import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Download, LayoutTemplate, Palette,
  Type, Settings2, X, SlidersHorizontal
} from 'lucide-react';
import API from '../../services/api';
import styles from './BuilderPage.module.css';

// Import Templates
import TemplateATS from './Templates/TemplateATS';
import TemplateModernSplit from './Templates/TemplateModernSplit';
import TemplateEnhancvModern from './Templates/TemplateEnhancvModern';
import TemplateDarkBlueHeader from './Templates/TemplateDarkBlueHeader';
import TemplateMinimalist from './Templates/TemplateMinimalist';

// A4 width at 96 dpi  ≈ 794px
const A4_PX = 794;

const BuilderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cvRef = useRef(null);
  const previewAreaRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  // Builder Settings
  const [selectedTemplate, setSelectedTemplate] = useState('ats');
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('medium');

  const themeColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#475569', '#0ea5e9'];
  const fonts = ['Inter', 'Roboto', 'Lora', 'Merriweather', 'Outfit'];
  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  // ── Compute scale so the A4 page fits within the preview area ──────────────
  const updateScale = useCallback(() => {
    const el = previewAreaRef.current;
    if (!el) return;
    const available = el.clientWidth - 32; // subtract 2rem padding
    setPreviewScale(Math.min(1, available / A4_PX));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // ── Fetch profile data ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const targetUserId = searchParams.get('userId');
        // Only allow admins to preview other users
        const endpoint =
          targetUserId && user?.role === 'admin'
            ? `/admin/users/${targetUserId}/profile`
            : '/profile/me';
        const res = await API.get(endpoint);
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePrint = useReactToPrint({
    contentRef: cvRef,
    documentTitle: profileData?.full_name
      ? `${profileData.full_name.replace(/\s+/g, '_')}_CV`
      : 'CV_Export',
  });

  if (loading) return <div className={styles.loadingScreen}>Loading Builder...</div>;
  if (!profileData) return <div className={styles.loadingScreen}>Failed to load CV data.</div>;

  // ── Template resolver ──────────────────────────────────────────────────────
  const renderTemplate = () => {
    const commonProps = { data: profileData, themeColor, fontFamily, fontSize };
    switch (selectedTemplate) {
      case 'modern':     return <TemplateModernSplit {...commonProps} />;
      case 'enhancv':    return <TemplateEnhancvModern {...commonProps} />;
      case 'darkblue':   return <TemplateDarkBlueHeader {...commonProps} />;
      case 'minimalist': return <TemplateMinimalist {...commonProps} />;
      case 'ats':
      default:           return <TemplateATS {...commonProps} />;
    }
  };

  // A4 wrapper style — keeps the printed size fixed while visually scaling it
  const a4WrapperStyle = {
    transform: `scale(${previewScale})`,
    transformOrigin: 'top center',
    // compensate the layout space so the parent scroll is correct
    marginBottom: `calc(${previewScale} * 297mm - 297mm)`,
  };

  const sidebarControls = (
    <>
      <div className={styles.sidebarSection}>
        <label className={styles.sectionLabel}><LayoutTemplate size={14} /> Templates</label>
        <div className={styles.templateGrid}>
          {[
            { key: 'ats',        label: 'ATS Classic' },
            { key: 'modern',     label: 'Modern Split' },
            { key: 'enhancv',    label: 'Timeline' },
            { key: 'darkblue',   label: 'Two Column Color' },
            { key: 'minimalist', label: 'Minimalist' },
          ].map(t => (
            <button
              key={t.key}
              className={`${styles.templateBtn} ${selectedTemplate === t.key ? styles.active : ''}`}
              onClick={() => { setSelectedTemplate(t.key); setSidebarOpen(false); }}
            >
              {t.label}
            </button>
          ))}
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
          style={{ fontFamily, marginBottom: '0.75rem' }}
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
    </>
  );

  return (
    <div className={styles.builderContainer}>

      {/* ── Mobile top bar ── */}
      <div className={styles.mobileTopBar}>
        <button className={styles.backBtn} onClick={() => navigate('/profile/edit')}>
          <ArrowLeft size={16} /> Back
        </button>
        <span className={styles.mobileTitle}><Settings2 size={15} /> CV Builder</span>
        <button
          className={styles.customizeBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open customization panel"
        >
          <SlidersHorizontal size={18} /> Customize
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <Settings2 size={18} /> CV Customization
          </h2>
          <button className={styles.backBtn} onClick={() => navigate('/profile/edit')}>
            <ArrowLeft size={16} /> Edit Details
          </button>
        </div>
        {sidebarControls}
      </aside>

      {/* ── Mobile slide-in panel ── */}
      {sidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.mobileSidebar} ${sidebarOpen ? styles.mobileSidebarOpen : ''}`}>
        <div className={styles.mobileSidebarHeader}>
          <span className={styles.sidebarTitle}><Settings2 size={16} /> Customize</span>
          <button
            className={styles.closeBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close customization panel"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarControls}
      </aside>

      {/* ── Main Preview Area ── */}
      <main className={styles.previewArea} ref={previewAreaRef}>
        <div className={styles.a4PageWrapper} style={a4WrapperStyle}>
          <div className={styles.a4Page} ref={cvRef}>
            {renderTemplate()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuilderPage;
