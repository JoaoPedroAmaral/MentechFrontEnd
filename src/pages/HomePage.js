import { useEffect, useState } from "react";

import "../css/OrganizeCSS/base.css";
import "../css/OrganizeCSS/components.css";
import "../css/OrganizeCSS/layout.css";
import "../css/OrganizeCSS/utils.css";

import PrimeiroAcesso from "./AcessoPage/PrimeiroAcesso.js";
import SegundoAcesso from "./AcessoPage/SegundoAcesso.js";

import "../css/OrganizeCSS/sweetalert-custom.css";

import { useGlobal, BASE_URL } from "../global/GlobalContext.js";
import { LOADING_SCREEN } from "../InitialPage.js";

const HomePage = ({ onLogout, userData }) => {
  const [dadosPaciente, setDadosPaciente] = useState(null);
  const [primeiroPacienteID, setPrimeiroPacienteID] = useState(null);
  const [isHavePaciente, setIsHavePaciente] = useState(null);
  const [enderecoPaciente, setEnderecoPaciente] = useState(null);
  const [responsaveisDados, setResponsaveisDados] = useState([]);
  const [telefoneDados, setTelefoneDados] = useState([]);
  const [pacienteSalvo, setPacienteSalvo] = useState(() =>
    localStorage.getItem(`ultimoPaciente_${userData.cd_usuario}`)
  );
  const [jaCarregouAgenda, setJaCarregouAgenda] = useState(false);
  const { pacienteEditado, setMetasModificadas, setProntuarioEdited } =
    useGlobal();

  useEffect(() => {
    verificarSeTemPaciente(userData.cd_usuario);
  }, [userData.cd_usuario]);

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
          ? primeiroResponsavel.cd_responsavel
          : null;

        carregarTelefonePaciente(idParaCarregar, responsavelId);

        setMetasModificadas((prev) => !prev);
        setProntuarioEdited((prev) => !prev);
      } catch (error) {
        console.error("Erro ao carregar dados essenciais:", error);
      }
    };

    if (isHavePaciente === true) {
      if (!jaCarregouAgenda) {
        determinarPacienteParaCarregar(userData.cd_usuario).then((idParaCarregar) => {
          if (idParaCarregar) {
            carregarDadosEssenciais(idParaCarregar);
            setJaCarregouAgenda(true);
          }
        });
      } else {
        const pacienteId = localStorage.getItem(
          `ultimoPaciente_${userData.cd_usuario}`
        );
        const idParaCarregar = pacienteId || primeiroPacienteID;

        if (idParaCarregar) {
          carregarDadosEssenciais(idParaCarregar);
        }
      }
    }
  }, [isHavePaciente, primeiroPacienteID, pacienteSalvo, pacienteEditado]);

  useEffect(() => {
    const handleAtualizacao = () => {
      const novoValor = localStorage.getItem(
        `ultimoPaciente_${userData.cd_usuario}`
      );
      setPacienteSalvo(novoValor);
    };

    window.addEventListener("atualizarUltimoPaciente", handleAtualizacao);
    return () =>
      window.removeEventListener("atualizarUltimoPaciente", handleAtualizacao);
  }, [userData.cd_usuario]);

  const determinarPacienteParaCarregar = async (cd_usuario) => {
    try {
      
      const response = await fetch(
        `${BASE_URL}/paciente/proximo/${cd_usuario}`
      );

      if (response.ok) {
        const proximoPaciente = await response.json();
        
        if (proximoPaciente && proximoPaciente.cd_paciente) {
          console.log("✅ Paciente da agenda encontrado:", proximoPaciente.cd_paciente);
          
          // Salva no localStorage para próximas trocas
          localStorage.setItem(
            `ultimoPaciente_${cd_usuario}`,
            proximoPaciente.cd_paciente
          );
          
          return proximoPaciente.cd_paciente;
        }
      }

      const ultimoPacienteLocalStorage = localStorage.getItem(
        `ultimoPaciente_${cd_usuario}`
      );

      if (ultimoPacienteLocalStorage) {
        return ultimoPacienteLocalStorage;
      }


      if (primeiroPacienteID) {
        localStorage.setItem(
          `ultimoPaciente_${cd_usuario}`,
          primeiroPacienteID
        );
        return primeiroPacienteID;
      }

      return null;
    } catch (error) {
      const fallbackPaciente = localStorage.getItem(
        `ultimoPaciente_${cd_usuario}`
      ) || primeiroPacienteID;
      
      return fallbackPaciente;
    }
  };

  const verificarSeTemPaciente = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/paciente/por_usuario/${id}`
      );
      const data = await response.json();

      if (response.ok && data.length > 0) {
        const primeiroPacienteID = data[0].cd_paciente;
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
        `${BASE_URL}/endereco/${pacienteID}`
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
        `${BASE_URL}/responsavel/${pacienteID}`
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
        `${BASE_URL}/telefone/por_paciente/${pacienteID}`
      );

      const dataPaciente = responsePaciente.ok
        ? await responsePaciente.json()
        : [];

      const telefonesUnificados = [
        ...(Array.isArray(dataPaciente) ? dataPaciente : [])
      ];

      setTelefoneDados(telefonesUnificados);
    } catch (error) {
      console.error("Erro ao carregar telefones:", error);
      setTelefoneDados([]);
    }
  };

  const carregarPaciente = async (pacienteID) => {
    try {
      localStorage.setItem(
        `ultimoPaciente_${userData.cd_usuario}`,
        pacienteID
      );

      const response = await fetch(
        `${BASE_URL}/paciente/${pacienteID}`
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
          pacienteID={localStorage.getItem(`ultimoPaciente_${userData.cd_usuario}`)}
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