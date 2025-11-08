import React, { useState, useEffect } from "react";

const ManterMedicamentos = ({ CD_PACIENTE }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentosData, setMedicamentosData] = useState({
    NM_MEDICAMENTO: "",
    DOSE: "",
    DIAS_MINISTRACAO: "",
  });


  useEffect(() => {
    fetchMedicamentos(CD_PACIENTE);
  }, [CD_PACIENTE]);

  const fetchMedicamentos = async (CD_PACIENTE) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/medicamento/por_paciente/${CD_PACIENTE}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar medicamentos");
      }
      const data = await response.json();
      setMedicamentos(data);
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
    }
  };


  const createMedicamento = async (medicamentoData) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/medicamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicamentoData),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar medicamento");
      }
      const data = await response.json();
      setMedicamentos((prevMedicamentos) => [...prevMedicamentos, data]);

      const responseRelation = await fetch(`http://127.0.0.1:5000/paciente_medicamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CD_PACIENTE: CD_PACIENTE,
          CD_MEDICAMENTO: data.CD_MEDICAMENTO,
          ...medicamentoData,
        }),
      });
      if (!responseRelation.ok) {
        throw new Error("Erro ao criar relação entre paciente e medicamento");
      }
      await responseRelation.json();
      fetchMedicamentos(CD_PACIENTE);
    } catch (error) {
      
    }
  }
  const deleteMedicamento = async (CD_MEDICAMENTO) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/medicamento/${CD_MEDICAMENTO}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao deletar medicamento");
      }
      fetchMedicamentos(CD_PACIENTE);
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
    }
  };
  return (
    <div
      className="MedicamentosContainer"
      style={{ width: "90%", height: "100%" }}
    >
      <div className="F_Title">
        <h2 className="F_CadastrarTitle">Medicamentos</h2>
      </div>
      <div className="Border ScrollBar" style={{ height: "200px" }}>
        {medicamentos.length > 0 ? (
          medicamentos.map((medicamento) => (
            <ul key={medicamento.CD_MEDICAMENTO}>
              <li
                className="TextBold"
                style={{
                  listStyleType: "circle",
                  fontSize: "100%",
                  color: "rgb(245, 245, 245)",
                }}
              >
                <div className="FlexCenterBetween actions " style={{ width: "90%" }}>
                  <p>{`${medicamento.NM_MEDICAMENTO} (${medicamento.DOSE}) - Durante ${medicamento.DIAS_MINISTRACAO} dias`}</p>
                  <button className="btn-delete" onClick={() => deleteMedicamento(medicamento.CD_MEDICAMENTO)}>🗑️</button>
                </div>
              </li>
            </ul>
          ))
        ) : (
          <p className="FlexCenterMid" style={{ color: "rgb(245, 245, 245)", marginTop: "10px" }}>Nenhum medicamento encontrado.</p>
        )}
      </div>
      <div className="F_CadastrarMedicamento">
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10%"}}
        >
          <p>Nome do Medicamento:</p>
          <input
            type="text"
            maxLength={90}
            placeholder="Nome do Medicamento"
            className="F_NomeAreaTranstorno"
            style={{ width : "250px" }}
            value={medicamentosData.NM_MEDICAMENTO}
            onChange={(e) => setMedicamentosData({ ...medicamentosData, NM_MEDICAMENTO: e.target.value })}
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Dosagem do Medicamento:</p>
          <input
            type="text"
            placeholder="Dosagem do Medicamento"
            className="F_NomeAreaTranstorno"
            style={{ width : "250px" }}
            value={medicamentosData.DOSE}
            onChange={(e) => setMedicamentosData({ ...medicamentosData, DOSE: e.target.value })}
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Dias:</p>
          <input
            type="text"
            maxLength={3}
            placeholder="Dias"
            className="F_NomeAreaTranstorno"
            style={{ width : "250px" }}
            value={medicamentosData.DIAS_MINISTRACAO}
            onChange={(e) => setMedicamentosData({ ...medicamentosData, DIAS_MINISTRACAO: e.target.value })}
          />
        </div>
      </div>
      <div className="F_AdicionarArea" style={{ marginTop: "10%" }}>
        <button
          className="F_btnTranstornos"
          onClick={() => {
            createMedicamento(medicamentosData);
            setMedicamentosData({
              NM_MEDICAMENTO: "",
              DOSE: "",
              DIAS_MINISTRACAO: "",
            });
          }}
        >
          Adicionar Medicamento
        </button>
      </div>
    </div>
  );
};

export default ManterMedicamentos;
