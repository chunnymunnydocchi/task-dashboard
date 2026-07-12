// src/components/Sidebar/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // NEW
import logo from '../../logo.svg';
import './Sidebar.css';

function Sidebar({ isOpen, onClose, onToggle }) { // NEW props
  const navigate = useNavigate();

  const handleAddTask = () => {
    navigate('/tasks', { state: { mode: 'manual' } });
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 480) {
      onClose();
    }
  };

  // Close sidebar on window resize (if going from mobile to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 480 && isOpen) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      {/* MOBILE: Pull handle - appears on left edge when sidebar is closed */}
      <button 
        className={`sidebar-handle ${isOpen ? 'hidden' : ''}`}
        onClick={onToggle}
        aria-label="Open sidebar"
      >
        <span className="material-icons">chevron_right</span>
      </button>

      {/* MOBILE: Close overlay backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Task Dashboard Logo" className="logo-img" />
            <h2>Task Calendar</h2>
          </div>
          {/* Close button - only visible on mobile when open */}
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => {
                if (window.innerWidth <= 480) onClose();
              }}
            >
              <span className="material-icons nav-icon">calendar_today</span>
              <span className="nav-text">Calendar</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => {
                if (window.innerWidth <= 480) onClose();
              }}
            >
              <span className="material-icons nav-icon">checklist</span>
              <span className="nav-text">Tasks</span>
            </NavLink>
          </li>
        </ul>
        <div className="sidebar-divider"></div>
        <button className="sidebar-add-task" onClick={handleAddTask}>
          <span className="material-icons nav-icon add-icon">add_circle</span>
          <span className="nav-text">Add Task</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;