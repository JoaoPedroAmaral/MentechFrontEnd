import React, { useState, useEffect } from "react";
import {
  Calendar,
  Modal,
  TimePicker,
  Checkbox,
  Select,
  Button,
  message,
  Badge,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const ManterAgenda = ({ cd_paciente }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [horarioInicio, setHorarioInicio] = useState(null);
  const [isRepetir, setIsRepetir] = useState(false);
  const [prazo, setPrazo] = useState("");
  const [feriados, setFeriados] = useState({});
  const [anosBuscados, setAnosBuscados] = useState(new Set());

  const onSelect = (date, { source }) => {
    if (source === "date") {
      setSelectedDate(date);
      setIsModalOpen(true);
      setHorarioInicio(null);
      setIsRepetir(false);
      setPrazo("");
    }
  };

  const fetchFeriados = async (ano) => {
    if (anosBuscados.has(ano)) {
      return;
    }

    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/feriados/v1/${ano}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar feriados");
      }
      const data = await response.json();

      const novosFeriados = data.reduce((acc, feriado) => {
        acc[feriado.date] = feriado.name;
        return acc;
      }, {});

      setFeriados((prevFeriados) => ({ ...prevFeriados, ...novosFeriados }));
      setAnosBuscados((prevAnos) => new Set(prevAnos).add(ano));
    } catch (error) {
      console.error("Erro ao buscar feriados:", error);
      message.error("Não foi possível carregar os feriados nacionais.");
    }
  };

  useEffect(() => {
    fetchFeriados(dayjs().year());
  }, []);

  const handlePanelChange = (value, mode) => {
    const ano = value.year();
    fetchFeriados(ano); // Busca feriados do ano selecionado
  };

  const dateCellRender = (value) => {
    const dataString = value.format("YYYY-MM-DD");
    const nomeFeriado = feriados[dataString];

    if (nomeFeriado) {
      return (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          <li>
            <Badge status="success" text={nomeFeriado} />
          </li>
        </ul>
      );
    }

    return null; 
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHorarioInicio(null);
    setIsRepetir(false);
    setPrazo("");
  };

  const handleSubmit = () => {
    if (!horarioInicio) {
      message.error("Por favor, selecione o horário de início");
      return;
    }

    if (isRepetir && !prazo) {
      message.error("Por favor, selecione o prazo de repetição");
      return;
    }

    const payload = {
      dia: selectedDate.format("YYYY-MM-DD"), 
      horario_inicio: horarioInicio.format("HH:mm"), 
      repetir: isRepetir, 
      prazo: isRepetir && prazo ? prazo : "",
    };

    console.log("Payload a ser enviado:", payload);

    // Exemplo de como enviar para API:
    // fetch('https://sua-api.com/programacao', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // }).then(response => response.json())
    //   .then(data => console.log(data));

    message.success("Programação salva com sucesso!");
    handleCancel();
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsRepetir(checked);
    if (!checked) {
      setPrazo(""); 
    }
  };

  return (
    <div
      style={{
        padding: "0 16px",
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div className="F_Title">
        <h2
          className="F_CadastrarTitle"
          style={{ fontSize: "20px", margin: "0 0 10px 0" }}
        >
          Agendamento
        </h2>
      </div>

      {/* Calendário */}
      <div
        style={{
          maxHeight: "78vh",
          overflow: "auto",
        }}
      >
        <Calendar
          onSelect={onSelect}
          fullscreen={true}
          style={{
            borderRadius: "8px",
            backgroundColor: "#b399d4",
            padding: "8px",
          }}
          onPanelChange={handlePanelChange}
          dateCellRender={dateCellRender}
        />
      </div>

      {/* Modal com Formulário */}
      <Modal
        title={`Programação para ${
          selectedDate ? selectedDate.format("DD/MM/YYYY") : ""
        }`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Salvar
          </Button>,
        ]}
        width={500}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Campo de Horário de Início */}
          <div>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Horário de Início <span style={{ color: "red" }}>*</span>
            </label>
            <TimePicker
              value={horarioInicio}
              onChange={setHorarioInicio}
              format="HH:mm"
              placeholder="Selecione o horário"
              style={{ width: "100%" }}
              minuteStep={15}
            />
          </div>

          {/* Checkbox de Repetir */}
          <div>
            <Checkbox checked={isRepetir} onChange={handleCheckboxChange}>
              Repetir programação
            </Checkbox>
          </div>

          {/* Select de Prazo (visível apenas se checkbox marcado) */}
          {isRepetir && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Prazo de Repetição <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                value={prazo || undefined}
                onChange={setPrazo}
                placeholder="Selecione o prazo"
                style={{ width: "100%" }}
              >
                <Option value="1_mes">1 mês</Option>
                <Option value="6_meses">6 meses</Option>
                <Option value="1_ano">1 ano</Option>
              </Select>
            </div>
          )}

          {/* Preview do Payload (para teste) */}
          <div
            style={{
              marginTop: "24px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <strong>Preview do Payload:</strong>
            <pre style={{ marginTop: "8px", fontSize: "11px", margin: 0 }}>
              {JSON.stringify(
                {
                  dia: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
                  horario_inicio: horarioInicio
                    ? horarioInicio.format("HH:mm")
                    : "",
                  repetir: isRepetir,
                  prazo: isRepetir && prazo ? prazo : "",
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManterAgenda;
