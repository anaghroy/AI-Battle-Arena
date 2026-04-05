import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MessageSquarePlus,
  Trophy,
  Search,
  X,
  PanelLeftClose,
  Trash2,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import useBattleStore from "../store/battleStore";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const {
    history,
    fetchHistory,
    loadChat,
    removeHistory,
    clearChat,
    currentChatId,
  } = useBattleStore();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    // Hide sidebar on nav icon click
    toggleSidebar();
  };

  const handleNewChat = () => {
    clearChat();
    handleNavClick();
    navigate("/");
  };

  const handleLoadChat = (id) => {
    loadChat(id);
    handleNavClick();
    navigate("/");
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    removeHistory(id);
  };

  return (
    <div className={`sidebar ${isOpen ? "" : "hidden"}`}>
      <div className="sidebar-header">
        <h1>
          <span
            style={{
              fontFamily: "var( --font-inter-regular)",
              letterSpacing: "2px",
            }}
          >
            🏛️ Arena
          </span>
        </h1>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title="Close Sidebar"
        >
         
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${!currentChatId ? "active" : ""}`}
          onClick={handleNewChat}
          style={{
            background: "none",
            border: "none",
            width: "100%",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-inter-regular)",
          }}
        >
          <MessageSquarePlus size={18} />
          New Chat
        </button>
        <NavLink
          style={{ fontFamily: "var(--font-inter-regular)" }}
          to="/leaderboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <Trophy size={18} />
          Leaderboard
        </NavLink>
        <button
          className="nav-item"
          onClick={handleNavClick}
          style={{
            background: "none",
            border: "none",
            width: "100%",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-inter-regular)",
          }}
        >
          <Search size={18} />
          Search
        </button>
      </nav>

      {/* Chat History Section */}
      <div
        className="chat-history-section"
        style={{
          flex: 3,
          overflowY: "auto",
          padding: "0 20px",
          marginTop: "10px",
        }}
      >
        <h4
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            marginBottom: "12px",
            letterSpacing: "1px",
            fontFamily: "var(--font-inter-regular)",
          }}
        >
          Recent Battles
        </h4>
        {history.length === 0 ? (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-inter-regular)",
            }}
          >
            No recent chats found.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {history.map((chat) => {
              const isActive = currentChatId === chat._id;
              return (
                <li
                  key={chat._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: isActive ? "var(--bg-tertiary)" : "transparent",
                    transition: "all 0.2s ease-in-out",
                    border: isActive ? "1px solid var(--border-color)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <button
                    onClick={() => handleLoadChat(chat._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: "0.85rem",
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontFamily: "var(--font-inter-regular)",
                      fontWeight: isActive ? "500" : "normal",
                    }}
                  >
                    {chat.title}
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      padding: "4px",
                      opacity: isActive ? 1 : 0.6,
                    }}
                    title="Delete Chat"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="sidebar-footer">
        {/* User Profile */}
        <div
          className="user-profile"
          onClick={() => setShowLogout(!showLogout)}
        >
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || "User"}`}
            alt="User Avatar"
            className="avatar"
          />
          <span className="email">{user?.email || "user@example.com"}</span>
        </div>

        {/* Logout Popover */}
        {showLogout && (
          <div className="logout-popover">
            <div className="popover-header">
              <button
                className="close-btn"
                onClick={() => setShowLogout(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="popover-user-info">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || "User"}`}
                alt="User Avatar"
              />
              <span
                style={{
                  fontFamily: "var( --font-inter-regular)",
                  fontSize: "0.6rem",
                }}
              >
                {user?.email || "user@example.com"}
              </span>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                marginBottom: "16px",
                color: "var(--text-secondary)",
              }}
            >
              <input type="checkbox" /> Send me product updates and
              announcements
            </label>

            <button className="logout-btn" onClick={handleLogout}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
