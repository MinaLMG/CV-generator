import React from 'react';
import { Mail, Phone } from 'lucide-react';
import styles from './Templates.module.css';

const LinkedinIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GithubIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const TemplateModernSplit = ({ data, themeColor, fontFamily, fontSize }) => {
  if (!data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getBaseSize = () => {
    if (fontSize === 'small') return '8.5pt';
    if (fontSize === 'large') return '10.5pt';
    return '9.5pt';
  };

  // Modern Split uses a lighter tint of the theme color for the side panel background
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '37, 99, 235';
  };
  const sideBgColor = `rgba(${hexToRgb(themeColor)}, 0.08)`;

  return (
    <div className={styles.modernContainer} style={{ fontFamily, fontSize: getBaseSize() }}>
      {/* ── LEFT COLUMN (Main Content - approx 70%) ── */}
      <div className={styles.modernMain}>

        {/* HEADER */}
        <header className={styles.modernHeader}>
          {data.photo_url && (
            <div className={styles.modernPhotoWrapper}>
              <img src={data.photo_url} alt="Profile" className={styles.modernPhoto} style={{ borderColor: themeColor }} />
            </div>
          )}
          <div className={styles.modernHeaderText}>
            <h1 className={styles.modernName} style={{ color: themeColor }}>{data.full_name}</h1>
            {data.job_title && <h2 className={styles.modernJobTitle}>{data.job_title}</h2>}
          </div>
        </header>

        {/* SUMMARY */}
        {data.experience_summary && (
          <section className={styles.modernSection}>
            <h3 className={styles.modernSectionTitle} style={{ color: themeColor }}>Profile</h3>
            <p className={styles.modernSummaryText}>{data.experience_summary}</p>
          </section>
        )}

        {/* EXPERIENCE */}
        {data.projects && data.projects.length > 0 && (
          <section className={styles.modernSection}>
            <h3 className={styles.modernSectionTitle} style={{ color: themeColor }}>Experience</h3>
            <div className={styles.modernProjectList}>
              {data.projects.map(p => (
                <div key={p.id} className={styles.modernProject}>
                  <div className={styles.modernProjectTimeline} style={{ backgroundColor: themeColor }} />
                  <div className={styles.modernProjectContent}>
                    <h4 className={styles.modernProjectRole}>{p.role}</h4>
                    <span className={styles.modernProjectCompany}>
                      {p.client ? `${p.client}` : ''} {p.name ? `| ${p.name}` : ''}
                    </span>
                    <span className={styles.modernProjectDate}>
                      {formatDate(p.start_date)} – {formatDate(p.end_date)}
                    </span>
                    {p.description && <p className={styles.modernProjectDesc}>{p.description}</p>}
                    {p.contributions && (
                      <ul className={styles.modernProjectContributions}>
                        {p.contributions.split('\n').map((line, i) => line.trim() && (
                          <li key={i}>{line.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── RIGHT COLUMN (Sidebar - approx 30%) ── */}
      <div className={styles.modernSidebar} style={{ backgroundColor: sideBgColor }}>

        {/* CONTACT */}
        <section className={styles.modernSideSection}>
          <h3 className={styles.modernSideTitle} style={{ color: themeColor }}>Contact</h3>
          <div className={styles.modernContactList}>
            {data.current_email && (
              <div className={styles.modernContactItem}>
                <div className={styles.modernContactIcon} style={{ color: themeColor }}><Mail size={14} /></div>
                <span>{data.current_email}</span>
              </div>
            )}
            {data.phone && (
              <div className={styles.modernContactItem}>
                <div className={styles.modernContactIcon} style={{ color: themeColor }}><Phone size={14} /></div>
                <span>{data.phone}</span>
              </div>
            )}
            {data.linkedin_url && (
              <div className={styles.modernContactItem}>
                <div className={styles.modernContactIcon} style={{ color: themeColor }}><LinkedinIcon size={14} color={themeColor} /></div>
                <span className={styles.truncate}>{data.linkedin_url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
              </div>
            )}
            {data.github_url && (
              <div className={styles.modernContactItem}>
                <div className={styles.modernContactIcon} style={{ color: themeColor }}><GithubIcon size={14} color={themeColor} /></div>
                <span className={styles.truncate}>{data.github_url.replace(/https?:\/\/(www\.)?github\.com\//, '')}</span>
              </div>
            )}
          </div>
        </section>

        {/* SKILLS */}
        {data.skills && data.skills.length > 0 && (
          <section className={styles.modernSideSection}>
            <h3 className={styles.modernSideTitle} style={{ color: themeColor }}>Expertise</h3>
            <div className={styles.modernSkillList}>
              {data.skills.map(s => (
                <div key={s.id} className={styles.modernSkillItem}>
                  <div className={styles.modernSkillHeader}>
                    <span className={styles.modernSkillName}>{s.name}</span>
                  </div>
                  <div className={styles.modernSkillBarBg}>
                    <div
                      className={styles.modernSkillBarFill}
                      style={{ width: `${s.proficiency || 50}%`, backgroundColor: themeColor }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TemplateModernSplit;
