import React from "react";

import ManterTranstorno from "../TranstornoPages/ManterTranstorno.js";
import CadastrarPaciente from "../PacientePages/CadastrarPaciente.js";

import "../../css/OrganizeCSS/base.css";
import "../../css/OrganizeCSS/components.css";
import "../../css/OrganizeCSS/layout.css";
import "../../css/OrganizeCSS/utils.css";

import LogoutIcon from "../../Images/LogoutIconBK.png";
import PsicologiaIcon from "../../Images/PsicologiaIcon.png";
import CadastroTranstornoIcon from "../../Images/CadastroTranstornoIcon.png";
import AdicionarPacienteIcon from "../../Images/AdicionarPacienteIcon.png";
import Seta from "../../Images/seta.png";


import ListarPacientes from "../PacientePages/ListarPacientes.js";

const PrimeiroAcesso = ({ onLogout, setIsHavePaciente, userData }) => {
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
        className="FlexCenterMid"
        style={{ width: "100%", height: "calc(100vh - 6vh)" }}
      >
        <div className="Border" style={{ width: "80%", height: "80%" }}>
          <div
            className="FlexCenterMid"
            style={{ height: "100%", width: "100%" }}
          >
            <div>
              <h1 style={{ color: "#959a90" }}>
                ADICIONE/SELECIONE UM PACIENTE!
              </h1>
              <div className="FlexCenterMid" style={{ gap: "20px" }}>
                <button
                  className="FlexCenterMid BTNCircle UserSelectNone"
                  onClick={() => toggleIframe("IframeTranstorno")}
                  style={{marginBottom: "0px"}}
                >
                  <img
                    className="ImgCircle FlexCenterMid BackgroundTransparent"
                    src={CadastroTranstornoIcon}
                  />
                </button>
                <button
                  className="FlexCenterMid BTNCircle UserSelectNone"
                  onClick={() => toggleIframe("IframePacienteCadastro")}
                  style={{marginBottom: "0px"}}
                >
                  <img
                    className="ImgCircle FlexCenterMid BackgroundTransparent"
                    src={AdicionarPacienteIcon}
                  />
                </button>
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
            </div>
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
          style={{ width: "1200px", height: "700px" }}
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
              setIsHavePaciente={setIsHavePaciente}
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
          style={{ width: "1200px", height: "700px" }}
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
        id="IframePacienteCadastro"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{ height: "100vh", width: "100vw", position: "fixed", top: "0" }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ width: "1260px", height: "700px" }}
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
            <CadastrarPaciente setIsHavePaciente={setIsHavePaciente} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeiroAcesso;
