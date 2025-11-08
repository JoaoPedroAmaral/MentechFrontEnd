import React from "react";
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InitialPage from "./InitialPage";
import RedefinirSenha from "./pages/RedefinirSenha";
import locale from 'antd/locale/pt_BR';

import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

function App() {
  return (
    <ConfigProvider locale={locale}>
      <Router>
        <Routes>
          <Route path="/" element={<InitialPage />} />
          <Route
            path="/redefinir-senha/:cd_alterar_senha/:cd_usuario/:token"
            element={<RedefinirSenha />}
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
