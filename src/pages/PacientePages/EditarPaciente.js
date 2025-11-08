import { useState, useEffect, useRef } from "react";

import iconTrash from "../../Images/Trash.png";
import { showAlert } from "../../utils/alerts.js";
import TelefoneGrid from "./pacienteComponents/TelefoneGrid.js";
import { useGlobal } from "../../global/GlobalContext.js";
import {carregarMensagemNegativa} from "../../InitialPage.js";

const EditarPaciente = ({
  dadosPaciente,
  enderecoPaciente,
  telefoneDados,
  responsaveisDados,
}) => {
  const [paciente, setPaciente] = useState({});
  const [responsavel, setResponsavel] = useState([
    {
      CD_PACIENTE: "",
      NOME: "",
      DT_NASCIMENTO: "",
      CPF: "",
    },
  ]);
  const [generos, setGeneros] = useState([]);
  const [telefonesPaciente, setTelefonesPaciente] = useState([]);
  const [telefonesResponsavel, setTelefonesResponsavel] = useState([[]]);
  const [enderecos, setEnderecos] = useState({
    CEP: "",
    UF: "",
    BAIRRO: "",
    CIDADE: "",
    LOGRADOURO: "",
    COMPLEMENTO: "",
    NUMERO: "",
  });
  const carregouPaciente = useRef(false);
  const { pacienteEditado, setPacientesModificados, setPacienteEditado } = useGlobal();

  useEffect(() => {
    if (dadosPaciente) {
      fetchGeneros();

      setPaciente(dadosPaciente);
      setEnderecos(enderecoPaciente);

      const telefonesPacientesFormatados = telefoneDados
        .filter((tel) => tel.TIPO === "PACIENTE")
        .map(
          (tel) =>
            `(${tel.DDD}) ${tel.NR_TELEFONE.slice(
              0,
              5
            )}-${tel.NR_TELEFONE.slice(5)}`
        );
      setTelefonesPaciente(telefonesPacientesFormatados);

      const responsaveis = Array.isArray(responsaveisDados)
        ? responsaveisDados
        : [];

      const telefonesResponsavelFormatados = responsaveis.map((resp) => {
        const telefones = telefoneDados
          .filter(
            (tel) =>
              tel.TIPO === "RESPONSAVEL" &&
              tel.CD_RESPONSAVEL === resp.CD_RESPONSAVEL
          )
          .map(
            (tel) =>
              `(${tel.DDD}) ${tel.NR_TELEFONE.slice(
                0,
                5
              )}-${tel.NR_TELEFONE.slice(5)}`
          );

        return telefones.length > 0 ? telefones : [];
      });

      setTelefonesResponsavel(telefonesResponsavelFormatados);

      const responsaveisFormatados = Array.isArray(responsaveisDados)
        ? responsaveisDados.map((resp) => {
            let data = "";

            if (resp.DT_NASCIMENTO?.includes("/")) {
              const [dia, mes, ano] = resp.DT_NASCIMENTO.split("/");
              data = `${ano}-${mes}-${dia}`;
            } else {
              data = resp.DT_NASCIMENTO;
            }

            return {
              ...resp,
              DT_NASCIMENTO: data,
            };
          })
        : [];

      if (responsaveisDados.length > 0) {
        // mapeia normalmente
        setResponsavel(responsaveisFormatados);
      } else {
        // cria um responsável vazio para renderizar os inputs
        setResponsavel([
          { CD_PACIENTE: "", NOME: "", DT_NASCIMENTO: "", CPF: "" },
        ]);
      }
      carregouPaciente.current = true;
    }
  }, [
    dadosPaciente,
    telefoneDados,
    enderecoPaciente,
    responsaveisDados,
    pacienteEditado
  ]);

  useEffect(() => {
    if (paciente.NM_GENERO && generos.length > 0) {
      const generoDoPaciente = generos.find(
        (g) => g.NM_GENERO === paciente.NM_GENERO
      );
      if (
        generoDoPaciente &&
        paciente.CD_GENERO !== generoDoPaciente.CD_GENERO
      ) {
        setPaciente((prev) => ({
          ...prev,
          CD_GENERO: generoDoPaciente.CD_GENERO,
        }));
      }
    }
  }, [paciente.NM_GENERO, generos]);


  const handleChangeFormulario = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatarCPF = (value) => {
    value = value.replace(/\D/g, ""); // Remove tudo que não for número
    value = value.slice(0, 11); // Limita a 11 dígitos

    // Aplica a formatação: 000.000.000-00
    return value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };
  const formatarCEP = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 8);

    return value.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const fetchGeneros = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/genero");
      if (!response.ok) {
        throw new Error("Erro ao buscar gêneros");
      }
      const data = await response.json();
      setGeneros(data);
    } catch (error) {
      console.error("Erro ao buscar gêneros:", error);
      alert(`Erro ao buscar gêneros: ${error.message}`);
    }
  };

  const handleAddResponsavel = () => {
    setResponsavel((prev) => [
      ...prev,
      { CD_PACIENTE: "", NOME: "", DT_NASCIMENTO: "", CPF: "" },
    ]);
    setTelefonesResponsavel([...telefonesResponsavel, []]);
  };
  const handleRemoverResponsavel = (index) => {
    if (responsavel.length > 1) {
      const novas = responsavel.filter((_, i) => i !== index);
      setResponsavel(novas);
      const novaListaTelefones = [...telefonesResponsavel];
      novaListaTelefones.splice(index, 1);
      setTelefonesResponsavel(novaListaTelefones);
    }
  };

  const alterarPaciente = async () => {
    try {
      if (
        !paciente.NM_PACIENTE ||
        !paciente.DT_NASCIMENTO ||
        !paciente.SEXO ||
        !enderecos.CEP
      ) {
        await showAlert.warning("Preencha os campos obrigatórios!");
        return null;
      }
      const { NM_GENERO, ...pacienteSemNomeGenero } = paciente;
      const { ATIVO, ...pacientePayload } = pacienteSemNomeGenero;
      const { CD_PACIENTE, ...pacienteData } = pacientePayload;

      const response = await fetch(
        `http://127.0.0.1:5000/paciente/${pacientePayload.CD_PACIENTE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pacienteData),
        }
      );

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (e) {
          const rawResponse = await response.text();
          console.error("Resposta não é JSON:", rawResponse);
          throw new Error("Resposta da API não é JSON válido");
        }
        setPacientesModificados((prev) => !prev);
        return data.CD_PACIENTE;
      } else {
        throw new Error("Falha ao cadastrar transtorno");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar transtorno: " + error);
      return null;
    }
  };
  const alterarResponsavel = async (pacienteID) => {
    try {
      const resposta = await fetch(
        `http://127.0.0.1:5000/responsavel/${pacienteID}`
      );

      let dados;

      if (resposta.status === 404) {
        dados = [];
      } else if (!resposta.ok) {
        throw new Error("Erro ao buscar responsável");
      } else {
        dados = await resposta.json();
      }
      if (dados.length > 0) {
        const deleteResponse = await fetch(
          `http://127.0.0.1:5000/responsavel/paciente/${pacienteID}`,
          {
            method: "DELETE",
          }
        );
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(
            `Erro ao deletar endereço: ${JSON.stringify(errorData)}`
          );
        }
      }

      const responsavelValidos = responsavel.filter(
        (r) => r.NOME && r.CPF && r.DT_NASCIMENTO
      );

      if (responsavelValidos.length === 0) {
        return [];
      }

      const responsavelIDs = [];

      for (const r of responsavelValidos) {
        const responsavelParaEnviar = {
          CD_PACIENTE: pacienteID,
          NOME: r.NOME,
          CPF: r.CPF,
          DT_NASCIMENTO: r.DT_NASCIMENTO,
        };

        const response = await fetch("http://127.0.0.1:5000/responsavel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(responsavelParaEnviar),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar responsável: ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        const idGerado = data.CD_RESPONSAVEL;
        responsavelIDs.push(idGerado);
      }

      return responsavelIDs;
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`Erro ao cadastrar responsáveis: ${error.message}`);
      return false;
    }
  };

  const alterarTelefone = async (pacienteID = "", responsavelIDs = []) => {
    try {
      const telefonesParaCadastrar = [];

      // 🔁 Etapa 1: apagar telefones existentes (do paciente e dos responsáveis)
      await fetch(`http://127.0.0.1:5000/telefone/${pacienteID}`, {
        method: "DELETE",
      });

      // 👦 Telefones do paciente
      telefonesPaciente.forEach((tel) => {
        telefonesParaCadastrar.push({
          CD_PACIENTE: pacienteID,
          CD_RESPONSAVEL: null,
          TIPO: "PACIENTE",
          DDD: tel.substring(1, 3),
          NR_TELEFONE: tel.replace(/\D/g, "").substring(2),
        });
      });

      // 👨‍👩‍👧 Telefones dos responsáveis
      telefonesResponsavel.forEach((listaTel, index) => {
        listaTel.forEach((tel) => {
          telefonesParaCadastrar.push({
            CD_PACIENTE: pacienteID,
            CD_RESPONSAVEL: responsavelIDs[index],
            TIPO: "RESPONSAVEL",
            DDD: tel.substring(1, 3),
            NR_TELEFONE: tel.replace(/\D/g, "").substring(2),
          });
        });
      });

      // Verificação
      if (telefonesParaCadastrar.length === 0) {
        return true;
      }

      // 📨 Cadastrando novamente via POST
      for (const tel of telefonesParaCadastrar) {
        const response = await fetch("http://127.0.0.1:5000/telefone", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tel),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar telefone: ${JSON.stringify(errorData)}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao cadastrar telefone:", error);
      alert(`Erro ao cadastrar telefone: ${error.message}`);
      return false;
    }
  };

  const alterarEndereco = async (pacienteID = "", responsavelIDs = []) => {
    try {
      const resposta = await fetch(
        `http://127.0.0.1:5000/endereco/${pacienteID}`
      );
      if (!resposta.ok) throw new Error("Erro ao buscar responsa");
      const dados = await resposta.json();

      if (dados) {
        const deleteResponse = await fetch(
          `http://127.0.0.1:5000/endereco/${pacienteID}`,
          {
            method: "DELETE",
          }
        );
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(
            `Erro ao deletar endereço: ${JSON.stringify(errorData)}`
          );
        }
      }

      // 3. Preparar array de endereços para criar (paciente + responsáveis)
      const enderecosParaCriar = [];

      if (enderecos.CEP) {
        // Endereço do paciente
        enderecosParaCriar.push({
          CD_PACIENTE: pacienteID,
          CD_RESPONSAVEL: null,
          CEP: enderecos.CEP,
          RUA: enderecos.RUA,
          NUMERO: enderecos.NUMERO,
          BAIRRO: enderecos.BAIRRO,
          CIDADE: enderecos.CIDADE,
          UF: enderecos.UF,
          COMPLEMENTO: enderecos.COMPLEMENTO,
          LOGRADOURO: enderecos.LOGRADOURO,
          TIPO: "PACIENTE",
        });
      }

      if (Array.isArray(responsavelIDs) && responsavelIDs.length > 0) {
        // Endereços dos responsáveis
        responsavelIDs.forEach((id) => {
          enderecosParaCriar.push({
            CD_PACIENTE: pacienteID,
            CD_RESPONSAVEL: id,
            CEP: enderecos.CEP,
            RUA: enderecos.RUA,
            NUMERO: enderecos.NUMERO,
            BAIRRO: enderecos.BAIRRO,
            CIDADE: enderecos.CIDADE,
            UF: enderecos.UF,
            COMPLEMENTO: enderecos.COMPLEMENTO,
            LOGRADOURO: enderecos.LOGRADOURO,
            TIPO: "RESPONSAVEL",
          });
        });
      }

      // 4. Criar todos os endereços com POST
      for (const endereco of enderecosParaCriar) {
        const postResponse = await fetch("http://127.0.0.1:5000/endereco", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(endereco),
        });

        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          throw new Error(
            `Erro ao criar endereço: ${JSON.stringify(errorData)}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error);
      alert(`Erro ao atualizar endereço: ${error.message}`);
      return false;
    }
  };

  const handleSubmitEditPaciente = async () => {
    const pacienteId = await alterarPaciente();
    if (pacienteId) {
      const responsavelId = await alterarResponsavel(pacienteId);
      await alterarTelefone(pacienteId, responsavelId);
      await alterarEndereco(pacienteId, responsavelId);
      const MSG = await carregarMensagemNegativa("MSG058");
      showAlert.success(MSG);
    }
  };

  return (
    <div style={{ width: "1200px" }}>
      <div className="F_Title">
        <h2 className="F_CadastrarTitle">Editar Paciente</h2>
      </div>
      <div
        className="F_DataPaciente"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ width: "56%" }}>
          <div
            style={{
              display: "flex",
              margin: "5px 0",
              justifyContent: "space-between",
            }}
          >
            <div className="F_CriarTranstornoInputObrigatorio">
              <p style={{ textAlign: "start" }}>Nome*</p>
              <input
                className="F_NomeAreaTranstorno"
                placeholder="Ex: Jonas Silva Miranda"
                name="NM_PACIENTE"
                value={paciente.NM_PACIENTE}
                onChange={(e) =>
                  setPaciente({
                    ...paciente,
                    NM_PACIENTE: e.target.value,
                  })
                }
                maxLength={90}
                style={{ width: "200px" }}
              ></input>
            </div>

            <div className="F_CriarTranstornoInputObrigatorio">
              <p style={{ textAlign: "start" }}>Tipo Sanguineo*</p>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <select
                  className="F_NomeAreaTranstorno"
                  name="TIP_SANG"
                  style={{ width: "100px" }}
                  value={paciente.TIP_SANG}
                  onChange={handleChangeFormulario}
                >
                  <option value="" disabled></option>
                  <option value="A+" style={{ color: "#000" }}>
                    A+
                  </option>
                  <option value="A-" style={{ color: "#000" }}>
                    A-
                  </option>
                  <option value="B+" style={{ color: "#000" }}>
                    B+
                  </option>
                  <option value="B-" style={{ color: "#000" }}>
                    B-
                  </option>
                  <option value="Ab+" style={{ color: "#000" }}>
                    AB+
                  </option>
                  <option value="AB-" style={{ color: "#000" }}>
                    AB-
                  </option>
                  <option value="O+" style={{ color: "#000" }}>
                    O+
                  </option>
                  <option value="O-" style={{ color: "#000" }}>
                    O-
                  </option>
                </select>
              </div>
            </div>
            <div className="F_CriarTranstornoInputObrigatorio">
              <p style={{ textAlign: "start" }}>Sexo*</p>
              <select
                className="F_NomeAreaTranstorno"
                name="SEXO"
                style={{ width: "118px" }}
                value={paciente.SEXO}
                onChange={handleChangeFormulario}
              >
                <option value="" disabled></option>
                <option value="M" style={{ color: "#000" }}>
                  Masculino
                </option>
                <option value="F" style={{ color: "#000" }}>
                  Feminino
                </option>
              </select>
            </div>
            <div className="F_CriarTranstornoInputObrigatorio">
              <p style={{ textAlign: "start" }}>Data de nascimento*</p>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <input
                  className="F_NomeAreaTranstorno"
                  placeholder="Ex: XX/XX/XXXX"
                  type="Date"
                  name="DT_NASC"
                  value={paciente.DT_NASCIMENTO || ""}
                  onChange={(e) =>
                    setPaciente({
                      ...paciente,
                      DT_NASC: e.target.value,
                    })
                  }
                  style={{ width: "120px", color: "#000" }}
                ></input>
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              margin: "5px 0",
              justifyContent: "space-between",
            }}
          >
            <div style={{ margin: "5px 0" }}>
              <TelefoneGrid
                label="Telefone do Paciente"
                telefones={telefonesPaciente}
                setTelefones={setTelefonesPaciente}
              />
            </div>
            <div className="F_CriarTranstornoInputObrigatorio">
              <p style={{ textAlign: "start" }}>Gênero*</p>
              <select
                className="F_NomeAreaTranstorno"
                name="CD_GENERO"
                style={{ width: "180px" }}
                value={paciente.CD_GENERO || 1}
                onChange={handleChangeFormulario}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {generos.map((genero) => (
                  <option
                    key={genero.CD_GENERO}
                    value={genero.CD_GENERO}
                    style={{ color: "#000" }}
                  >
                    {genero.NM_GENERO}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className="BorderArea"
            style={{
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                margin: "10px 0",
                justifyContent: "space-around",
              }}
            >
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>CEP*</p>
                <input
                  className="F_NomeAreaTranstorno"
                  placeholder="Ex: 72871-581"
                  name="CEP"
                  value={enderecos?.CEP || ""}
                  onChange={(e) =>
                    setEnderecos({
                      ...enderecos,
                      CEP: formatarCEP(e.target.value),
                    })
                  }
                  maxLength={9}
                  style={{ width: "150px" }}
                ></input>
              </div>

              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>UF</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: DF"
                  name="UF"
                  value={enderecos?.UF || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, UF: e.target.value })
                  }
                  maxLength={90}
                  style={{ width: "40px" }}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Bairro</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: Chácaras Anhanguera"
                  name="Bairro"
                  value={enderecos?.BAIRRO || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, BAIRRO: e.target.value })
                  }
                  maxLength={90}
                  style={{ width: "180px" }}
                ></input>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                margin: "10px 0",
                justifyContent: "space-around",
              }}
            >
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Cidade</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: Belo Horizonte"
                  name="Cidade"
                  value={enderecos?.CIDADE || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, CIDADE: e.target.value })
                  }
                  style={{ width: "150px" }}
                  maxLength={90}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Numero</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: 22"
                  name="Numero"
                  value={enderecos?.NUMERO || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, NUMERO: e.target.value })
                  }
                  style={{ width: "50px" }}
                  maxLength={5}
                ></input>
              </div>

              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Logradouro</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: Rua Paulo Freitas"
                  name="Logradouro"
                  value={enderecos?.LOGRADOURO || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, LOGRADOURO: e.target.value })
                  }
                  style={{ width: "150px" }}
                  maxLength={90}
                ></input>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                margin: "10px 0",
                justifyContent: "space-around",
              }}
            >
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Complemento</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: Condominio morada center, casa 52, 3º andarb "
                  name="Complemento"
                  value={enderecos?.COMPLEMENTO || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, COMPLEMENTO: e.target.value })
                  }
                  style={{ width: "440px" }}
                  maxLength={90}
                ></input>
                
              </div>
            </div>
          </div>
        </div>

        <div className="F_LineWhiteArea" style={{ height: "auto" }}>
          <div
            className="F_LineWhite"
            style={{ backgroundColor: "#f5f5f5" }}
          ></div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <h3 className="F_Title">Responsavel</h3>
            <div
              className="BorderArea"
              style={{ overflowY: "auto", height: "410px", width: "500px" }}
            >
              {responsavel.map((item, index) => (
                <div key={index}>
                  <div
                    style={{
                      display: "flex",
                      margin: "10px",
                    }}
                  >
                    <div className="F_CriarTranstornoInputObrigatorio">
                      <p style={{ textAlign: "start" }}>Nome*</p>
                      <input
                        className="F_GravidadeAreaTranstorno"
                        placeholder="Ex: Roberto Souza Silva"
                        name="NOME"
                        value={item.NOME}
                        onChange={(e) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].NOME = e.target.value;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "200px" }}
                        maxLength={90}
                      ></input>
                    </div>
                    <div
                      className="F_CriarTranstornoInputObrigatorio"
                      style={{ marginLeft: "50px" }}
                    >
                      <p style={{ textAlign: "start" }}>Data de nascimento*</p>
                      <input
                        className="F_GravidadeAreaTranstorno"
                        placeholder="Ex: XX/XX/XXXX"
                        type="Date"
                        name="DT_NASCIMENTO"
                        value={item.DT_NASCIMENTO}
                        onChange={(e) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].DT_NASCIMENTO =
                            e.target.value;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "120px", color: "#000" }}

                      ></input>
                    </div>
                  </div>
                  <div
                    style={{
                      margin: "10px",
                    }}
                  >
                    <div className="F_CriarTranstornoInputObrigatorio">
                      <p style={{ textAlign: "start" }}>CPF*</p>
                      <input
                        className="F_GravidadeAreaTranstorno"
                        placeholder="Ex: 057.421.581-65"
                        name="CPF"
                        value={item.CPF}
                        onChange={(e) => {
                          const cpfFormatado = formatarCPF(e.target.value);
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].CPF = cpfFormatado;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "130px" }}
                        maxLength={14}
                      ></input>
                    </div>
                    <div className="F_CriarTranstornoInputObrigatorio"></div>
                  </div>
                  <div style={{ margin: "10px" }}>
                    <TelefoneGrid
                      label="Telefone do Paciente"
                      telefones={telefonesResponsavel[index] || []}
                      setTelefones={(novosTelefones) => {
                        const novasListas = [...telefonesResponsavel];
                        novasListas[index] = novosTelefones;
                        setTelefonesResponsavel(novasListas);
                      }}
                    />
                  </div>
                  <div
                    className="F_BotoesGravidade"
                    style={{ display: "flex" }}
                  >
                    <button
                      className="F_BtnGravidade"
                      onClick={handleAddResponsavel}
                    >
                      <strong>+</strong>
                    </button>
                    {responsavel.length > 1 && (
                      <button
                        className="F_BtnGravidade"
                        onClick={() => handleRemoverResponsavel(index)}
                      >
                        <img className="F_TrashIcon" src={iconTrash} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="F_AdicionarArea" style={{ marginTop: "5px" }}>
        <button
          className="F_btnTranstornos"
          onClick={async (e) => {
            e.preventDefault();
            await handleSubmitEditPaciente();
            setPacienteEditado(prev => !prev)
          }}
        >
          Editar Paciente
        </button>
      </div>
    </div>
  );
};

export default EditarPaciente;
