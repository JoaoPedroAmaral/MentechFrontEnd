import { useEffect, useState } from "react";

import "../css/OrganizeCSS/base.css";
import "../css/OrganizeCSS/components.css";
import "../css/OrganizeCSS/layout.css";
import "../css/OrganizeCSS/utils.css";

import PrimeiroAcesso from "./AcessoPage/PrimeiroAcesso.js";
import SegundoAcesso from "./AcessoPage/SegundoAcesso.js";

import "../css/OrganizeCSS/sweetalert-custom.css";

import { useGlobal } from "../global/GlobalContext.js";
import { LOADING_SCREEN } from "../InitialPage.js";

const HomePage = ({ onLogout, userData }) => {
  const [dadosPaciente, setDadosPaciente] = useState(null);
  const [primeiroPacienteID, setPrimeiroPacienteID] = useState(null);
  const [isHavePaciente, setIsHavePaciente] = useState(null);
  const [enderecoPaciente, setEnderecoPaciente] = useState(null);
  const [responsaveisDados, setResponsaveisDados] = useState([]);
  const [telefoneDados, setTelefoneDados] = useState([]);
  const [pacienteSalvo, setPacienteSalvo] = useState(() =>
    localStorage.getItem("ultimoPaciente")
  );
  const { pacienteEditado, setMetasModificadas, setProntuarioEdited } =
    useGlobal();

  useEffect(() => {
    verificarSeTemPaciente(userData.CD_USUARIO);
  }, [userData.CD_USUARIO]);

  useEffect(() => {
    const carregarDadosEssenciais = async (idParaCarregar) => {
      try {
        carregarPaciente(idParaCarregar);
        carregarEnderecoPaciente(idParaCarregar);

        const dadosResponsaveis = await carregarResponsaveis(idParaCarregar);

        const primeiroResponsavel =
          Array.isArray(dadosResponsaveis) && dadosResponsaveis.length > 0
            ? dadosResponsaveis[0]
            : null;

        const responsavelId = primeiroResponsavel
          ? primeiroResponsavel.CD_RESPONSAVEL
          : null;

        carregarTelefonePaciente(idParaCarregar, responsavelId);

        setMetasModificadas((prev) => !prev);
        setProntuarioEdited((prev) => !prev);
      } catch (error) {
        console.error("Erro ao carregar dados essenciais:", error);
      }
    };

    if (isHavePaciente === true) {
      const pacienteId = localStorage.getItem(
        `ultimoPaciente_${userData.CD_USUARIO}`
      );
      const idParaCarregar = pacienteId || primeiroPacienteID;

      if (idParaCarregar) {
        carregarDadosEssenciais(idParaCarregar);
      }
    }
  }, [isHavePaciente, primeiroPacienteID, pacienteSalvo, pacienteEditado]);

  useEffect(() => {
    const handleAtualizacao = () => {
      const novoValor = localStorage.getItem(
        `ultimoPaciente_${userData.CD_USUARIO}`
      );
      setPacienteSalvo(novoValor);
    };

    window.addEventListener("atualizarUltimoPaciente", handleAtualizacao);
    return () =>
      window.removeEventListener("atualizarUltimoPaciente", handleAtualizacao);
  }, []);

  const verificarSeTemPaciente = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/paciente/por_usuario/${id}`
      );
      const data = await response.json();

      if (response.ok && data.length > 0) {
        const primeiroPacienteID = data[0].CD_PACIENTE;
        setPrimeiroPacienteID(primeiroPacienteID);
        setIsHavePaciente(true);
      } else {
        setIsHavePaciente(false);
      }
    } catch (error) {
      console.error("Erro ao verificar pacientes:", error);
    }
  };

  const carregarEnderecoPaciente = async (pacienteID) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/endereco/${pacienteID}`
      );
      const data = await response.json();
      if (data) {
        setEnderecoPaciente(data);
      }
    } catch (error) {
      console.error("Erro ao carregar endereço do paciente:", error);
    }
  };

  const carregarResponsaveis = async (pacienteID) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/responsavel/${pacienteID}`
      );
      const data = await response.json();
      if (data) {
        setResponsaveisDados(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao carregar responsáveis do paciente:", error);
      return null;
    }
  };

  const carregarTelefonePaciente = async (pacienteID, responsavelID) => {
    try {
      const responsePaciente = await fetch(
        `http://127.0.0.1:5000/telefone/por_paciente/${pacienteID}`
      );

      const responseResponsavel = await fetch(
        `http://127.0.0.1:5000/telefone/por_responsavel/${responsavelID}`
      );

      const dataPaciente = responsePaciente.ok
        ? await responsePaciente.json()
        : [];
      const dataResponsavel = responseResponsavel.ok
        ? await responseResponsavel.json()
        : [];

      const telefonesUnificados = [
        ...(Array.isArray(dataPaciente) ? dataPaciente : []),
        ...(Array.isArray(dataResponsavel) ? dataResponsavel : []),
      ];

      setTelefoneDados(telefonesUnificados);
    } catch (error) {
      console.error("Erro ao carregar telefones:", error);
      setTelefoneDados([]);
    }
  };

  const carregarPaciente = async (pacienteID) => {
    try {
      localStorage.setItem("ultimoPaciente", pacienteID);

      const response = await fetch(
        `http://127.0.0.1:5000/paciente/${pacienteID}`
      );
      const data = await response.json();
      setDadosPaciente(data);
    } catch (error) {
      console.error("Erro ao carregar paciente:", error);
    }
  };

  if (isHavePaciente === null) {
    return <LOADING_SCREEN />;
  }

  return (
    <div className="BackgroundWhite">
      {!isHavePaciente ? (
        <PrimeiroAcesso
          userData={userData}
          onLogout={onLogout}
          setIsHavePaciente={setIsHavePaciente}
        />
      ) : (
        <SegundoAcesso
          userData={userData}
          pacienteID={localStorage.getItem("ultimoPaciente")}
          onLogout={onLogout}
          dadosPaciente={dadosPaciente}
          enderecoPaciente={enderecoPaciente}
          telefoneDados={telefoneDados}
          responsaveisDados={responsaveisDados}
        />
      )}
    </div>
  );
};

export default HomePage;
