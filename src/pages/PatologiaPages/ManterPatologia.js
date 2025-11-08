import React, { useState, useEffect } from "react";
import "../../css/ManterPatologia.css";
import AdicionarPacienteIcon from "../../Images/AdicionarPacienteIcon.png";
import { showAlert } from "../../utils/alerts.js";

const ManterPatologia = ({ CD_PACIENTE }) => {
  const [patologia, setPatologia] = useState([]);
  const [patologiaVazia, setPatologiaVazia] = useState(false);
  const [newPatologia, setNewPatologia] = useState({
    CD_PACIENTE: parseInt(CD_PACIENTE),
    DOENCA: "",
    OBS_DOENCA: "",
    CID11: "",
  });

  useEffect(() => {
    fetchPatologia();
  }, [CD_PACIENTE]);

  const fetchPatologia = async () => {
    try {
      const pacienteID = localStorage.getItem("ultimoPaciente");

      if (!pacienteID) {
        console.error("Nenhum paciente selecionado.");
        return;
      }
      const response = await fetch(
        `http://127.0.0.1:5000/patologia/${pacienteID}`
      );

      const dataJson = await response.json();

      if (dataJson.Warning === "Paciente sem patologia") {
        setPatologia([]);
        setPatologiaVazia(true);
        return;
      }
      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setPatologia(dataJson);
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    }
  };

  const toggleIframe = (iframeId) => {
    const iframe = document.getElementById(iframeId);
    iframe.classList.toggle("Hidden");
  };

  const handleAddPatologia = async () => {
    try {
      if (!newPatologia.DOENCA || !newPatologia.CID11) {
        await showAlert.warning("requisitos obrigatorios!");
        return null;
      }

      const response = await fetch("http://127.0.0.1:5000/patologia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatologia),
      });

      if (response.ok) {
        let data;
        try {
          data = await response.json();
          fetchPatologia()
          setNewPatologia({
            CD_PACIENTE: parseInt(CD_PACIENTE),
            DOENCA: "",
            OBS_DOENCA: "",
            CID11: "",
          });
           await showAlert.success("Patologia cadastrado com sucesso!");
        } catch (e) {
          const rawResponse = await response.text();
          console.error("Resposta não é JSON:", rawResponse);
          throw new Error("Resposta da API não é JSON válido");
        }
        return data.CD_PACIENTE;
      } else {
        throw new Error("Falha ao cadastrar patologia");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar patologia: " + error);
      return null;
    }
  };

  const deletePatologia = async (id) => {
    await fetch(`http://127.0.0.1:5000/patologia/${id}`, { method: "DELETE" });
    fetchPatologia();
  };

  return (
    <div className="MP_ManterPatologia">
      <div className="MP_PatologiaArea">
        <button
          className="MP_btnCriarPatologia"
          onClick={() => toggleIframe("IframePatologia")}
        >
          <img
            className="MP_TrashIcon"
            src={AdicionarPacienteIcon}
            alt="Adicionar"
          />
        </button>
        <h4 className="MP_title">Patologia</h4>
      </div>
      <div className="MP_areaGraficos">
        {patologia.length <= 0 ? (
          <>
            {patologiaVazia ? (
              <p className="MP_text">Nenhuma patologia encontrada.</p>
            ) : (
              <p className="MP_text">Carregando patologias...</p>
            )}
          </>
        ) : (
          <ul className="MP_ULTranstorno">
            {patologia
              .slice()
              .reverse()
              .map((p, index) => (
                <li key={index} className="MP_LIPatologia">
                  <div className="MP_components">
                    <p className="MP_text">
                      <strong>{p.DOENCA}</strong>
                    </p>
                    <p className="MP_text">
                      <strong>CID: {p.CID11}</strong>
                    </p>
                    <p className="MP_text">{p.OBS_DOENCA}</p>
                  </div>
                  <div>
                    <button onClick={() => deletePatologia(p.CD_PATOLOGIA)}>
                      -
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div
        id="IframePatologia"
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
          style={{ width: "800px", height: "550px" }}
        >
          <div className="FlexCenterEnd" style={{ height: "45px" }}>
            <button
              className="BTNExitIFrame TextBold"
              onClick={() => toggleIframe("IframePatologia")}
            >
              ✖
            </button>
          </div>
          <div className="FlexCenterMid">
            <div>
              <div className="F_Title">
                <h2 className="F_CadastrarTitle">Adicionar Patologia</h2>
              </div>
              <div
                className="F_DataPaciente"
                style={{ justifyContent: "space-between", width: "700px" }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    className="BorderArea FlexCenterMid"
                    style={{
                      margin: "10px",
                    }}
                  >
                    <div>
                      <div className="F_CriarTranstornoInputObrigatorio TextCenter">
                        <p>Sintoma*</p>
                        <input
                          className="F_NomeAreaTranstorno"
                          placeholder="Ex: Dor de cabeça"
                          name="SINTOMA"
                          value={newPatologia.DOENCA}
                          onChange={(e) =>
                            setNewPatologia({
                              ...newPatologia,
                              DOENCA: e.target.value,
                            })
                          }
                          maxLength={90}
                          style={{ width: "150px" }}
                        ></input>
                      </div>

                      <div className="F_CriarTranstornoInputObrigatorio TextCenter">
                        <p>CID11*</p>
                        <input
                          className="F_CIDAreaTranstorno"
                          name="CID11"
                          placeholder="Ex: 6A20.0"
                          value={newPatologia.CID11}
                          onChange={(e) =>
                            setNewPatologia({
                              ...newPatologia,
                              CID11: e.target.value,
                            })
                          }
                          maxLength={10}
                        ></input>
                      </div>

                      <div className="F_CriarTranstornoInputObrigatorio TextCenter">
                        <p>Observação</p>
                        <textarea
                          className="F_SecAreaTranstorno"
                          name="OBS_DOENCA"
                          placeholder="Ex: Dores consecutivas em um curto periodo de tempo"
                          value={newPatologia.OBS_DOENCA}
                          onChange={(e) =>
                            setNewPatologia({
                              ...newPatologia,
                              OBS_DOENCA: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="F_AdicionarArea" style={{ marginTop: "5px" }}>
            <button className="F_btnTranstornos" onClick={handleAddPatologia}>
              Adicionar Paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManterPatologia;
