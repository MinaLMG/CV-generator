import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Download, LayoutTemplate, Palette, Type, Settings2 } from 'lucide-react';
import API from '../../services/api';
import styles from './BuilderPage.module.css';

// Import Templates
import TemplateATS from './Templates/TemplateATS';
import TemplateModernSplit from './Templates/TemplateModernSplit';

const BuilderPage = () => {
  const navigate = useNavigate();
  const cvRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Builder Settings
  const [selectedTemplate, setSelectedTemplate] = useState('ats'); // 'ats' | 'modern'
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState('Inter');

  const themeColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#475569', '#0ea5e9'];
  const fonts = ['Inter', 'Roboto', 'Lora', 'Merriweather', 'Outfit'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/profile/me');
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: cvRef,
    documentTitle: profileData?.full_name ? `${profileData.full_name.replace(/\s+/g, '_')}_CV` : 'CV_Export',
  });

  if (loading) {
    return <div className={styles.loadingScreen}>Loading Builder...</div>;
  }

  if (!profileData) {
    return <div className={styles.loadingScreen}>Failed to load CV data.</div>;
  }

  // Active template resolver
  const renderTemplate = () => {
    const commonProps = { data: profileData, themeColor, fontFamily };
    switch (selectedTemplate) {
      case 'modern': return <TemplateModernSplit {...commonProps} />;
      case 'ats':
      default: return <TemplateATS {...commonProps} />;
    }
  };

  return (
    <div className={styles.builderContainer}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <Settings2 size={18} /> CV Customization
          </h2>
          <button className={styles.backBtn} onClick={() => navigate('/profile/edit')}>
            <ArrowLeft size={16} /> Edit Details
          </button>
        </div>

        <div className={styles.sidebarSection}>
          <label className={styles.sectionLabel}><LayoutTemplate size={14} /> Templates</label>
          <div className={styles.templateGrid}>
            <button
              className={`${styles.templateBtn} ${selectedTemplate === 'ats' ? styles.active : ''}`}
              onClick={() => setSelectedTemplate('ats')}
            >
              ATS Classic
            </button>
            <button
              className={`${styles.templateBtn} ${selectedTemplate === 'modern' ? styles.active : ''}`}
              onClick={() => setSelectedTemplate('modern')}
            >
              Modern Split (3:1)
            </button>
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <label className={styles.sectionLabel}><Palette size={14} /> Theme Color</label>
          <div className={styles.colorGrid}>
            {themeColors.map(color => (
              <button
                key={color}
                className={`${styles.colorBtn} ${themeColor === color ? styles.activeColor : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setThemeColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className={styles.sidebarSection}>
          <label className={styles.sectionLabel}><Type size={14} /> Typography</label>
          <select
            className={styles.fontSelect}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{ fontFamily: fontFamily }}
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
            ))}
          </select>
        </div>

        <button className={styles.downloadBtn} onClick={() => handlePrint()}>
          <Download size={18} /> Download PDF
        </button>
      </aside>

      {/* ── Main Preview Area ── */}
      <main className={styles.previewArea}>
        <div className={styles.a4PageWrapper}>
          <div className={styles.a4Page} ref={cvRef}>
            {renderTemplate()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
