import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import styles from './AdminPage.module.css';
import {
  ArrowLeft, LogOut, Users, Briefcase, Zap,
  CheckCircle, XCircle, Plus, Pencil, Trash2, Save, X, LayoutTemplate,
  AlertCircle
} from 'lucide-react';

// ─── Skill Row (inline edit) ──────────────────────────────────────────────────
const SkillRow = ({ skill, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(skill.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name === skill.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await onUpdate(skill.id, name.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setName(skill.name); setEditing(false); };

  return (
    <tr>
      <td>
        {editing ? (
          <input
            className={styles.editInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            autoFocus
          />
        ) : (
          skill.name
        )}
      </td>
      <td>
        <span className={styles.usedByBadge}>
          <Users size={11} /> {skill.usedBy} {skill.usedBy === 1 ? 'profile' : 'profiles'}
        </span>
      </td>
      <td>
        <div className={styles.actionBtns}>
          {editing ? (
            <>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                <Save size={13} /> Save
              </button>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                <X size={13} />
              </button>
            </>
          ) : (
            <>
              <button className={styles.editBtn} onClick={() => setEditing(true)}>
                <Pencil size={13} /> Edit
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  if (window.confirm(`Delete "${skill.name}"? This will remove it from all profiles.`)) {
                    onDelete(skill.id);
                  }
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Admin Page ───────────────────────────────────────────────────────────────
const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [addError, setAddError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, skillsRes, usersRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/skills'),
          API.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setSkills(skillsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await API.post('/admin/skills', { name: newSkillName.trim() });
      setSkills([...skills, { ...res.data, usedBy: 0 }]);
      setNewSkillName('');
      setStats(s => ({ ...s, totalSkills: s.totalSkills + 1 }));
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add skill.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateSkill = async (id, name) => {
    setGeneralError('');
    try {
      const res = await API.put(`/admin/skills/${id}`, { name });
      setSkills(skills.map(s => s.id === id ? { ...s, name: res.data.name } : s));
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to update skill.');
    }
  };

  const handleDeleteSkill = async (id) => {
    setGeneralError('');
    try {
      await API.delete(`/admin/skills/${id}`);
      setSkills(skills.filter(s => s.id !== id));
      setStats(s => ({ ...s, totalSkills: s.totalSkills - 1 }));
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to delete skill.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className={styles.loadingScreen}>Loading admin panel...</div>;

  return (
    <div className={styles.pageContainer}>
      {/* ── Nav */}
      <nav className={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 className={styles.logo}>CV Genie</h2>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Admin Panel</h1>
        <p className={styles.pageSubtitle}>Manage users, skills, and platform statistics.</p>

        {/* ── Stats Grid */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Users size={18} /></div>
              <span className={styles.statValue}>{stats.totalUsers}</span>
              <span className={styles.statLabel}>Total Users</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircle size={18} /></div>
              <span className={styles.statValue}>{stats.completeProfiles}</span>
              <span className={styles.statLabel}>Complete Profiles</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><XCircle size={18} /></div>
              <span className={styles.statValue}>{stats.incompleteProfiles}</span>
              <span className={styles.statLabel}>Incomplete Profiles</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Zap size={18} /></div>
              <span className={styles.statValue}>{stats.totalSkills}</span>
              <span className={styles.statLabel}>Total Skills</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Briefcase size={18} /></div>
              <span className={styles.statValue}>{stats.totalProjects}</span>
              <span className={styles.statLabel}>Total Projects</span>
            </div>
          </div>
        )}

        {generalError && (
          <div className={styles.generalError}>
            <AlertCircle size={16} /> {generalError}
            <button onClick={() => setGeneralError('')} className={styles.dismissBtn}>Dismiss</button>
          </div>
        )}

        {/* ── Skills Management */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Zap size={16} /></span>
              Skills Management
            </h2>
          </div>

          {addError && <div className={styles.errorMsg}>{addError}</div>}
          <div className={styles.addSkillRow}>
            <input
              className={styles.addSkillInput}
              value={newSkillName}
              onChange={(e) => { setNewSkillName(e.target.value); setAddError(''); }}
              placeholder="New skill name (e.g. React, AutoCAD)"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <button className={styles.addBtn} onClick={handleAddSkill} disabled={adding || !newSkillName.trim()}>
              <Plus size={16} /> {adding ? 'Adding...' : 'Add Skill'}
            </button>
          </div>

          {skills.length === 0 ? (
            <p className={styles.emptyState}>No skills added yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Used By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(skill => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    onUpdate={handleUpdateSkill}
                    onDelete={handleDeleteSkill}
                  />
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Users Table */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Users size={16} /></span>
              All Users
            </h2>
          </div>

          {users.length === 0 ? (
            <p className={styles.emptyState}>No users found.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Title</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.profiles?.full_name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{u.profiles?.job_title || '—'}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleStaff}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={() => navigate(`/cv-builder?userId=${u.id}`)}
                        title="Build CV for this user"
                      >
                        <LayoutTemplate size={13} /> Build CV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
