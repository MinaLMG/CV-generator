import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import styles from './ProfileEditPage.module.css';
import {
  ArrowLeft, LogOut, Plus, X, Pencil, Trash2,
  Briefcase, Zap, AlertCircle, User as UserIcon, Camera, Save
} from 'lucide-react';

// ─── Project Modal ────────────────────────────────────────────────────────────
const ProjectModal = ({ project, onSave, onClose }) => {
  const [form, setForm] = useState(
    project || {
      name: '', client: '', location: '', role: '',
      description: '', contributions: '',
      start_date: '', end_date: '', technologies_used: []
    }
  );
  const [isCurrent, setIsCurrent] = useState(project ? !project.end_date : false);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleIsCurrentChange = (e) => {
    const checked = e.target.checked;
    setIsCurrent(checked);
    if (checked) {
      setForm({ ...form, end_date: '' });
    }
  };

  const addTech = () => {
    if (!techInput.trim()) return;
    setForm({ ...form, technologies_used: [...(form.technologies_used || []), techInput.trim()] });
    setTechInput('');
  };

  const removeTech = (tech) =>
    setForm({ ...form, technologies_used: form.technologies_used.filter((t) => t !== tech) });

  const handleSave = async () => {
    if (!form.name || !form.role) { setError('Project name and role are required.'); return; }
    if (!isCurrent && form.start_date && form.end_date) {
      if (new Date(form.start_date) > new Date(form.end_date)) {
        setError('Start date must be before end date.');
        return;
      }
    }
    setSaving(true);
    setError('');
    
    // Prepare payload
    const payload = { ...form };
    if (isCurrent) {
      payload.end_date = null;
    }

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>{project ? 'Edit Project' : 'Add New Project'}</h3>
        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Project Name *</label>
            <input className={styles.formInput} name="name" value={form.name} onChange={handleChange} placeholder="e.g. CRM Platform" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Role *</label>
            <input className={styles.formInput} name="role" value={form.role} onChange={handleChange} placeholder="e.g. Lead Developer" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Client</label>
            <input className={styles.formInput} name="client" value={form.client} onChange={handleChange} placeholder="e.g. ACME Corp" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Location</label>
            <input className={styles.formInput} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Cairo, Egypt" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Start Date</label>
            <input className={styles.formInput} type="date" name="start_date" value={form.start_date?.split('T')[0] || ''} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.formLabel}>End Date</label>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b' }}>
                <input type="checkbox" checked={isCurrent} onChange={handleIsCurrentChange} />
                Present
              </label>
            </div>
            <input className={styles.formInput} type="date" name="end_date" value={form.end_date?.split('T')[0] || ''} onChange={handleChange} disabled={isCurrent} />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formTextarea} name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the project..." />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Your Contributions</label>
            <textarea className={styles.formTextarea} name="contributions" value={form.contributions} onChange={handleChange} placeholder="What specifically did you do?" />
          </div>
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>Technologies Used</label>
            <div className={styles.addSkillRow}>
              <input
                className={styles.addSkillInput} value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. React"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              />
              <button type="button" className={styles.addSkillBtn} onClick={addTech}>Add</button>
            </div>
            <div className={styles.techTags} style={{ marginTop: '0.75rem' }}>
              {(form.technologies_used || []).map((t) => (
                <span key={t} className={styles.techTag}>
                  {t}
                  <button type="button" className={styles.removeSkillBtn} onClick={() => removeTech(t)}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Skill Modal ──────────────────────────────────────────────────────────
const AddSkillModal = ({ onAdd, onClose, existingSkillIds }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [proficiency, setProficiency] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/skills').then(res => {
      setAllSkills(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = allSkills
    .filter(s => !existingSkillIds.includes(s.id))
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const noMatch = !loading && search.trim().length > 0 && filtered.length === 0;

  const handleAdd = async () => {
    if (!selectedSkill) return;
    setSaving(true);
    setError('');
    try {
      await API.post('/skills/profile', { skillId: selectedSkill.id, proficiency });
      onAdd();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Add a Skill</h3>
        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Search Skills</label>
          <input
            className={styles.formInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedSkill(null); }}
            placeholder="Type to filter skills..."
            autoFocus
          />
        </div>

        {/* Search Results */}
        {!loading && search.trim() && filtered.length > 0 && (
          <div className={styles.skillDropdown}>
            {filtered.slice(0, 7).map(s => (
              <div
                key={s.id}
                className={`${styles.skillDropdownItem} ${selectedSkill?.id === s.id ? styles.selected : ''}`}
                onClick={() => setSelectedSkill(s)}
              >
                {s.name}
              </div>
            ))}
          </div>
        )}

        {/* Show all ungrouped when no search */}
        {!loading && !search.trim() && (
          <div className={styles.skillDropdown} style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {allSkills.filter(s => !existingSkillIds.includes(s.id)).map(s => (
              <div
                key={s.id}
                className={`${styles.skillDropdownItem} ${selectedSkill?.id === s.id ? styles.selected : ''}`}
                onClick={() => setSelectedSkill(s)}
              >
                {s.name}
              </div>
            ))}
          </div>
        )}

        {/* No match hint */}
        {noMatch && (
          <p className={styles.newSkillHint}>
            No skill found matching <strong>"{search}"</strong>. Please ask your admin to add it.
          </p>
        )}

        {/* Proficiency Slider — only shown after selecting */}
        {selectedSkill && (
          <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
            <label className={styles.formLabel}>
              Proficiency for <strong style={{ color: '#a5b4fc' }}>{selectedSkill.name}</strong> —{' '}
              <span style={{ color: '#818cf8', fontWeight: 700 }}>{proficiency}%</span>
            </label>
            <input
              type="range" min="1" max="100"
              value={proficiency}
              onChange={(e) => setProficiency(Number(e.target.value))}
              className={styles.proficiencySlider}
            />
            <div className={styles.sliderLabels}>
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>
        )}

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={handleAdd}
            disabled={!selectedSkill || saving}
          >
            {saving ? 'Adding...' : 'Add Skill'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Main Profile Edit Page ───────────────────────────────────────────────────
const ProfileEditPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileDetails, setProfileDetails] = useState({
    job_title: '',
    experience_summary: '',
    experience_years: 0,
    phone: '',
    current_email: '',
    github_url: '',
    linkedin_url: '',
    photo_url: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projectModal, setProjectModal] = useState(null);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const loadData = async () => {
    try {
      const [profileRes, statusRes] = await Promise.all([
        API.get('/profile/me'),
        API.get('/profile/status')
      ]);
      
      const { projects: pData, skills: sData, ...details } = profileRes.data;
      setProjects(pData || []);
      setSkills(sData || []);
      setProfileDetails({
        job_title: details.job_title || '',
        experience_summary: details.experience_summary || '',
        experience_years: details.experience_years || 0,
        phone: details.phone || '',
        current_email: details.current_email || '',
        github_url: details.github_url || '',
        linkedin_url: details.linkedin_url || '',
        photo_url: details.photo_url || ''
      });
      setIsComplete(statusRes.data.isComplete);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleProfileChange = (e) => {
    setProfileDetails({ ...profileDetails, [e.target.name]: e.target.value });
  };

  const saveProfileDetails = async () => {
    setProfileSaving(true);
    try {
      await API.put('/profile/me', profileDetails);
    } catch (err) {
      console.error('Failed to save profile details', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await API.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileDetails(prev => ({ ...prev, photo_url: res.data.photo_url }));
    } catch (err) {
      console.error('Failed to upload photo', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // ── Skills
  const handleRemoveSkill = async (skillId) => {
    try {
      await API.delete(`/skills/profile/${skillId}`);
      setSkills(skills.filter((s) => s.id !== skillId));
      const statusRes = await API.get('/profile/status');
      setIsComplete(statusRes.data.isComplete);
    } catch (err) { console.error(err); }
  };

  const handleUpdateProficiency = async (skillId, proficiency) => {
    try {
      await API.patch(`/skills/profile/${skillId}`, { proficiency });
      setSkills(skills.map(s => s.id === skillId ? { ...s, proficiency } : s));
    } catch (err) { console.error(err); }
  };

  // ── Projects
  const handleSaveProject = async (form) => {
    if (form.id) {
      const res = await API.put(`/projects/${form.id}`, form);
      setProjects(projects.map((p) => (p.id === form.id ? res.data : p)));
    } else {
      const res = await API.post('/projects', form);
      setProjects([res.data, ...projects]);
    }
    const statusRes = await API.get('/profile/status');
    setIsComplete(statusRes.data.isComplete);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
      const statusRes = await API.get('/profile/status');
      setIsComplete(statusRes.data.isComplete);
    } catch (err) { console.error(err); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const getProficiencyLabel = (val) => {
    if (!val) return null;
    if (val < 34) return 'Beginner';
    if (val < 67) return 'Intermediate';
    return 'Expert';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* ── Nav */}
      <nav className={styles.nav}>
        <h2 className={styles.logo}>CV Genie</h2>
        <div className={styles.navActions}>
          <button className={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          {!isComplete && (
            <div className={styles.incompleteAlert}>
              <AlertCircle size={18} />
              Your profile is incomplete. Add at least one skill and one project to continue.
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className={styles.pageTitle}>Edit My Profile</h1>
              <p className={styles.pageSubtitle}>Manage your skills and project experience for your CVs.</p>
            </div>
            {isComplete && (
              <button className={styles.saveBtn} onClick={() => navigate('/cv-builder')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#22c55e' }}>
                Preview & Save CV <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
          </div>
        </div>

        {/* ── Personal Info Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><UserIcon size={18} /></span>
              Personal & Contact Information
            </h2>
            <button className={styles.saveBtn} style={{ padding: '0.5rem 1rem' }} onClick={saveProfileDetails} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : <><Save size={14} style={{ marginRight: '0.3rem' }} /> Save Info</>}
            </button>
          </div>

          <div className={styles.personalInfoLayout}>
            <div className={styles.photoUploadContainer}>
              <div className={styles.photoPreviewWrapper}>
                {profileDetails.photo_url ? (
                  <img src={profileDetails.photo_url} alt="Profile" className={styles.photoImage} />
                ) : (
                  <div className={styles.photoPlaceholder}><UserIcon size={40} /></div>
                )}
                {photoUploading && <div className={styles.photoLoadingOverlay}>Uploading...</div>}
                <label className={styles.photoUploadBtn}>
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={photoUploading} />
                </label>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>1:1 Aspect Ratio</span>
            </div>

            <div className={styles.formGrid} style={{ flex: 1 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Title</label>
                <input className={styles.formInput} name="job_title" value={profileDetails.job_title} onChange={handleProfileChange} placeholder="e.g. Senior Developer" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Years of Experience</label>
                <input className={styles.formInput} name="experience_years" type="number" min="0" value={profileDetails.experience_years} onChange={handleProfileChange} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Email (for CV)</label>
                <input className={styles.formInput} name="current_email" value={profileDetails.current_email} onChange={handleProfileChange} placeholder="e.g. john@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input className={styles.formInput} name="phone" value={profileDetails.phone} onChange={handleProfileChange} placeholder="e.g. +1 234 567 890" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>LinkedIn Profile URL</label>
                <input className={styles.formInput} name="linkedin_url" value={profileDetails.linkedin_url} onChange={handleProfileChange} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GitHub Profile URL</label>
                <input className={styles.formInput} name="github_url" value={profileDetails.github_url} onChange={handleProfileChange} placeholder="https://github.com/username" />
              </div>
              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>Professional Summary</label>
                <textarea className={styles.formTextarea} name="experience_summary" value={profileDetails.experience_summary} onChange={handleProfileChange} placeholder="Brief summary of your professional background..." />
              </div>
            </div>
          </div>
        </section>

        {/* ── Skills Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Zap size={18} /></span>
              Skills
              {skills.length > 0 && (
                <span className={styles.countBadge}>{skills.length}</span>
              )}
            </h2>
            <button className={styles.addBtn} onClick={() => setShowSkillModal(true)}>
              <Plus size={16} /> Add Skill
            </button>
          </div>

          {skills.length === 0 ? (
            <p className={styles.emptyState}>No skills added yet.</p>
          ) : (
            <div className={styles.skillsList}>
              {skills.map((s) => (
                <div key={s.id} className={styles.skillRow}>
                  <div className={styles.skillRowTop}>
                    <span className={styles.skillName}>{s.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {s.proficiency && (
                        <span className={styles.proficiencyBadge}>
                          {s.proficiency}% · {getProficiencyLabel(s.proficiency)}
                        </span>
                      )}
                      <button className={styles.removeSkillBtn} onClick={() => handleRemoveSkill(s.id)}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Inline proficiency slider */}
                  <div className={styles.inlineSliderRow}>
                    <input
                      type="range" min="1" max="100"
                      value={s.proficiency || 50}
                      onChange={(e) => setSkills(skills.map(sk => sk.id === s.id ? { ...sk, proficiency: Number(e.target.value) } : sk))}
                      onMouseUp={(e) => handleUpdateProficiency(s.id, Number(e.target.value))}
                      onTouchEnd={(e) => handleUpdateProficiency(s.id, Number(e.target.value))}
                      className={styles.proficiencySlider}
                    />
                    <div className={styles.sliderBar}>
                      <div className={styles.sliderFill} style={{ width: `${s.proficiency || 50}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Projects Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Briefcase size={18} /></span>
              Projects
              {projects.length > 0 && (
                <span className={styles.countBadge}>{projects.length}</span>
              )}
            </h2>
            <button className={styles.addBtn} onClick={() => setProjectModal('new')}>
              <Plus size={16} /> Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <p className={styles.emptyState}>No projects added yet. Add your first project!</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.projectCardHeader}>
                  <div>
                    <h3 className={styles.projectName}>{p.name}</h3>
                    <p className={styles.projectMeta}>
                      {[p.client, p.location, `${formatDate(p.start_date)} – ${formatDate(p.end_date)}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className={styles.projectActions}>
                    <button className={styles.editProjectBtn} onClick={() => setProjectModal(p)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className={styles.deleteProjectBtn} onClick={() => handleDeleteProject(p.id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
                {p.role && <p className={styles.projectRole}>🎯 {p.role}</p>}
                {p.description && <p className={styles.projectDescription}>{p.description}</p>}
                {p.technologies_used?.length > 0 && (
                  <div className={styles.techTags}>
                    {p.technologies_used.map((t) => (
                      <span key={t} className={styles.techTag}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </div>

      {/* ── Modals */}
      {projectModal && (
        <ProjectModal
          project={projectModal === 'new' ? null : projectModal}
          onSave={handleSaveProject}
          onClose={() => setProjectModal(null)}
        />
      )}

      {showSkillModal && (
        <AddSkillModal
          existingSkillIds={skills.map(s => s.id)}
          onAdd={async () => {
            const [skillsRes, statusRes] = await Promise.all([
              API.get('/skills/profile'),
              API.get('/profile/status')
            ]);
            setSkills(skillsRes.data);
            setIsComplete(statusRes.data.isComplete);
          }}
          onClose={() => setShowSkillModal(false)}
        />
      )}
    </div>
  );
};

export default ProfileEditPage;
