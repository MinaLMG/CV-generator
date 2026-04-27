import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Download, LayoutTemplate, Palette, Type, Settings2 } from 'lucide-react';
import API from '../../services/api';
import styles from './BuilderPage.module.css';

// Import Templates
import TemplateATS from './Templates/TemplateATS';
import TemplateModernSplit from './Templates/TemplateModernSplit';
import TemplateEnhancvModern from './Templates/TemplateEnhancvModern';
import TemplateDarkBlueHeader from './Templates/TemplateDarkBlueHeader';
import TemplateMinimalist from './Templates/TemplateMinimalist';

const BuilderPage = () => {
  const navigate = useNavigate();
  const cvRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Builder Settings
  const [selectedTemplate, setSelectedTemplate] = useState('ats'); // 'ats' | 'modern'
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('medium'); // 'small' | 'medium' | 'large'

  const themeColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#475569', '#0ea5e9'];
  const fonts = ['Inter', 'Roboto', 'Lora', 'Merriweather', 'Outfit'];
  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

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
    const commonProps = { data: profileData, themeColor, fontFamily, fontSize };
    switch (selectedTemplate) {
      case 'modern': return <TemplateModernSplit {...commonProps} />;
      case 'enhancv': return <TemplateEnhancvModern {...commonProps} />;
      case 'darkblue': return <TemplateDarkBlueHeader {...commonProps} />;
      case 'minimalist': return <TemplateMinimalist {...commonProps} />;
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
              Modern Split
            </button>
            <button
              className={`${styles.templateBtn} ${selectedTemplate === 'enhancv' ? styles.active : ''}`}
              onClick={() => setSelectedTemplate('enhancv')}
            >
              Timeline
            </button>
            <button
              className={`${styles.templateBtn} ${selectedTemplate === 'darkblue' ? styles.active : ''}`}
              onClick={() => setSelectedTemplate('darkblue')}
            >
              Two Column Color
            </button>
            <button
              className={`${styles.templateBtn} ${selectedTemplate === 'minimalist' ? styles.active : ''}`}
              onClick={() => setSelectedTemplate('minimalist')}
            >
              Minimalist
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
            style={{ fontFamily: fontFamily, marginBottom: '0.75rem' }}
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
            ))}
          </select>
          <label className={styles.sectionLabel} style={{ marginBottom: '0.4rem', marginTop: '1rem', display: 'block' }}>Size</label>
          <select
            className={styles.fontSelect}
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          >
            {fontSizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
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
