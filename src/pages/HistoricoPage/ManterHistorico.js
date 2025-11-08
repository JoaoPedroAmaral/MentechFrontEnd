import React, { useState, useEffect } from "react";
import AdicionarPacienteIcon from "../../Images/AdicionarPacienteIcon.png";
import { showAlert, confirmDelete } from "../../utils/alerts.js";
import { useGlobal } from "../../global/GlobalContext.js";

const ManterHistorico = ({ pacienteID, pacientData }) => {
  const [anamneseState, setAnamneseState] = useState("none");
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const { prontuarioEdited, setProntuarioEdited } = useGlobal();

  const [prontuarioState, setProntuarioState] = useState("list");
  const [prontuarioData, setProntuarioData] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [anamnese, setAnamnese] = useState(null);
  const [prontuario, setProntuario] = useState({
    TXT_PRONTUARIO: "",
  });
  const [respostasAnamnese, setRespostasAnamnese] = useState({});
  const [perfilSelecionado, setPerfilSelecionado] = useState(""); // NOVO

  const [formIsOpen, setFormIsOpen] = useState(false);
  const [prontuarioList, setProntuarioList] = useState([]);

  useEffect(() => {
    if (anamneseState === "new" && anamnese?.ANAMNESE) {
      const respostasExistentes = {};
      const carregarAlternativas = async () => {
        const anamneseComAlternativas = await Promise.all(
          anamnese.ANAMNESE.map(async (item) => {
            if (
              item.TIPO_QUESTAO === "Múltipla Escolha" ||
              item.TIPO_QUESTAO === "Verdadeiro ou Falso"
            ) {
              const alternativas = await getAlternative(item.CD_QUESTAO);
              return { ...item, ALTERNATIVAS: alternativas || [] };
            }
            return item;
          })
        );

        setAnamnese({ ANAMNESE: anamneseComAlternativas });

        // Prepara respostas existentes
        anamneseComAlternativas.forEach((item) => {
          if (item.TXT_RESPOSTA || item.CD_ALTERNATIVA) {
            respostasExistentes[item.CD_QUESTAO] = {
              CD_QUESTAO: item.CD_QUESTAO,
              TIPO_QUESTAO: item.TIPO_QUESTAO,
              ...(item.TIPO_QUESTAO === "Dissertativa"
                ? { TXT_RESPOSTA: item.TXT_RESPOSTA || "" }
                : {
                    CD_ALTERNATIVA: Array.isArray(item.CD_ALTERNATIVA)
                      ? item.CD_ALTERNATIVA
                      : item.CD_ALTERNATIVA
                      ? [item.CD_ALTERNATIVA]
                      : [],
                  }),
            };
          }
        });

        setRespostasAnamnese(respostasExistentes);
      };

      carregarAlternativas();

      if (anamnese.ANAMNESE[0]?.CD_PERFIL) {
        setPerfilSelecionado(anamnese.ANAMNESE[0].CD_PERFIL);
      }
    }
  }, [anamneseState, anamnese?.ANAMNESE?.length]);

  useEffect(() => {
    hasAnamnese(pacienteID);
    hasProntuario(pacienteID);
    getPerfil();
  }, [pacienteID, prontuarioEdited]);

  useEffect(() => {
    console.log(formIsOpen);
  }, [formIsOpen]);

  const hasAnamnese = async (id) => {
    try {
      if (anamnese === "") {
        showAlert.warning("Anamnese não pode ser vazio");
      }
      const response = await fetch(
        `http://127.0.0.1:5000/anamnese/por_paciente/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        showAlert.error("Erro ao verificar anamnese");
        throw new Error("Erro ao verificar anamnese");
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setAnamnese({ ANAMNESE: data });
        setAnamneseState(formIsOpen ? "new" : "exist");
      } else {
        setAnamnese({ ANAMNESE: "" });
        setAnamneseState("none");
      }
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao cadastrar anamnese: " + error);
      return null;
    }
    return anamneseState;
  };

  const handleRespostaChange = (
    cdQuestao,
    tipoQuestao,
    valor,
    isMultiple = false
  ) => {
    setRespostasAnamnese((prev) => {
      if (tipoQuestao === "Múltipla Escolha" && isMultiple) {
        const alternativasAtuais = prev[cdQuestao]?.CD_ALTERNATIVA || [];
        const novasAlternativas = alternativasAtuais.includes(valor)
          ? alternativasAtuais.filter((alt) => alt !== valor)
          : [...alternativasAtuais, valor];

        return {
          ...prev,
          [cdQuestao]: {
            CD_QUESTAO: cdQuestao,
            CD_ALTERNATIVA: novasAlternativas,
            TIPO_QUESTAO: tipoQuestao,
          },
        };
      } else if (
        tipoQuestao === "Múltipla Escolha" ||
        tipoQuestao === "Verdadeiro ou Falso"
      ) {
        return {
          ...prev,
          [cdQuestao]: {
            CD_QUESTAO: cdQuestao,
            CD_ALTERNATIVA: [valor],
            TIPO_QUESTAO: tipoQuestao,
          },
        };
      } else {
        return {
          ...prev,
          [cdQuestao]: {
            CD_QUESTAO: cdQuestao,
            TXT_RESPOSTA: valor,
            TIPO_QUESTAO: tipoQuestao,
          },
        };
      }
    });
  };

  const getPerfil = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/anamnese/perfis`);

      if (!response.ok) {
        showAlert.error("Erro ao carregar perfis");
        throw new Error("Erro ao carregar perfis");
      }

      const data = await response.json();
      setPerfil(data);
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao carregar perfis: " + error);
      return null;
    }
  };

  const getAlternative = async (cdQuestao) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/anamnese/alternativas/${cdQuestao}`
      );
      if (!response.ok) {
        console.error(
          `Erro ao carregar alternativas para questão ${cdQuestao}`
        );
        return [];
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro:", error);
      return [];
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleDelete = async (id) => {
    await confirmDelete("este prontuário?", async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/prontuario/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          showAlert.error("Erro ao deletar prontuário");
          throw new Error("Erro ao deletar prontuário");
        }

        showAlert.success("Prontuário deletado com sucesso!");
        setProntuarioEdited((prev) => !prev);
      } catch (error) {
        console.error("Erro:", error);
        showAlert.error("Erro ao deletar prontuário: " + error);
        return null;
      }
    });
    openData();
  };

  const handleSaveEdit = (id, data) => {
    if (
      !prontuarioData?.TXT_PRONTUARIO ||
      prontuarioData.TXT_PRONTUARIO.trim() === ""
    ) {
      showAlert.warning("Prontuário não pode ser vazio!");
      return;
    }
    setIsEditing(false);
    fetch(`http://127.0.0.1:5000/prontuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CD_PACIENTE: pacienteID,
        DT_PRONTUARIO: formatarDataBR(data),
        TXT_PRONTUARIO: prontuarioData.TXT_PRONTUARIO,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          showAlert.error("Erro ao editar prontuário");
          throw new Error("Erro ao editar prontuário");
        }
        setProntuarioEdited((prev) => !prev);
        showAlert.success("Prontuário editado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro:", error);
        showAlert.error("Erro ao editar prontuário: " + error);
      });
  };

  const openData = () => {
    document.querySelector(".ProntuarioDetails").classList.toggle("Hidden");
  };
  function formatarDataBR(dataString) {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  const hasProntuario = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/prontuario/por_paciente/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        showAlert.error("Erro ao verificar prontuário");
        throw new Error("Erro ao verificar prontuário");
      }

      const data = await response.json();
      setProntuarioList(data);
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao cadastrar anamnese: " + error);
      return null;
    }
  };

  const handleSubmitAnamnese = async (e) => {
    e.preventDefault();

    try {
      const cdAnamnese = anamnese?.ANAMNESE[0]?.CD_ANAMNESE;

      if (!cdAnamnese) {
        showAlert.error("Código da anamnese não encontrado");
        return;
      }

      // Validação: verifica se há respostas
      if (Object.keys(respostasAnamnese).length === 0) {
        showAlert.warning("Preencha pelo menos uma resposta!");
        return;
      }

      const promises = Object.values(respostasAnamnese).map(
        async (resposta) => {
          const payload = {
            CD_ANAMNESE: cdAnamnese,
            CD_QUESTAO: resposta.CD_QUESTAO,
          };

          // Múltipla Escolha e Verdadeiro ou Falso enviam como array
          if (
            resposta.TIPO_QUESTAO === "Múltipla Escolha" ||
            resposta.TIPO_QUESTAO === "Verdadeiro ou Falso"
          ) {
            // Garante que sempre seja um array
            payload.CD_ALTERNATIVA = Array.isArray(resposta.CD_ALTERNATIVA)
              ? resposta.CD_ALTERNATIVA
              : [resposta.CD_ALTERNATIVA];
          } else {
            // Dissertativa envia como texto
            payload.TXT_RESPOSTA = resposta.TXT_RESPOSTA;
          }

          const response = await fetch(
            "http://127.0.0.1:5000/anamnese/resposta",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Erro ao salvar resposta da questão ${resposta.CD_QUESTAO}`
            );
          }

          return response.json();
        }
      );

      await Promise.all(promises);

      showAlert.success("Anamnese salva com sucesso!");

      // CORREÇÃO: Atualiza estados ANTES de recarregar
      await hasAnamnese(pacienteID); // Aguarda o reload
      setRespostasAnamnese({});
      setFormIsOpen(false);
      setAnamneseState("exist"); // Agora muda para exist
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao salvar anamnese: " + error.message);
    }
  };

  const handleSubmitProntuario = async () => {
    if (!prontuario.TXT_PRONTUARIO || prontuario.TXT_PRONTUARIO.trim() === "") {
      showAlert.warning("Prontuário não pode ser vazio!");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:5000/prontuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CD_PACIENTE: pacienteID,
          DT_PRONTUARIO: new Date()
            .toLocaleDateString("pt-BR")
            .replace(/\//g, "-"),
          TXT_PRONTUARIO: prontuario.TXT_PRONTUARIO,
        }),
      });

      if (!response.ok) {
        showAlert.error("Erro ao verificar prontuario");
        throw new Error("Response com problemas");
      }
      setProntuarioEdited((prev) => !prev);
      showAlert.success("Prontuário cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao cadastrar prontuário: " + error);
      return null;
    }
  };

  const getAnamneseByPerfil = async (
    perfilId,
    pacienteId,
    cd_anamnese = null
  ) => {
    try {
      if (cd_anamnese) {
        const deleteResponse = await fetch(
          `http://127.0.0.1:5000/anamnese/${cd_anamnese}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!deleteResponse.ok) {
          showAlert.error("Erro ao apagar anamnese anterior");
          throw new Error("Falha ao deletar anamnese existente");
        }
      }

      const createResponse = await fetch(
        `http://127.0.0.1:5000/anamnese/gerar_por_perfil`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CD_PERFIL: perfilId,
            CD_PACIENTE: pacienteId,
          }),
        }
      );

      if (!createResponse.ok) {
        showAlert.error("Erro ao gerar anamnese");
        throw new Error("Falha ao gerar nova anamnese");
      }

      // CORREÇÃO: Aguarda o reload e atualiza o perfil
      await hasAnamnese(pacienteId);
      setPerfilSelecionado(perfilId);
      setRespostasAnamnese({}); // Limpa respostas ao trocar perfil

      return anamnese;
    } catch (error) {
      console.error("Erro:", error);
      showAlert.error("Erro ao gerar anamnese: " + error.message);
      return null;
    }
  };

  return (
    <div style={{ width: "97%" }}>
      <div className="F_Title">
        <h2
          className="F_CadastrarTitle"
          style={{ fontSize: "20px", margin: "0 0 10px 0" }}
        >
          Histórico
        </h2>
      </div>

      <div className="FlexUpAround">
        <div
          style={{
            borderRight: "2px solid white",
            width: "50%",
            height: "100%",
          }}
        >
          <div className="F_Title">
            <h2
              className="F_CadastrarTitle"
              style={{ fontSize: "20px", margin: "0 0 10px 0" }}
            >
              Anamnese
            </h2>
          </div>
          {anamneseState === "exist" ? (
            <div
              className="FlexCenterMid"
              style={{ width: "100%", height: "100%" }}
            >
              <div>
                <div style={{ margin: "0 auto" }}>
                  <div
                    className="BackgroundTransparent F_SecAreaGravidade ScrollBar"
                    style={{
                      border: "3px solid #ccc",
                      width: "34vw",
                      wordWrap: "break-word",
                      height: "480px",
                      color: "#fff",
                      whiteSpace: "pre-wrap",
                      marginBottom: "7px",
                      padding: "15px",
                    }}
                  >
                    {anamnese?.ANAMNESE.map((item, index) => (
                      <div key={index} style={{ marginBottom: "15px" }}>
                        <h5 style={{ marginBottom: "5px" }}>
                          {item.TXT_QUESTAO}
                        </h5>

                        {item.TIPO_QUESTAO === "Dissertativa" ? (
                          <p style={{ marginLeft: "10px", color: "#ddd" }}>
                            {item.TXT_RESPOSTA || "Sem resposta"}
                          </p>
                        ) : item.TIPO_QUESTAO === "Múltipla Escolha" ||
                          item.TIPO_QUESTAO === "Verdadeiro ou Falso" ? (
                          <p style={{ marginLeft: "10px", color: "#ddd" }}>
                            {item.ALTERNATIVA || "Sem resposta"}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="F_AdicionarArea">
                  <button
                    className="F_btnTranstornos"
                    onClick={() => {
                      setFormIsOpen(true);
                      setAnamneseState("new");
                    }}
                  >
                    Editar Anamnese
                  </button>
                </div>
              </div>
            </div>
          ) : anamneseState === "new" ? (
            <div
              className="FlexCenterMid"
              style={{ width: "100%", height: "100%" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <select
                    className="Border F_NomeAreaTranstorno"
                    style={{
                      width: "400px",
                      height: "40px",
                      marginBottom: "7px",
                    }}
                    value={perfilSelecionado} // AGORA TEM VALUE CONTROLADO
                    onChange={async (e) => {
                      await getAnamneseByPerfil(
                        e.target.value,
                        pacienteID,
                        anamnese?.ANAMNESE?.CD_ANAMNESE ||
                          anamnese?.ANAMNESE[0]?.CD_ANAMNESE
                      );
                    }}
                  >
                    <option value="">Selecione um perfil</option>
                    {perfil &&
                      perfil.map((item) => (
                        <option key={item.CD_PERFIL} value={item.CD_PERFIL}>
                          {item.PERFIL}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="F_AdicionarArea" style={{ height: "100%" }}>
                  <form onSubmit={handleSubmitAnamnese}>
                    <div
                      className="Border BackgroundTransparent F_SecAreaGravidade ScrollBar"
                      style={{
                        width: "34vw",
                        height: "440px",
                        color: "#fff",
                      }}
                    >
                      {anamnese?.ANAMNESE.map((item, index) => (
                        <div key={index} style={{ marginBottom: "15px" }}>
                          {item.TIPO_QUESTAO === "Dissertativa" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.TXT_QUESTAO}</h5>
                              <textarea
                                className="Border F_NomeAreaTranstorno"
                                style={{
                                  width: "90%",
                                  marginBottom: "5px",
                                  minHeight: "60px",
                                  padding: "5px",
                                }}
                                value={
                                  respostasAnamnese[item.CD_QUESTAO]
                                    ?.TXT_RESPOSTA || ""
                                }
                                onChange={(e) =>
                                  handleRespostaChange(
                                    item.CD_QUESTAO,
                                    "Dissertativa",
                                    e.target.value
                                  )
                                }
                                placeholder="Digite sua resposta..."
                              />
                            </div>
                          ) : item.TIPO_QUESTAO === "Múltipla Escolha" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.TXT_QUESTAO}</h5>
                              {item.ALTERNATIVAS &&
                              item.ALTERNATIVAS.length > 0 ? (
                                item.ALTERNATIVAS.map((alt, altIndex) => (
                                  <div
                                    key={altIndex}
                                    style={{
                                      marginLeft: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    <label
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <input
                                        type={
                                          item.PERMITE_MULTIPLAS
                                            ? "checkbox"
                                            : "radio"
                                        }
                                        name={`questao_${item.CD_QUESTAO}`}
                                        value={alt.CD_ALTERNATIVA}
                                        checked={
                                          Array.isArray(
                                            respostasAnamnese[item.CD_QUESTAO]
                                              ?.CD_ALTERNATIVA
                                          )
                                            ? respostasAnamnese[
                                                item.CD_QUESTAO
                                              ].CD_ALTERNATIVA.includes(
                                                alt.CD_ALTERNATIVA
                                              )
                                            : respostasAnamnese[item.CD_QUESTAO]
                                                ?.CD_ALTERNATIVA ===
                                              alt.CD_ALTERNATIVA
                                        }
                                        onChange={(e) =>
                                          handleRespostaChange(
                                            item.CD_QUESTAO,
                                            "Múltipla Escolha",
                                            alt.CD_ALTERNATIVA,
                                            item.PERMITE_MULTIPLAS
                                          )
                                        }
                                        style={{ marginRight: "8px" }}
                                      />
                                      <span>{alt.ALTERNATIVA}</span>
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <p
                                  style={{ marginLeft: "10px", color: "#999" }}
                                >
                                  Carregando alternativas...
                                </p>
                              )}
                            </div>
                          ) : item.TIPO_QUESTAO === "Verdadeiro ou Falso" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.TXT_QUESTAO}</h5>
                              {item.ALTERNATIVAS &&
                              item.ALTERNATIVAS.length > 0 ? (
                                item.ALTERNATIVAS.map((alt, altIndex) => (
                                  <div
                                    key={altIndex}
                                    style={{
                                      marginLeft: "10px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    <label
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`questao_${item.CD_QUESTAO}`}
                                        value={alt.CD_ALTERNATIVA}
                                        checked={
                                          Array.isArray(
                                            respostasAnamnese[item.CD_QUESTAO]
                                              ?.CD_ALTERNATIVA
                                          )
                                            ? respostasAnamnese[
                                                item.CD_QUESTAO
                                              ].CD_ALTERNATIVA.includes(
                                                alt.CD_ALTERNATIVA
                                              )
                                            : respostasAnamnese[item.CD_QUESTAO]
                                                ?.CD_ALTERNATIVA ===
                                              alt.CD_ALTERNATIVA
                                        }
                                        onChange={(e) =>
                                          handleRespostaChange(
                                            item.CD_QUESTAO,
                                            "Verdadeiro ou Falso",
                                            alt.CD_ALTERNATIVA,
                                            false
                                          )
                                        }
                                        style={{ marginRight: "8px" }}
                                      />
                                      <span>{alt.ALTERNATIVA}</span>
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <p
                                  style={{ marginLeft: "10px", color: "#999" }}
                                >
                                  Carregando alternativas...
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div
                      className="FlexCenterMid"
                      style={{ marginTop: "10px" }}
                    >
                      <button type="submit" className="F_btnTranstornos">
                        Salvar Anamnese
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="FlexCenterMid"
              style={{ width: "100%", height: "100%" }}
            >
              <div>
                <p style={{ color: "#555555ff" }}>anamnese não disponível.</p>
                <div className="F_AdicionarArea" style={{ marginTop: "15%" }}>
                  <button
                    className="F_btnTranstornos"
                    onClick={() => {
                      getAnamneseByPerfil(pacientData.CD_PERFIL, pacienteID);
                      setAnamneseState("new");
                    }}
                  >
                    Adicionar Anamnese
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ width: "50%", height: "100%" }}>
          <div className="F_Title">
            <h2
              className="F_CadastrarTitle"
              style={{ fontSize: "20px", margin: "0 0 10px 0", height: "100%" }}
            >
              Prontuário
            </h2>
          </div>
          {prontuarioState == "new" ? (
            <>
              <div
                className="ScrollBar"
                style={{
                  height: "80%",
                  width: "90%",
                  margin: "0 auto",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                }}
              >
                <div className="FlexCenterEnd" style={{ margin: "10px 15px" }}>
                  <button
                    className="exitProntuario"
                    onClick={() => {
                      setProntuarioState("list");
                    }}
                  >
                    X
                  </button>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <textarea
                    className="F_SecAreaGravidade"
                    style={{
                      width: "90%",
                      height: "400px",
                      marginBottom: "10px",
                      border: "1px solid black",
                      outline: "none",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      padding: " 5px 10px",
                    }}
                    value={prontuario.TXT_PRONTUARIO}
                    onChange={(e) =>
                      setProntuario({
                        ...prontuario,
                        TXT_PRONTUARIO: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="F_AdicionarArea" style={{ marginTop: "10px" }}>
                <button
                  className="F_btnTranstornos"
                  onClick={(e) => {
                    handleSubmitProntuario();
                    setProntuarioState("list");
                    hasAnamnese(pacienteID);
                    hasProntuario(pacienteID);
                  }}
                >
                  Salvar Prontuario
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="ScrollBar"
                style={{
                  height: "80%",
                  width: "90%",
                  margin: "0 auto",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <input
                    style={{
                      width: "70%",
                      border: "1px solid black",
                      outline: "none",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      padding: " 5px 10px",
                    }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar prontuário..."
                  />
                </div>
                <div className="F_NavTranstorno">
                  {prontuarioList.length === 0 ? (
                    <p>Nenhum prontuário encontrado</p>
                  ) : (
                    <ul
                      className="F_ULTranstorno"
                      style={{ margin: "0 10px", height: "100%", padding: "0" }}
                    >
                      {prontuarioList
                        .filter((p) =>
                          p.DT_PRONTUARIO?.toLowerCase().includes(
                            search.toLowerCase()
                          )
                        )
                        .map((p) => (
                          <li
                            className="F_TranstornoElementoList"
                            key={p.CD_PRONTUARIO}
                            style={{ gap: "10px" }}
                          >
                            <button
                              className="F_Ampliar"
                              onClick={() => {
                                openData();
                                setProntuarioData(p);
                              }}
                            ></button>
                            <strong>
                              {formatarDataBR(p.DT_PRONTUARIO) || "Sem nome"}
                            </strong>
                          </li>
                        ))}
                      {prontuarioList.filter((p) =>
                        p.DT_PRONTUARIO?.toLowerCase().includes(
                          search.toLowerCase()
                        )
                      ).length === 0 && (
                        <p className="F_NoResults">
                          Nenhum prontuário encontrado
                        </p>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <div className="F_AdicionarArea" style={{ marginTop: "10px" }}>
                <button
                  className="F_btnTranstornos"
                  onClick={(e) => {
                    setProntuarioState("new");
                  }}
                >
                  Adicionar Prontuario
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="F_DataTranstornoArea ProntuarioDetails Hidden">
        <div className="F_DataTranstorno">
          <div className="F_exitArea">
            <button
              className="F_exitBtnData"
              onClick={() => {
                openData();
              }}
            >
              ✖
            </button>
          </div>
          <div
            style={{
              textAlign: "justify",
              margin: "10px auto",
              height: "450px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h2 style={{ textAlign: "center" }}>Detalhes do prontuario</h2>

            {isEditing ? (
              <textarea
                className="F_SecAreaGravidade"
                style={{
                  width: "95%",
                  height: "300px",
                  border: "1px solid black",
                  outline: "none",
                  backgroundColor: "transparent",
                  borderRadius: "8px",
                  padding: " 5px 10px",
                }}
                value={prontuarioData?.TXT_PRONTUARIO}
                onChange={(e) =>
                  setProntuarioData((prev) => ({
                    ...prev,
                    TXT_PRONTUARIO: e.target.value,
                  }))
                }
              />
            ) : (
              <>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflow: "auto",
                    width: "95%",
                  }}
                >
                  {prontuarioData?.TXT_PRONTUARIO || "Detalhes do Prontuário"}
                </p>
              </>
            )}
          </div>
          <div className="F_ButtonsArea">
            <button
              className="F_btnTranstornos"
              onClick={() => handleDelete(prontuarioData?.CD_PRONTUARIO)}
            >
              Deletar
            </button>
            {isEditing ? (
              <>
                <button
                  className="F_btnTranstornos F_btnSave"
                  onClick={() =>
                    handleSaveEdit(
                      prontuarioData?.CD_PRONTUARIO,
                      prontuarioData?.DT_PRONTUARIO
                    )
                  }
                >
                  Salvar
                </button>
                <button
                  className="F_btnTranstornos F_btnCancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button className="F_btnTranstornos" onClick={handleEdit}>
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManterHistorico;
