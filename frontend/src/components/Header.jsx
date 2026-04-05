import React from 'react';
import { PanelLeft, ChevronDown, Moon, Sun } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="header">
      <div className="header-left">
        <button className="sidebar-toggle-main" onClick={toggleSidebar}>
          <PanelLeft size={20} />
        </button>
        <div className="mode-selector">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 9.5-3-3m0 0-3 3m3-3v10m-8.5-5h17"/></svg>
          <span>Battle Mode</span>
          <ChevronDown size={14} />
        </div>
      </div>
      <div className="header-right">
        {/* Dark/Light mode toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Header;
