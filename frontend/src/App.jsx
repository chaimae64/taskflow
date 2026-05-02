import { useState, useEffect, useCallback } from "react";
import { Bell, Plus, Trash2, CheckCircle, Pencil, X, Save, CheckCheck,
         ClipboardList, Search, ArrowUpDown, LayoutGrid, List,
         BarChart2, Moon, Sun, LogOut } from "lucide-react";
import { api } from "./api";
import AuthPage from "./AuthPage";
import Pomodoro from "./Pomodoro";
import Stats from "./Stats";

const PRIORITY = {
  haute:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  label: "Haute" },
  normale: { color: "#6366F1", bg: "rgba(99,102,241,0.12)", label: "Normale" },
  basse:   { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "Basse" },
};
const STATUT_COLOR = { "en attente": "#F59E0B", "en cours": "#6366F1", "terminée": "#10B981" };
const CATEGORIES   = ["Général", "Travail", "Études", "Personnel", "Santé", "Projets"];
const KANBAN_COLS  = [
  { key: "en attente", label: "À faire",   color: "#F59E0B" },
  { key: "en cours",   label: "En cours",  color: "#6366F1" },
  { key: "terminée",   label: "Terminées", color: "#10B981" },
];

const css = `
@keyframes fadeIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
* { box-sizing: border-box; margin: 0; padding: 0; }
input,select,button { font-family: inherit; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #6366F133; border-radius: 4px; }
`;

export default function App() {
  const [token, setToken]   = useState(() => localStorage.getItem("token"));
  const [user, setUser]     = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [dark, setDark]     = useState(false);

  const [tasks, setTasks]                 = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs]       = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [editForm, setEditForm]           = useState({});
  const [form, setForm]                   = useState({ titre: "", description: "", priorite: "normale", categorie: "Général", deadline: "" });
  const [loading, setLoading]             = useState(false);
  const [hoveredId, setHoveredId]         = useState(null);

  const [search, setSearch]           = useState("");
  const [filterStatut, setFilterStatut] = useState("toutes");
  const [filterCat, setFilterCat]     = useState("toutes");
  const [sortBy, setSortBy]           = useState("date");
  const [view, setView]               = useState("list"); // list | kanban | stats

  const fetchTasks  = useCallback(() => token && api.getTasks(token).then(setTasks).catch(() => {}), [token]);
  const fetchNotifs = useCallback(() => token && api.getNotifications(token).then(setNotifications).catch(() => {}), [token]);

  useEffect(() => { fetchTasks(); fetchNotifs(); }, [token]);

  const handleLogin = (t, u) => { setToken(t); setUser(u); };
  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    setToken(null); setUser(null); setTasks([]); setNotifications([]);
  };

  const creerTache = async () => {
    if (!form.titre.trim()) return;
    setLoading(true);
    const payload = { ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : null };
    await api.createTask(token, payload);
    setForm({ titre: "", description: "", priorite: "normale", categorie: "Général", deadline: "" });
    await fetchTasks(); await fetchNotifs();
    setLoading(false);
  };

  const supprimerTache  = async (id) => { await api.deleteTask(token, id);   fetchTasks(); fetchNotifs(); };
  const terminerTache   = async (id) => { await api.completeTask(token, id); fetchTasks(); fetchNotifs(); };
  const sauvegarderEdit = async (id) => {
    const payload = { ...editForm, deadline: editForm.deadline ? new Date(editForm.deadline).toISOString() : null };
    await api.updateTask(token, id, payload);
    setEditingId(null); fetchTasks(); fetchNotifs();
  };
  const marquerToutesLues = async () => { await api.markAllRead(token); fetchNotifs(); };

  // Kanban drag
  const onDrop = async (e, statut) => {
    const id = parseInt(e.dataTransfer.getData("task_id"));
    const terminee = statut === "terminée";
    if (terminee) await api.completeTask(token, id);
    else await api.updateTask(token, id, { statut });
    fetchTasks();
  };

  // Filtres
  const tasksFiltrees = tasks
    .filter(t => {
      const s = t.titre.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
      const st = filterStatut === "toutes" ? true : filterStatut === "terminées" ? t.terminee : !t.terminee;
      const c  = filterCat === "toutes" ? true : t.categorie === filterCat;
      return s && st && c;
    })
    .sort((a, b) => {
      if (sortBy === "priorite") return ({ haute: 0, normale: 1, basse: 2 }[a.priorite] - { haute: 0, normale: 1, basse: 2 }[b.priorite]);
      if (sortBy === "deadline") return (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity);
      return new Date(b.cree_le) - new Date(a.cree_le);
    });

  const nonLues   = notifications.filter(n => !n.lue).length;
  const terminees = tasks.filter(t => t.terminee).length;
  const pct       = tasks.length ? Math.round((terminees / tasks.length) * 100) : 0;
  const isOverdue = t => t.deadline && !t.terminee && new Date(t.deadline) < new Date();

  // Thème
  const th = {
    bg:      dark ? "#0F0F1A" : "linear-gradient(135deg,#EEF2FF 0%,#F8FAFC 50%,#F0FDF4 100%)",
    sidebar: dark ? "rgba(30,30,46,0.95)" : "rgba(255,255,255,0.8)",
    card:    dark ? "rgba(30,30,46,0.9)"  : "rgba(255,255,255,0.85)",
    border:  dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.9)",
    txt:     dark ? "#E2E8F0" : "#1E293B",
    sub:     dark ? "#64748B" : "#94A3B8",
    input:   dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
    inputBorder: dark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)",
  };

  if (!token) return <AuthPage onLogin={handleLogin} />;

  const TaskCard = ({ task, i }) => {
    const p = PRIORITY[task.priorite] || PRIORITY.normale;
    const hovered = hoveredId === task.id;
    const overdue = isOverdue(task);
    return (
      <div key={task.id}
        draggable onDragStart={e => e.dataTransfer.setData("task_id", task.id)}
        onMouseEnter={() => setHoveredId(task.id)} onMouseLeave={() => setHoveredId(null)}
        style={{ background: th.card, backdropFilter: "blur(12px)", border: `1px solid ${th.border}`,
          borderLeft: `4px solid ${overdue ? "#EF4444" : p.color}`, borderRadius: "14px",
          padding: "1rem 1.25rem", transition: "transform 0.2s, box-shadow 0.2s",
          transform: hovered && !task.terminee ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered ? "0 12px 40px rgba(99,102,241,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
          animation: "fadeIn 0.3s ease both", animationDelay: `${i * 0.04}s`, opacity: task.terminee ? 0.6 : 1, cursor: "grab" }}>
        {editingId === task.id ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input value={editForm.titre || ""} onChange={e => setEditForm({ ...editForm, titre: e.target.value })} style={{ ...inp(th), }} placeholder="Titre" />
            <input value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={inp(th)} placeholder="Description" />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select value={editForm.categorie || "Général"} onChange={e => setEditForm({ ...editForm, categorie: e.target.value })} style={inp(th)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="datetime-local" value={editForm.deadline ? editForm.deadline.slice(0, 16) : ""}
                onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} style={inp(th)} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => sauvegarderEdit(task.id)} style={saveBtn}><Save size={13} /> Sauvegarder</button>
              <button onClick={() => setEditingId(null)} style={cancelBtn}><X size={13} /> Annuler</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.93rem", fontWeight: 700, color: task.terminee ? th.sub : th.txt, textDecoration: task.terminee ? "line-through" : "none" }}>{task.titre}</p>
                {overdue && <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "2px 7px", borderRadius: "20px" }}>⚠ Retard</span>}
              </div>
              {task.description && <p style={{ fontSize: "0.8rem", color: th.sub, marginTop: "2px" }}>{task.description}</p>}
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.45rem", flexWrap: "wrap" }}>
                <span style={{ ...pill, background: p.bg, color: p.color }}>{p.label}</span>
                <span style={{ ...pill, background: "rgba(0,0,0,0.04)", color: STATUT_COLOR[task.statut] || th.sub }}>{task.statut}</span>
                <span style={{ ...pill, background: "rgba(99,102,241,0.08)", color: "#6366F1" }}>{task.categorie}</span>
                {task.deadline && <span style={{ ...pill, background: overdue ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: overdue ? "#EF4444" : "#F59E0B" }}>📅 {new Date(task.deadline).toLocaleDateString("fr-FR")}</span>}
              </div>
            </div>
            {!task.terminee && (
              <div style={{ display: "flex", gap: "0.4rem", opacity: hovered ? 1 : 0.3, transition: "opacity 0.2s" }}>
                <button onClick={() => { setEditingId(task.id); setEditForm({ titre: task.titre, description: task.description, categorie: task.categorie, deadline: task.deadline }); }} style={iconBtn("#6366F1")}><Pencil size={14} /></button>
                <button onClick={() => terminerTache(task.id)} style={iconBtn("#10B981")}><CheckCircle size={14} /></button>
                <button onClick={() => supprimerTache(task.id)} style={iconBtn("#EF4444")}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: th.bg, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: "240px", background: th.sidebar, backdropFilter: "blur(20px)", borderRight: `1px solid ${th.border}`, padding: "1.5rem 1.1rem", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "4px 0 24px rgba(99,102,241,0.06)", flexShrink: 0 }}>
          
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <div style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: "10px", padding: "0.45rem", display: "flex" }}><ClipboardList size={18} color="#fff" /></div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: th.txt, letterSpacing: "-0.03em" }}>TaskFlow</span>
          </div>

          {/* User */}
          <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: "10px", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: th.txt, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.username}</p>
              <p style={{ fontSize: "0.7rem", color: th.sub }}>Connecté</p>
            </div>
          </div>

          {/* Vues */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Vues</p>
            {[
              { val: "list",   label: "Liste",        icon: <List size={15} /> },
              { val: "kanban", label: "Kanban",        icon: <LayoutGrid size={15} /> },
              { val: "stats",  label: "Statistiques",  icon: <BarChart2 size={15} /> },
            ].map(v => (
              <div key={v.val} onClick={() => setView(v.val)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", borderRadius: "9px", cursor: "pointer", marginBottom: "0.2rem", fontSize: "0.85rem", fontWeight: 500, background: view === v.val ? "rgba(99,102,241,0.12)" : "transparent", color: view === v.val ? "#6366F1" : th.sub, transition: "all 0.15s" }}>
                {v.icon} {v.label}
              </div>
            ))}
          </div>

          {/* Filtres statut */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Statut</p>
            {[
              { val: "toutes",    label: "Toutes",    count: tasks.length,                      dot: "#6366F1" },
              { val: "en cours",  label: "En cours",  count: tasks.filter(t=>!t.terminee).length, dot: "#F59E0B" },
              { val: "terminées", label: "Terminées", count: terminees,                          dot: "#10B981" },
            ].map(item => (
              <div key={item.val} onClick={() => setFilterStatut(item.val)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.75rem", borderRadius: "9px", cursor: "pointer", marginBottom: "0.2rem", fontSize: "0.82rem", background: filterStatut === item.val ? "rgba(99,102,241,0.1)" : "transparent", color: filterStatut === item.val ? "#6366F1" : th.sub, transition: "all 0.15s" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: "0.7rem", background: "rgba(99,102,241,0.1)", color: "#6366F1", borderRadius: "20px", padding: "1px 7px" }}>{item.count}</span>
              </div>
            ))}
          </div>

          {/* Catégories */}
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Catégories</p>
            {["toutes", ...CATEGORIES].map(cat => (
              <div key={cat} onClick={() => setFilterCat(cat)}
                style={{ padding: "0.38rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer", marginBottom: "0.15rem", background: filterCat === cat ? "rgba(99,102,241,0.1)" : "transparent", color: filterCat === cat ? "#6366F1" : th.sub, fontWeight: filterCat === cat ? 600 : 400, transition: "all 0.15s" }}>
                {cat === "toutes" ? "📋 Toutes" : cat}
              </div>
            ))}
          </div>

          {/* Progression */}
          <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: "12px", padding: "0.85rem 1rem", marginTop: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.72rem", color: th.sub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Progression</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6366F1" }}>{pct}%</span>
            </div>
            <div style={{ height: "6px", background: "rgba(99,102,241,0.15)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#6366F1,#8B5CF6)", borderRadius: "4px", transition: "width 0.5s ease" }} />
            </div>
            <p style={{ fontSize: "0.72rem", color: th.sub, marginTop: "0.4rem" }}>{terminees}/{tasks.length} complétées</p>
          </div>

          {/* Pomodoro */}
          <Pomodoro dark={dark} />

          {/* Actions bas */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setDark(!dark)} style={{ flex: 1, background: "rgba(99,102,241,0.08)", border: "none", borderRadius: "9px", padding: "0.5rem", cursor: "pointer", color: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={handleLogout} style={{ flex: 1, background: "rgba(239,68,68,0.08)", border: "none", borderRadius: "9px", padding: "0.5rem", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, padding: "2rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>

          {/* Header */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: th.txt, letterSpacing: "-0.04em" }}>
                {view === "list" ? "Mes tâches" : view === "kanban" ? "Vue Kanban" : "Statistiques"}
              </h1>
              <p style={{ fontSize: "0.85rem", color: th.sub, marginTop: "2px", textTransform: "capitalize" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) marquerToutesLues(); }}
                style={{ background: th.card, backdropFilter: "blur(12px)", border: `1px solid ${th.border}`, borderRadius: "12px", padding: "0.55rem 0.8rem", cursor: "pointer", display: "flex", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", position: "relative" }}>
                <Bell size={18} color={nonLues > 0 ? "#6366F1" : th.sub} />
                {nonLues > 0 && <span style={{ position: "absolute", top: "-7px", right: "-7px", background: "linear-gradient(135deg,#EF4444,#F97316)", color: "#fff", borderRadius: "50%", fontSize: "0.62rem", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{nonLues}</span>}
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", right: 0, top: "110%", background: dark ? "rgba(30,30,46,0.98)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: `1px solid ${th.border}`, borderRadius: "14px", width: "300px", maxHeight: "320px", overflowY: "auto", zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeIn 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 1rem", borderBottom: `1px solid ${th.border}` }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: th.txt }}>Notifications</span>
                    <CheckCheck size={14} color="#6366F1" />
                  </div>
                  {notifications.length === 0
                    ? <p style={{ padding: "1.5rem", fontSize: "0.85rem", color: th.sub, textAlign: "center" }}>Aucune notification</p>
                    : notifications.map(n => (
                      <div key={n.id} style={{ display: "flex", gap: "0.6rem", padding: "0.7rem 1rem", borderBottom: `1px solid ${th.border}`, alignItems: "flex-start", opacity: n.lue ? 0.4 : 1 }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366F1", flexShrink: 0, marginTop: "4px" }} />
                        <div>
                          <p style={{ fontSize: "0.8rem", color: th.txt }}>{n.message}</p>
                          <p style={{ fontSize: "0.7rem", color: th.sub, marginTop: "2px" }}>{new Date(n.cree_le).toLocaleString("fr-FR")}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </header>

          {/* ── VUE STATS ── */}
          {view === "stats" && <Stats tasks={tasks} dark={dark} />}

          {/* ── VUE LIST & KANBAN : Formulaire + toolbar ── */}
          {view !== "stats" && (
            <>
              {/* Toolbar */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: th.card, backdropFilter: "blur(12px)", border: `1.5px solid ${th.inputBorder}`, borderRadius: "10px", padding: "0.5rem 0.9rem", flex: 1, minWidth: "180px" }}>
                  <Search size={14} color={th.sub} />
                  <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: "0.875rem", color: th.txt, width: "100%" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: th.card, backdropFilter: "blur(12px)", border: `1.5px solid ${th.inputBorder}`, borderRadius: "10px", padding: "0.38rem 0.6rem" }}>
                  <ArrowUpDown size={13} color={th.sub} />
                  {[{ val: "date", label: "Date" }, { val: "priorite", label: "Priorité" }, { val: "deadline", label: "Deadline" }].map(o => (
                    <button key={o.val} onClick={() => setSortBy(o.val)}
                      style={{ padding: "0.28rem 0.55rem", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.78rem", background: sortBy === o.val ? "rgba(99,102,241,0.12)" : "transparent", color: sortBy === o.val ? "#6366F1" : th.sub, fontWeight: sortBy === o.val ? 600 : 400, transition: "all 0.15s" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulaire */}
              <section style={{ background: th.card, backdropFilter: "blur(20px)", border: `1px solid ${th.border}`, borderRadius: "16px", padding: "1.25rem 1.5rem", boxShadow: "0 4px 24px rgba(99,102,241,0.07)" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.8rem" }}>✦ Nouvelle tâche</p>
                <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
                  <input placeholder="Titre *" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} onKeyDown={e => e.key === "Enter" && creerTache()} style={{ ...inp(th), flex: 1, minWidth: "130px" }} />
                  <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inp(th), flex: 1.5, minWidth: "130px" }} />
                  <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={inp(th)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ ...inp(th), color: form.deadline ? th.txt : th.sub }} />
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    {Object.entries(PRIORITY).map(([key, val]) => (
                      <button key={key} onClick={() => setForm({ ...form, priorite: key })}
                        style={{ padding: "0.45rem 0.7rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, border: `1.5px solid ${form.priorite === key ? val.color : th.inputBorder}`, background: form.priorite === key ? val.bg : "transparent", color: form.priorite === key ? val.color : th.sub, transition: "all 0.15s" }}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={creerTache} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
                    <Plus size={16} /> {loading ? "…" : "Ajouter"}
                  </button>
                </div>
              </section>

              {/* ── VUE LISTE ── */}
              {view === "list" && (
                <section style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {tasksFiltrees.length === 0 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", background: th.card, borderRadius: "16px", border: `1.5px dashed ${th.inputBorder}` }}>
                      <ClipboardList size={44} color={th.sub} />
                      <p style={{ color: th.sub, marginTop: "0.75rem" }}>Aucune tâche trouvée</p>
                    </div>
                  )}
                  {tasksFiltrees.map((task, i) => <TaskCard key={task.id} task={task} i={i} />)}
                </section>
              )}

              {/* ── VUE KANBAN ── */}
              {view === "kanban" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
                  {KANBAN_COLS.map(col => (
                    <div key={col.key}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => onDrop(e, col.key)}
                      style={{ background: th.card, backdropFilter: "blur(12px)", border: `1px solid ${th.border}`, borderRadius: "16px", padding: "1rem", minHeight: "300px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }} />
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: th.txt }}>{col.label}</span>
                        <span style={{ marginLeft: "auto", fontSize: "0.72rem", background: `${col.color}22`, color: col.color, borderRadius: "20px", padding: "1px 8px", fontWeight: 600 }}>
                          {tasks.filter(t => col.key === "terminée" ? t.terminee : t.statut === col.key && !t.terminee).length}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {tasks
                          .filter(t => col.key === "terminée" ? t.terminee : t.statut === col.key && !t.terminee)
                          .map((task, i) => <TaskCard key={task.id} task={task} i={i} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ── Helpers ──
const inp = (th) => ({ padding: "0.6rem 0.9rem", border: `1.5px solid ${th.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: th.txt, outline: "none", background: th.input });
const pill       = { fontSize: "0.7rem", fontWeight: 600, padding: "2px 9px", borderRadius: "20px" };
const iconBtn    = (c) => ({ background: `${c}11`, border: `1px solid ${c}33`, color: c, padding: "0.35rem 0.5rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" });
const saveBtn    = { display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(16,185,129,0.1)", border: "1px solid #10B981", color: "#10B981", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem" };
const cancelBtn  = { display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", color: "#64748B", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem" };