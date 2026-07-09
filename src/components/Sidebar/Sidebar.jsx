// src/components/Sidebar/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../logo.svg';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleAddTask = () => {
    // ✅ Navigate to TasksPage with manual add mode
    navigate('/tasks', { state: { mode: 'manual' } });
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Task Dashboard Logo" className="logo-img" />
        <h2>Task Calendar</h2>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
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
  );
}

export default Sidebar;