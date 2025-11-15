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
    txt_prontuario: "",
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
              item.tipo_questao === "Múltipla Escolha" ||
              item.tipo_questao === "Verdadeiro ou Falso"
            ) {
              const alternativas = await getAlternative(item.cd_questao);
              return { ...item, ALTERNATIVAS: alternativas || [] };
            }
            return item;
          })
        );

        setAnamnese({ ANAMNESE: anamneseComAlternativas });

        // Prepara respostas existentes
        anamneseComAlternativas.forEach((item) => {
          if (item.txt_resposta || item.cd_alternativa) {
            respostasExistentes[item.cd_questao] = {
              cd_questao: item.cd_questao,
              tipo_questao: item.tipo_questao,
              ...(item.tipo_questao === "Dissertativa"
                ? { txt_resposta: item.txt_resposta || "" }
                : {
                    cd_alternativa: Array.isArray(item.cd_alternativa)
                      ? item.cd_alternativa
                      : item.cd_alternativa
                      ? [item.cd_alternativa]
                      : [],
                  }),
            };
          }
        });

        setRespostasAnamnese(respostasExistentes);
      };

      carregarAlternativas();

      if (anamnese.ANAMNESE[0]?.cd_perfil) {
        setPerfilSelecionado(anamnese.ANAMNESE[0].cd_perfil);
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
        `https://mentechbackend.onrender.com/anamnese/por_paciente/${id}`,
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
        const alternativasAtuais = prev[cdQuestao]?.cd_alternativa || [];
        const novasAlternativas = alternativasAtuais.includes(valor)
          ? alternativasAtuais.filter((alt) => alt !== valor)
          : [...alternativasAtuais, valor];

        return {
          ...prev,
          [cdQuestao]: {
            cd_questao: cdQuestao,
            cd_alternativa: novasAlternativas,
            tipo_questao: tipoQuestao,
          },
        };
      } else if (
        tipoQuestao === "Múltipla Escolha" ||
        tipoQuestao === "Verdadeiro ou Falso"
      ) {
        return {
          ...prev,
          [cdQuestao]: {
            cd_questao: cdQuestao,
            cd_alternativa: [valor],
            tipo_questao: tipoQuestao,
          },
        };
      } else {
        return {
          ...prev,
          [cdQuestao]: {
            cd_questao: cdQuestao,
            txt_resposta: valor,
            tipo_questao: tipoQuestao,
          },
        };
      }
    });
  };

  const getPerfil = async () => {
    try {
      const response = await fetch(`https://mentechbackend.onrender.com/anamnese/perfis`);

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
        `https://mentechbackend.onrender.com/anamnese/alternativas/${cdQuestao}`
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
        const response = await fetch(`https://mentechbackend.onrender.com/prontuario/${id}`, {
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
      !prontuarioData?.txt_prontuario ||
      prontuarioData.txt_prontuario.trim() === ""
    ) {
      showAlert.warning("Prontuário não pode ser vazio!");
      return;
    }
    setIsEditing(false);
    fetch(`https://mentechbackend.onrender.com/prontuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cd_paciente: pacienteID,
        dt_prontuario: formatarDataBR(data),
        txt_prontuario: prontuarioData.txt_prontuario,
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
        `https://mentechbackend.onrender.com/prontuario/por_paciente/${id}`,
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
      const cdAnamnese = anamnese?.ANAMNESE[0]?.cd_anamnese;

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
            cd_anamnese: cdAnamnese,
            cd_questao: resposta.cd_questao,
          };

          // Múltipla Escolha e Verdadeiro ou Falso enviam como array
          if (
            resposta.tipo_questao === "Múltipla Escolha" ||
            resposta.tipo_questao === "Verdadeiro ou Falso"
          ) {
            // Garante que sempre seja um array
            payload.cd_alternativa = Array.isArray(resposta.cd_alternativa)
              ? resposta.cd_alternativa
              : [resposta.cd_alternativa];
          } else {
            // Dissertativa envia como texto
            payload.txt_resposta = resposta.txt_resposta;
          }

          const response = await fetch(
            "https://mentechbackend.onrender.com/anamnese/resposta",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Erro ao salvar resposta da questão ${resposta.cd_questao}`
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
    if (!prontuario.txt_prontuario || prontuario.txt_prontuario.trim() === "") {
      showAlert.warning("Prontuário não pode ser vazio!");
      return;
    }
    try {
      const response = await fetch(`https://mentechbackend.onrender.com/prontuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cd_paciente: pacienteID,
          dt_prontuario: new Date()
            .toLocaleDateString("pt-BR")
            .replace(/\//g, "-"),
          txt_prontuario: prontuario.txt_prontuario,
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
          `https://mentechbackend.onrender.com/anamnese/${cd_anamnese}`,
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
        `https://mentechbackend.onrender.com/anamnese/gerar_por_perfil`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cd_perfil: perfilId,
            cd_paciente: pacienteId,
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
                          {item.txt_questao}
                        </h5>

                        {item.tipo_questao === "Dissertativa" ? (
                          <p style={{ marginLeft: "10px", color: "#ddd" }}>
                            {item.txt_resposta || "Sem resposta"}
                          </p>
                        ) : item.tipo_questao === "Múltipla Escolha" ||
                          item.tipo_questao === "Verdadeiro ou Falso" ? (
                          <p style={{ marginLeft: "10px", color: "#ddd" }}>
                            {item.alternativa || "Sem resposta"}
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
                        anamnese?.ANAMNESE?.cd_anamnese ||
                          anamnese?.ANAMNESE[0]?.cd_anamnese
                      );
                    }}
                  >
                    <option value="">Selecione um perfil</option>
                    {perfil &&
                      perfil.map((item) => (
                        <option key={item.cd_perfil} value={item.cd_perfil}>
                          {item.perfil}
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
                          {item.tipo_questao === "Dissertativa" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.txt_questao}</h5>
                              <textarea
                                className="Border F_NomeAreaTranstorno"
                                style={{
                                  width: "90%",
                                  marginBottom: "5px",
                                  minHeight: "60px",
                                  padding: "5px",
                                }}
                                value={
                                  respostasAnamnese[item.cd_questao]
                                    ?.txt_resposta || ""
                                }
                                onChange={(e) =>
                                  handleRespostaChange(
                                    item.cd_questao,
                                    "Dissertativa",
                                    e.target.value
                                  )
                                }
                                placeholder="Digite sua resposta..."
                              />
                            </div>
                          ) : item.tipo_questao === "Múltipla Escolha" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.txt_questao}</h5>
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
                                        name={`questao_${item.cd_questao}`}
                                        value={alt.cd_alternativa}
                                        checked={
                                          Array.isArray(
                                            respostasAnamnese[item.cd_questao]
                                              ?.cd_alternativa
                                          )
                                            ? respostasAnamnese[
                                                item.cd_questao
                                              ].cd_alternativa.includes(
                                                alt.cd_alternativa
                                              )
                                            : respostasAnamnese[item.cd_questao]
                                                ?.cd_alternativa ===
                                              alt.cd_alternativa
                                        }
                                        onChange={(e) =>
                                          handleRespostaChange(
                                            item.cd_questao,
                                            "Múltipla Escolha",
                                            alt.cd_alternativa,
                                            item.PERMITE_MULTIPLAS
                                          )
                                        }
                                        style={{ marginRight: "8px" }}
                                      />
                                      <span>{alt.alternativa}</span>
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
                          ) : item.tipo_questao === "Verdadeiro ou Falso" ? (
                            <div style={{ marginBottom: "10px" }}>
                              <h5>{item.txt_questao}</h5>
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
                                        name={`questao_${item.cd_questao}`}
                                        value={alt.cd_alternativa}
                                        checked={
                                          Array.isArray(
                                            respostasAnamnese[item.cd_questao]
                                              ?.cd_alternativa
                                          )
                                            ? respostasAnamnese[
                                                item.cd_questao
                                              ].cd_alternativa.includes(
                                                alt.cd_alternativa
                                              )
                                            : respostasAnamnese[item.cd_questao]
                                                ?.cd_alternativa ===
                                              alt.cd_alternativa
                                        }
                                        onChange={(e) =>
                                          handleRespostaChange(
                                            item.cd_questao,
                                            "Verdadeiro ou Falso",
                                            alt.cd_alternativa,
                                            false
                                          )
                                        }
                                        style={{ marginRight: "8px" }}
                                      />
                                      <span>{alt.alternativa}</span>
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
                      getAnamneseByPerfil(pacientData.cd_perfil, pacienteID);
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
                    value={prontuario.txt_prontuario}
                    onChange={(e) =>
                      setProntuario({
                        ...prontuario,
                        txt_prontuario: e.target.value,
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
                          p.dt_prontuario?.toLowerCase().includes(
                            search.toLowerCase()
                          )
                        )
                        .map((p) => (
                          <li
                            className="F_TranstornoElementoList"
                            key={p.cd_prontuario}
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
                              {formatarDataBR(p.dt_prontuario) || "Sem nome"}
                            </strong>
                          </li>
                        ))}
                      {prontuarioList.filter((p) =>
                        p.dt_prontuario?.toLowerCase().includes(
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
                value={prontuarioData?.txt_prontuario}
                onChange={(e) =>
                  setProntuarioData((prev) => ({
                    ...prev,
                    txt_prontuario: e.target.value,
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
                  {prontuarioData?.txt_prontuario || "Detalhes do Prontuário"}
                </p>
              </>
            )}
          </div>
          <div className="F_ButtonsArea">
            <button
              className="F_btnTranstornos"
              onClick={() => handleDelete(prontuarioData?.cd_prontuario)}
            >
              Deletar
            </button>
            {isEditing ? (
              <>
                <button
                  className="F_btnTranstornos F_btnSave"
                  onClick={() =>
                    handleSaveEdit(
                      prontuarioData?.cd_prontuario,
                      prontuarioData?.dt_prontuario
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
