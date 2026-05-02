import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { api } from "./api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode]       = useState("login"); // login | register
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const res = mode === "login"
        ? await api.login(form.username, form.password)
        : await api.register(form);
      if (res.access_token) {
        localStorage.setItem("token", res.access_token);
        localStorage.setItem("user", JSON.stringify(res.user));
        onLogin(res.access_token, res.user);
      } else {
        setError(res.detail || "Erreur de connexion");
      }
    } catch { setError("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}><ClipboardList size={22} color="#fff" /></div>
          <span style={s.logoText}>TaskFlow</span>
        </div>
        <h2 style={s.title}>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>

        <div style={s.form}>
          <input placeholder="Nom d'utilisateur" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            style={s.input} />
          {mode === "register" && (
            <input placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={s.input} type="email" />
          )}
          <input placeholder="Mot de passe" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={s.input} type="password" />

          {error && <p style={s.error}>{error}</p>}

          <button onClick={submit} disabled={loading} style={s.btn}>
            {loading ? "…" : mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>

          <p style={s.switch}>
            {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={s.link}>
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#EEF2FF 0%,#F8FAFC 50%,#F0FDF4 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  card: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "20px", padding: "2.5rem 2rem", width: "100%", maxWidth: "380px", boxShadow: "0 20px 60px rgba(99,102,241,0.12)" },
  logo: { display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.5rem" },
  logoIcon: { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: "12px", padding: "0.5rem", display: "flex" },
  logoText: { fontWeight: 800, fontSize: "1.3rem", color: "#1E293B", letterSpacing: "-0.03em" },
  title: { fontSize: "1.1rem", fontWeight: 700, color: "#1E293B", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  input: { padding: "0.7rem 1rem", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: "10px", fontSize: "0.9rem", color: "#1E293B", outline: "none", fontFamily: "inherit", background: "rgba(255,255,255,0.9)" },
  btn: { padding: "0.75rem", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", marginTop: "0.25rem" },
  error: { color: "#EF4444", fontSize: "0.82rem", textAlign: "center" },
  switch: { textAlign: "center", fontSize: "0.85rem", color: "#64748B" },
  link: { color: "#6366F1", fontWeight: 600, cursor: "pointer" },
};