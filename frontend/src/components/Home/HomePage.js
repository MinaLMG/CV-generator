import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className={styles.homeContainer}>
      <nav className={styles.nav}>
        <h2 className={styles.logo}>CVGenie</h2>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <UserIcon size={18} color="#94a3b8" />
            <span className={styles.userName}>{user?.fullName || 'User'}</span>
          </div>
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
          Your professional dashboard is ready. Soon you'll be able to create, 
          manage, and export professional CVs with the power of AI and clean design.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
