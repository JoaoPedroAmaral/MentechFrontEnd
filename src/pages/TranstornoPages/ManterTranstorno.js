import React, { useState, useEffect } from "react";
import iconTrash from "../../Images/Trash.png";
import "../../css/SpecificStyle.css";
import { showAlert, confirmDelete } from "../../utils/alerts.js";
import { useGlobal } from "../../global/GlobalContext";

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
    NM_TRANSTORNO: "",
    CID11: "",
    APOIO_DIAG: "",
    PREVALENCIA: "",
    FATORES_RISCO_PROGNOSTICO: "",
    DIAGNOSTICO_GENERO: "",
  });

  const [formgravidades, setFormGravidades] = useState([
    {
      NM_GRAVIDADE: "",
      GRAV_DESCRICAO: "",
    },
  ]);
  const [formCriterioDiagnostico, setFormCriterioDiagnostico] = useState([
    {
      CRITERIO_DIAGNOSTICO: "",
      CRITERIO_DIFERENCIAL: "N",
    },
  ]);
  const [formSubTipo, setFormSubTipo] = useState([
    {
      NM_SUBTIPO: "",
      CID11: "",
      OBS: "",
    },
  ]);

  const adicionarTranstorno = async () => {
    try {
      if (!formTranstorno.NM_TRANSTORNO || !formTranstorno.CID11) {
        alert("Nome do Transtorno e CID11 são obrigatórios!");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/transtorno", {
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

        return data.CD_TRANSTORNO;
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
        (g) => g.NM_GRAVIDADE && g.GRAV_DESCRICAO
      );

      if (gravidadesValidas.length === 0) {
        return true;
      }

      for (const gravidade of gravidadesValidas) {
        const gravidadeParaEnviar = {
          CD_TRANSTORNO: transtornoId,
          NM_GRAVIDADE: gravidade.NM_GRAVIDADE,
          GRAV_DESCRICAO: gravidade.GRAV_DESCRICAO,
        };

        const response = await fetch("http://127.0.0.1:5000/gravidade", {
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
        (c) => c.CRITERIO_DIAGNOSTICO
      );

      if (criteriosValidos.length === 0) {
        return;
      }

      for (const criteriosDiag of criteriosValidos) {
        const criterioParaEnviar = {
          CD_TRANSTORNO: transtornoId,
          CRITERIO_DIAGNOSTICO: criteriosDiag.CRITERIO_DIAGNOSTICO,
          CRITERIO_DIFERENCIAL: criteriosDiag.CRITERIO_DIFERENCIAL,
        };

        const response = await fetch(
          "http://127.0.0.1:5000/criterio_diagnostico",
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
        (s) => s.NM_SUBTIPO && s.CID11
      );

      if (subtiposValidos.length === 0) {
        return;
      }

      for (const subtipos of subtiposValidos) {
        const subtipoParaEnviar = {
          CD_TRANSTORNO: transtornoId,
          NM_SUBTIPO: subtipos.NM_SUBTIPO,
          CID11: subtipos.CID11,
          OBS: subtipos.OBS,
        };

        const response = await fetch(
          "http://127.0.0.1:5000/subtipo_transtorno",
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
      const response = await fetch("http://127.0.0.1:5000/transtorno");
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
        `http://127.0.0.1:5000/transtorno_PorIdTranstorno/${id}`
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
        `http://127.0.0.1:5000/criterio_diagnostico_PorIdTranstorno/${cdTranstorno}`
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
        `http://127.0.0.1:5000/gravidade_PorIdTranstorno/${cdTranstorno}`
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
        `http://127.0.0.1:5000/subtipo_transtorno_PorIdTranstorno/${cdTranstorno}`
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
    await fetch(`http://127.0.0.1:5000/transtorno/${id}`, { method: "DELETE" });
    setCriteriosModificados((prev) => !prev);
    fetchTranstornos();
  };

  const handleChangeArea = (id) => {
    setAtivo(id);
  };
  const handleAddGravidade = () => {
    setFormGravidades([
      ...formgravidades,
      { NM_GRAVIDADE: "", GRAV_DESCRICAO: "" },
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
        NM_TRANSTORNO: "",
        CID11: "",
        APOIO_DIAG: "",
        PREVALENCIA: "",
        FATORES_RISCO_PROGNOSTICO: "",
        DIAGNOSTICO_GENERO: "",
      });
      setFormGravidades([{ NM_GRAVIDADE: "", GRAV_DESCRICAO: "" }]);
      setFormCriterioDiagnostico([
        { CRITERIO_DIAGNOSTICO: "", CRITERIO_DIFERENCIAL: "N" },
      ]);
      setFormSubTipo([{ NM_SUBTIPO: "", CID11: "", OBS: "" }]);
    }
    fetchTranstornos();
  };
  const handleDelete = async () => {
    const success = await confirmDelete(
      transtornoSelect?.NM_TRANSTORNO || "Este Transtorno",
      async () => {
        await deleteTranstorno(transtornoSelect.CD_TRANSTORNO);
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
      NM_TRANSTORNO: transtornoSelect.NM_TRANSTORNO || "",
      CID11: transtornoSelect.CID11 || "",
      APOIO_DIAG: transtornoSelect.APOIO_DIAG || "",
      PREVALENCIA: transtornoSelect.PREVALENCIA || "",
      FATORES_RISCO_PROGNOSTICO:
        transtornoSelect.FATORES_RISCO_PROGNOSTICO || "",
      DIAGNOSTICO_GENERO: transtornoSelect.DIAGNOSTICO_GENERO || "",
    });
    setEditingGravidades(gravidade ? [...gravidade] : []);
    setEditingCriterios(criterioDiagnostico ? [...criterioDiagnostico] : []);
    setEditingSubtipos(subTipo ? [...subTipo] : []);
  };
  const handleAddEditingGravidade = () => {
    setEditingGravidades([
      ...editingGravidades,
      {
        CD_GRAVIDADE: null,
        NM_GRAVIDADE: "",
        GRAV_DESCRICAO: "",
      },
    ]);
  };

  const handleRemoveEditingGravidade = (index) => {
    const novas = editingGravidades.filter((_, i) => i !== index);
    setEditingGravidades(novas);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingTranstorno.NM_TRANSTORNO || !editingTranstorno.CID11) {
        await showAlert.error("Nome do Transtorno e CID11 são obrigatórios!");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:5000/transtorno/${transtornoSelect.CD_TRANSTORNO}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            NM_TRANSTORNO: editingTranstorno.NM_TRANSTORNO,
            CID11: editingTranstorno.CID11,
            APOIO_DIAG: editingTranstorno.APOIO_DIAG,
            PREVALENCIA: editingTranstorno.PREVALENCIA,
            FATORES_RISCO_PROGNOSTICO:
              editingTranstorno.FATORES_RISCO_PROGNOSTICO,
            DIAGNOSTICO_GENERO: editingTranstorno.DIAGNOSTICO_GENERO,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar transtorno");
      }

      // Atualiza gravidades
      await updateRelatedData(
        "gravidade",
        transtornoSelect.CD_TRANSTORNO,
        editingGravidades,
        ["NM_GRAVIDADE", "GRAV_DESCRICAO"]
      );

      // Atualiza critérios diagnósticos
      await updateRelatedData(
        "criterio_diagnostico",
        transtornoSelect.CD_TRANSTORNO,
        editingCriterios,
        ["CRITERIO_DIAGNOSTICO", "CRITERIO_DIFERENCIAL"]
      );

      // Atualiza subtipos
      await updateRelatedData(
        "subtipo_transtorno",
        transtornoSelect.CD_TRANSTORNO,
        editingSubtipos,
        ["NM_SUBTIPO", "CID11", "OBS"]
      );

      await showAlert.success("Transtorno atualizado com sucesso!");
      setIsEditing(false);
      fetchTranstornosByID(transtornoSelect.CD_TRANSTORNO);
      fetchCriterioDiagnostico(transtornoSelect.CD_TRANSTORNO);
      fetchGravidade(transtornoSelect.CD_TRANSTORNO);
      fetchSubTipos(transtornoSelect.CD_TRANSTORNO);
      fetchTranstornos();
    } catch (error) {
      await showAlert.error(error.message);
    }
  };

  const updateRelatedData = async (endpoint, cdTranstorno, items, fields) => {
    await fetch(
      `http://127.0.0.1:5000/${endpoint}/deletarPorTranstorno/${cdTranstorno}`,
      {
        method: "DELETE",
      }
    );

    // Depois adiciona os novos (apenas os que têm dados válidos)
    for (const item of items) {
      const payload = { CD_TRANSTORNO: cdTranstorno };

      fields.forEach((field) => {
        if (item[field] !== undefined && item[field] !== "") {
          payload[field] = item[field];
        }
      });

      if (Object.keys(payload).length > 1) {
        await fetch(`http://127.0.0.1:5000/${endpoint}`, {
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
      removeAccents(t.NM_TRANSTORNO).includes(removeAccents(searchTerm))
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
                  name="NM_TRANSTORNO"
                  placeholder="Ex: Transtorno Obsessivo-Compulsivo (TOC)"
                  value={formTranstorno.NM_TRANSTORNO}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      NM_TRANSTORNO: e.target.value,
                    })
                  }
                  maxLength={90}
                ></input>
              </div>
              <div className="F_CriarTranstornoInputObrigatorio">
                <p>CID11*</p>
                <input
                  className="F_CIDAreaTranstorno"
                  name="CID11"
                  placeholder="Ex: 6A20.0"
                  value={formTranstorno.CID11}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      CID11: e.target.value,
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
                    name="FATORES_RISCO_PROGNOSTICO"
                    placeholder="Ex: História familiar de transtornos de ansiedade, estresse ambiental."
                    value={formTranstorno.FATORES_RISCO_PROGNOSTICO}
                    onChange={(e) =>
                      setFormTranstorno({
                        ...formTranstorno,
                        FATORES_RISCO_PROGNOSTICO: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="F_CriarTranstornoInputSec">
                  <p>Prevalência</p>
                  <textarea
                    className="F_SecAreaTranstorno"
                    name="PREVALENCIA"
                    placeholder="Ex: A prevalência do TOC é de aproximadamente 1-2% da população geral."
                    value={formTranstorno.PREVALENCIA}
                    onChange={(e) =>
                      setFormTranstorno({
                        ...formTranstorno,
                        PREVALENCIA: e.target.value,
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
                          name="NM_GRAVIDADE"
                          placeholder="Ex: Leve, Moderado, Grave"
                          value={item.NM_GRAVIDADE}
                          onChange={(e) => {
                            const novasGravidades = [...formgravidades];
                            novasGravidades[index].NM_GRAVIDADE =
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
                          name="GRAV_DESCRICAO"
                          placeholder="Ex: O transtorno leve pode ser tratado com terapia cognitivo-comportamental."
                          value={item.GRAV_DESCRICAO}
                          onChange={(e) => {
                            const novasGravidades = [...formgravidades];
                            novasGravidades[index].GRAV_DESCRICAO =
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
                          name="CRITERIO_DIAGNOSTICO"
                          placeholder="Ex: Presença de obsessões e/ou compulsões."
                          value={CDiagnostico.CRITERIO_DIAGNOSTICO}
                          onChange={(e) => {
                            const novoCriterios = [...formCriterioDiagnostico];
                            novoCriterios[index].CRITERIO_DIAGNOSTICO =
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
                        checked={CDiagnostico.CRITERIO_DIFERENCIAL === "S"}
                        onChange={(e) => {
                          const novoCriterios = [...formCriterioDiagnostico];
                          novoCriterios[index].CRITERIO_DIFERENCIAL = e.target
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
                            CRITERIO_DIAGNOSTICO: "",
                            CRITERIO_DIFERENCIAL: "N",
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
                  name="APOIO_DIAG"
                  placeholder="Ex: O TOC pode ser diagnosticado com base na avaliação clínica e em questionários padronizados."
                  value={formTranstorno.APOIO_DIAG}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      APOIO_DIAG: e.target.value,
                    })
                  }
                />
              </div>
              <div className="F_DiagGenero">
                <p>Diagnóstico por Gênero</p>
                <textarea
                  className="F_SecAreaTranstorno F_DiagnosticoGen"
                  name="DIAGNOSTICO_GENERO"
                  placeholder="Ex: O TOC pode se manifestar de maneira diferente em homens e mulheres."
                  value={formTranstorno.DIAGNOSTICO_GENERO}
                  onChange={(e) =>
                    setFormTranstorno({
                      ...formTranstorno,
                      DIAGNOSTICO_GENERO: e.target.value,
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
                        name="NM_SUBTIPO"
                        placeholder="Ex: TOC com compulsões."
                        value={subtipo.NM_SUBTIPO}
                        onChange={(e) => {
                          const novosSubtipos = [...formSubTipo];
                          novosSubtipos[index].NM_SUBTIPO = e.target.value;
                          setFormSubTipo(novosSubtipos);
                        }}
                        maxLength={90}
                      />
                    </div>
                    <div>
                      <p>CID11</p>
                      <input
                        className="F_CID11SubtipoTranstorno"
                        name="CID11"
                        placeholder="Ex: 6A20.0"
                        value={subtipo.CID11}
                        onChange={(e) => {
                          const novosSubtipos = [...formSubTipo];
                          novosSubtipos[index].CID11 = e.target.value;
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
                      value={subtipo.OBS}
                      onChange={(e) => {
                        const novosSubtipos = [...formSubTipo];
                        novosSubtipos[index].OBS = e.target.value;
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
                            NM_SUBTIPO: "",
                            CID11: "",
                            OBS: "",
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
                        key={t.CD_TRANSTORNO}
                      >
                        <button
                          className="F_Ampliar"
                          onClick={() => {
                            openData();
                            fetchTranstornosByID(t.CD_TRANSTORNO);
                            fetchCriterioDiagnostico(t.CD_TRANSTORNO);
                            fetchGravidade(t.CD_TRANSTORNO);
                            fetchSubTipos(t.CD_TRANSTORNO);
                          }}
                        ></button>
                        <strong>{t.NM_TRANSTORNO || "Sem nome"}</strong>
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
                        value={editingTranstorno.NM_TRANSTORNO}
                        onChange={(e) =>
                          setEditingTranstorno({
                            ...editingTranstorno,
                            NM_TRANSTORNO: e.target.value,
                          })
                        }
                        placeholder="ex: Transtorno Obsessivo-Compulsivo (TOC)"
                        required
                        maxLength={90}
                      />
                      <div className="F_EditGrid">
                        <div>
                          <strong>CID11:</strong>
                          <input
                            className="F_EditInput"
                            value={editingTranstorno.CID11}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                CID11: e.target.value,
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
                            value={editingTranstorno.APOIO_DIAG}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                APOIO_DIAG: e.target.value,
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
                            value={editingTranstorno.PREVALENCIA}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                PREVALENCIA: e.target.value,
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
                            value={editingTranstorno.FATORES_RISCO_PROGNOSTICO}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                FATORES_RISCO_PROGNOSTICO: e.target.value,
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
                            value={editingTranstorno.DIAGNOSTICO_GENERO}
                            onChange={(e) =>
                              setEditingTranstorno({
                                ...editingTranstorno,
                                DIAGNOSTICO_GENERO: e.target.value,
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
                        {transtornoSelect.NM_TRANSTORNO}
                      </h3>
                      <p>
                        <strong>CID11:</strong> {transtornoSelect.CID11}
                      </p>
                      <p>
                        <strong>Apoio Diagnóstico:</strong>{" "}
                        {transtornoSelect.APOIO_DIAG}
                      </p>
                      <p>
                        <strong>Prevalência:</strong>{" "}
                        {transtornoSelect.PREVALENCIA}
                      </p>
                      <p>
                        <strong>Fatores de Risco/Prognóstico:</strong>{" "}
                        {transtornoSelect.FATORES_RISCO_PROGNOSTICO}
                      </p>
                      <p>
                        <strong>Diagnóstico por Gênero:</strong>{" "}
                        {transtornoSelect.DIAGNOSTICO_GENERO}
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
                              value={gravidade.NM_GRAVIDADE}
                              onChange={(e) => {
                                const novas = [...editingGravidades];
                                novas[index].NM_GRAVIDADE = e.target.value;
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
                              value={gravidade.GRAV_DESCRICAO}
                              onChange={(e) => {
                                const novas = [...editingGravidades];
                                novas[index].GRAV_DESCRICAO = e.target.value;
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
                            gravidadeLI.CD_GRAVIDADE || gravidadeLI.NM_GRAVIDADE
                          }
                          style={{
                            padding: "10px 0",
                            borderBottom: "solid 1px #b399d4",
                          }}
                        >
                          <p className="F_CDTopic">
                            <strong>{gravidadeLI.NM_GRAVIDADE}</strong>
                          </p>
                          <p>{gravidadeLI.GRAV_DESCRICAO}</p>
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
                              value={criterio.CRITERIO_DIAGNOSTICO}
                              onChange={(e) => {
                                const novas = [...editingCriterios];
                                novas[index].CRITERIO_DIAGNOSTICO =
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
                              checked={criterio.CRITERIO_DIFERENCIAL === "S"}
                              onChange={(e) => {
                                const novas = [...editingCriterios];
                                novas[index].CRITERIO_DIFERENCIAL = e.target
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
                              CRITERIO_DIAGNOSTICO: "",
                              CRITERIO_DIFERENCIAL: "N",
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
                            criteriodiagnosticoLI.CD_CRITERIO ||
                            criteriodiagnosticoLI.CRITERIO_DIAGNOSTICO
                          }
                        >
                          <p className="F_CDTopic">
                            {criteriodiagnosticoLI.CRITERIO_DIAGNOSTICO}
                          </p>

                          <p>
                            {criteriodiagnosticoLI.CRITERIO_DIFERENCIAL === "S"
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
                              value={subtipo.NM_SUBTIPO}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].NM_SUBTIPO = e.target.value;
                                setEditingSubtipos(novas);
                              }}
                              placeholder="Ex: TOC com compulsões"
                              required
                              maxLength={90}
                            />
                          </div>
                          <div className="F_EditingRow">
                            <label>CID11*</label>
                            <input
                              value={subtipo.CID11}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].CID11 = e.target.value;
                                setEditingSubtipos(novas);
                              }}
                              placeholder="Código CID11"
                              required
                              maxLength={10}
                            />
                          </div>
                          <div className="F_EditingRow">
                            <label>Observações</label>
                            <textarea
                              value={subtipo.OBS}
                              onChange={(e) => {
                                const novas = [...editingSubtipos];
                                novas[index].OBS = e.target.value;
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
                              NM_SUBTIPO: "",
                              CID11: "",
                              OBS: "",
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
                          key={subtipoLI.CD_SUBTIPO}
                          style={{
                            padding: "10px 0",
                            borderBottom: "solid 1px #b399d4",
                          }}
                        >
                          <p className="F_CDTopic">
                            <strong>{subtipoLI.NM_SUBTIPO}</strong>
                          </p>
                          <p>
                            <strong>CID11:</strong> {subtipoLI.CID11}
                          </p>
                          {subtipoLI.OBS && (
                            <p>
                              <strong>Observações:</strong> {subtipoLI.OBS}
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
