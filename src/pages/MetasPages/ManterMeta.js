import React, { useState, useEffect } from "react";
import { useGlobal, BASE_URL } from "../../global/GlobalContext.js";
import AdicionarMetas from "./AdicionarMetas.js";
import Slider from "react-slick";
import iconTrash from "../../Images/Trash.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ManterAtividade from "../AtividadePage/ManterAtividade.js";
import { PieChart } from "react-minimal-pie-chart";
import activity from "../../Images/activity.png";
import LoadingOverlay from "../../global/Loading.js";

const ManterMeta = ({ pacienteID }) => {
  const [metas, setMetas] = useState([]);
  const {
    metasModificadas,
    setMetasModificadas,
    atividadeModificada,
    setAtividadeModificada,
  } = useGlobal();
  const [percentMetas, setPercentMetas] = useState({});
  const [atividadesMetas, setAtividadesMetas] = useState({});
  const [atividadePorMeta, setAtividadePorMeta] = useState([]);
  const [metaID, setMetaID] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const metasCarregadas = await carregarMetas(pacienteID);
      if (metasCarregadas.length > 0) {
        const novosPercent = {};
        const novasAtividades = {};

        for (const meta of metasCarregadas) {
          const { atividades, percent } = await carregarAtividades(
            meta.cd_meta
          );
          novosPercent[meta.cd_meta] = percent;
          novasAtividades[meta.cd_meta] = atividades;
        }

        setPercentMetas(novosPercent);
        setAtividadesMetas(novasAtividades);
      }
    };
    fetchData();
  }, [metasModificadas, pacienteID, atividadeModificada]);

  useEffect(() => {
    if (metaID && atividadesMetas[metaID]) {
      setAtividadePorMeta(atividadesMetas[metaID]);
    } else {
      setAtividadePorMeta([]);
    }
  }, [atividadesMetas, metaID]);

  function formatarDataBR(dataString) {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const carregarAtividades = async (metaID) => {
    try {
      const response = await fetch(
        `${BASE_URL}/atividade/por_meta/${metaID}`
      );
      if (!response.ok) throw new Error("Erro ao buscar atividades");
      const data = await response.json();

      const total = data.length;
      const concluidas = data.filter((a) => a.resultado === "Concluído").length;
      const percent = total ? Math.round((concluidas / total) * 100) : 0;

      return { atividades: data, percent };
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      return { atividades: [], percent: 0 };
    }
  };

  const toggleIframe = (iframeId) => {
    const iframe = document.getElementById(iframeId);
    iframe.classList.toggle("Hidden");
  };

  const carregarMetas = async (pacienteID) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/meta/por_paciente/${pacienteID}`
      );
      if (!response.ok) throw new Error("Erro ao buscar metas");
      const data = await response.json();
      setMetas(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      alert(`Erro ao buscar metas: ${error.message}`);
    }finally{
      setLoading(false);
    }
  };

  const toggleAtivoMeta = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/meta/alternar/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Erro ao atualizar status");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(`Erro ao atualizar status: ${error.message}`);
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    arrows: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const handleRemoverMeta = async (id) => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/meta/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Erro ao deletar meta");
      setMetasModificadas((prev) => !prev);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(`Erro ao atualizar status: ${error.message}`);
    }finally{
      setLoading(false)
    }
  };

  const concluirMeta = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/paciente_meta/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Erro ao concluir meta");
      setMetasModificadas((prev) => !prev);
    } catch (error) {
      console.error("Erro ao concluir meta:", error);
      alert(`Erro ao concluir meta: ${error.message}`);
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          width: "97%",
        }}
      >
        <LoadingOverlay isLoading={loading} />
        <div className="F_Title">
          <h2
            className="F_CadastrarTitle"
            style={{ fontSize: "20px", margin: "0 0 10px 0" }}
          >
            Gerenciador de Metas
          </h2>
        </div>
        <Slider {...settings}>
          {metas.map((meta) => (
            <div
              key={meta.cd_meta}
              className={`meta-card ${(meta.ativo === "S" || meta.ativo === "s") ? "" : "inactive"}`}
            >
              <div className="FlexCenterBetween">
                <h3 style={{ height: "30px", margin: "10px 0" }}>
                  {meta.meta}
                </h3>

                <div className="FlexCenterMid">
                  <button
                    id={`btnDelete-${meta.cd_meta}`}
                    className={`F_BtnGravidade ${
                      (meta.ativo === "S" || meta.ativo === "s") ? "Hidden" : ""
                    }`}
                    onClick={() => handleRemoverMeta(meta.cd_meta)}
                  >
                    <img className="F_TrashIcon" src={iconTrash} />
                  </button>
                  <input
                    type="checkbox"
                    id={`toggle-meta-${meta.cd_meta}`}
                    checked={(meta.ativo === "S" || meta.ativo === "s")}
                    onChange={() => {
                      setMetasModificadas((prev) => !prev);
                      toggleIframe(`btnDelete-${meta.cd_meta}`);
                      toggleAtivoMeta(meta.cd_meta);
                    }}
                  />
                  <label
                    htmlFor={`toggle-meta-${meta.cd_meta}`}
                    className="simple-switch"
                  />
                </div>
              </div>
              <p>{meta.obs_meta}</p>
              <div className="FlexCenterAround" style={{ marginTop: "10px" }}>
                <div style={{ width: "33%" }}>
                  <p>
                    <strong>Cadastro:</strong>{" "}
                    {formatarDataBR(meta.dt_cadastro)}
                  </p>
                </div>
                <div style={{ width: "33%" }}>
                  <p>
                    <strong>Conclusão:</strong>{" "}
                    {formatarDataBR(meta.dt_conclusao)}
                  </p>
                </div>
                <div style={{ width: "33%" }}>
                  <p>
                    <strong>Previsão:</strong>{" "}
                    {formatarDataBR(meta.dt_previsao)}
                  </p>
                </div>
              </div>
              <div className="FlexCenterBetween" style={{ marginTop: "10px" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="btn_graphic"
                  onClick={() => {
                    toggleIframe("IframeAtividade");
                    setMetaID(meta.cd_meta);
                  }}
                >
                  <PieChart
                    data={[
                      {
                        title: "Concluído",
                        value: percentMetas[meta.cd_meta] || 0,
                        color: "#4EED63",
                      },
                      {
                        title: "Pendentes",
                        value: 100 - (percentMetas[meta.cd_meta] || 0),
                        color: "#ff362b",
                      },
                    ]}
                    style={{ width: "50px", height: "50px" }}
                    lineWidth={100}
                    rounded={false}
                    animate
                  />
                  <img
                    src={activity}
                    alt="Activity"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "20px",
                      height: "20px",
                      pointerEvents: "none",
                    }}
                  />
                </div>
                <div>
                  {percentMetas[meta.cd_meta] === 100 && (
                    <button
                      onClick={() => concluirMeta(meta.cd_meta)}
                      className="BTNPurple"
                      style={{
                        height: "30px",
                        fontSize: "12px",
                        width: "100px",
                      }}
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
        <div className="FlexCenterEvenly" style={{ marginTop: "10px" }}>
          <button
            className="BTNPurple"
            style={{
              height: "30px",
              width: "120px",
              fontSize: "12px",
              margin: "10px 5px",
            }}
            onClick={() => {
              toggleIframe("IframeAdicionarMeta");
            }}
          >
            Adicionar Meta
          </button>
        </div>
      </div>

      <div
        id="IframeAdicionarMeta"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: "0",
          left: "0",
        }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ width: "500px", height: "600px" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeAdicionarMeta")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <AdicionarMetas
              pacienteID={pacienteID}
              toggleIframe={toggleIframe}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>

      <div
        id="IframeAtividade"
        className="Hidden FlexCenterMid ZIndex iframes"
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          left: "0",
          top: "0",
        }}
      >
        <div
          className="Border BackgroundBlue"
          style={{ width: "1200px", height: "700px" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframeAtividade")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <ManterAtividade atividade={atividadePorMeta} metaID={metaID} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ManterMeta;
