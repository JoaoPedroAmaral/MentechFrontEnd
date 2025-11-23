import { useEffect, useState } from "react";

import "../../css/OrganizeCSS/base.css";
import "../../css/OrganizeCSS/components.css";
import "../../css/OrganizeCSS/layout.css";
import "../../css/OrganizeCSS/utils.css";

import ManterTranstorno from "../TranstornoPages/ManterTranstorno.js";
import ManterPatologia from "../PatologiaPages/ManterPatologia.js";
import CadastrarPaciente from "../PacientePages/CadastrarPaciente.js";
import EditarPaciente from "../PacientePages/EditarPaciente.js";
import ListarPacientes from "../PacientePages/ListarPacientes.js";
import ManterMedicamentos from "../MedicamentosPages/ManterMedicamentos.js";
import ManterMeta from "../MetasPages/ManterMeta.js";
import SupostoDiagnostico from "../DiagnosticoPage/Diagnostico.js";
import ManterAtividade from "../AtividadePage/ManterAtividade.js";
import ManterComportamento from "../ComportamentoPage/ManterComportamento.js";
import ManterAgenda from "../AgendaPage/ManterAgenda.js";

import LogoutIcon from "../../Images/LogoutIconBK.png";
import PsicologiaIcon from "../../Images/PsicologiaIcon.png";
import CadastroTranstornoIcon from "../../Images/CadastroTranstornoIcon.png";
import AdicionarPacienteIcon from "../../Images/AdicionarPacienteIcon.png";
import PerfilPhoto from "../../Images/PerfilPhoto.png";
import Seta from "../../Images/seta.png";
import calendar from "../../Images/calendar.png";
import { useGlobal, BASE_URL } from "../../global/GlobalContext.js";
import ManterHistorico from "../HistoricoPage/ManterHistorico.js";
import { Grafico } from "../GraficoPage/Grafico.js";

const SegundoAcesso = ({
  userData, //VOU USAR PARA PUXAR O nome E cip DO USUÁRIO
  pacienteID,
  onLogout,
  dadosPaciente,
  enderecoPaciente,
  telefoneDados,
  responsaveisDados,
}) => {
  const [statusAtivo, setStatusAtivo] = useState(true);
  const [listName, setListName] = useState("");
  const { setPacienteEditado, setMetasModificadas, setPacientesModificados } = useGlobal();

  useEffect(() => {
    if (dadosPaciente?.ativo) {
      setStatusAtivo(dadosPaciente.ativo !== "S" && dadosPaciente.ativo !== "s");
      toggleActiveStatusArea(!true);
      if (dadosPaciente?.ativo === "N") {
        toggleActiveStatusArea(true);
      }
    }
  }, [dadosPaciente]);

  const handleFechar = () => {
    window.electronClose.fecharApp();
  };

  const handleMinimize = () => {
    window.electronMinimize.minimize();
  };

  const handleMaximize = () => {
    window.electronMaximize.maximize();
  };

  const toggleIframe = (iframeId) => {
    const iframe = document.getElementById(iframeId);
    iframe.classList.toggle("Hidden");
  };

  const ddd = telefoneDados?.[0]?.ddd ?? "";
  const numeroTel = telefoneDados?.[0]?.nr_telefone ?? "";
  const primeiroTelefone =
    ddd && numeroTel ? `(${ddd}) ${numeroTel.slice(0, 5)}-${numeroTel.slice(5)}` : "--";

  const primeiroResponsavel = !responsaveisDados
    ? "carregando..."
    : responsaveisDados.error
    ? "--"
    : responsaveisDados[0]?.nome
    ? responsaveisDados[0].nome
    : "--";

  const openDivArea = (idArea, listName) => {
    setListName(listName);
    const divArea = document.getElementById(idArea);
    const BtnList = document.getElementById("BtnList");
    divArea.classList.toggle("Hidden");
    BtnList.classList.toggle("Hidden");
  };

  const toggleActiveStatusArea = (Inativo) => {
    const areas = document.querySelectorAll(".inactiveArea");
    areas.forEach((area) => {
      if (Inativo) {
        area.classList.add("disabled");
      } else {
        area.classList.remove("disabled");
      }
    });
  };

  const PUTStatusAtivo = async (id) => {
    const response = await fetch(
      `${BASE_URL}/paciente/toggle/${id}`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      console.error("Erro ao atualizar status do paciente");
    }
  };

  const formatarDataParaExibir = (dataISO) => {
    if (!dataISO) return "--";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div>
      <div
        className="BackgroundTransparent FlexCenterBetween"
        style={{ height: "5vh", margin: "0 0 6px 0" }}
      >
        <div
          className="FlexCenterEnd Draggable"
          style={{ width: "80%", margin: "6px 10px 0 0" }}
        >
          <h4 style={{ margin: "0 10px" }}>{userData?.nm_usuario}</h4>
          <img
            className="FlexCenterMid"
            style={{ width: "14px", height: "14px", margin: "0 10px" }}
            src={PsicologiaIcon}
          />
          <h4 style={{ margin: "0 10px" }}>{userData?.cip}</h4>
        </div>
        <button
          className="BTNLogout  FlexCenterMid UserSelectNone TextCenter TextBold"
          onClick={onLogout}
        >
          <img
            style={{ width: "14px", height: "14px", margin: "0 5px" }}
            src={LogoutIcon}
          />
          LOGOUT
        </button>
        <div id="ZIndex">
          <div className="FlexCenterMid">
            <button className="WindowBtns" onClick={handleMinimize}>
              🗕
            </button>
            <button className="WindowBtns" onClick={handleMaximize}>
              🗖
            </button>
            <button className="WindowBtns" onClick={handleFechar}>
              ✖
            </button>
          </div>
        </div>
      </div>
      <div
        className="FlexCenterEvenly"
        style={{ height: "30vh", marginBottom: "15px" }}
      >
        <div>
          <button
            className="FlexCenterMid BTNCircle UserSelectNone"
            onClick={() => toggleIframe("IframeAgenda")}
            title="Cadastrar Paciente"
          >
            <img
              className="ImgCircle FlexCenterMid BackgroundTransparent"
              src={calendar}
            />
          </button>
          <button
            className="FlexCenterMid BTNCircle UserSelectNone"
            onClick={() => toggleIframe("IframeTranstorno")}
            title="Cadastrar Transtorno"
          >
            <img
              className="ImgCircle FlexCenterMid BackgroundTransparent"
              src={CadastroTranstornoIcon}
            />
          </button>
          <button
            className="FlexCenterMid BTNCircle UserSelectNone"
            onClick={() => toggleIframe("IframePacienteCadastro")}
            title="Cadastrar Paciente"
          >
            <img
              className="ImgCircle FlexCenterMid BackgroundTransparent"
              src={AdicionarPacienteIcon}
            />
          </button>
        </div>
        <div
          className="FlexCenterMid Border BackgroundBlue"
          style={{ width: "58%", height: "100%" }}
        >
          <button
            className="FlexCenterMid BTNCircle UserSelectNone inactiveArea ImgPerfil"
            onClick={() => {
              toggleIframe("IframeDataPacient");
              setPacienteEditado((prev) => !prev);
            }}
            style={{ width: "150px", height: "150px" }}
          >
            <img
              className="FlexCenterMid, Border BackgroundTransparent UserSelectNone"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "100%",
                margin: "0 5px",
              }}
              src={PerfilPhoto}
              title="Dados do Paciente"
            />
          </button>
          <div
            className="FlexCenterMid"
            style={{ width: "70%", height: "100%" }}
          >
            <div style={{ width: "450px" }}>
              <div
                className="FlexCenterBetween BackgroundTransparent"
                style={{ height: "30px", position: "relative" }}
              >
                <h2
                  className="TextBold"
                  style={{ color: "#f5f5f5", margin: "10px 0px 0px 0px" }}
                >
                  {dadosPaciente ? dadosPaciente.nm_paciente : "CARREGANDO..."}
                </h2>
                <input
                  type="checkbox"
                  checked={statusAtivo}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setStatusAtivo(isChecked);
                    PUTStatusAtivo(pacienteID);
                    toggleActiveStatusArea(isChecked);
                    setPacientesModificados((prev) => !prev);
                    const div = document.getElementById("DivLists");

                    if (!div.classList.contains("Hidden") && isChecked) {
                      openDivArea("DivLists", "");
                    }
                  }}
                  className="HiddenCheckbox"
                  id="checkbox"
                />
                <label htmlFor="checkbox" className="Switch FlexCenterMid">
                  <p
                    className="BackgroundTransparent   StateInativo Hidden UserSelectNone TextLeft TextBold"
                    style={{ margin: "0", marginLeft: "12px" }}
                  >
                    Inativo
                  </p>
                  <p
                    className="BackgroundTransparent StateAtivo UserSelectNone TextRight TextBold"
                    style={{ margin: "0", marginRight: "20px" }}
                  >
                    Ativo
                  </p>
                  <span className="Slider"></span>
                </label>
              </div>
              <div>
                <div className="FlexCenterStart">
                  <ol style={{ paddingInlineStart: "20px" }}>
                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>cep:</strong>
                      {!enderecoPaciente
                        ? "carregando..."
                        : enderecoPaciente.error
                        ? "--"
                        : enderecoPaciente.cep
                        ? enderecoPaciente.cep
                        : "--"}
                    </li>

                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>cidade:</strong>
                      {!enderecoPaciente
                        ? "carregando..."
                        : enderecoPaciente.error
                        ? "--"
                        : enderecoPaciente.cidade
                        ? enderecoPaciente.cidade
                        : "--"}
                    </li>
                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>
                        NASCIMENTO:
                      </strong>
                      {dadosPaciente
                        ? formatarDataParaExibir(dadosPaciente.dt_nascimento)
                        : "--"}
                    </li>
                  </ol>
                  <div
                    style={{
                      height: "10vh",
                      width: "2px",
                      borderRadius: "3px",
                      margin: "10px",
                      backgroundColor: "#f5f5f5",
                    }}
                  ></div>
                  <ol style={{ paddingInlineStart: "20px" }}>
                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>TELEFONE:</strong>
                      {primeiroTelefone}
                    </li>
                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>sexo:</strong>
                      {dadosPaciente
                        ? dadosPaciente.sexo == "F"
                          ? "Feminino"
                          : "Masculino"
                        : "--"}
                    </li>
                    <li
                      className="TextBold"
                      style={{
                        listStyleType: "circle",
                        fontSize: "65%",
                        color: "#f5f5f5",
                        margin: "6ox 10px 0 0",
                      }}
                    >
                      <strong style={{ paddingRight: "3px" }}>
                        RESPONSAVEL:
                      </strong>
                      {primeiroResponsavel}
                    </li>
                  </ol>
                </div>
                <div className="FlexDownEnd inactiveArea">
                  <button
                    className="BTNPurple"
                    style={{
                      height: "30px",
                      width: "120px",
                      fontSize: "12px",
                      margin: "10px 5px",
                    }}
                    onClick={() => toggleIframe("IframeHistorico")}
                  >
                    Prontuário
                  </button>
                  <button
                    className="BTNPurple"
                    style={{
                      height: "30px",
                      width: "120px",
                      fontSize: "12px",
                      margin: "10px 5px",
                    }}
                    onClick={() => toggleIframe("IframeMedicamentos")}
                  >
                    Medicamentos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="FlexCenterMid Border BackgroundBlue"
          style={{ width: "34%", height: "100%" }}
        >
          <div
            className="FlexCenterMid inactiveArea"
            style={{ width: "100%", height: "90%" }}
          >
            <div>
              <ManterPatologia cd_paciente={pacienteID}></ManterPatologia>
            </div>
          </div>
        </div>
      </div>

      <div
        className="FlexUpEvenly"
        style={{ height: "50vh", marginBottom: "10px" }}
      >
        <div style={{ width: "32.6%" }} id="BtnList">
          <button
            className="BackgroundBlue Border inactiveArea"
            style={{
              width: "100%",
              height: "50px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "10px",
            }}
            onClick={() => openDivArea("DivLists", "diagnostico")}
          >
            Suposto Diagnostico
          </button>
          <button
            className="BackgroundBlue Border inactiveArea"
            style={{
              width: "100%",
              height: "50px",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              openDivArea("DivLists", "metas");
              setMetasModificadas((prev) => !prev);
            }}
          >
            Lista de metas
          </button>
        </div>
        <div
          id="DivLists"
          className="Hidden Border BackgroundBlue"
          style={{ width: "32%", height: "100%" }}
        >
          {listName === "atividades" && (
            <>
              <div
                className="FlexCenterEnd"
                style={{ width: "100%", marginTop: "5px" }}
              >
                <button
                  className="BTNExitIFrame TextBold"
                  onClick={() => openDivArea("DivLists", "")}
                >
                  ✖
                </button>
              </div>
              <div
                className="FlexCenterMid"
                style={{ width: "100%", height: "100%" }}
              >
                <ManterAtividade />
              </div>
            </>
          )}
          {listName === "diagnostico" && (
            <>
              <div
                className="FlexCenterEnd"
                style={{ width: "100%", marginTop: "5px" }}
              >
                <button
                  className="BTNExitIFrame TextBold"
                  onClick={() => openDivArea("DivLists", "")}
                >
                  ✖
                </button>
              </div>
              <div
                className="FlexCenterMid"
                style={{ width: "100%", height: "100%" }}
              >
                <SupostoDiagnostico pacienteId={pacienteID} />
              </div>
            </>
          )}
          {listName === "metas" && (
            <>
              <div
                className="FlexCenterEnd"
                style={{ width: "100%", marginTop: "5px" }}
              >
                <button
                  className="BTNExitIFrame TextBold"
                  onClick={() => openDivArea("DivLists", "")}
                >
                  ✖
                </button>
              </div>
              <div
                className="FlexCenterMid"
                style={{ width: "100%", height: "92%" }}
              >
                <ManterMeta pacienteID={pacienteID} />
              </div>
            </>
          )}
        </div>
        <div
          className="FlexCenterMid Border BackgroundBlue inactiveArea"
          style={{ width: "32%", height: "100%" }}
        >
          <Grafico pacienteID={pacienteID} />
        </div>
        <div
          className="FlexCenterMid Border BackgroundBlue inactiveArea"
          style={{ width: "32%", height: "100%" }}
        >
          <ManterComportamento pacienteID={pacienteID} />
        </div>
      </div>

      <div className="FlexCenterEvenly" style={{ minHeight: "10vh" }}>
        <button
          className="FlexCenterMid UserSelectNone BackgroundTransparent"
          onClick={() => toggleIframe("IframeListarPaciente")}
          title="Listar Pacientes"
          style={{ border: "none" }}
        >
          <img
            src={Seta}
            className="BTNCircle"
            style={{
              width: "100%",
              margin: "0",
              backgroundColor: "#ffb347",
              border: "none",
            }}
          ></img>
        </button>
      </div>

      {/*AQUI COMEÇA OS IFRAME*/}
      <div
        id="IframeDataPacient"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeDataPacient")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <EditarPaciente
              dadosPaciente={dadosPaciente}
              enderecoPaciente={enderecoPaciente}
              telefoneDados={telefoneDados}
              responsaveisDados={responsaveisDados}
            />
          </div>
        </div>
      </div>

      <div
        id="IframeTranstorno"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeTranstorno")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ManterTranstorno></ManterTranstorno>
          </div>
        </div>
      </div>
      <div
        id="IframeAgenda"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeAgenda")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ManterAgenda cd_paciente={pacienteID} cd_usuario={userData.cd_usuario} />
          </div>
        </div>
      </div>

      <div
        id="IframePacienteCadastro"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframePacienteCadastro")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <CadastrarPaciente cd_usuario={userData.cd_usuario} />
          </div>
        </div>
      </div>

      <div
        id="IframeHistorico"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeHistorico")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ManterHistorico
              pacienteID={pacienteID}
              pacientData={dadosPaciente}
            />
          </div>
        </div>
      </div>

      <div
        id="IframeListarPaciente"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeListarPaciente")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ListarPacientes
              cd_usuario={userData.cd_usuario}
              toggleIframe={() => toggleIframe("IframeListarPaciente")}
            />
          </div>
        </div>
      </div>

      <div
        id="IframeMedicamentos"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ minWidth: "80vw", minHeight: "700px", maxHeight: "90vh" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeMedicamentos")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ManterMedicamentos cd_paciente={pacienteID} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegundoAcesso;
