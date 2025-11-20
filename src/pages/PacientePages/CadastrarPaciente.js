import React, { useState, useEffect } from "react";
import iconTrash from "../../Images/Trash.png";
import { showAlert } from "../../utils/alerts.js";
import TelefoneGrid from "./pacienteComponents/TelefoneGrid.js";
import { useGlobal,BASE_URL } from "../../global/GlobalContext.js";
import { carregarMensagemNegativa } from "../../InitialPage.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const CadastrarPaciente = ({ cd_usuario }) => {
  const [paciente, setPaciente] = useState({
    nm_paciente: "",
    dt_nasc: "",
    sexo: "",
    tip_sang: "",
    cd_perfil: "",
    cd_usuario: 0,
    cd_genero: "",
  });
  const [responsavel, setResponsavel] = useState([
    {
      cd_paciente: "",
      nome: "",
      dt_nascimento: "",
      cpf: "",
    },
  ]);
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
  const [generos, setGeneros] = useState([]);
  const { setPacientesModificados } = useGlobal();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    fetchGeneros();
    getPerfil();
  }, []);

  const getPerfil = async () => {
    try {
      const response = await fetch(`${BASE_URL}/anamnese/perfis`);

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
      [name]: name === "cd_genero" ? Number(value) : value,
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

  const adicionarPaciente = async () => {
    try {
      if (
        !paciente.nm_paciente ||
        !paciente.dt_nasc ||
        !paciente.sexo ||
        !paciente.dt_nasc ||
        !paciente.cd_genero ||
        !paciente.cd_perfil ||
        !enderecos.cep
      ) {
        await showAlert.warning("requisitos obrigatorios faltando!");
        return null;
      }

      const response = await fetch(`${BASE_URL}/paciente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paciente,
          dt_nasc: formatarDataParaMySQL(paciente.dt_nasc),
          cd_usuario: cd_usuario || Number(localStorage.getItem("cd_usuario")),
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

  const adicionarResponsavel = async (pacienteID) => {
    try {
      const responsavelValidos = responsavel.filter(
        (r) => r.nome && r.cpf && r.dt_nascimento
      );

      if (responsavelValidos.length === 0) {
        return true;
      }

      const responsavelIDs = [];

      for (const responsavel of responsavelValidos) {
        const responsavelParaEnviar = {
          cd_paciente: pacienteID,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          dt_nascimento: formatarDataParaMySQL(responsavel.dt_nascimento),
        };

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
            `Erro ao cadastrar gravidade: ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        const idGerado = data.cd_responsavel;
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
          cd_paciente: pacienteID,
          cd_responsavel: null,
          tipo: "PACIENTE",
          ddd: apenasNumeros.slice(0, 2),
          nr_telefone: apenasNumeros.slice(2),
        });
      });

      telefonesResponsavel.forEach((listaTel, index) => {
        listaTel.forEach((tel) => {
          const apenasNumeros = tel.replace(/\D/g, "");
          telefonesParaCadastrar.push({
            cd_paciente: pacienteID,
            cd_responsavel: responsavelIDs[index],
            tipo: "RESPONSAVEL",
            ddd: apenasNumeros.slice(0, 2),
            nr_telefone: apenasNumeros.slice(2),
          });
        });
      });

      if (telefonesParaCadastrar.length === 0) {
        return true;
      }

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

  const adicionarEndereco = async (pacienteID = "", responsavelIDs = []) => {
    try {
      const enderecosParaCadastrar = [];

      // 👉 Endereço do paciente
      if (enderecos.cep) {
        enderecosParaCadastrar.push({
          cd_paciente: pacienteID,
          cd_responsavel: null,
          cep: enderecos.cep,
          tipo: "PACIENTE",
          RUA: enderecos.RUA,
          numero: enderecos.numero,
          bairro: enderecos.bairro,
          cidade: enderecos.cidade,
          uf: enderecos.uf,
          complemento: enderecos.complemento,
          logradouro: enderecos.logradouro,
        });
      }

      // 👉 Endereços dos responsáveis
      if (Array.isArray(responsavelIDs) && responsavelIDs.length > 0) {
        responsavelIDs.forEach((id) => {
          enderecosParaCadastrar.push({
            cd_paciente: pacienteID,
            cd_responsavel: id,
            cep: enderecos.cep,
            tipo: "RESPONSAVEL",
            RUA: enderecos.RUA,
            numero: enderecos.numero,
            bairro: enderecos.bairro,
            cidade: enderecos.cidade,
            uf: enderecos.uf,
            complemento: enderecos.complemento,
            logradouro: enderecos.logradouro,
          });
        });
      }
      if (enderecosParaCadastrar.length === 0) {
        return true;
      }

      for (const endereco of enderecosParaCadastrar) {
        const response = await fetch(`${BASE_URL}/endereco`, {
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
        nm_paciente: "",
        dt_nasc: "",
        sexo: "",
        tip_sang: "",
        cd_perfil: "",
        cd_usuario: 0,
        cd_genero: "",
        ativo: "S",
      });

      setResponsavel([
        { cd_paciente: "", nome: "", dt_nascimento: "", cpf: "" },
      ]);
      setTelefonesPaciente([]);
      setTelefonesResponsavel([[]]);
      setEnderecos({
        cep: "",
        uf: "",
        bairro: "",
        cidade: "",
        logradouro: "",
        complemento: "",
        numero: "",
      });
      setPacientesModificados((prev) => !prev);
      const MSG = await carregarMensagemNegativa("MSG057");
      showAlert.success(MSG);
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
                name="nm_paciente"
                value={paciente.nm_paciente}
                onChange={(e) =>
                  setPaciente({
                    ...paciente,
                    nm_paciente: e.target.value,
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
                name="sexo"
                style={{ width: "118px" }}
                value={paciente.sexo}
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
                  name="dt_nasc"
                  placeholder="dd/mm/yyyy"
                  format="DD/MM/YYYY"
                  value={
                    paciente.dt_nasc
                      ? dayjs(paciente.dt_nasc, "DD/MM/YYYY")
                      : null
                  }
                  onChange={(date, dateString) => {
                    setPaciente({
                      ...paciente,
                      dt_nasc: dateString,
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
                name="cd_genero"
                style={{ width: "180px" }}
                value={Number(paciente.cd_genero) || ""}
                onChange={handleChangeFormulario}
                defaultValue=""
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
              <div style={{ marginTop: "10px" }}>
                <p style={{ textAlign: "start" }}>Categoria*</p>
                <select
                  className="Border F_NomeAreaTranstorno select-cinza"
                  style={{ width: "200px" }}
                  value={paciente.cd_perfil || ""}
                  onChange={async (e) => {
                    console.log(e.target.value);
                    setPaciente((prev) => ({
                      ...prev,
                      cd_perfil: e.target.value || "",
                    }));
                  }}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {perfil &&
                    perfil.map((item) => (
                      <option
                        key={item.cd_perfil}
                        value={item.cd_perfil}
                        style={{ color: "#000" }}
                      >
                        {item.perfil}
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
                <p style={{ textAlign: "start" }}>cep*</p>
                <input
                  className="F_NomeAreaTranstorno"
                  maxLength={9}
                  placeholder="Ex: 72871-581"
                  name="cep"
                  value={enderecos.cep}
                  onChange={(e) =>
                    setEnderecos({
                      ...enderecos,
                      cep: formatarCEP(e.target.value),
                    })
                  }
                  style={{ width: "150px" }}
                ></input>
              </div>

              <div className="F_CriarTranstornoInputObrigatorio">
                <p style={{ textAlign: "start" }}>uf</p>
                <input
                  className="F_NomeAreaTranstorno"
                  placeholder="Ex: DF"
                  name="uf"
                  maxLength={2}
                  value={enderecos.uf}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, uf: e.target.value })
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
                  value={enderecos.bairro}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, bairro: e.target.value })
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
                  value={enderecos.cidade}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, cidade: e.target.value })
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
                  value={enderecos.numero}
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
                  value={enderecos.logradouro}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, logradouro: e.target.value })
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
                  value={enderecos.complemento}
                  maxLength={90}
                  onChange={(e) =>
                    setEnderecos({ ...enderecos, complemento: e.target.value })
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
                        name="nome"
                        value={item.nome}
                        maxLength={90}
                        onChange={(e) => {
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].nome = e.target.value;
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
                        name="dt_nasc"
                        placeholder="dd/mm/yyyy"
                        format="DD/MM/YYYY"
                        value={
                          item.dt_nascimento
                            ? dayjs(item.dt_nascimento, "DD/MM/YYYY")
                            : null
                        }
                        onChange={(date, dateString) => {

                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].dt_nascimento = dateString;
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
                      <p style={{ textAlign: "start" }}>cpf*</p>
                      <input
                        className="F_GravidadeAreaTranstorno"
                        placeholder="Ex: 057.421.581-65"
                        name="cpf"
                        maxLength={14}
                        value={item.cpf}
                        onChange={(e) => {
                          const cpfFormatado = formatarCPF(e.target.value);
                          const novosResponsaveis = [...responsavel];
                          novosResponsaveis[index].cpf = cpfFormatado;
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
