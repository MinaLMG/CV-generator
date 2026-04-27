import React from 'react';
import { Mail, Phone, MapPin, Award } from 'lucide-react';
import styles from './Templates.module.css';

const LinkedinIcon = ({ color }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ color }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TemplateEnhancvModern = ({ data, themeColor, fontFamily, fontSize }) => {
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
    <div className={styles.enhancvContainer} style={{ fontFamily, fontSize: getBaseSize() }}>
      
      {/* HEADER */}
      <header className={styles.enhancvHeader}>
        <div className={styles.enhancvHeaderLeft}>
          <h1 className={styles.enhancvName} style={{ color: themeColor }}>{data.full_name}</h1>
          {data.job_title && <h2 className={styles.enhancvJobTitle} style={{ color: themeColor }}>{data.job_title}</h2>}
          <div className={styles.enhancvContactList}>
            {data.phone && (
              <span className={styles.enhancvContactItem}>
                <Phone size={12} color={themeColor} /> {data.phone}
              </span>
            )}
            {data.current_email && (
              <span className={styles.enhancvContactItem}>
                <Mail size={12} color={themeColor} /> {data.current_email}
              </span>
            )}
            {data.linkedin_url && (
              <span className={styles.enhancvContactItem}>
                <LinkedinIcon color={themeColor} /> {data.linkedin_url.replace(/https?:\/\/(www\.)?/, '')}
              </span>
            )}
            {data.github_url && (
              <span className={styles.enhancvContactItem}>
                <GithubIcon color={themeColor} /> {data.github_url.replace(/https?:\/\/(www\.)?/, '')}
              </span>
            )}
            {data.location && (
              <span className={styles.enhancvContactItem}>
                <MapPin size={12} color={themeColor} /> {data.location}
              </span>
            )}
          </div>
        </div>
        {data.photo_url && (
          <div className={styles.enhancvPhotoWrapper}>
            <img src={data.photo_url} alt="Profile" className={styles.enhancvPhoto} />
          </div>
        )}
      </header>

      {/* SUMMARY */}
      {data.experience_summary && (
        <section className={styles.enhancvSection}>
          <h3 className={styles.enhancvSectionTitle} style={{ color: themeColor }}>SUMMARY</h3>
          <p className={styles.enhancvSummaryText}>{data.experience_summary}</p>
        </section>
      )}

      {/* EXPERIENCE */}
      {data.projects && data.projects.length > 0 && (
        <section className={styles.enhancvSection}>
          <h3 className={styles.enhancvSectionTitle} style={{ color: themeColor }}>EXPERIENCE</h3>
          <div className={styles.enhancvTimelineContainer}>
            <div className={styles.enhancvTimelineLine} />
            {data.projects.map(p => (
              <div key={p.id} className={styles.enhancvTimelineItem}>
                <div className={styles.enhancvTimelineLeft}>
                  <div className={styles.enhancvDate} style={{ color: themeColor, fontWeight: 700 }}>
                    {formatDate(p.start_date)} - {formatDate(p.end_date)}
                  </div>
                  {p.location && <div className={styles.enhancvTimelineLocation}>{p.location}</div>}
                </div>
                <div className={styles.enhancvTimelineDot} />
                <div className={styles.enhancvTimelineRight}>
                  <h4 className={styles.enhancvRole} style={{ color: themeColor }}>{p.role}</h4>
                  <div className={styles.enhancvCompany}>
                    {p.client ? `${p.client}` : ''} {p.name ? `${p.name}` : ''}
                  </div>
                  {p.description && <p className={styles.enhancvDesc}>{p.description}</p>}
                  {p.contributions && (
                    <ul className={styles.enhancvBullets}>
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

      {/* SKILLS */}
      {data.skills && data.skills.length > 0 && (
        <section className={styles.enhancvSection}>
          <h3 className={styles.enhancvSectionTitle} style={{ color: themeColor }}>SKILLS</h3>
          <div className={styles.enhancvSkillsGrid}>
            {data.skills.map(s => (
              <div key={s.id} className={styles.enhancvSkillBadge} style={{ borderColor: themeColor }}>
                {s.name}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default TemplateEnhancvModern;
