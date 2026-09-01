import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "/api";

const OPTIONS = {
  job_role: [
    "Software Engineer",
    "Data Analyst",
    "Data Scientist",
    "AI Engineer",
    "Business Analyst",
    "Cloud Engineer",
    "DevOps Engineer",
    "Cybersecurity Analyst",
    "UX Designer",
    "Technology Consultant",
  ],
  department: [
    "Technology",
    "Data & Analytics",
    "Data & AI",
    "Consulting",
    "Cloud",
    "Cybersecurity",
    "Design",
  ],
  experience_years: ["0–1 years", "2–3 years", "4–6 years", "7–10 years", "10+ years"],
  skill_proficiency: ["Beginner", "Intermediate", "Advanced", "Expert"],
  current_project_area: [
    "Application Development",
    "Data Analytics",
    "Machine Learning",
    "Artificial Intelligence",
    "Cloud Application",
    "Cloud Infrastructure",
    "Cloud Migration",
    "Business Intelligence",
    "Digital Transformation",
    "Cybersecurity",
    "DevOps",
    "Product Design",
    "Technology Consulting",
  ],
  technology_trend: ["Low", "Medium", "High", "Very High"],
};

const SKILLS = [
  "Python",
  "SQL",
  "Java",
  "JavaScript",
  "Power BI",
  "Excel",
  "Machine Learning",
  "Artificial Intelligence",
  "Data Visualisation",
  "Statistics",
  "Pandas",
  "Scikit-learn",
  "APIs",
  "Cloud Computing",
  "Docker",
  "Kubernetes",
  "Git",
  "Linux",
  "CI/CD",
  "TensorFlow",
  "PyTorch",
  "Cybersecurity",
  "Networking",
  "Risk Analysis",
  "SIEM",
  "Figma",
  "UI Design",
  "UX Design",
  "User Research",
  "Communication",
  "Requirements Analysis",
  "Process Mapping",
  "Project Management",
];

const EMPTY_FORM = {
  employee_id: "",
  job_role: "",
  department: "",
  experience_years: "",
  current_skills: [],
  skill_proficiency: "",
  current_project_area: "",
  technology_trend: "",
};

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    sparkles: <><path d="m12 3-1.4 4.2L6 8.6l4.6 1.4L12 14l1.4-4 4.6-1.4-4.6-1.4L12 3Z"/><path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/><path d="M17 7h2v2"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></>,
    graduation: <><path d="m3 10 9-6 9 6-9 6-9-6Z"/><path d="M7 13v4c2 2 8 2 10 0v-4"/><path d="M21 10v6"/></>,
    library: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"/><path d="M4 5.5V21"/><path d="M8 7h8"/><path d="M8 11h8"/></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2 .9-4A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-4L3 10"/><path d="M3 5v5h5"/><path d="M4 13a8 8 0 0 0 14.9 4L21 14"/><path d="M21 19v-5h-5"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    brain: <><path d="M9 5.5A3.5 3.5 0 0 0 5.5 9c0 .5.1 1 .3 1.4A3.8 3.8 0 0 0 7 17.8a3.4 3.4 0 0 0 2 1.7"/><path d="M15 5.5A3.5 3.5 0 0 1 18.5 9c0 .5-.1 1-.3 1.4a3.8 3.8 0 0 1-1.2 7.4 3.4 3.4 0 0 1-2 1.7"/><path d="M9 5.5c.8.1 1.7.6 2 1.5.3-.9 1.2-1.4 2-1.5"/><path d="M12 7v12"/><path d="M7 12h3M14 12h3"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/><path d="m17 7 4-4M17 3h4v4"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    close: <><path d="m7 7 10 10M17 7 7 17"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    database: <><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  };
  return <svg {...common}>{paths[name] || paths.sparkles}</svg>;
}

function SelectField({ label, name, value, onChange, options, placeholder, required = true }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <em>*</em>}</span>
      <span className="select-wrap">
        <select name={name} value={value} onChange={onChange} required={required}>
          <option value="" disabled>{placeholder}</option>
          {options.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <span className="select-chevron"><Icon name="chevron" size={17} /></span>
      </span>
    </label>
  );
}

function SkillsSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = useMemo(
    () => SKILLS.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const toggleSkill = (skill) => {
    const next = value.includes(skill) ? value.filter((s) => s !== skill) : [...value, skill];
    onChange(next);
  };

  return (
    <div className="field skills-field" ref={ref}>
      <span className="field-label">Current Skills<em>*</em><small>Select multiple</small></span>
      <div className={`multi-select ${open ? "is-open" : ""}`}>
        <button type="button" className="multi-trigger" onClick={() => setOpen(!open)}>
          <span className={value.length ? "selected-placeholder" : "placeholder"}>{value.length ? `${value.length} skill${value.length > 1 ? "s" : ""} selected` : "Select your current skills"}</span>
          <Icon name="chevron" size={17} />
        </button>
        {value.length > 0 && (
          <div className="skill-chips">
            {value.map((skill) => (
              <span className="skill-chip" key={skill}>
                {skill}
                <button type="button" onClick={() => toggleSkill(skill)} aria-label={`Remove ${skill}`}><Icon name="close" size={13} /></button>
              </span>
            ))}
          </div>
        )}
        {open && (
          <div className="skills-menu">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              onClick={(e) => e.stopPropagation()}
            />
            <div className="skills-list">
              {filtered.map((skill) => (
                <button type="button" key={skill} className={value.includes(skill) ? "skill-option selected" : "skill-option"} onClick={() => toggleSkill(skill)}>
                  <span className="check-box">{value.includes(skill) && <Icon name="check" size={14} />}</span>
                  <span>{skill}</span>
                </button>
              ))}
            </div>
            <div className="skills-menu-footer"><span>{value.length} selected</span><button type="button" className="skills-done" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>Done</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="empty-results">
      <div className="empty-orbit"><Icon name="brain" size={40} /></div>
      <h3>AI analysis is ready</h3>
      <p>Complete the employee profile and run a prediction to see future skills, skill gaps and personalised training recommendations.</p>
      <div className="empty-flow">
        <span>Profile</span><b>→</b><span>AI Prediction</span><b>→</b><span>Recommendations</span>
      </div>
    </div>
  );
}

function EmployeeEditor({ employee, onClose, onSaved }) {
  const [form, setForm] = useState(() => employee ? {
    employee_id: employee.employee_id,
    job_role: employee.job_role,
    department: employee.department,
    experience_years: `${employee.experience_years}+ years`,
    current_skills: employee.current_skills || [],
    skill_proficiency: employee.skill_proficiency,
    current_project_area: employee.current_project_area,
    technology_trend: employee.technology_trend,
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const expNumber = (v) => {
    if (String(v).startsWith("0")) return 0;
    if (String(v).startsWith("2")) return 2;
    if (String(v).startsWith("4")) return 4;
    if (String(v).startsWith("7")) return 7;
    return 10;
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.current_skills.length) { setError("Select at least one current skill."); return; }
    setSaving(true);
    try {
      const payload = {
        employee_id: form.employee_id.trim(), job_role: form.job_role, department: form.department,
        experience_years: expNumber(form.experience_years), current_skills: form.current_skills.join(", "),
        skill_proficiency: form.skill_proficiency, current_project_area: form.current_project_area,
        technology_trend: form.technology_trend,
      };
      const url = employee ? `${API}/employees/${encodeURIComponent(employee.employee_id)}` : `${API}/predict`;
      const response = await fetch(url, { method: employee ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save employee.");
      onSaved(data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="employee-modal panel" onMouseDown={e => e.stopPropagation()}>
      <div className="modal-header"><div><span className="eyebrow">HR WORKFORCE MANAGEMENT</span><h2>{employee ? "Edit Employee" : "Add Employee"}</h2><p>Save the profile and refresh prediction, skill gaps and readiness automatically.</p></div><button className="icon-btn" onClick={onClose}><Icon name="close" size={18}/></button></div>
      <form onSubmit={save} className="modal-form">
        <label className="field"><span className="field-label">Employee ID<em>*</em></span><input name="employee_id" value={form.employee_id} onChange={update} placeholder="Enter employee ID" disabled={!!employee} required /></label>
        <SelectField label="Job Role" name="job_role" value={form.job_role} onChange={update} options={OPTIONS.job_role} placeholder="Select job role" />
        <SelectField label="Department" name="department" value={form.department} onChange={update} options={OPTIONS.department} placeholder="Select department" />
        <SelectField label="Experience (Years)" name="experience_years" value={form.experience_years} onChange={update} options={OPTIONS.experience_years} placeholder="Select experience" />
        <SkillsSelect value={form.current_skills} onChange={skills => setForm(prev => ({...prev, current_skills: skills}))} />
        <SelectField label="Skill Proficiency" name="skill_proficiency" value={form.skill_proficiency} onChange={update} options={OPTIONS.skill_proficiency} placeholder="Select proficiency" />
        <SelectField label="Current Project / Area" name="current_project_area" value={form.current_project_area} onChange={update} options={OPTIONS.current_project_area} placeholder="Select project / area" />
        <SelectField label="Technology Trend" name="technology_trend" value={form.technology_trend} onChange={update} options={OPTIONS.technology_trend} placeholder="Select technology trend" />
        {error && <div className="error-message">{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="predict-btn" disabled={saving}>{saving ? "Updating AI analysis..." : employee ? "Save Changes & Recalculate" : "Add Employee & Predict"}</button></div>
      </form>
    </div>
  </div>;
}

function HRDashboard({ refreshKey, onOpenEmployee }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [gapFilter, setGapFilter] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const PAGE_SIZE = 10;

  const load = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API}/hr-dashboard`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.detail || "Unable to load HR dashboard.");
      setData(json);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [refreshKey]);
  React.useEffect(() => { setPage(1); }, [search, gapFilter]);

  const handleDeleteEmployee = async () => {
    if (!selectedEmployeeId || deleteLoading) return;
    const employee = employeeRows.find(emp => emp.employee_id === selectedEmployeeId);
    const confirmed = window.confirm(`Are you sure you want to delete employee ${employee?.employee_id || selectedEmployeeId}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${API}/employees/${encodeURIComponent(selectedEmployeeId)}`, { method: "DELETE" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.detail || "Unable to delete employee.");
      setShowDeleteModal(false);
      setSelectedEmployeeId("");
      await load();
    } catch (err) {
      alert(err.message || "Unable to delete employee.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !data) return <section className="hr-view"><div className="panel loading-panel">Loading live workforce analytics...</div></section>;
  if (error && !data) return <section className="hr-view"><div className="panel loading-panel error-text">{error}</div></section>;

  // Use the requested demonstration baseline when the database is empty.
  // Once HR adds employees, the API values become the live metrics automatically.
  const hasLiveEmployees = Array.isArray(data.employees) && data.employees.length > 0;
  const metrics = hasLiveEmployees ? {
    total: data.total_employees, high: data.high_skill_gap, medium: data.medium_skill_gap, low: data.low_skill_gap,
    readiness: data.workforce_readiness
  } : { total: 250, high: 35, medium: 82, low: 133, readiness: 74 };
  const total = metrics.total || 1;
  const highPct = Math.round((metrics.high / total) * 100);
  const mediumPct = Math.round((metrics.medium / total) * 100);
  const lowPct = Math.max(0, 100 - highPct - mediumPct);

  const employeeRows = Array.isArray(data.employees) ? data.employees : [];
  const getGapLevel = (emp) => emp.skill_gaps.length >= 3 ? "High" : emp.skill_gaps.length ? "Medium" : "Low";
  const filteredEmployees = employeeRows.filter(emp => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      emp.employee_id.toLowerCase().includes(q) ||
      emp.job_role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q);
    return matchesSearch && (gapFilter === "All" || getGapLevel(emp) === gapFilter);
  });
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleEmployees = filteredEmployees.slice(startIndex, startIndex + PAGE_SIZE);
  const pageNumbers = Array.from({length: totalPages}, (_, i) => i + 1).slice(
    Math.max(0, safePage - 3), Math.min(totalPages, safePage + 2)
  );

  return <section className="hr-view">
    <div className="view-hero panel"><div><span className="eyebrow">ACCENTURE • HR & LEARNING</span><h2>HR AI Workforce Dashboard</h2><p>Live workforce visibility based on employee records and ML predictions.</p></div><div className="hero-actions"><button className="refresh-btn" onClick={load}><Icon name="refresh" size={15}/> Refresh</button><div className="hero-badge"><Icon name="chart" size={24}/><span>Workforce readiness<strong>{metrics.readiness}%</strong></span></div></div></div>
    <div className="stat-grid">
      {[['Total Employees',metrics.total,'Live workforce population','blue'],['High Skill Gap',metrics.high,'Immediate attention','red'],['Medium Skill Gap',metrics.medium,'Upskilling needed','amber'],['Low Skill Gap',metrics.low,'Future-ready group','green']].map(([title,num,sub,c])=><div className={`stat-card ${c}`} key={title}><span>{title}</span><strong>{num}</strong><small>{sub}</small></div>)}
    </div>
    <div className="hr-grid">
      <section className="panel hr-panel"><div className="section-title"><div><h3>Future Skills in Demand</h3><p>Calculated from current employee predictions</p></div><Icon name="sparkles" size={22}/></div>
        {data.future_skills.length ? <div className="bars">{data.future_skills.map(x=><div className="bar-row" key={x.skill}><span>{x.skill}</span><div><i style={{width:`${x.percentage}%`}}></i></div><b>{x.count}</b></div>)}</div> : <div className="empty-small">Add employee profiles to generate future-skill demand.</div>}
      </section>
      <section className="panel hr-panel"><div className="section-title"><div><h3>Skill Gap Distribution</h3><p>Organisation-wide risk distribution</p></div><Icon name="target" size={22}/></div><div className="donut" style={{background:`conic-gradient(#ff5f70 0 ${highPct}%,#ffb348 ${highPct}% ${highPct+mediumPct}%,#36d98b ${highPct+mediumPct}% 100%)`}}><div><strong>{highPct}%</strong><span>High gap</span></div></div><div className="legend"><span><i className="high-dot"/>High</span><span><i className="med-dot"/>Medium</span><span><i className="low-dot"/>Low</span></div></section>
    </div>
    <section className="panel priority-panel"><div className="section-title"><div><h3>Training Priority Queue</h3><p>Calculated from live skill-gap records</p></div><Icon name="graduation" size={22}/></div><div className="priority-list">{(hasLiveEmployees ? data.training_priority : [{label:"Immediate",range:"0–3 months",employees:35,priority:"High"},{label:"Medium Term",range:"3–6 months",employees:82,priority:"Medium"},{label:"Future",range:"6–12 months",employees:133,priority:"Planned"}]).map((x,i)=><div key={x.label}><b>{x.label}</b><span>{x.range} • {x.employees} employees</span><em className={`priority-${i}`}>{x.priority}</em></div>)}</div></section>
    <section className="panel employee-management"><div className="section-title"><div><h3>Employee Management</h3><p>10 employees per page • Search, filter and edit profiles. AI results recalculate automatically.</p></div><div className="employee-action-buttons"><button className="add-btn" onClick={()=>onOpenEmployee(null)}>＋ Add Employee</button><button className="delete-top-btn" onClick={()=>{setSelectedEmployeeId("");setShowDeleteModal(true);}} disabled={!employeeRows.length}>🗑 Delete Employee</button></div></div>
      {data.employees.length ? <>
        <div className="employee-controls">
          <div className="employee-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee ID, role or department" /></div>
          <select className="gap-filter" value={gapFilter} onChange={e=>setGapFilter(e.target.value)}>
            <option value="All">All Skill Gaps</option><option value="High">High Skill Gap</option><option value="Medium">Medium Skill Gap</option><option value="Low">Low Skill Gap</option>
          </select>
        </div>
        <div className="employee-table"><div className="employee-row employee-head"><span>ID</span><span>Role</span><span>Department</span><span>Readiness</span><span>Gap</span><span>Action</span></div>
          {visibleEmployees.map(emp=><div className="employee-row" key={emp.employee_id}><span className="employee-id">{emp.employee_id}</span><span>{emp.job_role}</span><span>{emp.department}</span><span><b className="readiness-pill">{emp.readiness_score}%</b></span><span><b className={`gap-pill ${getGapLevel(emp).toLowerCase()}`}>{getGapLevel(emp)}</b></span><span><button className="edit-btn" onClick={()=>onOpenEmployee(emp)}>Edit</button></span></div>)}
          {!visibleEmployees.length && <div className="empty-small">No employees match your search or filter.</div>}
        </div>
        <div className="pagination-bar"><span>Showing {filteredEmployees.length ? startIndex + 1 : 0}–{Math.min(startIndex + PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length} employees</span>
          <div className="pagination-buttons"><button type="button" className="page-btn" disabled={safePage===1} onClick={()=>setPage(Math.max(1,safePage-1))}>‹</button>
            {pageNumbers.map(n=><button type="button" key={n} className={`page-btn ${n===safePage?"active":""}`} onClick={()=>setPage(n)}>{n}</button>)}
            <button type="button" className="page-btn" disabled={safePage===totalPages} onClick={()=>setPage(Math.min(totalPages,safePage+1))}>›</button>
          </div>
        </div>
      </> : <div className="empty-small">No employee records yet. Add employee profiles to populate the employee management table. The KPI cards above show the 250-employee demonstration baseline.</div>}
    </section>
    {showDeleteModal && <div className="modal-backdrop" onMouseDown={()=>{if(!deleteLoading)setShowDeleteModal(false);}}>
      <div className="delete-modal panel" onMouseDown={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><span className="eyebrow">HR WORKFORCE MANAGEMENT</span><h2>Delete Employee</h2><p>Select an employee record to remove from the live workforce database.</p></div>
          <button className="icon-btn" onClick={()=>{if(!deleteLoading)setShowDeleteModal(false);}}>×</button>
        </div>
        <label className="field"><span className="field-label">Select Employee<em>*</em></span>
          <select value={selectedEmployeeId} onChange={e=>setSelectedEmployeeId(e.target.value)} disabled={deleteLoading}>
            <option value="">Choose an employee</option>
            {employeeRows.map(emp=><option key={emp.employee_id} value={emp.employee_id}>{emp.employee_id} — {emp.job_role}</option>)}
          </select>
        </label>
        <div className="delete-warning">⚠️ Deleting an employee permanently removes their employee record from Supabase.</div>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>{if(!deleteLoading)setShowDeleteModal(false);}}>Cancel</button><button type="button" className="delete-confirm-btn" disabled={!selectedEmployeeId || deleteLoading} onClick={handleDeleteEmployee}>{deleteLoading ? "Deleting..." : "Delete Employee"}</button></div>
      </div>
    </div>}
  </section>;
}

function ChatAssistant({ messages, input, setInput, onSend, loading }) {
  return <section className="chat-view panel"><div className="chat-header"><div className="heading-icon purple"><Icon name="brain" size={25}/></div><div><h2>AI Work Assistant</h2><p>Technical support, debugging, future skills and workplace learning</p></div><span className="online-dot">● AI Online</span></div><div className="chat-body">{messages.map((m,i)=><div className={`chat-message ${m.role}`} key={i}><div className="chat-avatar"><Icon name={m.role === "bot" ? "brain" : "user"} size={17}/></div><div><span>{m.role === "bot" ? "AI Work Assistant" : "You"}</span><p>{m.text}</p></div></div>)}{loading && <div className="chat-message bot"><div className="chat-avatar"><Icon name="brain" size={17}/></div><div><span>AI Work Assistant</span><p className="typing">Thinking…</p></div></div>}<div className="suggestions"><button onClick={()=>setInput("Why is my Python code giving a KeyError?")}>🐍 Debug Python</button><button onClick={()=>setInput("Help me write a SQL query to find the top 5 customers")}>▣ SQL help</button><button onClick={()=>setInput("What skills should a Data Analyst learn next?")}>✦ Future skills</button><button onClick={()=>setInput("What training should I take for promotion?")}>🎓 Training</button></div></div><div className="chat-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key === "Enter" && onSend()} placeholder="Ask me about code, bugs, SQL, data, skills or training..."/><button onClick={onSend} disabled={loading}><Icon name="arrow" size={18}/></button></div></section>;
}

function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEmployee, setEditingEmployee] = useState(undefined);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: "bot", text: "Hi! I’m your AI Work Assistant. I can help with coding bugs, SQL and data problems, technical concepts, future-skill planning and personalised training." }]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const experienceToNumber = (value) => { if (value.startsWith("0")) return 0; if (value.startsWith("2")) return 2; if (value.startsWith("4")) return 4; if (value.startsWith("7")) return 7; return 10; };

  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.current_skills.length) { setError("Please select at least one current skill."); return; }
    setLoading(true);
    try {
      const payload = { employee_id: form.employee_id.trim(), job_role: form.job_role, department: form.department, experience_years: experienceToNumber(form.experience_years), current_skills: form.current_skills.join(", "), skill_proficiency: form.skill_proficiency, current_project_area: form.current_project_area, technology_trend: form.technology_trend };
      const response = await fetch(`${API}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Prediction failed. Please check that the backend is running.");
      setResult(data); setRefreshKey(k=>k+1);
    } catch (err) { setError(err.message || "Unable to connect to the prediction service."); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm(EMPTY_FORM); setResult(null); setError(""); setView("dashboard"); };
  const readiness = result ? (result.readiness_score ?? Math.max(0, Math.round(100 - (result.skill_gaps.length / Math.max(result.predicted_future_skills.length, 1)) * 100))) : 0;

  const sendChat = async () => {
    const q = chatInput.trim(); if (!q || chatLoading) return;
    setChatMessages(m => [...m, {role:"user", text:q}]); setChatInput(""); setChatLoading(true);
    try {
      const response = await fetch(`${API}/chat`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        message:q,
        employee_id:form.employee_id.trim() || null,
        history: chatMessages.slice(-20)
      })});
      const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Chat request failed.");
      setChatMessages(m => [...m, {role:"bot", text:data.answer, aiEnabled:data.ai_enabled}]);
    } catch (err) { setChatMessages(m => [...m, {role:"bot", text:`I couldn't reach the AI assistant. ${err.message}`}]); }
    finally { setChatLoading(false); }
  };

  const openEmployee = (employee) => setEditingEmployee(employee);
  const savedEmployee = (data) => { setRefreshKey(k=>k+1); if (data.predicted_future_skills) setResult(data); };

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Icon name="brain" size={38}/></div><div><h1>AI FUTURE SKILL PREDICTOR</h1><p>Predict. Prepare. Progress.</p></div></div><button className="new-prediction" onClick={reset}><Icon name="refresh" size={18}/> New Prediction</button></header>
    <div className="workspace"><aside className="sidebar"><nav>{[["home","Dashboard","dashboard"],["chart","HR Dashboard","hr"]].map(([icon,label,target])=><button key={label} className={`nav-item ${view===target?"active":""}`} type="button" onClick={()=>setView(target)}><Icon name={icon} size={21}/><span>{label}</span></button>)}</nav><div className="future-card"><div className="future-stars">✦　✧</div><strong>Level Up Your Future</strong><p>Keep learning and stay ahead in your career journey.</p><div className="rocket">◢</div></div></aside>
      <main className={`content ${view !== "dashboard" ? "single-view" : ""}`}>
        {view === "dashboard" && <><section className="profile-panel panel"><div className="panel-heading"><div className="heading-icon purple"><Icon name="user" size={25}/></div><div><h2>Employee Profile</h2><p>Tell us about yourself</p></div></div><form onSubmit={submit}>
          <label className="field"><span className="field-label">Employee ID<em>*</em></span><input name="employee_id" value={form.employee_id} onChange={handleChange} placeholder="Enter your Employee ID" required /></label>
          <SelectField label="Job Role" name="job_role" value={form.job_role} onChange={handleChange} options={OPTIONS.job_role} placeholder="Select your job role" />
          <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={OPTIONS.department} placeholder="Select department" />
          <SelectField label="Experience (Years)" name="experience_years" value={form.experience_years} onChange={handleChange} options={OPTIONS.experience_years} placeholder="Select years of experience" />
          <SkillsSelect value={form.current_skills} onChange={skills=>setForm(prev=>({...prev,current_skills:skills}))}/>
          <SelectField label="Skill Proficiency" name="skill_proficiency" value={form.skill_proficiency} onChange={handleChange} options={OPTIONS.skill_proficiency} placeholder="Select your proficiency level" />
          <SelectField label="Current Project / Area" name="current_project_area" value={form.current_project_area} onChange={handleChange} options={OPTIONS.current_project_area} placeholder="Select your project / area" />
          <SelectField label="Technology Trend" name="technology_trend" value={form.technology_trend} onChange={handleChange} options={OPTIONS.technology_trend} placeholder="Select technology trend" />
          <button className="predict-btn" disabled={loading}><Icon name="sparkles" size={19}/>{loading ? "Analysing your profile..." : "Predict Skills & Get Recommendations"}</button>
        </form><div className="secure-note"><Icon name="lock" size={14}/> Your data is secure and confidential</div>{error && <div className="error-message">{error}</div>}</section>
        <section className="results-column">{!result ? <EmptyResults/> : <><section className="result-panel panel"><div className="panel-heading compact"><div className="heading-icon purple"><Icon name="brain" size={25}/></div><div><h2>Future Skill Prediction</h2><p>Skills you are likely to need in the future</p></div></div><div className="prediction-grid">{result.predicted_future_skills.map((skill,i)=><div className={`prediction-card c${i%4}`} key={skill}><div className="prediction-symbol"><Icon name={i%2?"chart":"sparkles"} size={30}/></div><strong>{skill}</strong><span>High Demand</span></div>)}</div></section>
          <section className="result-panel panel gap-panel"><div className="panel-heading compact"><div className="heading-icon amber"><span>!</span></div><div><h2>Skill Gap Analysis</h2><p>Skills you need to improve or learn</p></div></div><div className="gap-content"><div className="score-ring" style={{"--score":`${readiness}%`}}><div><strong>{readiness}%</strong><span>Readiness Score</span></div></div><div className="gap-list"><h4>Missing / Gap Skills</h4>{result.skill_gaps.length?result.skill_gaps.map(skill=><div className="gap-item" key={skill}>• <span>{skill}</span></div>):<p className="no-gap">Great! No predicted skill gaps.</p>}</div><div className="target-graphic"><Icon name="target" size={100}/></div></div></section>
          <section className="result-panel panel"><div className="panel-heading compact"><div className="heading-icon purple"><Icon name="graduation" size={25}/></div><div><h2>Recommended Training</h2><p>Personalised courses to bridge your skill gaps</p></div></div><div className="courses">{result.recommendations.map((course,i)=><div className="course-row" key={`${course.skill}-${i}`}><div className={`course-icon c${i%4}`}><Icon name={i%2?"chart":"graduation"} size={22}/></div><div className="course-copy"><strong>{course.course}</strong><span>{course.skill}</span></div><b className={course.priority.toLowerCase().includes("high")?"high":"medium"}>{course.priority} Priority</b><Icon name="arrow" size={19}/></div>)}</div></section></>}</section></>}
        {view === "hr" && <HRDashboard refreshKey={refreshKey} onOpenEmployee={openEmployee}/>} 
        {view === "chat" && <ChatAssistant messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={sendChat} loading={chatLoading}/>} 
      </main>
    </div>
    <footer>Built with <span>♥</span> using React, FastAPI, Machine Learning & PostgreSQL</footer>
    {editingEmployee !== undefined && <EmployeeEditor employee={editingEmployee} onClose={()=>setEditingEmployee(undefined)} onSaved={savedEmployee}/>} 
  </div>;
}

createRoot(document.getElementById("root")).render(<App/>);
