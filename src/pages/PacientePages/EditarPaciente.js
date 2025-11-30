import { useState, useEffect, useRef } from "react";

import iconTrash from "../../Images/Trash.png";
import { showAlert } from "../../utils/alerts.js";
import TelefoneGrid from "./pacienteComponents/TelefoneGrid.js";
import { useGlobal, BASE_URL } from "../../global/GlobalContext.js";
import { carregarMensagemNegativa } from "../../InitialPage.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import LoadingOverlay from "../../global/Loading.js";
dayjs.extend(customParseFormat);

const EditarPaciente = ({
  dadosPaciente,
  enderecoPaciente,
  telefoneDados,
  responsaveisDados,
}) => {
  const [paciente, setPaciente] = useState({});
  const [responsavel, setResponsavel] = useState([
    {
      cd_paciente: "",
      nome: "",
      dt_nascimento: "",
      cpf: "",
    },
  ]);
  const [generos, setGeneros] = useState([]);
  const [telefonesPaciente, setTelefonesPaciente] = useState([]);
  const [telefonesResponsavel, setTelefonesResponsavel] = useState([[]]);
  const [enderecos, setEnderecos] = useState({
    cep: "",
    uf: "",
    bairro: "",
    cidade: "",
    logradouro: "",
    complemento: "",
    numero: "",
  });
  const carregouPaciente = useRef(false);
  const { pacienteEditado, setPacientesModificados, setPacienteEditado } =
    useGlobal();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (dadosPaciente) {
      fetchGeneros();

      setPaciente(dadosPaciente);
      setEnderecos(enderecoPaciente);

      const telefonesPacientesFormatados = telefoneDados
        .filter((tel) => tel.tipo === "PACIENTE")
        .map(
          (tel) =>
            `(${tel.ddd}) ${tel.nr_telefone.slice(
              0,
              5
            )}-${tel.nr_telefone.slice(5)}`
        );
      setTelefonesPaciente(telefonesPacientesFormatados);

      const responsaveis = Array.isArray(responsaveisDados)
        ? responsaveisDados
        : [];

      const telefonesResponsavelFormatados = responsaveis.map((resp) => {
        const telefones = telefoneDados
          .filter(
            (tel) =>
              tel.tipo === "RESPONSAVEL" &&
              tel.cd_responsavel === resp.cd_responsavel
          )
          .map(
            (tel) =>
              `(${tel.ddd}) ${tel.nr_telefone.slice(
                0,
                5
              )}-${tel.nr_telefone.slice(5)}`
          );

        return telefones.length > 0 ? telefones : [];
      });

      setTelefonesResponsavel(telefonesResponsavelFormatados);

      const responsaveisFormatados = Array.isArray(responsaveisDados)
        ? responsaveisDados.map((resp) => {
            let data = "";

            if (resp.dt_nascimento?.includes("/")) {
              const [dia, mes, ano] = resp.dt_nascimento.split("/");
              data = `${ano}-${mes}-${dia}`;
            } else {
              data = resp.dt_nascimento;
            }

            return {
              ...resp,
              dt_nascimento: data,
            };
          })
        : [];

      if (responsaveisDados.length > 0) {
        // mapeia normalmente
        setResponsavel(responsaveisFormatados);
      } else {
        // cria um responsável vazio para renderizar os inputs
        setResponsavel([
          { cd_paciente: "", nome: "", dt_nascimento: "", cpf: "" },
        ]);
      }
      carregouPaciente.current = true;
    }
  }, [
    dadosPaciente,
    telefoneDados,
    enderecoPaciente,
    responsaveisDados,
    pacienteEditado,
  ]);

  useEffect(() => {
    if (paciente.nm_genero && generos.length > 0) {
      const generoDoPaciente = generos.find(
        (g) => g.nm_genero === paciente.nm_genero
      );
      if (
        generoDoPaciente &&
        paciente.cd_genero !== generoDoPaciente.cd_genero
      ) {
        setPaciente((prev) => ({
          ...prev,
          cd_genero: generoDoPaciente.cd_genero,
        }));
      }
    }
  }, [paciente.nm_genero, generos]);

  const handleChangeFormulario = (e) => {
    const { name, value } = e.target;
    setPaciente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const formatarData = (data) => {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
          return data;
        }
        
        if (data instanceof Date) {
          const dia = String(data.getDate()).padStart(2, '0');
          const mes = String(data.getMonth() + 1).padStart(2, '0');
          const ano = data.getFullYear();
          return `${dia}/${mes}/${ano}`;
        }
        
        const dateObj = new Date(data);
        if (!isNaN(dateObj.getTime())) {
          const dia = String(dateObj.getDate()).padStart(2, '0');
          const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
          const ano = dateObj.getFullYear();
          return `${dia}/${mes}/${ano}`;
        }
        
        return data; 
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

  const buscarCEP = async (cep) => {
      const cepLimpo = cep.replace(/\D/g, "");
  
      // Valida se o CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        return;
      }
  
      setLoadingCep(true);
  
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
  
        if (!response.ok) {
          throw new Error("Erro ao buscar CEP");
        }
  
        const data = await response.json();
  
        // Verifica se o CEP foi encontrado
        if (data.erro) {
          showAlert.warning("CEP não encontrado!");
          setLoadingCep(false);
          return;
        }
  
        // Preenche os campos automaticamente
        setEnderecos((prev) => ({
          ...prev,
          cep: formatarCEP(cepLimpo),
          uf: data.uf || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          logradouro: data.logradouro || "",
          complemento: data.complemento || prev.complemento, // Mantém o complemento se não vier da API
        }));
  
        showAlert.success("CEP encontrado!");
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        showAlert.error("Erro ao buscar CEP. Verifique sua conexão.");
      } finally {
        setLoadingCep(false);
      }
    };
  const formatarCEP = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 8);

    return value.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const fetchGeneros = async () => {
    try {
      const response = await fetch(`${BASE_URL}/genero`);
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
      { cd_paciente: "", nome: "", dt_nascimento: "", cpf: "" },
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
        !paciente.nm_paciente ||
        !paciente.dt_nascimento ||
        !enderecos.cep
      ) {
        await showAlert.warning("Preencha os campos obrigatórios!");
        return null;
      }
      const { nm_genero, ...pacienteSemNomeGenero } = paciente;
      const { ativo, ...pacientePayload } = pacienteSemNomeGenero;
      const { cd_paciente, ...pacienteData } = pacientePayload;

      const pacienteFormatado = {
        ...pacienteData,
        dt_nascimento: formatarData(pacienteData.dt_nascimento)
      };

      const response = await fetch(
        `${BASE_URL}/paciente/${pacientePayload.cd_paciente}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pacienteFormatado),
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
        return data.cd_paciente;
      } else {
        throw new Error("Falha ao cadastrar paciente");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar paciente: " + error);
      return null;
    }
  };
  const alterarResponsavel = async (pacienteID) => {
    try {
      const resposta = await fetch(`${BASE_URL}/responsavel/${pacienteID}`);

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
          `${BASE_URL}/responsavel/paciente/${pacienteID}`,
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
        (r) => r.nome && r.cpf && r.dt_nascimento
      );

      if (responsavelValidos.length === 0) {
        return [];
      }

      const responsavelIDs = [];

      for (const r of responsavelValidos) {
        const responsavelParaEnviar = {
          cd_paciente: pacienteID,
          nome: r.nome,
          cpf: r.cpf,
          dt_nascimento: r.dt_nascimento,
        };
        console.log("Enviando responsável:", responsavelParaEnviar);

        const response = await fetch(`${BASE_URL}/responsavel`, {
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
        const idGerado = data.cd_responsavel;
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


      await fetch(`${BASE_URL}/telefone/${pacienteID}`, {
        method: "DELETE",
      });

      telefonesPaciente.forEach((tel) => {
        telefonesParaCadastrar.push({
          cd_paciente: pacienteID,
          cd_responsavel: null,
          tipo: "PACIENTE",
          ddd: tel.substring(1, 3),
          nr_telefone: tel.replace(/\D/g, "").substring(2),
        });
      });

      telefonesResponsavel.forEach((listaTel, index) => {
        listaTel.forEach((tel) => {
          telefonesParaCadastrar.push({
            cd_paciente: pacienteID,
            cd_responsavel: responsavelIDs[index],
            tipo: "RESPONSAVEL",
            ddd: tel.substring(1, 3),
            nr_telefone: tel.replace(/\D/g, "").substring(2),
          });
        });
      });

      // Verificação
      if (telefonesParaCadastrar.length === 0) {
        return true;
      }

      // 📨 Cadastrando novamente via POST
      for (const tel of telefonesParaCadastrar) {
        const response = await fetch(`${BASE_URL}/telefone`, {
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
      const resposta = await fetch(`${BASE_URL}/endereco/${pacienteID}`);
      if (!resposta.ok) throw new Error("Erro ao buscar responsa");
      const dados = await resposta.json();

      if (dados) {
        const deleteResponse = await fetch(
          `${BASE_URL}/endereco/${pacienteID}`,
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

      if (enderecos.cep) {
        // Endereço do paciente
        enderecosParaCriar.push({
          cd_paciente: pacienteID,
          cd_responsavel: null,
          cep: enderecos.cep,
          RUA: enderecos.RUA,
          numero: enderecos.numero,
          bairro: enderecos.bairro,
          cidade: enderecos.cidade,
          uf: enderecos.uf,
          complemento: enderecos.complemento,
          logradouro: enderecos.logradouro,
          tipo: "PACIENTE",
        });
      }

      if (Array.isArray(responsavelIDs) && responsavelIDs.length > 0) {
        // Endereços dos responsáveis
        responsavelIDs.forEach((id) => {
          enderecosParaCriar.push({
            cd_paciente: pacienteID,
            cd_responsavel: id,
            cep: enderecos.cep,
            RUA: enderecos.RUA,
            numero: enderecos.numero,
            bairro: enderecos.bairro,
            cidade: enderecos.cidade,
            uf: enderecos.uf,
            complemento: enderecos.complemento,
            logradouro: enderecos.logradouro,
            tipo: "RESPONSAVEL",
          });
        });
      }

      // 4. Criar todos os endereços com POST
      for (const endereco of enderecosParaCriar) {
        const postResponse = await fetch(`${BASE_URL}/endereco`, {
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
  const formatarDataParaExibir = (dataISO) => {
    if (!dataISO) return "--";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };
  const handleSubmitEditPaciente = async () => { 
    setLoading(true);
    const pacienteId = await alterarPaciente();
    if (pacienteId) {
      const responsavelId = await alterarResponsavel(pacienteId);
      await alterarTelefone(pacienteId, responsavelId);
      await alterarEndereco(pacienteId, responsavelId);
      const MSG = await carregarMensagemNegativa("MSG058");
      showAlert.success(MSG);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: "1200px" }}>
      <LoadingOverlay isLoading={loading} />
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
                name="nm_paciente"
                value={paciente.nm_paciente}
                onChange={(e) =>
                  setPaciente({
                    ...paciente,
                    nm_paciente: e.target.value,
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
                  className="F_GravidadeAreaTranstorno"
                  name="tip_sang"
                  style={{ width: "100px" }}
                  value={paciente.tip_sang}
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
                className="F_GravidadeAreaTranstorno"
                name="sexo"
                style={{ width: "118px" }}
                value={paciente.sexo}
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
                <DatePicker
                  className="F_NomeAreaTranstorno datepicker-sem-foco"
                  placeholder="dd/mm/yyyy"
                  format="DD/MM/YYYY"
                  name="dt_nascimento"
                  value={
                    paciente.dt_nascimento
                      ? dayjs(formatarDataParaExibir(paciente.dt_nascimento), "DD/MM/YYYY")
                      : null
                  }
                  onChange={(date, dateString) => {
                    setPaciente({
                      ...paciente,
                      dt_nascimento: dateString
                    });
                  }}
                  style={{ width: "140px" }}
                  maxLength={10}
                />
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
                name="cd_genero"
                style={{ width: "180px" }}
                value={paciente.cd_genero || ""}
                onChange={handleChangeFormulario}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {generos.map((genero) => (
                  <option
                    key={genero.cd_genero}
                    value={genero.cd_genero}
                    style={{ color: "#000" }}
                  >
                    {genero.nm_genero}
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
                  value={enderecos?.cep || ""}
                  onChange={(e) =>
                    setEnderecos({
                      ...enderecos,
                      cep: formatarCEP(e.target.value),
                    })
                  }
                  onBlur={(e) => {
                    const cep = e.target.value;
                    if (cep.replace(/\D/g, "").length === 8) {
                      buscarCEP(cep);
                    }
                  }}
                  maxLength={9}
                  style={{ width: "150px" }}
                ></input>
              </div>

              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>UF</p>
                <input
                  className="F_NomeAreaTranstorno"
                  placeholder="Ex: DF"
                  name="uf"
                  value={enderecos?.uf || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, uf: e.target.value })
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
                  value={enderecos?.bairro || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, bairro: e.target.value })
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
                  value={enderecos?.cidade || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, cidade: e.target.value })
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
                  value={enderecos?.numero || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, numero: e.target.value })
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
                  value={enderecos?.logradouro || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, logradouro: e.target.value })
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
                  value={enderecos?.complemento || ""}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, complemento: e.target.value })
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
                        name="nome"
                        value={item.nome}
                        onChange={(e) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].nome = e.target.value;
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
                      <DatePicker
                        className="F_GravidadeAreaTranstorno datepicker-sem-foco"
                        placeholder="dd/mm/yyyy"
                        format="DD/MM/YYYY"
                        name="dt_nascimento"
                        value={
                          item.dt_nascimento
                            ? dayjs(
                                formatarDataParaExibir(item.dt_nascimento),
                                "DD/MM/YYYY"
                              )
                            : null
                        }
                        onChange={(date, dateString) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].dt_nascimento = dateString;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "120px", color: "#000" }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      margin: "10px",
                    }}
                  >
                    <div className="F_CriarTranstornoInputObrigatorio">
                      <p style={{ textAlign: "start" }}>cpf*</p>
                      <input
                        className="F_GravidadeAreaTranstorno"
                        placeholder="Ex: 057.421.581-65"
                        name="cpf"
                        value={item.cpf}
                        onChange={(e) => {
                          const cpfFormatado = formatarCPF(e.target.value);
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].cpf = cpfFormatado;
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
            setPacienteEditado((prev) => !prev);
          }}
        >
          Editar Paciente
        </button>
      </div>
    </div>
  );
};

export default EditarPaciente;
