import { createContext, useState, useContext, use } from "react";

const GlobalContext = createContext();
export const BASE_URL = "https://mentechbackend.onrender.com";
export const GlobalProvider = ({ children }) => {
  const [criteriosModificados, setCriteriosModificados] = useState(false);
  const [pacientesModificados, setPacientesModificados] = useState(false);
  const [metasModificadas, setMetasModificadas] = useState(false);
  const [pacienteEditado, setPacienteEditado] = useState(false);
  const [prontuarioEdited, setProntuarioEdited] = useState(false);
  const [atividadeModificada, setAtividadeModificada] = useState(false);
  const [diagnosticosModificados, setDiagnosticosModificados] = useState(false);

  return (
    <GlobalContext.Provider
      value={{
        criteriosModificados,
        setCriteriosModificados,
        pacientesModificados,
        setPacientesModificados,
        metasModificadas,
        setMetasModificadas,
        pacienteEditado,
        setPacienteEditado,
        prontuarioEdited,
        setProntuarioEdited,
        atividadeModificada,
        setAtividadeModificada,
        diagnosticosModificados,
        setDiagnosticosModificados,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);
