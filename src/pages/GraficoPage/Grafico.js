import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGlobal } from "../../global/GlobalContext.js";

export const Grafico = ({ pacienteID }) => {
  const [metas, setMetas] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [historicoAtividades, setHistoricoAtividades] = useState([]);
  const { metasModificadas, atividadeModificada } = useGlobal();
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const graficoVazio = [
    { dt_atualizacao: new Date().toISOString().split("T")[0], placeholder: 0 },
  ];
  const dadosParaGrafico =
    dadosGrafico.length > 0 ? dadosGrafico : graficoVazio;

  const coresLinhas = [
    "#fd2c2cff",
    "#bded4eff",
    "#ccdcffff",
    "#F1C40F",
    "#bb4be7ff",
    "#E67E22",
    "#1ABC9C",
    "#F39C12",
    "#D35400",
    "#3498DB",
    "#E84393",
    "#00CED1",
    "#7F8C8D",
    "#2ECC71",
  ];

  useEffect(() => {
    carregarMetas(pacienteID);
    if (metas[indiceAtual]?.cd_meta) {
      carregarAtividades(metas[indiceAtual]?.cd_meta).then((data) => {
        setHistoricoAtividades(data);
      });
    }
  }, [metasModificadas, pacienteID, atividadeModificada]);

  useEffect(() => {
    if (metas[indiceAtual]?.cd_meta) {
      carregarAtividades(metas[indiceAtual]?.cd_meta).then((data) => {
        setHistoricoAtividades(data);
      });
    }
  }, [metas, indiceAtual]);

  useEffect(() => {
    const fetchHistoricos = async () => {
      let combinado = {};

      for (const id of atividadesSelecionadas) {
        const hist = await carregarHistoricoAtividade(id);

        hist.sort(
          (a, b) => new Date(a.dt_atualizacao) - new Date(b.dt_atualizacao)
        );

        hist.forEach((h) => {
          const dataKey = new Date(h.dt_atualizacao)
            .toISOString()
            .split("T")[0];

          if (!combinado[dataKey])
            combinado[dataKey] = { dt_atualizacao: dataKey };

          combinado[dataKey][h.nm_atividade] = h.percent_conclusao;
        });
      }

      const todasDatas = Object.keys(combinado).sort(
        (a, b) => new Date(a) - new Date(b)
      );

      const todasAtividades = new Set();
      Object.values(combinado).forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (key !== "dt_atualizacao") todasAtividades.add(key);
        });
      });

      const dadosCompletos = todasDatas.map((data) => {
        const entry = { dt_atualizacao: data };
        todasAtividades.forEach((atividade) => {
          entry[atividade] = combinado[data][atividade];
        });
        return entry;
      });

      setDadosGrafico(dadosCompletos);
    };

    if (atividadesSelecionadas.length > 0) {
      fetchHistoricos();
    }
  }, [atividadesSelecionadas, atividadeModificada]);

  const carregarAtividades = async (metaID) => {
    try {
      const response = await fetch(
        `https://mentechbackend.onrender.com/atividade/por_meta/${metaID}`
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

  const carregarMetas = async (id) => {
    try {
      const response = await fetch(
        `https://mentechbackend.onrender.com/meta/por_paciente/${id}`
      );
      if (!response.ok) throw new Error("Erro ao buscar metas");
      const data = await response.json();
      setMetas(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      alert(`Erro ao buscar metas: ${error.message}`);
    }
  };

  const proximaMeta = () => {
    setIndiceAtual((prev) => (prev + 1) % metas.length);
  };

  const metaAnterior = () => {
    setIndiceAtual((prev) => (prev - 1 + metas.length) % metas.length);
  };

  const carregarHistoricoAtividade = async (atividadeId) => {
    const resp = await fetch(
      `https://mentechbackend.onrender.com/percent_atividade/porAtividade/${atividadeId}`
    );
    const historico = await resp.json();
    return historico;
  };

  return (
    <div
      className="FlexCenterAround"
      style={{ width: "100%", height: "100%", flexDirection: "column" }}
    >
      <div style={{ width: "100%" }}>
        <div className="FlexCenterBetween gap-4 p-4" style={{ width: "100%" }}>
          <button
            onClick={metaAnterior}
            className="BackgroundTransparent FlexCenterMid p-4"
            style={{
              cursor: "pointer",
              color: "white",
              border: "1px solid white",
              borderRadius: "4px",
              marginLeft: "10px",
            }}
          >
            <p>{"<"}</p>
          </button>

          <div style={{ position: "relative", maxWidth: "200px" }}>
            <div
              className="texto-truncado"
              style={{ color: "white", margin: "0" }}
            >
              {metas.length > 0 ? metas[indiceAtual].meta : "Nenhuma meta"}
            </div>
            <div className="tooltip">
              {metas.length > 0 ? metas[indiceAtual].meta : "Nenhuma meta"}
            </div>
          </div>

          <button
            onClick={proximaMeta}
            className="BackgroundTransparent FlexCenterMid p-4"
            style={{
              cursor: "pointer",
              color: "white",
              border: "1px solid white",
              borderRadius: "4px",
              marginRight: "10px",
            }}
          >
            <p>{">"}</p>
          </button>
        </div>
        <div
          style={{
            padding: "10px",
            height: "60%",
            overflowY: "auto",
            border: "1px solid white",
            padding: "5px",
            margin: "0 10px",
            borderRadius: "4px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid white", padding: "8px" }}>
                  <p>✔</p>
                </th>
                <th style={{ borderBottom: "1px solid white", padding: "8px" }}>
                  <p>Nome</p>
                </th>
                <th style={{ borderBottom: "1px solid white", padding: "8px" }}>
                  <p>Resultado</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {historicoAtividades?.atividades?.length > 0 ? (
                historicoAtividades.atividades.map((atividade, index) => {
                  const isChecked = atividadesSelecionadas.includes(
                    atividade.cd_atividade
                  );

                  const toggleAtividade = () => {
                    setAtividadesSelecionadas((prev) =>
                      isChecked
                        ? prev.filter((id) => id !== atividade.cd_atividade)
                        : [...prev, atividade.cd_atividade]
                    );
                  };

                  return (
                    <tr key={atividade.cd_atividade}>
                      <td style={{ display: "flex", justifyContent: "center" }}>
                        <input
                          style={{ display: "inline-block" }}
                          type="checkbox"
                          checked={isChecked}
                          onChange={toggleAtividade}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <p>{atividade.nm_atividade}</p>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <p>{atividade.resultado}</p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", padding: "8px" }}
                  >
                    Nenhuma atividade encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="FlexCenterStart   " style={{ width: "100%" }}>
        <ResponsiveContainer width="90%" height={250}>
          <LineChart connectNulls={true} data={dadosParaGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dt_atualizacao" tick={false} />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              tick={{ fill: "#ccc", fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = new Date(label);
                  const day = String(d.getDate() + 1).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  const dataFormatada = `${day}/${month}/${year}`;

                  return (
                    <div
                      style={{
                        backgroundColor: "#ecececff",
                        padding: "10px",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        {dataFormatada}
                      </p>
                      {payload.map((p) => (
                        <p
                          key={p.dataKey}
                          style={{ margin: 0, color: p.stroke }}
                        >
                          {p.name || p.dataKey}: {p.value}%
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            {atividadesSelecionadas.map((id, i) => {
              const atividade = historicoAtividades.atividades.find(
                (a) => a.cd_atividade === id
              );
              const nomeAtividade =
                atividade?.nm_atividade || `Atividade_${id}`;

              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={nomeAtividade}
                  stroke={coresLinhas[i % coresLinhas.length]}
                  dot={{
                    strokeWidth: 2,
                    fill: "#2B2B2B",
                  }}
                  connectNulls={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
