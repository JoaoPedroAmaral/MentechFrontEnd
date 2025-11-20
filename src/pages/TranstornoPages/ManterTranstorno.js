import React, { useState, useEffect } from "react";
import iconTrash from "../../Images/Trash.png";
import "../../css/SpecificStyle.css";
import { showAlert, confirmDelete } from "../../utils/alerts.js";
import { useGlobal, BASE_URL } from "../../global/GlobalContext";

import "../../css/OrganizeCSS/base.css";
import "../../css/OrganizeCSS/components.css";
import "../../css/OrganizeCSS/layout.css";
import "../../css/OrganizeCSS/utils.css";

const ManterTranstorno = () => {
  const [transtornos, setTranstornos] = useState([]);
  const [transtornoSelect, setTranstornoSelect] = useState(null);
  const [criterioDiagnostico, setcriterioDiagnostico] = useState(null);
  const [gravidade, setGravidade] = useState(null);
  const [subTipo, setSubTipo] = useState(null);
  const [loadingTranstorno, setLoadingTranstorno] = useState(false);
  const [ativo, setAtivo] = useState("checkboxTranstorno");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { setCriteriosModificados, setDiagnosticosModificados } = useGlobal();

  const [editingTranstorno, setEditingTranstorno] = useState(null);
  const [editingGravidades, setEditingGravidades] = useState([]);
  const [editingCriterios, setEditingCriterios] = useState([]);
  const [editingSubtipos, setEditingSubtipos] = useState([]);

  const [formTranstorno, setFormTranstorno] = useState({
    nm_transtorno: "",
    cid11: "",
    apoio_diag: "",
    prevalencia: "",
    fatores_risco_prognostico: "",
    diagnostico_genero: "",
  });

  const [formgravidades, setFormGravidades] = useState([
    {
      nm_gravidade: "",
      grav_descricao: "",
    },
  ]);
  const [formCriterioDiagnostico, setFormCriterioDiagnostico] = useState([
    {
      criterio_diagnostico: "",
      criterio_diferencial: "N",
    },
  ]);
  const [formSubTipo, setFormSubTipo] = useState([
    {
      nm_subtipo: "",
      cid11: "",
      obs: "",
    },
  ]);

  const adicionarTranstorno = async () => {
    try {
      if (!formTranstorno.nm_transtorno || !formTranstorno.cid11) {
        alert("Nome do Transtorno e cid11 são obrigatórios!");
        return;
      }

      const response = await fetch(`${BASE_URL}/transtorno`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formTranstorno),
      });

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (e) {
          const rawResponse = await response.text();
          console.error("Resposta não é JSON:", rawResponse);
          throw new Error("Resposta da API não é JSON válido");
        }

        await showAlert.success("Transtorno cadastrado com sucesso!");

        return data.cd_transtorno;
      } else {
        throw new Error("Falha ao cadastrar transtorno");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar transtorno: " + error);
      return null;
    }
  };
  const adicionarGravidades = async (transtornoId) => {
    try {
      const gravidadesValidas = formgravidades.filter(
        (g) => g.nm_gravidade && g.grav_descricao
      );

      if (gravidadesValidas.length === 0) {
        return true;
      }

      for (const gravidade of gravidadesValidas) {
        const gravidadeParaEnviar = {
          cd_transtorno: transtornoId,
          nm_gravidade: gravidade.nm_gravidade,
          grav_descricao: gravidade.grav_descricao,
        };

        const response = await fetch(`${BASE_URL}/gravidade`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gravidadeParaEnviar),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar gravidade: ${JSON.stringify(errorData)}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`Erro ao cadastrar gravidades: ${error.message}`);
      return false;
    }
  };
  const adicionarCriterioDiagnostico = async (transtornoId) => {
    try {
      const criteriosValidos = formCriterioDiagnostico.filter(
        (c) => c.criterio_diagnostico
      );

      if (criteriosValidos.length === 0) {
        return;
      }

      for (const criteriosDiag of criteriosValidos) {
        const criterioParaEnviar = {
          cd_transtorno: transtornoId,
          criterio_diagnostico: criteriosDiag.criterio_diagnostico,
          criterio_diferencial: criteriosDiag.criterio_diferencial,
        };

        const response = await fetch(
          `${BASE_URL}/criterio_diagnostico`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(criterioParaEnviar),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar Criterios: ${JSON.stringify(errorData)}`
          );
        }
      }
      setCriteriosModificados((prev) => !prev);
      setDiagnosticosModificados((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`Erro ao cadastrar criterios: ${error.message}`);
      return false;
    }
  };
  const adicionarSubTipo = async (transtornoId) => {
    try {
      const subtiposValidos = formSubTipo.filter(
        (s) => s.nm_subtipo && s.cid11
      );

      if (subtiposValidos.length === 0) {
        return;
      }

      for (const subtipos of subtiposValidos) {
        const subtipoParaEnviar = {
          cd_transtorno: transtornoId,
          nm_subtipo: subtipos.nm_subtipo,
          cid11: subtipos.cid11,
          obs: subtipos.obs,
        };

        const response = await fetch(
          `${BASE_URL}/subtipo_transtorno`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subtipoParaEnviar),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Erro ao cadastrar subtipos: ${JSON.stringify(errorData)}`
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`Erro ao cadastrar subtipos: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchTranstornos();
  }, []);

  const fetchTranstornos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/transtorno`);
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setTranstornos(dataJson);
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    }
  };
  const fetchTranstornosByID = async (id) => {
    setLoadingTranstorno(true);
    try {
      const response = await fetch(
        `${BASE_URL}/transtorno_PorIdTranstorno/${id}`
      );
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setTranstornoSelect(dataJson[0]);
    } catch (error) {
      console.error("Erro ao buscar transtornos:", error);
    } finally {
      setLoadingTranstorno(false);
    }
  };
  const fetchCriterioDiagnostico = async (cdTranstorno) => {
    setcriterioDiagnostico(null);
    try {
      const response = await fetch(
        `${BASE_URL}/criterio_diagnostico_PorIdTranstorno/${cdTranstorno}`
      );
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setcriterioDiagnostico(dataJson);

      setCriteriosModificados((prev) => !prev);
    } catch (error) {
      console.error("Erro ao buscar criterios diagnosticos:", error);
    }
  };
  const fetchGravidade = async (cdTranstorno) => {
    setGravidade([]);
    try {
      const response = await fetch(
        `${BASE_URL}/gravidade_PorIdTranstorno/${cdTranstorno}`
      );
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setGravidade(dataJson);
    } catch (error) {
      console.error("Erro ao buscar criterios diagnosticos:", error);
    }
  };
  const fetchSubTipos = async (cdTranstorno) => {
    setSubTipo([]);
    try {
      const response = await fetch(
        `${BASE_URL}/subtipo_transtorno_PorIdTranstorno/${cdTranstorno}`
      );
      const dataJson = await response.json();

      if (!Array.isArray(dataJson)) {
        console.error("Formato inesperado:", dataJson);
        return;
      }

      setSubTipo(dataJson);
    } catch (error) {
      console.error("Erro ao buscar criterios diagnosticos:", error);
    }
  };

  const deleteTranstorno = async (id) => {
    await fetch(`${BASE_URL}/transtorno/${id}`, { method: "DELETE" });
    setCriteriosModificados((prev) => !prev);
    fetchTranstornos();
  };

  const handleChangeArea = (id) => {
    setAtivo(id);
  };
  const handleAddGravidade = () => {
    setFormGravidades([
      ...formgravidades,
      { nm_gravidade: "", grav_descricao: "" },
    ]);
  };
  const handleRemoveGravidade = (index) => {
    if (formgravidades.length > 1) {
      const novas = formgravidades.filter((_, i) => i !== index);
      setFormGravidades(novas);
    }
  };
  const handleSubmitCadastrosTranstorno = async () => {
    const transtornoId = await adicionarTranstorno();
    if (transtornoId) {
      await adicionarGravidades(transtornoId);
      await adicionarCriterioDiagnostico(transtornoId);
      await adicionarSubTipo(transtornoId);
      fetchTranstornos();
      setFormTranstorno({
        nm_transtorno: "",
        cid11: "",
        apoio_diag: "",
        prevalencia: "",
        fatores_risco_prognostico: "",
        diagnostico_genero: "",
      });
      setFormGravidades([{ nm_gravidade: "", grav_descricao: "" }]);
      setFormCriterioDiagnostico([
        { criterio_diagnostico: "", criterio_diferencial: "N" },
      ]);
      setFormSubTipo([{ nm_subtipo: "", cid11: "", obs: "" }]);
    }
    fetchTranstornos();
  };
  const handleDelete = async () => {
    const success = await confirmDelete(
      transtornoSelect?.nm_transtorno || "Este Transtorno",
      async () => {
        await deleteTranstorno(transtornoSelect.cd_transtorno);
        fetchTranstornos(); // Atualiza a lista
      }
    );

    if (success) {
      openData(); // Fecha o modal se necessário
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditingTranstorno({
      ...transtornoSelect,
      nm_transtorno: transtornoSelect.nm_transtorno || "",
      cid11: transtornoSelect.cid11 || "",
      apoio_diag: transtornoSelect.apoio_diag || "",
      prevalencia: transtornoSelect.prevalencia || "",
      fatores_risco_prognostico:
        transtornoSelect.fatores_risco_prognostico || "",
      diagnostico_genero: transtornoSelect.diagnostico_genero || "",
    });
    setEditingGravidades(gravidade ? [...gravidade] : []);
    setEditingCriterios(criterioDiagnostico ? [...criterioDiagnostico] : []);
    setEditingSubtipos(subTipo ? [...subTipo] : []);
  };
  const handleAddEditingGravidade = () => {
    setEditingGravidades([
      ...editingGravidades,
      {
        cd_gravidade: null,
        nm_gravidade: "",
        grav_descricao: "",
      },
    ]);
  };

  const handleRemoveEditingGravidade = (index) => {
    const novas = editingGravidades.filter((_, i) => i !== index);
    setEditingGravidades(novas);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingTranstorno.nm_transtorno || !editingTranstorno.cid11) {
        await showAlert.error("Nome do Transtorno e cid11 são obrigatórios!");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/transtorno/${transtornoSelect.cd_transtorno}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nm_transtorno: editingTranstorno.nm_transtorno,
            cid11: editingTranstorno.cid11,
            apoio_diag: editingTranstorno.apoio_diag,
            prevalencia: editingTranstorno.prevalencia,
            fatores_risco_prognostico:
              editingTranstorno.fatores_risco_prognostico,
            diagnostico_genero: editingTranstorno.diagnostico_genero,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar transtorno");
      }

      // Atualiza gravidades
      await updateRelatedData(
        "gravidade",
        transtornoSelect.cd_transtorno,
        editingGravidades,
        ["nm_gravidade", "grav_descricao"]
      );

      // Atualiza critérios diagnósticos
      await updateRelatedData(
        "criterio_diagnostico",
        transtornoSelect.cd_transtorno,
        editingCriterios,
        ["criterio_diagnostico", "criterio_diferencial"]
      );

      // Atualiza subtipos
      await updateRelatedData(
        "subtipo_transtorno",
        transtornoSelect.cd_transtorno,
        editingSubtipos,
        ["nm_subtipo", "cid11", "obs"]
      );

      await showAlert.success("Transtorno atualizado com sucesso!");
      setIsEditing(false);
      fetchTranstornosByID(transtornoSelect.cd_transtorno);
      fetchCriterioDiagnostico(transtornoSelect.cd_transtorno);
      fetchGravidade(transtornoSelect.cd_transtorno);
      fetchSubTipos(transtornoSelect.cd_transtorno);
      fetchTranstornos();
    } catch (error) {
      await showAlert.error(error.message);
    }
  };

  const updateRelatedData = async (endpoint, cdTranstorno, items, fields) => {
    await fetch(
      `${BASE_URL}/${endpoint}/deletarPorTranstorno/${cdTranstorno}`,
      {
        method: "DELETE",
      }
    );

    // Depois adiciona os novos (apenas os que têm dados válidos)
    for (const item of items) {
      const payload = { cd_transtorno: cdTranstorno };

      fields.forEach((field) => {
        if (item[field] !== undefined && item[field] !== "") {
          payload[field] = item[field];
        }
      });

      if (Object.keys(payload).length > 1) {
        await fetch(`${BASE_URL}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
    }
  };

  const removeAccents = (str) => {
    if (typeof str !== "string") return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const filteredTranstornos = transtornos
    .filter((t) =>
      removeAccents(t.nm_transtorno).includes(removeAccents(searchTerm))
    )
    .reverse();

  const openData = () => {
    document.querySelector(".F_DataTranstornoArea").classList.toggle("Hidden");
  };

  return (
    <div className="F_BODY">
      <div className="F_Title">
        <h2 className="F_gerenciarTranstornoTitle">Gerenciar Transtornos</h2>
      </div>
      <div className="F_TranstornoCadastro">
        <div className="F_BtnCampos">
          <input
            type="checkbox"
            checked={ativo === "checkboxTranstorno"}
            onChange={() => handleChangeArea("checkboxTranstorno")}
            className="F_checkbox"
            id="checkboxTranstorno"
          />
          <label className="F_btnCad" htmlFor="checkboxTranstorno">
            Transtorno
          </label>

          <input
            type="checkbox"
            checked={ativo === "checkboxDiagnostico"}
            onChange={() => handleChangeArea("checkboxDiagnostico")}
            className="F_checkbox"
            id="checkboxDiagnostico"
          />
          <label className="F_btnCad" htmlFor="checkboxDiagnostico">
            Diagnostico
          </label>

          <input
            type="checkbox"
            checked={ativo === "checkboxSubtipos"}
            onChange={() => handleChangeArea("checkboxSubtipos")}
            className="F_checkbox"
            id="checkboxSubtipos"
          />
          <label className="F_btnCad" htmlFor="checkboxSubtipos">
            Subtipos
          </label>
        </div>
        <div className="F_CriarTranstornoContainer">
          <div
            className={
              ativo === "checkboxTranstorno"
                ? "F_TranstornoArea"
                : "F_TranstornoArea Hidden"
            }
          >
            <div className="F_CriarTranstornoInputSup">
              <div className="F_CriarTranstornoInputObrigatorio">
                <p>Nome do Transtorno*</p>
                <input
                  className="F_NomeAreaTranstorno"
                  name="nm_transtorno"
                  placeholder="Ex: Transtorno Obsessivo-Compulsivo (TOC)"
                  value={formTranstorno.nm_transtorno}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      nm_transtorno: e.target.value,
                    })
                  }
                  maxLength={90}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p>cid11*</p>
                <input
                  className="F_CIDAreaTranstorno"
                  name="cid11"
                  placeholder="Ex: 6A20.0"
                  value={formTranstorno.cid11}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      cid11: e.target.value,
                    })
                  }
                  maxLength={10}
                ></input>
              </div>
            </div>
            <div className="F_AreaSecundaria">
              <div className="F_CriarTranstornoInputMid">
                <div className="F_CriarTranstornoInputSec">
                  <p>Fatores de risco / Prognóstico</p>
                  <textarea
                    className="F_SecAreaTranstorno"
                    name="fatores_risco_prognostico"
                    placeholder="Ex: História familiar de transtornos de ansiedade, estresse ambiental."
                    value={formTranstorno.fatores_risco_prognostico}
                    onChange={(e) =>
                      setFormTranstorno({
                        ...formTranstorno,
                        fatores_risco_prognostico: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="F_CriarTranstornoInputSec">
                  <p>Prevalência</p>
                  <textarea
                    className="F_SecAreaTranstorno"
                    name="prevalencia"
                    placeholder="Ex: A prevalência do TOC é de aproximadamente 1-2% da população geral."
                    value={formTranstorno.prevalencia}
                    onChange={(e) =>
                      setFormTranstorno({
                        ...formTranstorno,
                        prevalencia: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>
              <div className="F_CriarTranstornoInputSup">
                <div className="F_AreaGravidade">
                  {formgravidades.map((item, index) => (
                    <div key={index} className="F_CriarTranstornoInputSec">
                      <p>Gravidade</p>
                      <div>
                        <input
                          className="F_GravidadeAreaTranstorno"
                          name="nm_gravidade"
                          placeholder="Ex: Leve, Moderado, Grave"
                          value={item.nm_gravidade}
                          onChange={(e) => {
                            const novasGravidades = [...formgravidades];
                            novasGravidades[index].nm_gravidade =
                              e.target.value;
                            setFormGravidades(novasGravidades);
                          }}
                          maxLength={90}
                        />
                      </div>
                      <p>Descrição Gravidade</p>
                      <div>
                        <textarea
                          className="F_SecAreaGravidade"
                          name="grav_descricao"
                          placeholder="Ex: O transtorno leve pode ser tratado com terapia cognitivo-comportamental."
                          value={item.grav_descricao}
                          onChange={(e) => {
                            const novasGravidades = [...formgravidades];
                            novasGravidades[index].grav_descricao =
                              e.target.value;
                            setFormGravidades(novasGravidades);
                          }}
                        />
                      </div>
                      <div className="F_BotoesGravidade">
                        <button
                          className="F_BtnGravidade"
                          onClick={handleAddGravidade}
                        >
                          <strong>+</strong>
                        </button>
                        {formgravidades.length > 1 && (
                          <button
                            className="F_BtnGravidade"
                            onClick={() => handleRemoveGravidade(index)}
                          >
                            <img className="F_TrashIcon" src={iconTrash} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              ativo === "checkboxDiagnostico"
                ? "F_DiagnosticoArea"
                : "F_DiagnosticoArea Hidden"
            }
          >
            <div className="F_CriarDiagnosticoInputSup">
              <div className="F_TitleCDAndDiferencial">
                <p className="F_TitleCD">Critério Diagnostico*</p>
                <p className="F_TitleDiferencial">Diferencial?*</p>
              </div>
              {formCriterioDiagnostico.map((CDiagnostico, index) => (
                <div key={index}>
                  <div className="F_CriarCDInputObligatorio">
                    <div className="F_CDArea">
                      <div>
                        <input
                          className="F_InputCD"
                          name="criterio_diagnostico"
                          placeholder="Ex: Presença de obsessões e/ou compulsões."
                          value={CDiagnostico.criterio_diagnostico}
                          onChange={(e) => {
                            const novoCriterios = [...formCriterioDiagnostico];
                            novoCriterios[index].criterio_diagnostico =
                              e.target.value;
                            setFormCriterioDiagnostico(novoCriterios);
                          }}
                          maxLength={255}
                        />
                      </div>
                    </div>
                    <div className="F_DiferencialArea">
                      <input
                        className="F_CheckBoxCD"
                        type="checkbox"
                        style={{ display: "grid" }}
                        checked={CDiagnostico.criterio_diferencial === "S"}
                        onChange={(e) => {
                          const novoCriterios = [...formCriterioDiagnostico];
                          novoCriterios[index].criterio_diferencial = e.target
                            .checked
                            ? "S"
                            : "N";
                          setFormCriterioDiagnostico(novoCriterios);
                        }}
                      />
                    </div>
                  </div>
                  <div className="F_AreaBtnAddCD">
                    <button
                      className="F_BtnAddCD"
                      type="button"
                      onClick={() => {
                        setFormCriterioDiagnostico([
                          ...formCriterioDiagnostico,
                          {
                            criterio_diagnostico: "",
                            criterio_diferencial: "N",
                          },
                        ]);
                      }}
                    >
                      +
                    </button>
                    {formCriterioDiagnostico.length > 1 && (
                      <button
                        className="F_BtnAddCD"
                        type="button"
                        onClick={() => {
                          const novosCriterios = formCriterioDiagnostico.filter(
                            (_, i) => i !== index
                          );
                          setFormCriterioDiagnostico(novosCriterios);
                        }}
                      >
                        <img className="F_TrashIcon" src={iconTrash} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="F_ApoioRiscoAndGenero">
              <div className="F_ApoioDiag">
                <p>Apoio Diagnóstico</p>
                <textarea
                  className="F_SecAreaTranstorno F_ApoioDiagArea"
                  name="apoio_diag"
                  placeholder="Ex: O TOC pode ser diagnosticado com base na avaliação clínica e em questionários padronizados."
                  value={formTranstorno.apoio_diag}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      apoio_diag: e.target.value,
                    })
                  }
                />
              </div>
              <div className="F_DiagGenero">
                <p>Diagnóstico por Gênero</p>
                <textarea
                  className="F_SecAreaTranstorno F_DiagnosticoGen"
                  name="diagnostico_genero"
                  placeholder="Ex: O TOC pode se manifestar de maneira diferente em homens e mulheres."
                  value={formTranstorno.diagnostico_genero}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      diagnostico_genero: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div
            className={
              ativo === "checkboxSubtipos"
                ? "F_SubtipoArea"
                : "F_SubtipoArea Hidden"
            }
          >
            <div className="F_SubtipoAreaTranstorno">
              {formSubTipo.map((subtipo, index) => (
                <div key={index} className="F_CriarSubtipoInputSec">
                  <div className="F_SubtipoNameCID">
                    <div>
                      <p>Subtipo</p>
                      <input
                        className="F_SubtipoTranstorno"
                        name="nm_subtipo"
                        placeholder="Ex: TOC com compulsões."
                        value={subtipo.nm_subtipo}
                        onChange={(e) => {
                          const novosSubtipos = [...formSubTipo];
                          novosSubtipos[index].nm_subtipo = e.target.value;
                          setFormSubTipo(novosSubtipos);
                        }}
                        maxLength={90}
                      />
                    </div>
                    <div>
                      <p>cid11</p>
                      <input
                        className="F_CID11SubtipoTranstorno"
                        name="cid11"
                        placeholder="Ex: 6A20.0"
                        value={subtipo.cid11}
                        onChange={(e) => {
                          const novosSubtipos = [...formSubTipo];
                          novosSubtipos[index].cid11 = e.target.value;
                          setFormSubTipo(novosSubtipos);
                        }}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="F_SubtipoObs">
                    <p>Observações</p>
                    <textarea
                      className="F_SecAreaTranstorno F_OBSSubtipo"
                      name="Observaçoes subtipo"
                      placeholder="Ex: O TOC com compulsões pode incluir rituais de limpeza, verificação ou contagem."
                      value={subtipo.obs}
                      onChange={(e) => {
                        const novosSubtipos = [...formSubTipo];
                        novosSubtipos[index].obs = e.target.value;
                        setFormSubTipo(novosSubtipos);
                      }}
                    />
                  </div>
                  <div className="F_AreaBtnAddST">
                    <button
                      className="F_BtnAddCD"
                      type="button"
                      onClick={() => {
                        setFormSubTipo([
                          ...formSubTipo,
                          {
                            nm_subtipo: "",
                            cid11: "",
                            obs: "",
                          },
                        ]);
                      }}
                    >
                      +
                    </button>
                    {formSubTipo.length > 1 && (
                      <button
                        className="F_BtnAddCD"
                        type="button"
                        onClick={() => {
                          const novosCriterios = formSubTipo.filter(
                            (_, i) => i !== index
                          );
                          setFormSubTipo(novosCriterios);
                        }}
                      >
                        <img className="F_TrashIcon" src={iconTrash} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="F_LineWhiteArea">
            <div className="F_LineWhite"></div>
          </div>
          <div className="F_TranstornoList">
            <div className="F_SearchElement">
              <input
                type="text"
                className="F_SearchTranstorno"
                placeholder="Pesquisar transtorno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxLength={90}
              />
            </div>
            <div className="F_NavTranstorno">
              {transtornos.length === 0 ? (
                <p>Carregando transtornos...</p>
              ) : (
                <ul className="F_ULTranstorno">
                  {filteredTranstornos.length > 0 ? (
                    filteredTranstornos.map((t) => (
                      <li
                        className="F_TranstornoElementoList"
                        key={t.cd_transtorno}
                      >
                        <button
                          className="F_Ampliar"
                          onClick={() => {
                            openData();
                            fetchTranstornosByID(t.cd_transtorno);
                            fetchCriterioDiagnostico(t.cd_transtorno);
                            fetchGravidade(t.cd_transtorno);
                            fetchSubTipos(t.cd_transtorno);
                          }}
                        ></button>
                        <strong>{t.nm_transtorno || "Sem nome"}</strong>
                      </li>
                    ))
                  ) : (
                    <p className="F_NoResults">Nenhum transtorno encontrado</p>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="F_AdicionarArea">
          <button
            className="F_btnTranstornos"
            onClick={handleSubmitCadastrosTranstorno}
          >
            Adicionar Transtorno
          </button>
        </div>
      </div>
      <div className="F_DataTranstornoArea Hidden">
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
          <div className="F_TranstornoInfos">
            {loadingTranstorno ? (
              <p>Carregando...</p>
            ) : transtornoSelect ? (
              <div>
                <div>
                  {isEditing ? (
                    <>
                      <input
                        className="F_EditInput"
                        value={editingTranstorno.nm_transtorno}
                        onChange={(e) =>
                          setEditingTranstorno({
                            ...editingTranstorno,
                            nm_transtorno: e.target.value,
                          })
                        }
                        placeholder="ex: Transtorno Obsessivo-Compulsivo (TOC)"
                        required
                        maxLength={90}
                      />
                      <div className="F_EditGrid">
                        <div>
                          <strong>cid11:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.cid11}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                cid11: e.target.value,
                              })
                            }
                            placeholder="ex: 6A20.0"
                            required
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <strong>Apoio Diagnóstico:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.apoio_diag}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                apoio_diag: e.target.value,
                              })
                            }
                            placeholder="ex: O TOC pode ser diagnosticado com base na avaliação clínica e em questionários padronizados."
                            maxLength={255}
                          />
                        </div>
                        <div>
                          <strong>Prevalência:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.prevalencia}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                prevalencia: e.target.value,
                              })
                            }
                            placeholder="ex: A prevalência do TOC é de aproximadamente 1-2% da população geral."
                            maxLength={255}
                          />
                        </div>
                        <div>
                          <strong>Fatores de Risco/Prognóstico:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.fatores_risco_prognostico}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                fatores_risco_prognostico: e.target.value,
                              })
                            }
                            placeholder="ex: História familiar de transtornos de ansiedade, estresse ambiental."
                            maxLength={255}
                          />
                        </div>
                        <div>
                          <strong>Diagnóstico por Gênero:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.diagnostico_genero}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                diagnostico_genero: e.target.value,
                              })
                            }
                            placeholder="ex: O TOC pode se manifestar de maneira diferente em homens e mulheres."
                            maxLength={255}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <h3 className="F_TitleTranstorno">
                        {transtornoSelect.nm_transtorno}
                      </h3>
                      <p>
                        <strong>cid11:</strong> {transtornoSelect.cid11}
                      </p>
                      <p>
                        <strong>Apoio Diagnóstico:</strong>{" "}
                        {transtornoSelect.apoio_diag}
                      </p>
                      <p>
                        <strong>Prevalência:</strong>{" "}
                        {transtornoSelect.prevalencia}
                      </p>
                      <p>
                        <strong>Fatores de Risco/Prognóstico:</strong>{" "}
                        {transtornoSelect.fatores_risco_prognostico}
                      </p>
                      <p>
                        <strong>Diagnóstico por Gênero:</strong>{" "}
                        {transtornoSelect.diagnostico_genero}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="F_GravidadeTitle">Gravidades</h3>
                  {isEditing ? (
                    <div className="F_EditingSection">
                      {editingGravidades.map((gravidade, index) => (
                        <div key={index} className="F_EditingItem">
                          <div className="F_EditingRow">
                            <label>Nome da Gravidade*</label>
                            <input
                              value={gravidade.nm_gravidade}
                              onChange={(e) => {
                                const novas = [...editingGravidades];
                                novas[index].nm_gravidade = e.target.value;
                                setEditingGravidades(novas);
                              }}
                              placeholder="Ex: Leve, Moderado"
                              required
                              maxLength={90}
                            />
                          </div>
                          <div className="F_EditingRow">
                            <label>Descrição</label>
                            <textarea
                              value={gravidade.grav_descricao}
                              onChange={(e) => {
                                const novas = [...editingGravidades];
                                novas[index].grav_descricao = e.target.value;
                                setEditingGravidades(novas);
                              }}
                              placeholder="Descrição detalhada"
                            />
                          </div>
                          <button
                            className="F_RemoveButton"
                            onClick={() => handleRemoveEditingGravidade(index)}
                          >
                            <img src={iconTrash} alt="Remover" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="F_AddButton"
                        onClick={handleAddEditingGravidade}
                      >
                        + Adicionar Gravidade
                      </button>
                    </div>
                  ) : gravidade && gravidade.length > 0 ? (
                    <ul>
                      {gravidade.map((gravidadeLI) => (
                        <li
                          key={
                            gravidadeLI.cd_gravidade || gravidadeLI.nm_gravidade
                          }
                          style={{
                            padding: "10px 0",
                            borderBottom: "solid 1px #b399d4",
                          }}
                        >
                          <p className="F_CDTopic">
                            <strong>{gravidadeLI.nm_gravidade}</strong>
                          </p>
                          <p>{gravidadeLI.grav_descricao}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="F_aviso_G">Não possui Gravidade</p>
                  )}
                </div>

                <div>
                  <div className="F_TitlesCriteriosEDiferenciais">
                    <h3 className="F_CriterioDiagTitle">
                      Critério Diagnostico
                    </h3>
                    <h3 className="F_CriterioDiagTitle">Diferencial</h3>
                  </div>
                  {isEditing ? (
                    <div className="F_EditingSection">
                      {editingCriterios.map((criterio, index) => (
                        <div key={index} className="F_EditingItem">
                          <div className="F_EditingRow">
                            <input
                              value={criterio.criterio_diagnostico}
                              onChange={(e) => {
                                const novas = [...editingCriterios];
                                novas[index].criterio_diagnostico =
                                  e.target.value;
                                setEditingCriterios(novas);
                              }}
                              placeholder="Descrição do critério*"
                              required
                              maxLength={255}
                            />
                          </div>
                          <div className="F_EditingCheckbox">
                            <input
                              type="checkbox"
                              checked={criterio.criterio_diferencial === "S"}
                              onChange={(e) => {
                                const novas = [...editingCriterios];
                                novas[index].criterio_diferencial = e.target
                                  .checked
                                  ? "S"
                                  : "N";
                                setEditingCriterios(novas);
                              }}
                              style={{ display: "block " }}
                            />
                          </div>
                          <button
                            className="F_RemoveButton"
                            onClick={() => {
                              const novas = editingCriterios.filter(
                                (_, i) => i !== index
                              );
                              setEditingCriterios(novas);
                            }}
                          >
                            <img src={iconTrash} alt="Remover" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="F_AddButton"
                        onClick={() => {
                          setEditingCriterios([
                            ...editingCriterios,
                            {
                              criterio_diagnostico: "",
                              criterio_diferencial: "N",
                            },
                          ]);
                        }}
                      >
                        + Adicionar Critério
                      </button>
                    </div>
                  ) : criterioDiagnostico && criterioDiagnostico.length > 0 ? (
                    <ul className=" ">
                      {criterioDiagnostico.map((criteriodiagnosticoLI, i) => (
                        <li
                          className="F_LiCD"
                          key={
                            criteriodiagnosticoLI.cd_criterio ||
                            criteriodiagnosticoLI.criterio_diagnostico
                          }
                        >
                          <p className="F_CDTopic">
                            {criteriodiagnosticoLI.criterio_diagnostico}
                          </p>

                          <p>
                            {criteriodiagnosticoLI.criterio_diferencial === "S"
                              ? "Sim"
                              : "Não"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="F_aviso_CD">
                      Não possui criterio Diagnostico
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="F_SubTipoTitle">Subtipos</h3>
                  {isEditing ? (
                    <div className="F_EditingSection">
                      {editingSubtipos.map((subtipo, index) => (
                        <div key={index} className="F_EditingItem">
                          <div className="F_EditingRow">
                            <label>Nome do Subtipo*</label>
                            <input
                              value={subtipo.nm_subtipo}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].nm_subtipo = e.target.value;
                                setEditingSubtipos(novas);
                              }}
                              placeholder="Ex: TOC com compulsões"
                              required
                              maxLength={90}
                            />
                          </div>
                          <div className="F_EditingRow">
                            <label>cid11*</label>
                            <input
                              value={subtipo.cid11}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].cid11 = e.target.value;
                                setEditingSubtipos(novas);
                              }}
                              placeholder="Código cid11"
                              required
                              maxLength={10}
                            />
                          </div>
                          <div className="F_EditingRow">
                            <label>Observações</label>
                            <textarea
                              value={subtipo.obs}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].obs = e.target.value;
                                setEditingSubtipos(novas);
                              }}
                              placeholder="Detalhes adicionais"
                            />
                          </div>
                          <button
                            className="F_RemoveButton"
                            onClick={() => {
                              const novas = editingSubtipos.filter(
                                (_, i) => i !== index
                              );
                              setEditingSubtipos(novas);
                            }}
                          >
                            <img src={iconTrash} alt="Remover" />
                          </button>
                        </div>
                      ))}
                      <button
                        className="F_AddButton"
                        onClick={() => {
                          setEditingSubtipos([
                            ...editingSubtipos,
                            {
                              nm_subtipo: "",
                              cid11: "",
                              obs: "",
                            },
                          ]);
                        }}
                      >
                        + Adicionar Subtipo
                      </button>
                    </div>
                  ) : subTipo && subTipo.length > 0 ? (
                    <ul>
                      {subTipo.map((subtipoLI) => (
                        <li
                          key={subtipoLI.cd_subtipo}
                          style={{
                            padding: "10px 0",
                            borderBottom: "solid 1px #b399d4",
                          }}
                        >
                          <p className="F_CDTopic">
                            <strong>{subtipoLI.nm_subtipo}</strong>
                          </p>
                          <p>
                            <strong>cid11:</strong> {subtipoLI.cid11}
                          </p>
                          {subtipoLI.obs && (
                            <p>
                              <strong>Observações:</strong> {subtipoLI.obs}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="F_aviso">Não possui Subtipos</p>
                  )}
                </div>
              </div>
            ) : (
              <p>Carregando dados do transtorno...</p>
            )}
          </div>
          <div className="F_ButtonsArea">
            <button className="F_btnTranstornos" onClick={handleDelete}>
              Deletar
            </button>
            {isEditing ? (
              <>
                <button
                  className="F_btnTranstornos F_btnSave"
                  onClick={handleSaveEdit}
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

export default ManterTranstorno;
