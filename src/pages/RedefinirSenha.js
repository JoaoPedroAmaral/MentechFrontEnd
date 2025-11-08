import { useState, useEffect } from "react";

import EyeOpen from "../Images/EyeOpen.png";
import EyeClose from "../Images/eyeClose.png";
import { useParams } from "react-router-dom";

function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [animate, setAnimate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [CD_USUARIO, setCD_USUARIO] = useState("");
  const [CD_ALTERAR_SENHA, setCD_ALTERAR_SENHA] = useState("");

  const { cd_alterar_senha, cd_usuario, token } = useParams();

  useEffect(() => {
    setCD_ALTERAR_SENHA(cd_alterar_senha);
    setCD_USUARIO(cd_usuario);
  }, [cd_alterar_senha, cd_usuario, token]);

  const redefinir = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/alterar_senha/${CD_ALTERAR_SENHA}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CD_USUARIO: CD_USUARIO,
            token: token,
            NOVA_SENHA: novaSenha,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMensagem("Senha redefinida com sucesso!");
      } else {
        setMensagem(data.error || "Erro ao redefinir senha.");
      }
    } catch {
      setMensagem("Erro de conexão com o servidor.");
    }
  };

  const togglePasswordVisibility = () => {
    setAnimate(true);
    setShowPassword((prev) => !prev);

    setTimeout(() => setAnimate(false), 300);
  };

  return (
    <div className="RedefinirSenhaContainer">
      <div className="RedefinirSenhaBox">
        <h2 className="RedefinirSenhaTitle">Definir nova senha</h2>
        <div className="FlexCenterMid" style={{ marginBottom: "2em" }}>
          <input
            maxLength={90}
            type={showPassword ? "text" : "password"}
            className="RedefinirSenhaInput"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <button className="VerSenha" onClick={togglePasswordVisibility}>
            <img
              src={showPassword ? EyeClose : EyeOpen}
              alt="Toggle visibility"
              className={animate ? "Pisca" : ""}
              style={{ width: "25px", height: "25px" }}
            />
          </button>
        </div>
        <button className="RedefinirSenhaButton" onClick={redefinir}>
          Salvar nova senha
        </button>
        <p className="RedefinirSenhaMessage">{mensagem}</p>
      </div>
    </div>
  );
}

export default RedefinirSenha;
