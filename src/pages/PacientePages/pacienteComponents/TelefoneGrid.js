import { useState } from "react";

export default function TelefoneGrid({ label, telefones, setTelefones }) {
  telefones = Array.isArray(telefones) ? telefones : [];

  const [telefone, setTelefone] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [indexEdicao, setIndexEdicao] = useState(null);

  const formatarTelefone = (valor) => {
    valor = valor.replace(/\D/g, "").slice(0, 11);
    let formatado = "";
    if (valor.length > 0) formatado += `(${valor.slice(0, 2)}`;
    if (valor.length >= 2) formatado += `) `;
    if (valor.length >= 3) formatado += valor.slice(2, 7);
    if (valor.length >= 7) formatado += `-${valor.slice(7, 11)}`;
    return formatado;
  };

  const handleChange = (e) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  const adicionarOuEditar = () => {
    if (!telefone.trim()) return;

    const novaLista = [...telefones];

    if (modoEdicao && indexEdicao !== null) {
      novaLista[indexEdicao] = telefone;
    } else if (!telefones.includes(telefone)) {
      novaLista.push(telefone);
    }

    setTelefones(novaLista);
    limpar();
  };

  const editarTelefone = (idx) => {
    setTelefone(telefones[idx]);
    setModoEdicao(true);
    setIndexEdicao(idx);
  };

  const removerTelefone = (idx) => {
    const novaLista = [...telefones];
    novaLista.splice(idx, 1);
    setTelefones(novaLista);
    if (modoEdicao && indexEdicao === idx) {
      limpar();
    }
  };

  const limpar = () => {
    setTelefone("");
    setModoEdicao(false);
    setIndexEdicao(null);
  };

  return (
    <div>
      <p style={{ textAlign: "start", fontWeight: "bold", margin:"0", color:"#f5f5f5" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center"}}>
        <input
          className="F_GravidadeAreaTranstorno"
          placeholder="Ex: (61) 98573-9227"
          value={telefone}
          onChange={handleChange}
          style={{ width: "150px" }}
          maxLength={15}
        />
        <button
          type="button"
          onClick={adicionarOuEditar}
          className="F_btnTranstornos"
          style={{ marginLeft: "10px", width: "100px", height: "30px" }}
        >
          {modoEdicao ? "Salvar" : "Adicionar"}
        </button>
        {modoEdicao && (
          <button
            type="button"
            onClick={limpar}
            className="F_btnTranstornos"
            style={{ marginLeft: "5px", backgroundColor: "gray", width: "100px", height: "30px"}}
          >
            Cancelar
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: "5px",
          border: "3px solid #6cc5ab",
          borderRadius: "4px",
          height: "120px",
          width:"388px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead
            style={{
              display: "table",
              width: "100%",
              tableLayout: "fixed",
              backgroundColor: "#6cc5ab",
              color: "#fff",
            }}
          >
            <tr>
              <th style={{ padding: "8px", width:"60%" ,textAlign: "left" }}>Telefone</th>
              <th style={{ textAlign: "left" }}>Ações</th>
            </tr>
          </thead>
          <tbody
            style={{
              display: "block",
              height: "80px",
              overflowY: "auto",
              width: "100%",
            }}
          >
            {telefones.length > 0 ? (
              telefones.map((tel, idx) => (
                <tr key={idx} style={{ display: "table", width: "100%" }}>
                  <td style={{ padding: "8px", width:"60%", color:"#f5f5f5" }}>{tel}</td>
                  <td style={{ padding: "8px" }}>
                    <button onClick={() => editarTelefone(idx)}>✏️</button>
                    <button onClick={() => removerTelefone(idx)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr style={{ display: "table", width: "100%" }}>
                <td colSpan="2" style={{ padding: "8px", textAlign: "center", color:"#f5f5f5" }}>
                  Nenhum telefone adicionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
