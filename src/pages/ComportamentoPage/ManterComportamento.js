import React, { useState, useEffect } from "react";
import AdicionarPacienteIcon from "../../Images/AdicionarPacienteIcon.png";
import { useGlobal, BASE_URL } from "../../global/GlobalContext";

const ManterComportamento = ({ pacienteID }) => {
  const [criterios, setCriterios] = useState([]);
  const [criteriosUnicos, setCriteriosUnicos] = useState([]);
  const [criterioParaTranstornos, setCriterioParaTranstornos] = useState({});
  const { criteriosModificados, setDiagnosticosModificados } = useGlobal();

  const buscarCriterios = () => {
    fetch(`${BASE_URL}/criterio_diagnostico`)
      .then((res) => res.json())
      .then((data) => {
        const map = new Map();
        const criterioToTranstornos = {};

        data.forEach((item) => {
          const criterio = item.criterio_diagnostico;
          const cdTranstorno = item.cd_transtorno;
          const isDiferencial = item.criterio_diferencial === "S";

          if (!map.has(criterio)) {
            map.set(criterio, { diferencial: isDiferencial });
            criterioToTranstornos[criterio] = [cdTranstorno];
          } else {
            const anterior = map.get(criterio);
            map.set(criterio, {
              diferencial: anterior.diferencial || isDiferencial,
            });

            if (!criterioToTranstornos[criterio].includes(cdTranstorno)) {
              criterioToTranstornos[criterio].push(cdTranstorno);
            }
          }
        });

        const criteriosFormatados = Array.from(map.entries()).map(
          ([criterio, { diferencial }]) => ({
            criterio,
            diferencial,
          })
        );

        setCriteriosUnicos(criteriosFormatados);
        setCriterioParaTranstornos(criterioToTranstornos);
      })
      .catch((err) => console.error(err));
  };

  const listarComportamentos = (id) => {
    fetch(`${BASE_URL}/comportamento_paciente/por_paciente/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCriterios(data);
      })
      .catch((err) => console.error(err));
  };

  const adicionarComportamento = async (comportamento) => {
    try {
      const response = await fetch(
        `${BASE_URL}/comportamento_paciente`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cd_paciente: pacienteID,
            comportamento_paciente: comportamento,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro ao adicionar comportamento");

      listarComportamentos(pacienteID);
      setDiagnosticosModificados(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComportamento = async (cdComportamento) => {
    try {
      const response = await fetch(
        `${BASE_URL}/comportamento_paciente/${cdComportamento}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erro ao deletar comportamento");

      listarComportamentos(pacienteID);
      setDiagnosticosModificados(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    buscarCriterios();
    listarComportamentos(pacienteID);
  }, [criteriosModificados, pacienteID]);

  return (
    <div style={{ width: "98%", height: "100%" }}>
      <div className="F_Title">
        <h2 className="F_CadastrarTitle" style={{ fontSize: "20px" }}>
          Criterio
        </h2>
      </div>
      <div className="FlexCenterEvenly" style={{ marginBottom: "15px" }}>
        <select
          className="F_NomeAreaTranstorno"
          name="tip_sang"
          style={{ width: "80%", overflowY: "auto" }}
        >
          {criteriosUnicos.map((item, index) => (
            <option
              key={index}
              value={item.criterio}
              style={{
                backgroundColor: item.diferencial ? "#ffb347" : undefined,
              }}
            >
              {item.criterio}
              {item.diferencial ? " (DIFERENCIAL)" : ""}
            </option>
          ))}
        </select>

        <button
          className="MP_btnCriarPatologia"
          onClick={() =>
            adicionarComportamento(document.querySelector("select").value)
          }
        >
          <img
            className="MP_TrashIcon"
            src={AdicionarPacienteIcon}
            alt="Adicionar"
          />
        </button>
      </div>
      <div
        className="Border BackgroundWhite ScrollBar"
        style={{ height: "64%" }}
      >
        {criterios.length === 0 ? (
          <p>Nenhum comportamento adicionado.</p>
        ) : (
          <ul
            className="MP_ULTranstorno"
            style={{ marginLeft: "10px", padding: "0" }}
          >
            {criterios.map((item, index) => (
              <li
                className="FlexCenterBetween actions"
                key={index}
                style={{ marginBottom: "10px" }}
              >
                <p className="MP_text">
                  •{" "}
                  <strong style={{ marginLeft: "5px" }}>
                    {item.comportamento_paciente}
                  </strong>
                </p>
                <button
                  className="btn-delete"
                  onClick={() => deleteComportamento(item.cd_comportamento_paciente)}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManterComportamento;
