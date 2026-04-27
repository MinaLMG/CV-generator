import React from 'react';
import styles from './Templates.module.css';

const TemplateMinimalist = ({ data, themeColor, fontFamily, fontSize }) => {
  if (!data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '/');
  };

  const getBaseSize = () => {
    if (fontSize === 'small') return '0.85em';
    if (fontSize === 'large') return '1.1em';
    return '0.95em';
  };

  return (
    <div className={styles.minimalistContainer} style={{ fontFamily, fontSize: getBaseSize() }}>
      
      {/* HEADER */}
      <header className={styles.minimalistHeader}>
        <div className={styles.minimalistHeaderLeft}>
          <h1 className={styles.minimalistName}>{data.full_name}</h1>
          {data.job_title && <h2 className={styles.minimalistJobTitle}>{data.job_title}</h2>}
          <div className={styles.minimalistContact}>
            {data.phone && <span>{data.phone}</span>}
            {data.current_email && <span>{data.current_email}</span>}
            {data.linkedin_url && <span>{data.linkedin_url.replace(/https?:\/\/(www\.)?/, '')}</span>}
            {data.github_url && <span>{data.github_url.replace(/https?:\/\/(www\.)?/, '')}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>
        {data.photo_url && (
          <div className={styles.minimalistPhotoWrapper}>
            <img src={data.photo_url} alt="Profile" className={styles.minimalistPhoto} />
          </div>
        )}
      </header>

      {/* SUMMARY */}
      {data.experience_summary && (
        <section className={styles.minimalistSection}>
          <h3 className={styles.minimalistSectionTitle} style={{ color: themeColor }}>SUMMARY</h3>
          <p className={styles.minimalistSummaryText}>{data.experience_summary}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.projects && data.projects.length > 0 && (
        <section className={styles.minimalistSection}>
          <h3 className={styles.minimalistSectionTitle} style={{ color: themeColor }}>EXPERIENCE</h3>
          <div className={styles.minimalistProjectList}>
            {data.projects.map(p => (
              <div key={p.id} className={styles.minimalistProjectItem}>
                <div className={styles.minimalistProjectHeader}>
                  <div className={styles.minimalistRoleGroup}>
                    <h4 className={styles.minimalistRole}>{p.role}</h4>
                    <span className={styles.minimalistCompany}>
                       {p.client ? `${p.client}` : ''} {p.name ? `${p.name}` : ''}
                    </span>
                  </div>
                  <div className={styles.minimalistDate}>
                    {p.location && <span>{p.location}</span>}
                    {p.location && <span style={{margin: '0 4px'}}>-</span>}
                    {formatDate(p.start_date)} - {formatDate(p.end_date)}
                  </div>
                </div>
                {p.description && <p className={styles.minimalistDesc}>{p.description}</p>}
                {p.contributions && (
                  <ul className={styles.minimalistBullets}>
                    {p.contributions.split('\n').map((line, i) => line.trim() && (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {data.skills && data.skills.length > 0 && (
        <section className={styles.minimalistSection}>
          <h3 className={styles.minimalistSectionTitle} style={{ color: themeColor }}>SKILLS</h3>
          <p className={styles.minimalistSkillsText}>
            {data.skills.map(s => s.name).join(', ')}
          </p>
        </section>
      )}

    </div>
  );
};

export default TemplateMinimalist;
