import React, { useState, useEffect } from "react";
import iconTrash from "../../Images/Trash.png";
import { showAlert } from "../../utils/alerts.js";
import TelefoneGrid from "./pacienteComponents/TelefoneGrid.js";
import { useGlobal } from "../../global/GlobalContext.js";
import { carregarMensagemNegativa } from "../../InitialPage.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const CadastrarPaciente = ({ CD_USUARIO }) => {
  const [paciente, setPaciente] = useState({
    NM_PACIENTE: "",
    DT_NASC: "",
    SEXO: "",
    TIP_SANG: "",
    CD_PERFIL: "",
    CD_USUARIO: 0,
    CD_GENERO: "",
  });
  const [responsavel, setResponsavel] = useState([
    {
      CD_PACIENTE: "",
      NOME: "",
      DT_NASCIMENTO: "",
      CPF: "",
    },
  ]);
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
  const [generos, setGeneros] = useState([]);
  const { setPacientesModificados } = useGlobal();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    fetchGeneros();
    getPerfil();
  }, []);

  const getPerfil = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/anamnese/perfis`);

      if (!response.ok) {
        showAlert.error("Erro ao carregar perfis");
        throw new Error("Erro ao carregar perfis");
      }

      const data = await response.json();
      setPerfil(data);
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao carregar perfis: " + error);
      return null;
    }
  };

  const handleChangeFormulario = (e) => {
    const { name, value } = e.target;

    setPaciente((prev) => ({
      ...prev,
      [name]: name === "CD_GENERO" ? Number(value) : value,
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

  const adicionarPaciente = async () => {
    try {
      if (
        !paciente.NM_PACIENTE ||
        !paciente.DT_NASC ||
        !paciente.SEXO ||
        !paciente.DT_NASC ||
        !paciente.CD_GENERO ||
        !paciente.CD_PERFIL ||
        !enderecos.CEP
      ) {
        await showAlert.warning("requisitos obrigatorios faltando!");
        return null;
      }

      const response = await fetch("http://127.0.0.1:5000/paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paciente,
          DT_NASC: formatarDataParaMySQL(paciente.DT_NASC),
          CD_USUARIO: CD_USUARIO || Number(localStorage.getItem("CD_USUARIO")),
        }),
      });

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
        throw new Error("Falha ao cadastrar paciente");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar paciente: " + error);
      return null;
    }
  };

  const adicionarResponsavel = async (pacienteID) => {
    try {
      const responsavelValidos = responsavel.filter(
        (r) => r.NOME && r.CPF && r.DT_NASCIMENTO
      );

      if (responsavelValidos.length === 0) {
        return true;
      }

      const responsavelIDs = [];

      for (const responsavel of responsavelValidos) {
        const responsavelParaEnviar = {
          CD_PACIENTE: pacienteID,
          NOME: responsavel.NOME,
          CPF: responsavel.CPF,
          DT_NASCIMENTO: formatarDataParaMySQL(responsavel.DT_NASCIMENTO),
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
            `Erro ao cadastrar gravidade: ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        const idGerado = data.CD_RESPONSAVEL;
        responsavelIDs.push(idGerado);
      }

      return responsavelIDs;
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`Erro ao cadastrar gravidades: ${error.message}`);
      return false;
    }
  };
  const adicionarTelefone = async (pacienteID = "", responsavelIDs = []) => {
    try {
      const telefonesParaCadastrar = [];

      telefonesPaciente.forEach((tel) => {
        const apenasNumeros = tel.replace(/\D/g, "");
        telefonesParaCadastrar.push({
          CD_PACIENTE: pacienteID,
          CD_RESPONSAVEL: null,
          TIPO: "PACIENTE",
          DDD: apenasNumeros.slice(0, 2),
          NR_TELEFONE: apenasNumeros.slice(2),
        });
      });

      telefonesResponsavel.forEach((listaTel, index) => {
        listaTel.forEach((tel) => {
          const apenasNumeros = tel.replace(/\D/g, "");
          telefonesParaCadastrar.push({
            CD_PACIENTE: pacienteID,
            CD_RESPONSAVEL: responsavelIDs[index],
            TIPO: "RESPONSAVEL",
            DDD: apenasNumeros.slice(0, 2),
            NR_TELEFONE: apenasNumeros.slice(2),
          });
        });
      });

      if (telefonesParaCadastrar.length === 0) {
        return true;
      }

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

  const adicionarEndereco = async (pacienteID = "", responsavelIDs = []) => {
    try {
      const enderecosParaCadastrar = [];

      // 👉 Endereço do paciente
      if (enderecos.CEP) {
        enderecosParaCadastrar.push({
          CD_PACIENTE: pacienteID,
          CD_RESPONSAVEL: null,
          CEP: enderecos.CEP,
          TIPO: "PACIENTE",
          RUA: enderecos.RUA,
          NUMERO: enderecos.NUMERO,
          BAIRRO: enderecos.BAIRRO,
          CIDADE: enderecos.CIDADE,
          UF: enderecos.UF,
          COMPLEMENTO: enderecos.COMPLEMENTO,
          LOGRADOURO: enderecos.LOGRADOURO,
        });
      }

      // 👉 Endereços dos responsáveis
      if (Array.isArray(responsavelIDs) && responsavelIDs.length > 0) {
        responsavelIDs.forEach((id) => {
          enderecosParaCadastrar.push({
            CD_PACIENTE: pacienteID,
            CD_RESPONSAVEL: id,
            CEP: enderecos.CEP,
            TIPO: "RESPONSAVEL",
            RUA: enderecos.RUA,
            NUMERO: enderecos.NUMERO,
            BAIRRO: enderecos.BAIRRO,
            CIDADE: enderecos.CIDADE,
            UF: enderecos.UF,
            COMPLEMENTO: enderecos.COMPLEMENTO,
            LOGRADOURO: enderecos.LOGRADOURO,
          });
        });
      }
      if (enderecosParaCadastrar.length === 0) {
        return true;
      }

      for (const endereco of enderecosParaCadastrar) {
        const response = await fetch("http://127.0.0.1:5000/endereco", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(endereco),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar endereço: ${JSON.stringify(errorData)}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao cadastrar endereço:", error);
      alert(`Erro ao cadastrar endereço: ${error.message}`);
      return false;
    }
  };

  const handleSubmitCadastroPaciente = async () => {
    const pacienteId = await adicionarPaciente();
    if (pacienteId) {
      const responsavelId = await adicionarResponsavel(pacienteId);
      await adicionarTelefone(pacienteId, responsavelId);
      await adicionarEndereco(pacienteId, responsavelId);

      setPaciente({
        NM_PACIENTE: "",
        DT_NASC: "",
        SEXO: "",
        TIP_SANG: "",
        CD_PERFIL: "",
        CD_USUARIO: 0,
        CD_GENERO: "",
        ATIVO: "S",
      });

      setResponsavel([
        { CD_PACIENTE: "", NOME: "", DT_NASCIMENTO: "", CPF: "" },
      ]);
      setTelefonesPaciente([]);
      setTelefonesResponsavel([[]]);
      setEnderecos({
        CEP: "",
        UF: "",
        BAIRRO: "",
        CIDADE: "",
        LOGRADOURO: "",
        COMPLEMENTO: "",
        NUMERO: "",
      });
      setPacientesModificados((prev) => !prev);
      const MSG = await carregarMensagemNegativa("MSG057");
      showAlert.success(MSG);
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

  const formatarDataParaMySQL = (data) => {
    if (!data) return "";

    const partes = data.split("/");
    if (partes.length !== 3) return "";

    const [dia, mes, ano] = partes;
    return `${ano}-${mes}-${dia}`;
  };

  return (
    <div style={{ width: "1200px" }}>
      <div className="F_Title">
        <h2 className="F_CadastrarTitle">Adicionar Paciente</h2>
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
                maxLength={90}
                placeholder="Ex: Jonas Silva Miranda"
                name="NM_PACIENTE"
                value={paciente.NM_PACIENTE}
                onChange={(e) =>
                  setPaciente({
                    ...paciente,
                    NM_PACIENTE: e.target.value,
                  })
                }
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
                  <option value="AB+" style={{ color: "#000" }}>
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
                className="F_NomeAreaTranstorno select-cinza"
                name="SEXO"
                style={{ width: "118px" }}
                value={paciente.SEXO}
                onChange={handleChangeFormulario}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
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
                  name="DT_NASC"
                  placeholder="dd/mm/yyyy"
                  format="DD/MM/YYYY"
                  value={
                    paciente.DT_NASC
                      ? dayjs(paciente.DT_NASC, "DD/MM/YYYY")
                      : null
                  }
                  onChange={(date, dateString) => {
                    setPaciente({
                      ...paciente,
                      DT_NASC: dateString,
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
                className="F_NomeAreaTranstorno select-cinza"
                name="CD_GENERO"
                style={{ width: "180px" }}
                value={Number(paciente.CD_GENERO) || ""}
                onChange={handleChangeFormulario}
                defaultValue=""
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
              <div style={{ marginTop: "10px" }}>
                <p style={{ textAlign: "start" }}>Categoria*</p>
                <select
                  className="Border F_NomeAreaTranstorno select-cinza"
                  style={{ width: "200px" }}
                  value={Number(paciente.CD_PERFIL) || ""}
                  onChange={async (e) => {
                    const selectedPerfil = e.target.value;
                    setPaciente((prev) => ({
                      ...prev,
                      CD_PERFIL: parseInt(selectedPerfil) || "",
                    }));
                  }}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {perfil &&
                    perfil.map((item) => (
                      <option
                        key={item.CD_PERFIL}
                        value={item.CD_PERFIL}
                        style={{ color: "#000" }}
                      >
                        {item.PERFIL}
                      </option>
                    ))}
                </select>
              </div>
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
                  maxLength={9}
                  placeholder="Ex: 72871-581"
                  name="CEP"
                  value={enderecos.CEP}
                  onChange={(e) =>
                    setEnderecos({
                      ...enderecos,
                      CEP: formatarCEP(e.target.value),
                    })
                  }
                  style={{ width: "150px" }}
                ></input>
              </div>

              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>UF</p>
                <input
                  className="F_NomeAreaTranstorno"
                  placeholder="Ex: DF"
                  name="UF"
                  maxLength={2}
                  value={enderecos.UF}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, UF: e.target.value })
                  }
                  style={{ width: "40px" }}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Bairro</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: Chácaras Anhanguera"
                  name="Bairro"
                  value={enderecos.BAIRRO}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, BAIRRO: e.target.value })
                  }
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
                  value={enderecos.CIDADE}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, CIDADE: e.target.value })
                  }
                  style={{ width: "150px" }}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>Numero</p>
                <input
                  className="F_GravidadeAreaTranstorno"
                  placeholder="Ex: 22"
                  name="Numero"
                  value={enderecos.NUMERO}
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
                  value={enderecos.LOGRADOURO}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, LOGRADOURO: e.target.value })
                  }
                  style={{ width: "150px" }}
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
                  value={enderecos.COMPLEMENTO}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, COMPLEMENTO: e.target.value })
                  }
                  style={{ width: "440px" }}
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
                        maxLength={90}
                        onChange={(e) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].NOME = e.target.value;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "200px" }}
                      ></input>
                    </div>
                    <div
                      className="F_CriarTranstornoInputObrigatorio"
                      style={{ marginLeft: "50px" }}
                    >
                      <p style={{ textAlign: "start" }}>Data de nascimento*</p>
                      <DatePicker
                        className="F_NomeAreaTranstorno datepicker-sem-foco"
                        name="DT_NASC"
                        placeholder="dd/mm/yyyy"
                        format="DD/MM/YYYY"
                        value={
                          item.DT_NASCIMENTO
                            ? dayjs(item.DT_NASCIMENTO, "DD/MM/YYYY")
                            : null
                        }
                        onChange={(date, dateString) => {

                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].DT_NASCIMENTO = dateString;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "140px" }}
                        maxLength={10}
                      />
                      
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
                        maxLength={14}
                        value={item.CPF}
                        onChange={(e) => {
                          const cpfFormatado = formatarCPF(e.target.value);
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].CPF = cpfFormatado;
                          setResponsavel(novosResponsaveis);
                        }}
                        style={{ width: "130px" }}
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
          onClick={handleSubmitCadastroPaciente}
        >
          Adicionar Paciente
        </button>
      </div>
    </div>
  );
};

export default CadastrarPaciente;
