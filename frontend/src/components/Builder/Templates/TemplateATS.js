// TemplateATS.js
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import styles from './Templates.module.css';

const LinkedinIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TemplateATS = ({ data, themeColor, fontFamily }) => {
  if (!data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.atsContainer} style={{ fontFamily }}>
      {/* ── HEADER ── */}
      <header className={styles.atsHeader}>
        <h1 className={styles.atsName} style={{ color: themeColor }}>{data.full_name}</h1>
        {data.job_title && <h2 className={styles.atsJobTitle}>{data.job_title}</h2>}

        <div className={styles.atsContactInfo}>
          {data.current_email && (
            <span className={styles.atsContactItem}>
              <Mail size={12} color={themeColor} /> {data.current_email}
            </span>
          )}
          {data.phone && (
            <span className={styles.atsContactItem}>
              <Phone size={12} color={themeColor} /> {data.phone}
            </span>
          )}
          {data.linkedin_url && (
            <span className={styles.atsContactItem}>
              <LinkedinIcon size={12} color={themeColor} /> {data.linkedin_url.replace(/https?:\/\/(www\.)?/, '')}
            </span>
          )}
          {data.github_url && (
            <span className={styles.atsContactItem}>
              <GithubIcon size={12} color={themeColor} /> {data.github_url.replace(/https?:\/\/(www\.)?/, '')}
            </span>
          )}
        </div>
      </header>

      {/* ── SUMMARY ── */}
      {data.experience_summary && (
        <section className={styles.atsSection}>
          <h3 className={styles.atsSectionTitle} style={{ color: themeColor, borderBottomColor: themeColor }}>
            Professional Summary
          </h3>
          <p className={styles.atsSummaryText}>{data.experience_summary}</p>
        </section>
      )}

      {/* ── EXPERIENCE (Projects) ── */}
      {data.projects && data.projects.length > 0 && (
        <section className={styles.atsSection}>
          <h3 className={styles.atsSectionTitle} style={{ color: themeColor, borderBottomColor: themeColor }}>
            Professional Experience
          </h3>
          <div className={styles.atsProjectList}>
            {data.projects.map(p => (
              <div key={p.id} className={styles.atsProject}>
                <div className={styles.atsProjectHeader}>
                  <div className={styles.atsProjectRoleGroup}>
                    <span className={styles.atsProjectRole}>{p.role}</span>
                    <span className={styles.atsProjectCompany}>
                      {p.client ? ` at ${p.client}` : ''} {p.name ? `(${p.name})` : ''}
                    </span>
                  </div>
                  <span className={styles.atsProjectDate}>
                    {formatDate(p.start_date)} – {formatDate(p.end_date)}
                    {p.location && ` | ${p.location}`}
                  </span>
                </div>

                {p.description && <p className={styles.atsProjectDesc}>{p.description}</p>}
                {p.contributions && (
                  <div className={styles.atsProjectContributions}>
                    {p.contributions.split('\n').map((line, i) => line.trim() && (
                      <div key={i} className={styles.atsBulletPrefix}>• <span style={{ display: 'inline-block' }}>{line.replace(/^-\s*/, '')}</span></div>
                    ))}
                  </div>
                )}

                {p.technologies_used && p.technologies_used.length > 0 && (
                  <p className={styles.atsProjectTech}>
                    <strong>Tech:</strong> {p.technologies_used.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {data.skills && data.skills.length > 0 && (
        <section className={styles.atsSection}>
          <h3 className={styles.atsSectionTitle} style={{ color: themeColor, borderBottomColor: themeColor }}>
            Technical Skills
          </h3>
          <div className={styles.atsSkillGrid}>
            {data.skills.map(s => (
              <div key={s.id} className={styles.atsSkillItem}>
                <span className={styles.atsSkillDot} style={{ backgroundColor: themeColor }} />
                {s.name}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TemplateATS;
