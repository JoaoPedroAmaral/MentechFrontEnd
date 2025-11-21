import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../global/GlobalContext";

const ManterMedicamentos = ({ cd_paciente }) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentosData, setMedicamentosData] = useState({
    nm_medicamento: "",
    dose: "",
    dosagem: "",
    forma_farmaceutica: "",
    principio_ativo: "",
    fabricante: "",
  });

  useEffect(() => {
    fetchMedicamentos(cd_paciente);
  }, [cd_paciente]);

  const fetchMedicamentos = async (cd_paciente) => {
    try {
      const response = await fetch(
        `${BASE_URL}/medicamento/por_paciente/${cd_paciente}`
      );
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
      const response = await fetch(`${BASE_URL}/medicamento`, {
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

      const responseRelation = await fetch(`${BASE_URL}/paciente_medicamento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cd_paciente: cd_paciente,
          cd_medicamento: data.cd_medicamento,
          ...medicamentoData,
        }),
      });
      if (!responseRelation.ok) {
        throw new Error("Erro ao criar relação entre paciente e medicamento");
      }
      await responseRelation.json();
      fetchMedicamentos(cd_paciente);
    } catch (error) {}
  };
  const deleteMedicamento = async (cd_medicamento) => {
    try {
      const response = await fetch(
        `${BASE_URL}/medicamento/${cd_medicamento}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao deletar medicamento");
      }
      fetchMedicamentos(cd_paciente);
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
            <ul key={medicamento.cd_medicamento}>
              <li
                className="TextBold"
                style={{
                  listStyleType: "circle",
                  fontSize: "100%",
                  color: "rgb(245, 245, 245)",
                }}
              >
                <div
                  className="FlexCenterBetween actions "
                  style={{ width: "90%" }}
                >
                  <p>{`${medicamento.nm_medicamento} (${medicamento.dose})`}</p>
                  <button
                    className="btn-delete"
                    onClick={() =>
                      deleteMedicamento(medicamento.cd_medicamento)
                    }
                  >
                    🗑️
                  </button>
                </div>
              </li>
            </ul>
          ))
        ) : (
          <p
            className="FlexCenterMid"
            style={{ color: "rgb(245, 245, 245)", marginTop: "10px" }}
          >
            Nenhum medicamento encontrado.
          </p>
        )}
      </div>
      <div
        className="F_CadastrarMedicamento ScrollBar"
        style={{ marginTop: "5%", height: "200px" }}
      >
        <div className="FlexCenterBetween F_CriarTranstornoInputObrigatorio ">
          <p>Nome do Medicamento:</p>
          <input
            type="text"
            maxLength={90}
            placeholder="ex: Paracetamol"
            className="F_NomeAreaTranstorno"
            style={{ width: "250px" }}
            value={medicamentosData.nm_medicamento}
            onChange={(e) =>
              setMedicamentosData({
                ...medicamentosData,
                nm_medicamento: e.target.value,
              })
            }
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Dosagem do Medicamento:</p>
          <input
            type="text"
            placeholder="ex: 500mg"
            className="F_NomeAreaTranstorno"
            style={{ width: "250px" }}
            value={medicamentosData.dose}
            onChange={(e) =>
              setMedicamentosData({ ...medicamentosData, dose: e.target.value, dosagem: e.target.value })
            }
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Forma Farmaceutica:</p>
          <input
            type="text"
            maxLength={255}
            placeholder="ex: Comprimido"
            className="F_NomeAreaTranstorno"
            style={{ width: "250px" }}
            value={medicamentosData.forma_farmaceutica}
            onChange={(e) =>
              setMedicamentosData({
                ...medicamentosData,
                forma_farmaceutica: e.target.value,
              })
            }
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Principio Ativo:</p>
          <input
            type="text"
            maxLength={255}
            placeholder="ex: N-acetil-p-aminofenol"
            className="F_NomeAreaTranstorno"
            style={{ width: "250px" }}
            value={medicamentosData.principio_ativo}
            onChange={(e) =>
              setMedicamentosData({
                ...medicamentosData,
                principio_ativo: e.target.value,
              })
            }
          />
        </div>
        <div
          className="FlexCenterBetween F_CriarTranstornoInputObrigatorio "
          style={{ marginTop: "10px" }}
        >
          <p>Fabricante:</p>
          <input
            type="text"
            maxLength={255}
            placeholder="ex: Laboratório XYZ"
            className="F_NomeAreaTranstorno"
            style={{ width: "250px" }}
            value={medicamentosData.fabricante}
            onChange={(e) =>
              setMedicamentosData({
                ...medicamentosData,
                fabricante: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="F_AdicionarArea" style={{ marginTop: "5%" }}>
        <button
          className="F_btnTranstornos"
          onClick={() => {
            createMedicamento(medicamentosData);
            setMedicamentosData({
              nm_medicamento: "",
              dose: "",
              dosagem: "",
              forma_farmaceutica: "",
              principio_ativo: "",
              fabricante: "",
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
