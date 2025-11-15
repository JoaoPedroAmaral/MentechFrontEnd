import React, { useState, useEffect } from "react";
import { useGlobal } from "../../global/GlobalContext";

const SupostoDiagnostico = ({ pacienteId }) => {
  const [criteriosPaciente, setCriteriosPaciente] = useState([]);
  const [criteriosUnicos, setCriteriosUnicos] = useState([]);
  const [criterioParaTranstornos, setCriterioParaTranstornos] = useState({});
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [transtornosInfo, setTranstornosInfo] = useState({});
  const { diagnosticosModificados } = useGlobal();

  useEffect(() => {
    listarComportamentos(pacienteId);
    buscarCriterios();
    buscarTranstornos();
  }, [pacienteId, diagnosticosModificados, pacienteId]);

  useEffect(() => {
    if (
      criteriosPaciente.length &&
      Object.keys(criterioParaTranstornos).length
    ) {
      compararCriterios();
    }
  }, [criteriosPaciente, criterioParaTranstornos, diagnosticosModificados]);

  const buscarTranstornos = () => {
    fetch("https://mentechbackend.onrender.com/transtorno")
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((item) => {
          map[item.cd_transtorno] = item.nm_transtorno;
        });
        setTranstornosInfo(map);
      })
      .catch((err) => console.error(err));
  };

  const listarComportamentos = (id) => {
    fetch(`https://mentechbackend.onrender.com/comportamento_paciente/por_paciente/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCriteriosPaciente(data); // salva todos os objetos com cd_transtorno e criterio_diagnostico
      })
      .catch((err) => console.error(err));
  };

  const buscarCriterios = () => {
    fetch("https://mentechbackend.onrender.com/criterio_diagnostico")
      .then((res) => res.json())
      .then((data) => {
        const criteriosPorTranstorno = {};

        data.forEach((item) => {
          const { cd_transtorno, criterio_diagnostico } = item;

          if (!criteriosPorTranstorno[cd_transtorno]) {
            criteriosPorTranstorno[cd_transtorno] = [];
          }

          criteriosPorTranstorno[cd_transtorno].push(criterio_diagnostico);
        });

        setCriterioParaTranstornos(criteriosPorTranstorno);
      })
      .catch((err) => console.error(err));
  };

  const compararCriterios = () => {
    const transtornosMap = {};
    const normalize = (text) =>
      text
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    // Normaliza os critérios do paciente
    const criteriosPacienteNormalizados = criteriosPaciente.map((item) =>
      normalize(item.comportamento_paciente)
    );

    // Para cada transtorno, verificar se algum critério do paciente está presente
    Object.entries(criterioParaTranstornos).forEach(
      ([cdTranstorno, criteriosEsperados]) => {
        const presentes = [];
        const faltantes = [];

        criteriosEsperados.forEach((criterio) => {
          const criterioNormalizado = normalize(criterio);

          if (criteriosPacienteNormalizados.includes(criterioNormalizado)) {
            presentes.push(criterio);
          } else {
            faltantes.push(criterio);
          }
        });

        // Se pelo menos um critério do paciente estiver presente nesse transtorno, incluir
        if (presentes.length > 0) {
          transtornosMap[cdTranstorno] = { presentes, faltantes };
        }
      }
    );

    setDiagnosticos(transtornosMap);
  };

  return (
    <div style={{ width: "90%", height: "100%" }}>
      <div className="F_Title">
        <h2 className="F_CadastrarTitle" style={{ fontSize: "20px" }}>
          Suposto Diagnóstico
        </h2>
      </div>
      <div
        className="Border ScrollBar"
        style={{ height: "50%", overflowY: "auto" }}
      >
        {criteriosPaciente.length === 0 ? (
          <p>Nenhum diagnóstico encontrado com os critérios atuais.</p>
        ) : (
          <>
            {Object.entries(diagnosticos).map(
              ([transtorno, { presentes, faltantes }]) => (
                <div className="FlexUpStart" key={transtorno} style={{ marginBottom: "20px", color: "white", flexDirection: "column", padding: "20px", gap: "10px" }}>
                  <h3>
                    🧩 Transtorno: {transtornosInfo[transtorno] || transtorno}
                  </h3>
                  <p>
                    <strong>✅ Comportamentos presentes:</strong>{" "}
                    {presentes.length > 0 ? presentes.join(", ") : "Nenhum"}
                  </p>
                  <p>
                    <strong>❌ Comportamentos faltantes:</strong>{" "}
                    {faltantes.length > 0 ? faltantes.join(", ") : "Nenhum"}
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupostoDiagnostico;
