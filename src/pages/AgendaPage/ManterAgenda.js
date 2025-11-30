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
  List,
  Card,
} from "antd";
import dayjs from "dayjs";
import LoadingOverlay from "../../global/Loading";
import { BASE_URL } from "../../global/GlobalContext";
import { showAlert } from "../../utils/alerts";

const { Option } = Select;

const ManterAgenda = ({ cd_paciente, cd_usuario }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [horarioInicio, setHorarioInicio] = useState(null);
  const [horario_fim, setHorario_fim] = useState(null);
  const [isRepetir, setIsRepetir] = useState(false);
  const [prazo, setPrazo] = useState("");
  const [feriados, setFeriados] = useState({});
  const [anosBuscados, setAnosBuscados] = useState(new Set());
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosDoDia, setAgendamentosDoDia] = useState([]);
  const [pacientes, setPacientes] = useState({});
  const [loading, setLoading] = useState(false); 


  // Buscar dados do paciente
  const fetchPaciente = async (cd_paciente) => {
    if (pacientes[cd_paciente]) {
      return pacientes[cd_paciente];
    }

    try {
      const response = await fetch(`${BASE_URL}/paciente`);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do paciente");
      }
      const data = await response.json();
      setPacientes(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      return null;
    }
  };

  const fetchAgendamentos = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/agendamento/por_usuario/${cd_usuario}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar agendamentos");
      }
      const data = await response.json();
      setAgendamentos(data);

      // Buscar dados de todos os pacientes dos agendamentos
      const pacientesIds = [...new Set(data.map((ag) => ag.cd_paciente))];
      pacientesIds.forEach((id) => fetchPaciente(id));
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      message.error("Não foi possível carregar os agendamentos.");
    }
  };

  useEffect(() => {
    if (cd_usuario) {
      fetchPaciente(cd_paciente);
      fetchAgendamentos();
    }
  }, [cd_usuario]);

  const onSelect = (date, { source }) => {
    if (source === "date") {
      setSelectedDate(date);

      const dataString = date.format("YYYY-MM-DD");
      const agendamentosEncontrados = agendamentos.filter(
        (ag) => ag.dt_agendamento === dataString
      );

      if (agendamentosEncontrados.length > 0) {
        setAgendamentosDoDia(agendamentosEncontrados);
        setIsDetalhesModalOpen(true);
      } else {
        abrirModalCadastro();
      }
    }
  };

  const abrirModalCadastro = () => {
    setIsModalOpen(true);
    setHorarioInicio(null);
    setHorario_fim(null);
    setIsRepetir(false);
    setPrazo("");
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
    fetchFeriados(ano);
  };

  const dateCellRender = (value) => {
    const dataString = value.format("YYYY-MM-DD");
    const nomeFeriado = feriados[dataString];

    const agendamentosDia = agendamentos.filter(
      (ag) => ag.dt_agendamento === dataString
    );

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {nomeFeriado && (
          <li>
            <Badge status="success" text={nomeFeriado} />
          </li>
        )}
        {agendamentosDia.length > 0 && (
          <li>
            <Badge
              status="processing"
              text={`${agendamentosDia.length} agendamento(s)`}
            />
          </li>
        )}
      </ul>
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHorarioInicio(null);
    setHorario_fim(null);
    setIsRepetir(false);
    setPrazo("");
  };

  const handleDetalhesCancel = () => {
    setIsDetalhesModalOpen(false);
    setAgendamentosDoDia([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!horarioInicio) {
      message.error("Por favor, selecione o horário de início");
      return;
    }

    if (!horario_fim) {
      message.error("Por favor, selecione o horário de fim");
      return;
    }

    if (isRepetir && !prazo) {
      message.error("Por favor, selecione o prazo de repetição");
      return;
    }

    const payload = {
      cd_usuario: cd_usuario,
      cd_paciente: Number(cd_paciente),
      dt_agendamento: selectedDate.format("YYYY-MM-DD"),
      hora_inicio: horarioInicio.format("HH:mm") + ":00",
      hora_fim: horario_fim.format("HH:mm") + ":00",
      prazo: isRepetir && prazo ? prazo : "",
    };

    try {
      const response = await fetch(`${BASE_URL}/agendamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.MSG260) {
        showAlert.error("Agendamento não pode ser feito no passado!");
        return;
      }
      if (response.ok) {
        showAlert.success("Agendamento salvo com sucesso!");
        handleCancel();
        handleDetalhesCancel();
        fetchAgendamentos();
      } else {
        showAlert.error("Erro ao salvar agendamento");
        message.error(
          data.MSG200 ||
            data.MSG260 ||
            data.MSG248 ||
            data.MSG249 ||
            "Erro ao salvar agendamento"
        );
      }
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      message.error("Erro ao salvar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsRepetir(checked);
    if (!checked) {
      setPrazo("");
    }
  };

  const handleDeletarAgendamento = async (cd_agendamento) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/agendamento/${cd_agendamento}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        showAlert.success("Agendamento deletado com sucesso!");
        fetchAgendamentos();

        const novaLista = agendamentosDoDia.filter(
          (ag) => ag.cd_agendamento !== cd_agendamento
        );
        setAgendamentosDoDia(novaLista);

        if (novaLista.length === 0) {
          handleDetalhesCancel();
        }
      } else {
        showAlert.error("Erro ao deletar agendamento");
      }
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      showAlert.error("Erro ao deletar agendamento");
    }finally {
      setLoading(false);
    }
  };

  const handleDeleteAgendamentoSequencial = async (cd_agendamento) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/agendamento/em_serie`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cd_agendamento: cd_agendamento,
          prazo: "1_ano",
        }),
      });
      if (response.ok) {
        showAlert.success("Agendamentos deletados com sucesso!");
        fetchAgendamentos();
        handleDetalhesCancel();
      }
    } catch (error) {
      showAlert.error("Erro ao deletar agendamentos sequenciais:");
      message.error("Erro ao deletar agendamentos sequenciais");
    }finally {
      setLoading(false);
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
      <LoadingOverlay isLoading={loading} />
      <div className="F_Title">
        <h2
          className="F_CadastrarTitle"
          style={{ fontSize: "20px", margin: "0 0 10px 0" }}
        >
          Agendamento
        </h2>
      </div>

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

      {/* Modal de Detalhes dos Agendamentos */}
      <Modal
        title={`Agendamentos de ${
          selectedDate ? selectedDate.format("DD/MM/YYYY") : ""
        }`}
        open={isDetalhesModalOpen}
        onCancel={handleDetalhesCancel}
        footer={[
          <Button
            className="BTNPurple"
            style={{
              height: "30px",
              width: "150px",
              fontSize: "12px",
              margin: "10px 5px",
            }}
            key="add"
            type="primary"
            onClick={() => {
              setIsDetalhesModalOpen(false);
              abrirModalCadastro();
            }}
          >
            Adicionar Horário
          </Button>,
          <Button
            className="BTNPurple"
            style={{
              height: "30px",
              width: "120px",
              fontSize: "12px",
              margin: "10px 5px",
            }}
            key="close"
            onClick={handleDetalhesCancel}
          >
            Fechar
          </Button>,
        ]}
        width={600}
      >
        <List
          dataSource={agendamentosDoDia}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: "10px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    Horário: {item.hora_inicio} - {item.hora_fim}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                    Paciente:{" "}
                    {pacientes[item.cd_paciente]?.nm_paciente ||
                      "Carregando..."}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "10px" }}>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setIsDetalhesModalOpen(false)
                    handleDeletarAgendamento(item.cd_agendamento)}}
                  style={{ marginRight: "10px" }}
                >
                  🗑️ Desmarcar
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() =>{

                  setIsDetalhesModalOpen(false)
                    handleDeleteAgendamentoSequencial(item.cd_agendamento)
                  }}
                >
                  🗑️ Desmarcar Sequencialmente
                </Button>
              </div>
            </Card>
          )}
        />
      </Modal>

      {/* Modal de Cadastro */}
      <Modal
        title={`Novo Agendamento para ${
          selectedDate ? selectedDate.format("DD/MM/YYYY") : ""
        }`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            className="BTNPurple"
            style={{
              height: "30px",
              width: "120px",
              fontSize: "12px",
              margin: "10px 5px",
            }}
            key="cancel"
            onClick={handleCancel}
          >
            Cancelar
          </Button>,
          <Button
            className="BTNPurple"
            style={{
              height: "30px",
              width: "120px",
              fontSize: "12px",
              margin: "10px 5px",
            }}
            key="submit"
            type="primary"
            onClick={() => {
              setIsModalOpen(false)
              handleSubmit()}}
          >
            Salvar
          </Button>,
        ]}
        width={500}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Horário de Início <span style={{ color: "red" }}>*</span>
            </label>
            <TimePicker
              className="F_NomeAreaTranstorno"
              value={horarioInicio}
              onChange={setHorarioInicio}
              format="HH:mm"
              placeholder="Selecione o horário"
              style={{ width: "100%" }}
              minuteStep={15}
            />
          </div>
          <div>
            <label
              style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
            >
              Horário de Fim <span style={{ color: "red" }}>*</span>
            </label>
            <TimePicker
              className="F_NomeAreaTranstorno"
              value={horario_fim}
              onChange={setHorario_fim}
              format="HH:mm"
              placeholder="Selecione o horário"
              style={{ width: "100%" }}
              minuteStep={15}
            />
          </div>

          <div>
            <Checkbox checked={isRepetir} onChange={handleCheckboxChange}>
              Repetir dia da semana
            </Checkbox>
          </div>

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
                className="F_NomeAreaTranstorno select-cinza"
                value={prazo || undefined}
                onChange={setPrazo}
                placeholder="Selecione o prazo"
                style={{ width: "100%", padding: "0%" }}
              >
                <Option value="1_mes">1 mês</Option>
                <Option value="6_meses">6 meses</Option>
                <Option value="1_ano">1 ano</Option>
              </Select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ManterAgenda;
