import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import styles from './HomePage.module.css';
import { LogOut, User as UserIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await API.get('/profile/status');
        setProfileStatus(res.data);

        // If profile is incomplete, redirect to edit profile
        if (!res.data.isComplete) {
          navigate('/profile/edit');
        }
      } catch (err) {
        console.error('Failed to check profile status', err);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <Loader size={40} className={styles.spinner} />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <nav className={styles.nav}>
        <h2 className={styles.logo}>CVGenie</h2>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <UserIcon size={18} color="#94a3b8" />
            <span className={styles.userName}>{user?.fullName || 'User'}</span>
          </div>
          {profileStatus?.isComplete ? (
            <span className={styles.statusBadgeComplete}>
              <CheckCircle size={14} /> Profile Complete
            </span>
          ) : (
            <span className={styles.statusBadgeIncomplete}>
              <AlertCircle size={14} /> Profile Incomplete
            </span>
          )}
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className={styles.description}>
          Your professional dashboard is ready. Create, manage, and export professional CVs with ease.
        </p>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{profileStatus?.stats?.projects ?? 0}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{profileStatus?.stats?.skills ?? 0}</span>
            <span className={styles.statLabel}>Skills</span>
          </div>
        </div>

        <button className={styles.editBtn} onClick={() => navigate('/profile/edit')}>
          Edit My Profile
        </button>
      </main>
    </div>
  );
};

export default HomePage;
