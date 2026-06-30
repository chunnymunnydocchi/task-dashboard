// src/components/Sidebar/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import logo from '../../logo.svg'; // Adjust path as needed
import './Sidebar.css';

function Sidebar() {
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
    </nav>
  );
}

export default Sidebar;