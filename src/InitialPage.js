import React, { useState, useEffect } from "react";
import "./css/OrganizeCSS/base.css";
import "./css/OrganizeCSS/components.css";
import "./css/OrganizeCSS/layout.css";
import "./css/OrganizeCSS/utils.css";

import HomePage from "./pages/HomePage.js";
import Logo from "./Images/Logo.svg";
import EyeOpen from "./Images/EyeOpen.png";
import EyeClose from "./Images/eyeClose.png";
import LeftArrow from "./Images/leftArrow.png";
import { showAlert } from "./utils/alerts.js";

export const LOADING_SCREEN = () =>  (
  <div className="FlexCenterMid" style={{ height: "100vh" }}>
    <div style={{ textAlign: "center" }}>
      <img
        src={Logo}
        alt="Logo"
        style={{ width: "150px", marginBottom: "20px" }}
      />
      <p style={{ color: "#fff", fontSize: "18px" }}>Carregando...</p>
    </div>
  </div>
);

export const carregarMensagemNegativa = async (nomeMensagem) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/mensagemNegativa?msg=${encodeURIComponent(
        nomeMensagem
      )}`
    );

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Erro ao carregar a mensagem positiva:", error);
  }
};

const InitialPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formLogin, setFormLogin] = useState({
    EMAIL: "",
    SENHA: "",
  });
  const [formRegister, setFormRegister] = useState({
    NM_USUARIO: "",
    EMAIL: "",
    SENHA: "",
    CIP: "",
  });
  const [userData, setUserData] = useState(null);
  const [stateLogin, setStateLogin] = useState("L");
  const [userForgotPassword, setUserForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !isLoggedIn && stateLogin === "L") {
        handleLogin();
      } else if (event.key === "Enter" && stateLogin === "R") {
        registrarUsuario();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formLogin, isLoggedIn, stateLogin]);

  useEffect(() => {
    const loginSalvo = localStorage.getItem("loginSalvo");

    if (loginSalvo) {
      const { EMAIL, SENHA, manterConectado } = JSON.parse(loginSalvo);

      if (manterConectado) {
        setFormLogin({ EMAIL, SENHA });
        setManterConectado(true);

        handleLoginAutomatico(EMAIL, SENHA).finally(() => {
          setIsCheckingLogin(false);
        });
        return;
      }
    }

    setIsCheckingLogin(false);
  }, []);

  function formatarCIP(cip) {
    if (!cip) return "";
    const limpo = cip.replace(/\D/g, "");
    return limpo.replace(/(\d{2})(\d{5})/, "$1/$2");
  }
  const handleLogout = () => {
    setIsLoggedIn(false);

    // Sempre limpa ao fazer logout
    localStorage.removeItem("loginSalvo");
    localStorage.removeItem("CD_USUARIO");
    setFormLogin({ EMAIL: "", SENHA: "" });
    setManterConectado(false); // Desmarca o checkbox também
  };

  const handleLoginAutomatico = async (email, senha) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/usuario");
      const data = await response.json();

      let user = null;

      for (let i = 0; i < data.length; i++) {
        if (data[i].EMAIL === email && data[i].SENHA === senha) {
          user = { ...data[i], CIP: formatarCIP(data[i].CIP) };
          setUserData(user);
          break;
        }
      }

      if (user) {
        try {
          await fetch(
            `http://127.0.0.1:5000/definir_usuario/${user.CD_USUARIO}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("Erro ao definir usuário:", error);
        }

        setIsLoggedIn(true);
        localStorage.setItem("CD_USUARIO", user.CD_USUARIO);
      } else {
        localStorage.removeItem("loginSalvo");
        setManterConectado(false);
      }
    } catch (error) {
      console.error("Erro no login automático:", error);
      localStorage.removeItem("loginSalvo");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/usuario");
      const data = await response.json();

      let user = null;
      let erroExibido = false;

      for (let i = 0; i < data.length; i++) {
        if (data[i].EMAIL === formLogin.EMAIL) {
          if (data[i].SENHA === formLogin.SENHA) {
            user = { ...data[i], CIP: formatarCIP(data[i].CIP) };
            setUserData(user);
            break;
          } else {
            await showAlert.error("Cadastro ou senha incorreta!");
            erroExibido = true;
            return;
          }
        }
      }

      if (!user) {
        if (!erroExibido) {
          await showAlert.error("Falha no login!");
        }
        return;
      }

      /*try {
        await fetch(
          `http://127.0.0.1:5000/definir_usuario/${user.CD_USUARIO}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Erro ao definir usuário:", error);
      }*/

      console.log("Checkbox marcado:", manterConectado);
      if (manterConectado) {
        console.log("Salvando login no localStorage...");
        localStorage.setItem(
          "loginSalvo",
          JSON.stringify({
            EMAIL: formLogin.EMAIL,
            SENHA: formLogin.SENHA,
            manterConectado: true,
          })
        );
        console.log("Login salvo:", localStorage.getItem("loginSalvo"));
      } else {
        console.log("Removendo login salvo...");
        localStorage.removeItem("loginSalvo");
      }

      setIsLoggedIn(true);
      localStorage.setItem("CD_USUARIO", user.CD_USUARIO);
    } catch (error) {
      console.error("Erro no handleLogin:", error);
      await showAlert.error("Falha no login!");
    }
  };

  const registrarUsuario = async () => {
    try {
      const getResponse = await fetch("http://127.0.0.1:5000/usuario");
      const data = await getResponse.json();

      if (
        !formRegister.EMAIL ||
        !formRegister.CIP ||
        !formRegister.NM_USUARIO ||
        !formRegister.SENHA
      ) {
        await showAlert.error("CAMPOS VAZIOS");
        return;
      }
      for (let i = 0; i < data.length; i++) {
        if (
          data[i][4] === formRegister.CIP ||
          data[i][3] === formRegister.EMAIL
        ) {
          await showAlert.error("REGISTRO EXISTENTE");
          return;
        }
      }

      const response = await fetch("http://127.0.0.1:5000/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formRegister),
      });

      const rawResponse = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(rawResponse);
        } catch (e) {
          console.error("Resposta não é JSON:", rawResponse);
          throw new Error("Resposta da API não é JSON válido");
        }
        return setStateLogin("L");
      } else {
        throw new Error("Falha ao registrar usuário");
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      await showAlert.error("Erro ao conectar com o servidor!");
    }
  };

  const handleFechar = () => {
    window.electronClose.fecharApp();
  };

  const handleMinimize = () => {
    window.electronMinimize.minimize();
  };

  const handleMaximize = () => {
    window.electronMaximize.maximize();
  };

  const togglePasswordVisibility = () => {
    setAnimate(true);
    setShowPassword((prev) => !prev);

    setTimeout(() => setAnimate(false), 300);
  };

  const enviarSolicitacao = async () => {
    try {
      let user = null;

      try {
        const response = await fetch("http://127.0.0.1:5000/usuario");
        const data = await response.json();

        for (let i = 0; i < data.length; i++) {
          if (data[i].EMAIL === email) {
            user = { ...data[i], CIP: formatarCIP(data[i].CIP) };
            setUserForgotPassword(user); // ainda atualiza o estado para render
            break;
          }
        }
      } catch (error) {
        await showAlert.error("Erro ao conectar com o servidor!");
        return;
      }

      if (!user) {
        setMensagem("Usuário não encontrado.");
        return;
      }

      // Usa a variável `user`, não o estado
      const response2 = await fetch("http://127.0.0.1:5000/alterar_senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CD_USUARIO: user.CD_USUARIO, EMAIL: email }),
      });

      const data2 = await response2.json();
      if (response2.ok) {
        setMensagem("Verifique seu e-mail para redefinir a senha.");
      } else {
        setMensagem(data2.error || "Erro ao enviar solicitação.");
      }
    } catch (error) {
      setMensagem("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="BackgroundBlue">
      {isCheckingLogin ? (
        // ← TELA DE LOADING
        <LOADING_SCREEN />
      ) : !isLoggedIn ? (
        <div>
          <div className="NoDraggable  FlexCenterEnd UserSelectNone">
            <div
              className="Draggable"
              style={{ width: "100%", height: "30px" }}
            ></div>
            <button className="WindowBtns" onClick={handleMinimize}>
              🗕
            </button>
            <button className="WindowBtns" onClick={handleMaximize}>
              🗖
            </button>
            <button
              className="WindowBtns WindowBtnClose"
              onClick={handleFechar}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <div>
              <div className="FlexCenterMid">
                <img
                  className="UseSelectNone"
                  style={{ width: "150px" }}
                  src={Logo}
                ></img>
              </div>
              <h1 className="Title TextCenter TextBold">MENTECH</h1>
              {stateLogin === "L" && (
                <div className="BoxLoginPage">
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Email</p>
                    <input
                      maxLength={90}
                      placeholder="ex: exemplo@gmail.com"
                      value={formLogin.EMAIL}
                      onChange={(e) =>
                        setFormLogin({ ...formLogin, EMAIL: e.target.value })
                      }
                      className="InputLogin"
                    />
                  </div>
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Senha</p>
                    <div className="FlexCenterMid">
                      <input
                        maxLength={90}
                        value={formLogin.SENHA}
                        onChange={(e) =>
                          setFormLogin({ ...formLogin, SENHA: e.target.value })
                        }
                        type={showPassword ? "text" : "password"}
                        className="InputLogin"
                        style={{ width: 85 + "%" }}
                      />
                      <button
                        className="VerSenha"
                        onClick={togglePasswordVisibility}
                      >
                        <img
                          src={showPassword ? EyeClose : EyeOpen}
                          alt="Toggle visibility"
                          className={animate ? "Pisca" : ""}
                          style={{ width: "25px", height: "25px" }}
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      margin: "10px 50px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="manterConectado"
                      checked={manterConectado}
                      onChange={(e) => setManterConectado(e.target.checked)}
                      style={{
                        width: "18px",
                        height: "18px",
                        marginRight: "8px",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                    />
                    <label
                      htmlFor="manterConectado"
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                        fontWeight: "500",
                      }}
                    >
                      Manter conectado
                    </label>
                  </div>
                  <div
                    className="TextCenter"
                    style={{ width: "100%", fontWeight: "500" }}
                  >
                    <div
                      style={{
                        marginRight: "55px",
                        marginBottom: "30px",
                        textAlign: "end",
                      }}
                    >
                      <a
                        className="LinkLogin"
                        onClick={() => setStateLogin("E")}
                      >
                        Esqueci minha senha
                      </a>
                    </div>
                    <div>
                      <button className="BTNPurple" onClick={handleLogin}>
                        Entrar
                      </button>
                      <p style={{ marginTop: "10px" }}>
                        Não Possui Login?{" "}
                        <a
                          className="LinkLogin"
                          onClick={() => setStateLogin("R")}
                        >
                          Registre-se
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {stateLogin === "R" && (
                <div
                  className="BoxLoginPage"
                  style={{ height: "50vh", paddingTop: "4vh" }}
                >
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Nome</p>
                    <input
                      maxLength={90}
                      placeholder="ex: João Silva"
                      value={formRegister.NM_USUARIO}
                      onChange={(e) =>
                        setFormRegister({
                          ...formRegister,
                          NM_USUARIO: e.target.value,
                        })
                      }
                      className="InputLogin"
                    />
                  </div>
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Email</p>
                    <input
                      maxLength={90}
                      placeholder="ex: exemplo@gmail.com"
                      value={formRegister.EMAIL}
                      onChange={(e) =>
                        setFormRegister({
                          ...formRegister,
                          EMAIL: e.target.value,
                        })
                      }
                      className="InputLogin"
                    />
                  </div>
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Codigo CRP</p>
                    <input
                      maxLength={8}
                      value={formRegister.CIP}
                      onChange={(e) => {
                        const formatted = formatarCIP(e.target.value);

                        setFormRegister({
                          ...formRegister,
                          CIP: formatted,
                        });
                      }}
                      className="InputLogin"
                    />
                  </div>
                  <div style={{ margin: "10px 50px" }}>
                    <p className="TextBold">Senha</p>
                    <div className="FlexCenterMid">
                      <input
                        maxLength={90}
                        value={formRegister.SENHA}
                        onChange={(e) =>
                          setFormRegister({
                            ...formRegister,
                            SENHA: e.target.value,
                          })
                        }
                        type={showPassword ? "text" : "password"}
                        className="InputLogin"
                        style={{ width: 85 + "%" }}
                      />
                      <button
                        className="VerSenha"
                        onClick={togglePasswordVisibility}
                      >
                        <img
                          src={showPassword ? EyeClose : EyeOpen}
                          alt="Toggle visibility"
                          className={animate ? "LG_pisca" : ""}
                          style={{ width: "25px", height: "25px" }}
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    className="TextCenter"
                    style={{ width: "100%", fontWeight: "500" }}
                  >
                    <div>
                      <button className="BTNPurple" onClick={registrarUsuario}>
                        Registrar
                      </button>
                      <p style={{ marginTop: "10px" }}>
                        Já Possui Login?{" "}
                        <a
                          className="LinkLogin"
                          onClick={() => {
                            setStateLogin("L");
                          }}
                        >
                          Login
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {stateLogin === "E" && (
                <div className="BoxLoginPage">
                  <div className="FlexCenterStart" style={{ margin: "0 50px" }}>
                    <a onClick={() => setStateLogin("L")}>
                      <img
                        style={{
                          width: "30px",
                          marginRight: "4vw",
                          cursor: "pointer",
                        }}
                        src={LeftArrow}
                      />
                    </a>
                    <h3 style={{ marginLeft: "2vw" }}>Confirme seu Email</h3>
                  </div>
                  <div className="FlexCenterMid" style={{ height: "30vh" }}>
                    <div style={{ width: "100%" }}>
                      <div
                        className=" LG_EsqueciSenhaInputArea"
                        style={{ margin: "10px 50px 30px 50px" }}
                      >
                        <p className="TextBold">Email</p>
                        <input
                          maxLength={90}
                          placeholder="ex: exemplo@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="InputLogin"
                        />
                      </div>
                      <div className="FlexCenterMid">
                        <button
                          className="BTNPurple"
                          onClick={() => enviarSolicitacao()}
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <HomePage onLogout={handleLogout} userData={userData} />
        </div>
      )}
    </div>
  );
};

export default InitialPage;
