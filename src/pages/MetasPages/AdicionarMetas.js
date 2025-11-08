import React, { useState, useEffect } from "react";
import { useGlobal } from "../../global/GlobalContext";
import { showAlert } from "../../utils/alerts.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AdicionarMetas = ({ pacienteID, toggleIframe }) => {
  const { setMetasModificadas } = useGlobal();
  const [novaMeta, setNovaMeta] = useState({
    DT_PREVISAO: "",
    META: "",
    OBS_META: "",
  });

  const handleMeta = async () => {
    if (!novaMeta.META || !novaMeta.DT_PREVISAO) {
      await showAlert.error("Nome do Transtorno e CID11 são obrigatórios!");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          META: novaMeta.META,
          OBS_META: novaMeta.OBS_META,
        }),
      });

      const dataJson = await response.json();

      return dataJson.CD_META;
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    }
  };

  const handleSubmit = async () => {
    const MetaID = await handleMeta();
    try {
      const response = await fetch("http://127.0.0.1:5000/paciente_meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CD_META: MetaID,
          CD_PACIENTE: pacienteID,
          DT_PREVISAO: novaMeta.DT_PREVISAO,
        }),
      });

      setNovaMeta({
        DT_PREVISAO: "",
        META: "",
        OBS_META: "",
      });

      setMetasModificadas((prev) => !prev);
      await showAlert.success("Meta Criada!");
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    }
  };

  return (
    <div style={{ width: "97%", height: "100%" }}>
      <div className="F_Title">
        <h2
          className="F_CadastrarTitle"
          style={{ fontSize: "20px", margin: "0 0 10px 0" }}
        >
          Adicionar Metas
        </h2>
      </div>
      <div className="FlexCenterMid" style={{ width: "100%", marginTop: "5%" }}>
        <div>
          <div className="F_CriarTranstornoInputObrigatorio">
            <p style={{ textAlign: "center" }}>Data de previsão*</p>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <DatePicker
                className="F_NomeAreaTranstorno datepicker-sem-foco"
                name="DT_NASCIMENTO"
                placeholder="dd/mm/yyyy"
                format="DD/MM/YYYY"
                value={
                  novaMeta.DT_PREVISAO
                    ? dayjs(novaMeta.DT_PREVISAO, "DD/MM/YYYY")
                    : null
                }
                onChange={(date, dateString) => {
                  setNovaMeta({
                    ...novaMeta,
                    DT_PREVISAO: dateString,
                  });
                }}
                style={{ width: "140px" }}
                maxLength={10}
              />
            </div>
          </div>

          <div
            className="F_CriarTranstornoInputObrigatorio"
            style={{ marginTop: "20px" }}
          >
            <p style={{ textAlign: "center" }}>Nome da Meta*</p>
            <input
              className="F_NomeAreaTranstorno"
              placeholder="Ex: Melhorar a habilidade de socializar"
              name="META"
              value={novaMeta.META}
              onChange={(e) =>
                setNovaMeta({
                  ...novaMeta,
                  META: e.target.value,
                })
              }
              style={{ width: "320px" }}
            ></input>
          </div>

          <div
            className="F_CriarTranstornoInputSec"
            style={{ marginTop: "20px" }}
          >
            <p>Observação</p>
            <textarea
              className="F_NomeAreaTranstorno"
              style={{ width: "320px", height: "150px" }}
              name="OBS_META"
              placeholder="Ex: Melhorar as habilidades de interação social entre os colegas da escola."
              value={novaMeta.OBS_META}
              onChange={(e) =>
                setNovaMeta({
                  ...novaMeta,
                  OBS_META: e.target.value,
                })
              }
            ></textarea>
          </div>
        </div>
      </div>
      <div className="F_AdicionarArea" style={{ marginTop: "15%" }}>
        <button
          className="F_btnTranstornos"
          onClick={() => {
            handleSubmit();
            toggleIframe("IframeAdicionarMeta");
          }}
        >
          Adicionar Meta
        </button>
      </div>
    </div>
  );
};

export default AdicionarMetas;
