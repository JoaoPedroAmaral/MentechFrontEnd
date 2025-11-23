import React, { useState, useEffect } from "react";
import { useGlobal, BASE_URL } from "../../global/GlobalContext.js";
import TextArea from "antd/es/input/TextArea.js";
import { showAlert } from "../../utils/alerts.js";

const ManterAtividade = ({ atividade, metaID }) => {
  const { setAtividadeModificada, atividadeModificada } = useGlobal();
  const [atividadeList, setAtividadeList] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [atividadeEditando, setAtividadeEditando] = useState(null);

  useEffect(() => {
    setAtividadeList(atividade);
  }, [atividadeModificada, atividade]);

  const [novaAtividade, setNovaAtividade] = useState({
    nm_atividade: "",
    descricao_atividade: "",
    parecer_tecnico: "",
    resultado: "Não iniciado",
  });

  const formatarDataBR = (dataString) => {
    if (!dataString) return "";

    if (dataString instanceof Date) {
      const dia = String(dataString.getDate()).padStart(2, "0");
      const mes = String(dataString.getMonth() + 1).padStart(2, "0");
      const ano = dataString.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    if (typeof dataString === "string" && dataString.includes("-")) {
      const [ano, mes, dia] = dataString.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    const d = new Date(dataString);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const handleSalvarNovaAtividade = async () => {
    try {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");
      const dataISO = `${dia}/${mes}/${ano}`;

      const response = await fetch(`${BASE_URL}/atividade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novaAtividade,
          dt_atividade: dataISO,
          cd_meta: metaID,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar atividade");
      setAtividadeModificada((prev) => !prev);
      setNovaAtividade({
        nm_atividade: "",
        descricao_atividade: "",
        parecer_tecnico: "",
        resultado: "Não iniciado",
      });
      if (response.ok) {
        showAlert.success("Atividade criada com sucesso!");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAtividade = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/atividade/${id}`, {
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
      await fetch(`${BASE_URL}/atividade/inativar/${id}`, {
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
      await fetch(`${BASE_URL}/atividade/inativar/${id}`, {
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
      cd_meta: atividade.cd_meta,
      descricao_atividade: atividade.descricao_atividade,
      dt_atividade: atividade.dt_atividade,
      nm_atividade: atividade.nm_atividade,
      parecer_tecnico: atividade.parecer_tecnico,
      percent_conclusao: atividade.percent_conclusao,
      resultado: atividade.resultado,
    };

    try {
      const response = await fetch(`${BASE_URL}/atividade/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setAtividadeList((prev) =>
        prev.map((a) => (a.cd_atividade === id ? atividadeEditando : a))
      );

      if (!response.ok){
        showAlert.error("Erro ao salvar edição da atividade!");
        return;
      }
      if(response.ok){
        showAlert.success("Edição da atividade salva com sucesso!");
      }

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
                  <TextArea
                    maxLength={90}
                    type="text"
                    value={novaAtividade.nm_atividade}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        nm_atividade: e.target.value,
                      })
                    }
                    showCount
                    className="F_NomeAreaTranstorno"
                    style={{
                      width: "140px",
                      height: "100px",
                      resize: "none",
                      paddingBottom: "30px",
                    }}
                    placeholder="Nome da atividade"
                  />
                </td>
                <td>
                  <TextArea
                    maxLength={255}
                    showCount
                    type="text"
                    value={novaAtividade.descricao_atividade}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        descricao_atividade: e.target.value,
                      })
                    }
                    className="F_NomeAreaTranstorno"
                    style={{
                      width: "100%",
                      height: "200px",
                      resize: "none",
                      paddingBottom: "30px",
                    }}
                    placeholder="Descrição"
                  />
                </td>
                <td>{formatarDataBR(new Date())}</td>
                <td>
                  <TextArea
                    maxLength={5000}
                    type="text"
                    value={novaAtividade.parecer_tecnico}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        parecer_tecnico: e.target.value,
                      })
                    }
                    showCount
                    className="F_NomeAreaTranstorno"
                    style={{
                      width: "200px",
                      height: "200px",
                      resize: "none",
                      paddingBottom: "30px",
                    }}
                    placeholder="Parecer técnico"
                  />
                </td>
                <td>0%</td>
                <td>
                  <select
                    value={novaAtividade.resultado}
                    onChange={(e) =>
                      setNovaAtividade({
                        ...novaAtividade,
                        resultado: e.target.value,
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
                const isConcluido = atividades.ativo === "N";
                const emEdicao = editandoId === atividades.cd_atividade;

                return (
                  <tr
                    key={atividades.cd_atividade}
                    style={{ fontSize: "12px" }}
                  >
                    <td className="actions">
                      <div className="FlexCenterMid">
                        {!emEdicao && (
                          <>
                            <button
                              className="btn-delete"
                              onClick={() =>
                                deleteAtividade(atividades.cd_atividade)
                              }
                              disabled={isConcluido}
                            >
                              🗑️
                            </button>
                            <button
                              className="btn-edit"
                              style={{ backgroundColor: "#f7dd5c" }}
                              disabled={isConcluido}
                              onClick={() => {
                                setEditandoId(atividades.cd_atividade);
                                setAtividadeEditando({ ...atividades });
                              }}
                            >
                              ✏️
                            </button>
                            {!isConcluido &&
                              atividades.percent_conclusao === 100 && (
                                <button
                                  className="btn-complete"
                                  onClick={() =>
                                    marcarConcluido(atividades.cd_atividade)
                                  }
                                >
                                  ✔️
                                </button>
                              )}
                            {isConcluido && (
                              <button
                                className="btn-undo"
                                onClick={() =>
                                  reabrirAtividade(atividades.cd_atividade)
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
                                handleSalvarEdicao(atividades.cd_atividade)
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
                        <TextArea
                          maxLength={90}
                          type="text"
                          value={atividadeEditando.nm_atividade}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              nm_atividade: e.target.value,
                            })
                          }
                          showCount
                          className="F_NomeAreaTranstorno"
                          style={{
                            width: "140px",
                            height: "100px",
                            resize: "none",
                            paddingBottom: "30px",
                          }}
                        />
                      ) : (
                        atividades.nm_atividade
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <TextArea
                          maxLength={255}
                          type="text"
                          value={atividadeEditando.descricao_atividade}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              descricao_atividade: e.target.value,
                            })
                          }
                          showCount
                          className="F_NomeAreaTranstorno"
                          style={{
                            width: "100%",
                            height: "200px",
                            resize: "none",
                            paddingBottom: "30px",
                          }}
                        />
                      ) : (
                        atividades.descricao_atividade
                      )}
                    </td>

                    {/* Data - não editável */}
                    <td>{formatarDataBR(atividades.dt_atividade)}</td>

                    {/* Parecer */}
                    <td>
                      {emEdicao ? (
                        <TextArea
                          type="text"
                          maxLength={5000}
                          value={atividadeEditando.parecer_tecnico}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              parecer_tecnico: e.target.value,
                            })
                          }
                          showCount
                          className="F_NomeAreaTranstorno"
                          style={{
                            width: "200px",
                            height: "200px",
                            resize: "none",
                            paddingBottom: "30px",
                          }}
                        />
                      ) : (
                        atividades.parecer_tecnico
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <input
                          type="number"
                          value={atividadeEditando.percent_conclusao}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              percent_conclusao: e.target.value,
                            })
                          }
                          min="0"
                          max="100"
                          className="F_NomeAreaTranstorno"
                          style={{ width: "50px" }}
                        />
                      ) : (
                        `${atividades.percent_conclusao}%`
                      )}
                    </td>

                    <td>
                      {emEdicao ? (
                        <select
                          value={atividadeEditando.resultado}
                          onChange={(e) =>
                            setAtividadeEditando({
                              ...atividadeEditando,
                              resultado: e.target.value,
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
                        atividades.resultado
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
