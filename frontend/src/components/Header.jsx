import React from 'react';
import { PanelLeft, ChevronDown, Moon, Sun, Swords } from 'lucide-react';
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
          <Swords size={16} />
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
