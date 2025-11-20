import React, { useState, useEffect } from "react";
import { useGlobal, BASE_URL } from "../../global/GlobalContext";
import { showAlert } from "../../utils/alerts.js";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const AdicionarMetas = ({ pacienteID, toggleIframe }) => {
  const { setMetasModificadas } = useGlobal();
  const [novaMeta, setNovaMeta] = useState({
    dt_previsao: "",
    meta: "",
    obs_meta: "",
  });

  const handleMeta = async () => {
    if (!novaMeta.meta || !novaMeta.dt_previsao) {
      await showAlert.error("Nome do Transtorno e cid11 são obrigatórios!");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/meta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meta: novaMeta.meta,
          obs_meta: novaMeta.obs_meta,
        }),
      });

      const dataJson = await response.json();

      return dataJson.cd_meta;
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    }
  };

  const handleSubmit = async () => {
    const MetaID = await handleMeta();
    try {
      const response = await fetch(`${BASE_URL}/paciente_meta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cd_meta: MetaID,
          cd_paciente: pacienteID,
          dt_previsao: novaMeta.dt_previsao,
        }),
      });

      setNovaMeta({
        dt_previsao: "",
        meta: "",
        obs_meta: "",
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
                name="dt_nascimento"
                placeholder="dd/mm/yyyy"
                format="DD/MM/YYYY"
                value={
                  novaMeta.dt_previsao
                    ? dayjs(novaMeta.dt_previsao, "DD/MM/YYYY")
                    : null
                }
                onChange={(date, dateString) => {
                  setNovaMeta({
                    ...novaMeta,
                    dt_previsao: dateString,
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
              name="meta"
              value={novaMeta.meta}
              onChange={(e) =>
                setNovaMeta({
                  ...novaMeta,
                  meta: e.target.value,
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
              name="obs_meta"
              placeholder="Ex: Melhorar as habilidades de interação social entre os colegas da escola."
              value={novaMeta.obs_meta}
              onChange={(e) =>
                setNovaMeta({
                  ...novaMeta,
                  obs_meta: e.target.value,
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
