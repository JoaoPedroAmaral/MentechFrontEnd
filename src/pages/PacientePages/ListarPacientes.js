import { useState, useEffect } from "react";
import logo from "../../Images/Logo.svg";
import { useGlobal } from "../../global/GlobalContext.js";
import { Tooltip } from "antd";

const ListarPacientes = ({ cd_usuario, toggleIframe, setIsHavePaciente }) => {
  const [paciente, setPaciente] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtroSelecionado, setFiltroSelecionado] = useState("todos");
  const { pacientesModificados } = useGlobal();

  useEffect(() => {
    fetchPaciente(cd_usuario);
  }, [cd_usuario, pacientesModificados]);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, filtroSelecionado, paciente]);

  const fetchPaciente = async (id) => {
    try {
      const response = await fetch(
        `https://mentechbackend.onrender.com/paciente/por_usuario/${id}`
      );
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setPaciente(dataJson);
      setPacientesFiltrados(dataJson);
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...paciente];

    if (busca.trim() !== "") {
      resultado = resultado.filter((p) =>
        p.nm_paciente.toLowerCase().includes(busca.toLowerCase())
      );
    }

    switch (filtroSelecionado) {
      case "masculino":
        resultado = resultado.filter((p) => p.nm_genero === "Masculino");
        break;
      case "feminino":
        resultado = resultado.filter((p) => p.nm_genero === "Feminino");
        break;
      case "ativos":
        resultado = resultado.filter((p) => p.ativo === "S");
        break;
      case "inativos":
        resultado = resultado.filter((p) => p.ativo === "N");
        break;
      case "az":
        resultado.sort((a, b) => a.nm_paciente.localeCompare(b.nm_paciente));
        break;
      case "za":
        resultado.sort((a, b) => b.nm_paciente.localeCompare(a.nm_paciente));
        break;
      case "mais_novos":
        resultado.sort(
          (a, b) => new Date(b.dt_nascimento) - new Date(a.dt_nascimento)
        );
        break;
      case "mais_velhos":
        resultado.sort(
          (a, b) => new Date(a.dt_nascimento) - new Date(b.dt_nascimento)
        );
        break;
      default:
        break;
    }

    setPacientesFiltrados(resultado);
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroSelecionado("todos");
    setMostrarFiltro(false);
  };

  return (
    <div
      className="container-paciente"
      style={{
        width: "90%",
        height: "650px",
        margin: "auto",
        padding: "20px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        className="header-paciente FlexCenterMid"
        style={{ gap: "10px", marginBottom: "20px" }}
      >
        <input
          type="text"
          placeholder="Buscar paciente..."
          className="search-input-paciente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            flex: "1",
            padding: "10px",
            border: "none",
            borderRadius: "6px",
          }}
        />
        <div style={{ position: "relative" }}>
          <img
            src="https://img.icons8.com/ios-filled/50/filter--v1.png"
            className="icon-paciente"
            alt="Filtro"
            onClick={() => setMostrarFiltro(!mostrarFiltro)}
            style={{
              width: "24px",
              height: "24px",
              cursor: "pointer",
              filter:
                filtroSelecionado !== "todos" ? "brightness(0.7)" : "none",
            }}
          />

          {mostrarFiltro && (
            <div
              style={{
                position: "absolute",
                top: "35px",
                right: "0",
                background: "white",
                border: "1px solid #b399d4",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                zIndex: 1000,
                minWidth: "200px",
              }}
            >
              <div
                style={{
                  marginBottom: "10px",
                  fontWeight: "bold",
                  color: "#b399d4",
                }}
              >
                Filtrar por:
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{ display: "block", fontSize: "12px", color: "#666" }}
                >
                  Sexo
                </label>
                <select
                  value={
                    filtroSelecionado === "masculino" ||
                    filtroSelecionado === "feminino"
                      ? filtroSelecionado
                      : ""
                  }
                  onChange={(e) =>
                    setFiltroSelecionado(e.target.value || "todos")
                  }
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #b399d4",
                  }}
                >
                  <option value="">Todos</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{ display: "block", fontSize: "12px", color: "#666" }}
                >
                  Status
                </label>
                <select
                  value={
                    filtroSelecionado === "ativos" ||
                    filtroSelecionado === "inativos"
                      ? filtroSelecionado
                      : ""
                  }
                  onChange={(e) =>
                    setFiltroSelecionado(e.target.value || "todos")
                  }
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #b399d4",
                  }}
                >
                  <option value="">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label
                  style={{ display: "block", fontSize: "12px", color: "#666" }}
                >
                  Ordenar
                </label>
                <select
                  value={
                    ["az", "za", "mais_novos", "mais_velhos"].includes(
                      filtroSelecionado
                    )
                      ? filtroSelecionado
                      : ""
                  }
                  onChange={(e) =>
                    setFiltroSelecionado(e.target.value || "todos")
                  }
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #b399d4",
                  }}
                >
                  <option value="">Padrão</option>
                  <option value="az">Nome A-Z</option>
                  <option value="za">Nome Z-A</option>
                  <option value="mais_novos">Mais Novos</option>
                  <option value="mais_velhos">Mais Velhos</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  onClick={limparFiltros}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#f0f0f0",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Limpar
                </button>
                <button
                  onClick={() => setMostrarFiltro(false)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    background: "#ffb347",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(busca || filtroSelecionado !== "todos") && (
        <div
          style={{
            marginBottom: "10px",
            fontSize: "12px",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{pacientesFiltrados.length} paciente(s) encontrado(s)</span>
          {filtroSelecionado !== "todos" && (
            <span
              style={{
                background: "#e6f7ff",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "11px",
              }}
            >
              Filtro ativo
            </span>
          )}
        </div>
      )}

      <div className="grid-pacientes">
        {pacientesFiltrados.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "#999",
            }}
          >
            Nenhum paciente encontrado
          </div>
        ) : (
          pacientesFiltrados.map((p) => (
            <button
              className="BackgroundTransparent BorderNone UserSelectPointer"
              key={p.cd_paciente}
              onClick={() => {
                localStorage.setItem(
                  `ultimoPaciente_${cd_usuario}`,
                  p.cd_paciente
                );
                window.dispatchEvent(
                  new CustomEvent("atualizarUltimoPaciente")
                );
                toggleIframe();
                if (typeof setIsHavePaciente === "function") {
                  setIsHavePaciente(true);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                className="card-paciente FlexCenterMid"
                style={{ flexDirection: "column" }}
              >
                <img
                  src={logo}
                  alt="Avatar"
                  className="avatar-paciente"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "60%",
                    border: "2px solid white",
                    marginBottom: "10px",
                  }}
                />

                <Tooltip title={p.nm_paciente} placement="top">
                  <div
                    className="nome-paciente texto-truncado"
                    style={{ color: "white", fontSize: "14px", fontWeight: "bold", maxWidth: "150px" }}
                  >
                    {p.nm_paciente}
                  </div>
                </Tooltip>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#ccc",
                    marginTop: "4px",
                  }}
                >
                  {p.nm_genero}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ListarPacientes;