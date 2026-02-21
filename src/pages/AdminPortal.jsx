import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { key: "users", label: "Users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "colleges", label: "Colleges", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { key: "programs", label: "Academic Programs", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0V6" },
  { key: "events", label: "Events", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

// College/major names for Add User dropdowns (populated from API)

function AdminPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [colleges, setColleges] = useState([]);
  const [majors, setMajors] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminColleges, setAdminColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [collegePrograms, setCollegePrograms] = useState([]);
  const [selectedCollegeForPrograms, setSelectedCollegeForPrograms] = useState(null);
  const [collegeForm, setCollegeForm] = useState(null);
  const [programForm, setProgramForm] = useState(null);
  const [collegeError, setCollegeError] = useState("");
  const [collegeSuccess, setCollegeSuccess] = useState("");
  const [programError, setProgramError] = useState("");
  const [programSuccess, setProgramSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    student_number: "", college: "", major: "", phone: "", email: "", role: "student",
    new_password: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      if (!u || u.role !== "admin") { navigate("/login", { replace: true }); return; }
      setUser(u);
    } catch { navigate("/login", { replace: true }); }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [c, m, e, u, adminC] = await Promise.all([
          fetch("/api/colleges").then(r => r.json()),
          fetch("/api/majors").then(r => r.json()),
          fetch("/api/events").then(r => r.json()),
          fetch("/api/admin/users").then(r => r.json()),
          fetch("/api/admin/colleges").then(r => r.json()),
        ]);
        setColleges(c); setMajors(m); setEvents(e); setUsers(u); setAdminColleges(adminC);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!selectedCollegeForPrograms) { setCollegePrograms([]); return; }
    fetch(`/api/admin/colleges/${selectedCollegeForPrograms.id}/programs`)
      .then((r) => r.json())
      .then(setCollegePrograms)
      .catch(() => setCollegePrograms([]));
  }, [selectedCollegeForPrograms]);

  const refreshAdminColleges = () => {
    fetch("/api/admin/colleges").then((r) => r.json()).then(setAdminColleges);
    fetch("/api/colleges").then((r) => r.json()).then(setColleges);
    fetch("/api/majors").then((r) => r.json()).then(setMajors);
  };

  const refreshCollegePrograms = () => {
    if (selectedCollegeForPrograms) {
      fetch(`/api/admin/colleges/${selectedCollegeForPrograms.id}/programs`).then((r) => r.json()).then(setCollegePrograms);
    }
    fetch("/api/majors").then((r) => r.json()).then(setMajors);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    setCollegeError(""); setCollegeSuccess("");
    const c = collegeForm;
    if (!c.name?.trim() || !c.short_name?.trim() || !c.slug?.trim()) {
      setCollegeError("Name, short name, and slug are required.");
      return;
    }
    try {
      const url = c.id ? `/api/admin/colleges/${c.id}` : "/api/admin/colleges";
      const method = c.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
      const data = await res.json();
      if (!res.ok) { setCollegeError(data.error || "Failed"); return; }
      setCollegeSuccess(c.id ? "College updated." : "College created.");
      setCollegeForm(null);
      refreshAdminColleges();
    } catch { setCollegeError("Request failed."); }
  };

  const handleDeleteCollege = async (college) => {
    if (!confirm(`Delete "${college.name}" and all its programs?`)) return;
    try {
      const res = await fetch(`/api/admin/colleges/${college.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setCollegeError(data.error || "Failed"); return; }
      setSelectedCollegeForPrograms(null);
      setCollegeForm(null);
      refreshAdminColleges();
    } catch { setCollegeError("Request failed."); }
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    setProgramError(""); setProgramSuccess("");
    const p = programForm;
    if (!p.name?.trim()) { setProgramError("Program name is required."); return; }
    const collegeId = p.college_id ?? selectedCollegeForPrograms?.id;
    if (!collegeId) { setProgramError("No college selected."); return; }
    try {
      const url = p.id ? `/api/admin/programs/${p.id}` : `/api/admin/colleges/${collegeId}/programs`;
      const method = p.id ? "PUT" : "POST";
      const body = p.id ? { ...p } : { name: p.name, slug: p.slug, credits: p.credits, duration: p.duration, description: p.description, department: p.department, required_gpa: p.required_gpa, high_school_track: p.high_school_track, degree_type: p.degree_type, about_text: p.about_text, image_url: p.image_url, degree_level: p.degree_level };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setProgramError(data.error || "Failed"); return; }
      setProgramSuccess(p.id ? "Program updated." : "Program added.");
      setProgramForm(null);
      refreshCollegePrograms();
    } catch { setProgramError("Request failed."); }
  };

  const handleDeleteProgram = async (program) => {
    if (!confirm(`Delete "${program.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setProgramError(data.error || "Failed"); return; }
      setProgramForm(null);
      refreshCollegePrograms();
    } catch { setProgramError("Request failed."); }
  };

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login", { replace: true }); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "college") updated.major = "";
      return updated;
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    if (!form.first_name || !form.last_name || !form.student_number || !form.email) {
      setFormError("First name, last name, student number, and email are required.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data;
      try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) {
        const msg = data.error || `Failed to create user (${res.status}).`;
        const detail = res.status === 404 && data.path ? ` Backend got: ${data.method} ${data.path}` : '';
        setFormError(msg + detail);
        return;
      }
      setFormSuccess(`User ${data.email} created as ${data.role}. Default password is their student number.`);
      setForm({ first_name: "", middle_name: "", last_name: "", student_number: "", college: "", major: "", phone: "", email: "", role: "student", new_password: "" });
      const u = await fetch("/api/admin/users").then(r => r.json());
      setUsers(u);
    } catch (e) {
      setFormError(e?.message || "Failed to create user. Check that the backend is running and the database is reachable.");
    }
    finally { setFormLoading(false); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setFormError(""); setFormSuccess("");
    if (!form.first_name || !form.last_name || !form.student_number || !form.email) {
      setFormError("First name, last name, student number, and email are required.");
      return;
    }
    setFormLoading(true);
    try {
      const body = { first_name: form.first_name, middle_name: form.middle_name, last_name: form.last_name, student_number: form.student_number, college: form.college || null, major: form.major || null, phone: form.phone || null, email: form.email, role: form.role };
      if (form.new_password && form.new_password.trim()) body.new_password = form.new_password.trim();
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Failed to update user.");
        return;
      }
      setFormSuccess("User updated.");
      setEditUser(null);
      setForm({ first_name: "", middle_name: "", last_name: "", student_number: "", college: "", major: "", phone: "", email: "", role: "student", new_password: "" });
      const u = await fetch("/api/admin/users").then(r => r.json());
      setUsers(u);
    } catch (e) {
      setFormError(e?.message || "Failed to update user.");
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading…</p></div>;

  const availableMajors = form.college ? majors.filter((m) => m.college_name === form.college).map((m) => m.name) : [];
  const collegesList = adminColleges.map((c) => c.name);

  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-[#0b1e3d] text-white flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-white/10" aria-label="Toggle sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {SIDEBAR_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                activeTab === key ? "bg-blue-600 text-white font-semibold" : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
              title={label}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
              </svg>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab.replace("-", " ")}</h1>
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Users", count: users.length, color: "bg-blue-600" },
                { label: "Colleges", count: colleges.length, color: "bg-emerald-600" },
                { label: "Majors", count: majors.length, color: "bg-amber-600" },
                { label: "Events", count: events.length, color: "bg-purple-600" },
              ].map(({ label, count, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>{count}</div>
                  <div><p className="text-sm text-gray-500">Total</p><p className="text-lg font-semibold text-gray-900">{label}</p></div>
                </div>
              ))}
            </div>
          )}

          {/* Users list */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>}
              {formSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{formSuccess}</div>}

              {editUser && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Edit User — full control</h3>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input name="first_name" value={form.first_name} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                        <input name="middle_name" value={form.middle_name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input name="last_name" value={form.last_name} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Number *</label>
                        <input name="student_number" value={form.student_number} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                        <select name="college" value={form.college} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                          <option value="">Select college…</option>
                          {collegesList.map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Program</label>
                        <select name="major" value={form.major} onChange={handleFormChange} disabled={!form.college} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:opacity-50">
                          <option value="">Select program…</option>
                          {availableMajors.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select name="role" value={form.role} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New password (optional)</label>
                      <input name="new_password" type="password" value={form.new_password} onChange={handleFormChange} placeholder="Leave blank to keep current" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm">Save changes</button>
                      <button type="button" onClick={() => { setEditUser(null); setFormError(""); setFormSuccess(""); setForm({ first_name: "", middle_name: "", last_name: "", student_number: "", college: "", major: "", phone: "", email: "", role: "student", new_password: "" }); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">All Users</h3>
                  <button onClick={() => { setFormError(""); setFormSuccess(""); setActiveTab("add-user"); }} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add Student</button>
                </div>
                {loading ? <p className="p-6 text-gray-500">Loading…</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Student #</th>
                          <th className="px-4 py-3">College</th>
                          <th className="px-4 py-3">Major</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{[u.first_name, u.middle_name, u.last_name].filter(Boolean).join(" ") || u.email}</td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3 text-gray-600">{u.student_number || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{u.college || "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{u.major || "—"}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{u.role}</span></td>
                            <td className="px-4 py-3">
                              <button type="button" onClick={() => { setFormError(""); setFormSuccess(""); setEditUser(u); setForm({ first_name: u.first_name || "", middle_name: u.middle_name || "", last_name: u.last_name || "", student_number: u.student_number || "", college: u.college || "", major: u.major || "", phone: u.phone || "", email: u.email, role: u.role || "student", new_password: "" }); }} className="text-blue-600 hover:underline text-sm">Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Student (reached from Users section) */}
          {activeTab === "add-user" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Student</h3>
              <p className="text-sm text-gray-500 mb-6">The student's university email will be their login. Their student number will be the default password (they must change it on first login).</p>

              {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>}
              {formSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{formSuccess}</div>}

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input name="first_name" value={form.first_name} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <input name="middle_name" value={form.middle_name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input name="last_name" value={form.last_name} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Number *</label>
                    <input name="student_number" value={form.student_number} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. 12210123" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleFormChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="student@stu.najah.edu" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                    <select name="college" value={form.college} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                      <option value="">Select college…</option>
                      {collegesList.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Program</label>
                    <select name="major" value={form.major} onChange={handleFormChange} disabled={!form.college} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:opacity-50">
                      <option value="">Select program…</option>
                      {availableMajors.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select name="role" value={form.role} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="+970 59 xxx xxxx" />
                  </div>
                </div>

                <div className="bg-gray-50 -mx-6 -mb-6 mt-6 px-6 py-4 rounded-b-xl border-t border-gray-200 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Default password = student number. Must change on first login.</p>
                  <button type="submit" disabled={formLoading} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm">
                    {formLoading ? "Creating…" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Academic Programs — select college, then full control on each program */}
          {activeTab === "programs" && (
            <div className="space-y-6">
              {programError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{programError}</div>}
              {programSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{programSuccess}</div>}

              {!selectedCollegeForPrograms ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Add Academic Programs</h3>
                  <p className="text-sm text-gray-600 mb-4">Select the college for which you want to add or edit academic programs. You will have full control over each program profile (name, image, credits, duration, description, department, GPA, and more).</p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select college</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : null;
                      const c = id ? adminColleges.find((col) => col.id === id) : null;
                      setSelectedCollegeForPrograms(c || null);
                      setProgramForm(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">— Choose a college —</option>
                    {adminColleges.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="text-sm font-medium text-gray-700">College:</label>
                      <select
                        value={selectedCollegeForPrograms.id}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const c = adminColleges.find((col) => col.id === id);
                          if (c) { setSelectedCollegeForPrograms(c); setProgramForm(null); }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-900"
                      >
                        {adminColleges.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <span className="text-gray-500 text-sm">({collegePrograms.length} programs)</span>
                    </div>
                    <button type="button" onClick={() => { setProgramError(""); setProgramSuccess(""); setProgramForm({ name: "", slug: "", credits: "", duration: "4 Years", description: "", department: "", required_gpa: "", high_school_track: "", degree_type: "B.Sc", about_text: "", image_url: "", degree_level: "UNDERGRADUATE" }); }} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add Program</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                        <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Slug</th><th className="px-6 py-3">Credits</th><th className="px-6 py-3">Duration</th><th className="px-6 py-3">Degree level</th><th className="px-6 py-3">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {collegePrograms.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                            <td className="px-6 py-3 text-gray-600">{p.slug}</td>
                            <td className="px-6 py-3 text-gray-600">{p.credits ?? "—"}</td>
                            <td className="px-6 py-3 text-gray-600">{p.duration ?? "—"}</td>
                            <td className="px-6 py-3 text-gray-600">{p.degree_level || "—"}</td>
                            <td className="px-6 py-3"><button type="button" onClick={() => setProgramForm({ ...p })} className="text-blue-600 hover:underline text-sm">Edit</button><button type="button" onClick={() => handleDeleteProgram(p)} className="ml-3 text-red-600 hover:underline text-sm">Delete</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {programForm && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-3">{programForm.id ? "Edit program profile" : "Add program"}</h4>
                      <form onSubmit={handleSaveProgram} className="space-y-3 max-w-2xl">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Program name *</label><input value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input value={programForm.slug || ""} onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })} placeholder="e.g. computer-science" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Program card image URL</label><input value={programForm.image_url || ""} onChange={(e) => setProgramForm({ ...programForm, image_url: e.target.value })} placeholder="https://… or /majors/computer-science.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Credits</label><input type="number" value={programForm.credits ?? ""} onChange={(e) => setProgramForm({ ...programForm, credits: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration</label><input value={programForm.duration || ""} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} placeholder="4 Years" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Degree level (card label)</label><select value={programForm.degree_level || "UNDERGRADUATE"} onChange={(e) => setProgramForm({ ...programForm, degree_level: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="UNDERGRADUATE">Undergraduate</option><option value="GRADUATE">Graduate</option><option value="POSTGRADUATE">Postgraduate</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Short description</label><textarea value={programForm.description || ""} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input value={programForm.department || ""} onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Required GPA</label><input value={programForm.required_gpa || ""} onChange={(e) => setProgramForm({ ...programForm, required_gpa: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">High school track</label><input value={programForm.high_school_track || ""} onChange={(e) => setProgramForm({ ...programForm, high_school_track: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Degree type</label><input value={programForm.degree_type || ""} onChange={(e) => setProgramForm({ ...programForm, degree_type: e.target.value })} placeholder="B.Sc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">About (full text for program page)</label><textarea value={programForm.about_text || ""} onChange={(e) => setProgramForm({ ...programForm, about_text: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button><button type="button" onClick={() => setProgramForm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button></div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Colleges */}
          {activeTab === "colleges" && (
            <div className="space-y-6">
              {collegeError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{collegeError}</div>}
              {collegeSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{collegeSuccess}</div>}

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Colleges ({adminColleges.length})</h3>
                      <button type="button" onClick={() => { setCollegeError(""); setCollegeSuccess(""); setCollegeForm({ name: "", short_name: "", slug: "", tagline: "", description: "", badge_1_label: "", badge_1_icon: "check", badge_2_label: "", badge_2_icon: "users", stat_1: "", stat_2: "", stat_3: "", stat_4: "", image_url: "" }); }} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Add College</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                          <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Short name</th><th className="px-6 py-3">Slug</th><th className="px-6 py-3">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {adminColleges.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                              <td className="px-6 py-3 text-gray-600">{c.short_name}</td>
                              <td className="px-6 py-3 text-gray-600">{c.slug}</td>
                              <td className="px-6 py-3 flex items-center gap-2">
                                <button type="button" onClick={() => setCollegeForm({ ...c })} className="text-blue-600 hover:underline text-sm">Edit</button>
                                <button type="button" onClick={() => handleDeleteCollege(c)} className="text-red-600 hover:underline text-sm">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {collegeForm && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{collegeForm.id ? "Edit College" : "Add College"}</h3>
                      <form onSubmit={handleSaveCollege} className="space-y-4 max-w-2xl">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={collegeForm.name} onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Short name *</label><input value={collegeForm.short_name} onChange={(e) => setCollegeForm({ ...collegeForm, short_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label><input value={collegeForm.slug} onChange={(e) => setCollegeForm({ ...collegeForm, slug: e.target.value })} placeholder="e.g. engineering-it" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label><input value={collegeForm.tagline || ""} onChange={(e) => setCollegeForm({ ...collegeForm, tagline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={collegeForm.description || ""} onChange={(e) => setCollegeForm({ ...collegeForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Hero / cover image URL</label><input value={collegeForm.image_url || ""} onChange={(e) => setCollegeForm({ ...collegeForm, image_url: e.target.value })} placeholder="https://… or /images/college.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge 1 label</label><input value={collegeForm.badge_1_label || ""} onChange={(e) => setCollegeForm({ ...collegeForm, badge_1_label: e.target.value })} placeholder="e.g. ABET Accredited" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge 1 icon</label><select value={collegeForm.badge_1_icon || "check"} onChange={(e) => setCollegeForm({ ...collegeForm, badge_1_icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="check">Shield / check</option><option value="users">Users</option></select></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge 2 label</label><input value={collegeForm.badge_2_label || ""} onChange={(e) => setCollegeForm({ ...collegeForm, badge_2_label: e.target.value })} placeholder="e.g. 4,500+ Students" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                          <div><label className="block text-sm font-medium text-gray-700 mb-1">Badge 2 icon</label><select value={collegeForm.badge_2_icon || "users"} onChange={(e) => setCollegeForm({ ...collegeForm, badge_2_icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="check">Shield / check</option><option value="users">Users</option></select></div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {["stat_1", "stat_2", "stat_3", "stat_4"].map((key, i) => (<div key={key}><label className="block text-sm font-medium text-gray-700 mb-1">Stat {i + 1}</label><input value={collegeForm[key] || ""} onChange={(e) => setCollegeForm({ ...collegeForm, [key]: e.target.value })} placeholder="e.g. 98% EMPLOYMENT RATE" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>))}
                        </div>
                        <div className="flex gap-2"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button><button type="button" onClick={() => setCollegeForm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button></div>
                      </form>
                    </div>
                  )}
            </div>
          )}

          {/* Events */}
          {activeTab === "events" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Events ({events.length})</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-xs">
                    <tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Date & Time</th><th className="px-6 py-3">Location</th><th className="px-6 py-3">Tag</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((ev) => (<tr key={ev.id} className="hover:bg-gray-50"><td className="px-6 py-3 font-medium text-gray-900">{ev.title}</td><td className="px-6 py-3 text-gray-600">{ev.date} · {ev.time}</td><td className="px-6 py-3 text-gray-600">{ev.location}</td><td className="px-6 py-3 text-gray-600">{ev.tag}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPortal;
