import React, { useState, useEffect } from "react";
import { useGlobal } from "../../global/GlobalContext.js";

const ManterAtividade = ({ atividade, metaID }) => {
  const { setAtividadeModificada, atividadeModificada } = useGlobal();
  const [atividadeList, setAtividadeList] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [atividadeEditando, setAtividadeEditando] = useState(null);

  useEffect(() => {
    setAtividadeList(atividade);
  }, [atividadeModificada, atividade]);

  const [novaAtividade, setNovaAtividade] = useState({
    NM_ATIVIDADE: "",
    DESCRICAO_ATIVIDADE: "",
    PARECER_TECNICO: "",
    RESULTADO: "Não iniciado",
  });

  const formatarDataBR = (dataString) => {
    if (!dataString) return "";
    const d = new Date(dataString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleSalvarNovaAtividade = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/atividade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novaAtividade,
          DT_ATIVIDADE: formatarDataBR(new Date().toISOString().split("T")[0]),
          CD_META: metaID,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar atividade");
      setAtividadeModificada((prev) => !prev);
      setNovaAtividade({
        NM_ATIVIDADE: "",
        DESCRICAO_ATIVIDADE: "",
        PARECER_TECNICO: "",
        RESULTADO: "Não iniciado",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAtividade = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/atividade/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Erro ao deletar atividade");
      setAtividadeModificada((prev) => !prev);
    } catch (error) {
      console.error("Erro ao deletar atividade:", error);
      alert(`Erro ao deletar atividade: ${error.message}`);
    }
  };

  const marcarConcluido = async (id) => {
    try {
      await fetch(`http://localhost:5000/atividade/inativar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setAtividadeModificada((prev) => !prev);
    } catch (error) {
      console.error("Erro ao concluir atividade:", error);
    }
  };

  const reabrirAtividade = async (id) => {
    try {
      await fetch(`http://localhost:5000/atividade/inativar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setAtividadeModificada((prev) => !prev);
    } catch (error) {
      console.error("Erro ao reabrir atividade:", error);
    }
  };

  const handleSalvarEdicao = async (id) => {
    const atividade = atividadeEditando;

    const payload = {
      CD_META: atividade.CD_META,
      DESCRICAO_ATIVIDADE: atividade.DESCRICAO_ATIVIDADE,
      DT_ATIVIDADE: formatarDataBR(atividade.DT_ATIVIDADE),
      NM_ATIVIDADE: atividade.NM_ATIVIDADE,
      PARECER_TECNICO: atividade.PARECER_TECNICO,
      PERCENT_CONCLUSAO: atividade.PERCENT_CONCLUSAO,
      RESULTADO: atividade.RESULTADO,
    };

    try {
      await fetch(`http://localhost:5000/atividade/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setAtividadeList((prev) =>
        prev.map((a) => (a.CD_ATIVIDADE === id ? atividadeEditando : a))
      );

      setEditandoId(null);
      setAtividadeEditando(null);
      setAtividadeModificada((prev) => !prev);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setAtividadeEditando(null);
  };

  return (
    <div style={{ width: "96%", height: "100%" }}>
      <div className="F_Title">
        <h2 className="F_CadastrarTitle" style={{ fontSize: "20px" }}>
          Gerenciador de Atividades
        </h2>
      </div>
      <div className=" FlexUpMid Border ScrollBar" style={{ height: "60vh" }}>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table className="atividade-table">
            <thead>
              <tr style={{ whiteSpace: "nowrap" }}>
                <th>Ações</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Data</th>
                <th>Parecer</th>
                <th>Conclusão</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontSize: "12px" }}>
                <td className="actions">
                  <div className="FlexCenterMid">
                    <button
                      className="btn-edit"
                      onClick={handleSalvarNovaAtividade}
                    >
                      💾
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    maxLength={90}
                    type="text"
                    value={novaAtividade.NM_ATIVIDADE}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        NM_ATIVIDADE: e.target.value,
                      })
                    }
                    className="F_NomeAreaTranstorno"
                    style={{ width: "130px" }}
                    placeholder="Nome da atividade"
                  />
                </td>
                <td>
                  <input
                    maxLength={255}
                    type="text"
                    value={novaAtividade.DESCRICAO_ATIVIDADE}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        DESCRICAO_ATIVIDADE: e.target.value,
                      })
                    }
                    className="F_NomeAreaTranstorno"
                    style={{ width: "150px" }}
                    placeholder="Descrição"
                  />
                </td>
                <td>{formatarDataBR(new Date())}</td>
                <td>
                  <input
                    maxLength={255}
                    type="text"
                    value={novaAtividade.PARECER_TECNICO}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        PARECER_TECNICO: e.target.value,
                      })
                    }
                    className="F_NomeAreaTranstorno"
                    style={{ width: "110px" }}
                    placeholder="Parecer técnico"
                  />
                </td>
                <td>0%</td>
                <td>
                  <select
                    value={novaAtividade.RESULTADO}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        RESULTADO: e.target.value,
                      })
                    }
                    className="F_NomeAreaTranstorno"
                    style={{ width: "150px" }}
                  >
                    <option value="Não iniciado">Não iniciado</option>
                    <option value="Em andamento">Em andamento</option>
                  </select>
                </td>
              </tr>
              {atividadeList.map((atividades) => {
                const isConcluido = atividades.ATIVO === "N";
                const emEdicao = editandoId === atividades.CD_ATIVIDADE;

                return (
                  <tr
                    key={atividades.CD_ATIVIDADE}
                    style={{ fontSize: "12px" }}
                  >
                    <td className="actions">
                      <div className="FlexCenterMid">
                        {!emEdicao && (
                          <>
                            <button
                              className="btn-delete"
                              onClick={() =>
                                deleteAtividade(atividades.CD_ATIVIDADE)
                              }
                              disabled={isConcluido}
                            >
                              🗑️
                            </button>
                            <button
                              className="btn-edit"
                              style={{backgroundColor:"#f7dd5c"}}
                              disabled={isConcluido}
                              onClick={() => {
                                setEditandoId(atividades.CD_ATIVIDADE);
                                setAtividadeEditando({ ...atividades });
                              }}
                            >
                              ✏️
                            </button>
                            {!isConcluido &&
                              atividades.PERCENT_CONCLUSAO === 100 && (
                                <button
                                  className="btn-complete"
                                  onClick={() =>
                                    marcarConcluido(atividades.CD_ATIVIDADE)
                                  }
                                >
                                  ✔️
                                </button>
                              )}
                            {isConcluido && (
                              <button
                                className="btn-undo"
                                onClick={() =>
                                  reabrirAtividade(atividades.CD_ATIVIDADE)
                                }
                              >
                                🔄
                              </button>
                            )}
                          </>
                        )}
                        {emEdicao && (
                          <>
                            <button
                              className="btn-delete"
                              onClick={handleCancelarEdicao}
                            >
                              ❌
                            </button>
                            <button
                              className="btn-complete"
                              onClick={() =>
                                handleSalvarEdicao(atividades.CD_ATIVIDADE)
                              }
                            >
                              💾
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Nome */}
                    <td>
                      {emEdicao ? (
                        <input
                          maxLength={90}
                          type="text"
                          value={atividadeEditando.NM_ATIVIDADE}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              NM_ATIVIDADE: e.target.value,
                            })
                          }
                          className="F_NomeAreaTranstorno"
                          style={{ width: "130px" }}
                        />
                      ) : (
                        atividades.NM_ATIVIDADE
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <input
                          maxLength={255}
                          type="text"
                          value={atividadeEditando.DESCRICAO_ATIVIDADE}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              DESCRICAO_ATIVIDADE: e.target.value,
                            })
                          }
                          className="F_NomeAreaTranstorno"
                          style={{ width: "150px" }}
                        />
                      ) : (
                        atividades.DESCRICAO_ATIVIDADE
                      )}
                    </td>

                    {/* Data - não editável */}
                    <td>{formatarDataBR(atividades.DT_ATIVIDADE)}</td>

                    {/* Parecer */}
                    <td>
                      {emEdicao ? (
                        <input
                          type="text"
                          maxLength={1000}
                          value={atividadeEditando.PARECER_TECNICO}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              PARECER_TECNICO: e.target.value,
                            })
                          }
                          className="F_NomeAreaTranstorno"
                          style={{ width: "110px" }}
                        />
                      ) : (
                        atividades.PARECER_TECNICO
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <input
                          type="number"
                          value={atividadeEditando.PERCENT_CONCLUSAO}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              PERCENT_CONCLUSAO: e.target.value,
                            })
                          }
                          min="0"
                          max="100"
                          className="F_NomeAreaTranstorno"
                          style={{ width: "40px" }}
                        />
                      ) : (
                        `${atividades.PERCENT_CONCLUSAO}%`
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <select
                          value={atividadeEditando.RESULTADO}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              RESULTADO: e.target.value,
                            })
                          }
                          className="F_NomeAreaTranstorno"
                          style={{ width: "150px" }}
                        >
                          <option value="Não iniciado">Não iniciado</option>
                          <option value="Em andamento">Em andamento</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      ) : (
                        atividades.RESULTADO
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManterAtividade;
