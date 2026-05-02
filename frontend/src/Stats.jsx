import { useMemo } from "react";

export default function Stats({ tasks, dark }) {
  const txt = dark ? "#E2E8F0" : "#1E293B";
  const sub = dark ? "#64748B" : "#94A3B8";
  const bg  = dark ? "#1E1E2E" : "rgba(255,255,255,0.8)";

  const stats = useMemo(() => {
    const total     = tasks.length;
    const terminees = tasks.filter(t => t.terminee).length;
    const enCours   = tasks.filter(t => !t.terminee).length;
    const overdue   = tasks.filter(t => t.deadline && !t.terminee && new Date(t.deadline) < new Date()).length;

    const parPriorite = {
      haute:   tasks.filter(t => t.priorite === "haute").length,
      normale: tasks.filter(t => t.priorite === "normale").length,
      basse:   tasks.filter(t => t.priorite === "basse").length,
    };

    const parCategorie = {};
    tasks.forEach(t => {
      parCategorie[t.categorie] = (parCategorie[t.categorie] || 0) + 1;
    });

    const pct = total ? Math.round((terminees / total) * 100) : 0;
    return { total, terminees, enCours, overdue, parPriorite, parCategorie, pct };
  }, [tasks]);

  const cards = [
    { label: "Total",      value: stats.total,     color: "#6366F1", icon: "📋" },
    { label: "Terminées",  value: stats.terminees,  color: "#10B981", icon: "✅" },
    { label: "En cours",   value: stats.enCours,    color: "#F59E0B", icon: "⏳" },
    { label: "En retard",  value: stats.overdue,    color: "#EF4444", icon: "⚠️" },
  ];

  const prioColors = { haute: "#EF4444", normale: "#6366F1", basse: "#10B981" };
  const maxCat = Math.max(...Object.values(stats.parCategorie), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: bg, backdropFilter: "blur(12px)", border: `1px solid ${c.color}22`, borderRadius: "14px", padding: "1rem", borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: "1.4rem" }}>{c.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: c.color, marginTop: "0.25rem" }}>{c.value}</div>
            <div style={{ fontSize: "0.75rem", color: sub, marginTop: "2px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Progression globale */}
      <div style={{ background: bg, backdropFilter: "blur(12px)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: txt }}>Progression globale</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6366F1" }}>{stats.pct}%</span>
        </div>
        <div style={{ height: "8px", background: "rgba(99,102,241,0.15)", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ width: `${stats.pct}%`, height: "100%", background: "linear-gradient(90deg,#6366F1,#8B5CF6)", borderRadius: "4px", transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Par priorité */}
      <div style={{ background: bg, backdropFilter: "blur(12px)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
        <p style={{ fontSize: "0.82rem", fontWeight: 600, color: txt, marginBottom: "0.75rem" }}>Par priorité</p>
        {Object.entries(stats.parPriorite).map(([key, val]) => (
          <div key={key} style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.78rem", color: sub, textTransform: "capitalize" }}>{key}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: prioColors[key] }}>{val}</span>
            </div>
            <div style={{ height: "5px", background: `${prioColors[key]}22`, borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: stats.total ? `${(val / stats.total) * 100}%` : "0%", height: "100%", background: prioColors[key], borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Par catégorie */}
      {Object.keys(stats.parCategorie).length > 0 && (
        <div style={{ background: bg, backdropFilter: "blur(12px)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: txt, marginBottom: "0.75rem" }}>Par catégorie</p>
          {Object.entries(stats.parCategorie).map(([cat, val]) => (
            <div key={cat} style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <span style={{ fontSize: "0.78rem", color: sub }}>{cat}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6366F1" }}>{val}</span>
              </div>
              <div style={{ height: "5px", background: "rgba(99,102,241,0.15)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${(val / maxCat) * 100}%`, height: "100%", background: "linear-gradient(90deg,#6366F1,#8B5CF6)", borderRadius: "3px", transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}