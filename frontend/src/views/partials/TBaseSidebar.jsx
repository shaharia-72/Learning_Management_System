import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAxios from '../../utils/useAxios';
import UseData from '../plugin/UserData';

const TBaseSidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
    const location = useLocation();

    const axiosInstance = useAxios();
    const userData = UseData();
    console.log(userData);

    const [dropdownOpen, setDropdownOpen] = useState({
        courses: false,
        resources: false
    });
    const [activeHover, setActiveHover] = useState(null);

    // Auto close dropdowns when sidebar collapses
    useEffect(() => {
        if (sidebarCollapsed) {
            setDropdownOpen({ courses: false, resources: false });
        }
    }, [sidebarCollapsed]);

    // Function to toggle dropdown menus
    const toggleDropdown = (menu) => {
        setDropdownOpen({
            ...dropdownOpen,
            [menu]: !dropdownOpen[menu]
        });
    };

    // Check if path is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Check if path starts with (for nested routes)
    const isPathActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Enhanced Dark Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top border-bottom border-secondary">
                <div className="container-fluid px-3">
                    <div className="d-flex align-items-center">
                        <button
                            className="btn btn-dark me-2 d-lg-none"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <Link className="navbar-brand d-flex align-items-center" to="/instructor/dashboard/">
                            <i className="fas fa-graduation-cap me-2 text-primary"></i>
                            <span className="fw-bold text-gradient">EduPortal</span>
                        </Link>
                    </div>

                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <a
                                className="btn btn-dark dropdown-toggle d-flex align-items-center"
                                href="#"
                                role="button"
                                id="dropdownUser"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <div className="me-2">
                                    <div className="avatar avatar-sm rounded-circle bg-primary d-flex align-items-center justify-content-center">
                                        <span className="text-white">{userData?.username?.substring(0, 2)}</span>
                                    </div>
                                </div>
                                <span className="d-none d-lg-inline">{userData?.username}</span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="dropdownUser">
                                <li>
                                    <div className="dropdown-header d-flex align-items-center">
                                        <div className="me-3">
                                            <div className="avatar avatar-md rounded-circle bg-primary d-flex align-items-center justify-content-center">
                                                <span className="text-white">{userData?.username?.substring(0, 2)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{userData?.username}</div>
                                        </div>
                                    </div>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <Link className="dropdown-item" to="/instructor/profile/">
                                        <i className="fas fa-user me-2"></i> Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/settings">
                                        <i className="fas fa-cog me-2"></i> Settings
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <Link className="dropdown-item" to="/logout">
                                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Enhanced Sidebar */}
            <div className={`sidebar bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
                    {!sidebarCollapsed && (
                        <Link to="/instructor/dashboard/" className="d-flex align-items-center text-decoration-none">
                            <i className="fas fa-user-graduate fs-4 me-2 text-primary"></i>
                            <h5 className="mb-0 text-white fw-bold">Teacher Portal</h5>
                        </Link>
                    )}
                    <button
                        className="btn btn-dark btn-sm rounded-circle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`fas fa-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <Link
                        to="/instructor/dashboard/"
                        className={`nav-link ${isActive('/instructor/dashboard/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('dashboard')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-tachometer-alt"></i>
                        </div>
                        {!sidebarCollapsed && <span>Dashboard</span>}
                        {sidebarCollapsed && activeHover === 'dashboard' && (
                            <div className="sidebar-tooltip">Dashboard</div>
                        )}
                    </Link>

                    {/* Courses Dropdown */}
                    <div className={`nav-item ${dropdownOpen.courses ? 'show' : ''}`}>
                        <a
                            href="#"
                            className={`nav-link ${isPathActive('/instructor/courses') ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!sidebarCollapsed) toggleDropdown('courses');
                            }}
                            onMouseEnter={() => setActiveHover('courses')}
                            onMouseLeave={() => setActiveHover(null)}
                        >
                            <div className="nav-icon">
                                <i className="fas fa-book"></i>
                            </div>
                            {!sidebarCollapsed && (
                                <>
                                    <span>Courses</span>
                                    <i className={`fas fa-chevron-${dropdownOpen.courses ? 'down' : 'right'} ms-auto transition-all`}></i>
                                </>
                            )}
                            {sidebarCollapsed && activeHover === 'courses' && (
                                <div className="sidebar-tooltip">Courses</div>
                            )}
                        </a>

                        {(!sidebarCollapsed || activeHover === 'courses') && dropdownOpen.courses && (
                            <div className="submenu">
                                <Link
                                    to="/instructor/courses/"
                                    className={`nav-link ${isActive('/instructor/courses/') ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveHover('all-courses')}
                                    onMouseLeave={() => setActiveHover('courses')}
                                >
                                    <div className="nav-icon">
                                        <i className="fas fa-circle-notch fa-xs"></i>
                                    </div>
                                    <span>My Courses</span>
                                    {sidebarCollapsed && activeHover === 'all-courses' && (
                                        <div className="sidebar-tooltip">My Courses</div>
                                    )}
                                </Link>
                                <Link
                                    to="/instructor/create-course/"
                                    className={`nav-link ${isActive('/instructor/create-course/') ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveHover('create-course')}
                                    onMouseLeave={() => setActiveHover('courses')}
                                >
                                    <div className="nav-icon">
                                        <i className="fas fa-circle-notch fa-xs"></i>
                                    </div>
                                    <span>Create Course</span>
                                    {sidebarCollapsed && activeHover === 'create-course' && (
                                        <div className="sidebar-tooltip">Create Course</div>
                                    )}
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/instructor/students/"
                        className={`nav-link ${isPathActive('/instructor/students/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('students')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        {!sidebarCollapsed && <span>Students</span>}
                        {sidebarCollapsed && activeHover === 'students' && (
                            <div className="sidebar-tooltip">Students</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/earning/"
                        className={`nav-link ${isPathActive('/instructor/earning/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('earning')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        {!sidebarCollapsed && <span>Earnings</span>}
                        {sidebarCollapsed && activeHover === 'earning' && (
                            <div className="sidebar-tooltip">Earnings</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/orders/"
                        className={`nav-link ${isPathActive('/instructor/orders/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('orders')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        {!sidebarCollapsed && <span>Orders</span>}
                        {sidebarCollapsed && activeHover === 'orders' && (
                            <div className="sidebar-tooltip">Orders</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/coupons/"
                        className={`nav-link ${isPathActive('/instructor/coupons/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('coupons')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-tags"></i>
                        </div>
                        {!sidebarCollapsed && <span>Coupons</span>}
                        {sidebarCollapsed && activeHover === 'coupons' && (
                            <div className="sidebar-tooltip">Coupons</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/reviews/"
                        className={`nav-link ${isPathActive('/instructor/reviews/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('reviews')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        {!sidebarCollapsed && <span>Reviews</span>}
                        {sidebarCollapsed && activeHover === 'reviews' && (
                            <div className="sidebar-tooltip">Reviews</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/teacherNotifications/"
                        className={`nav-link ${isPathActive('/instructor/teacherNotifications/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('notifications')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-bell"></i>
                        </div>
                        {!sidebarCollapsed && <span>Notifications</span>}
                        {sidebarCollapsed && activeHover === 'notifications' && (
                            <div className="sidebar-tooltip">Notifications</div>
                        )}
                    </Link>

                    <Link
                        to="/instructor/questions-answers/"
                        className={`nav-link ${isPathActive('/instructor/questions-answers/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('qa')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-question-circle"></i>
                        </div>
                        {!sidebarCollapsed && <span>Q&A</span>}
                        {sidebarCollapsed && activeHover === 'qa' && (
                            <div className="sidebar-tooltip">Q&A</div>
                        )}
                    </Link>

                    <hr className="border-secondary mx-3 my-2" />

                    <Link
                        to="/instructor/profile/"
                        className={`nav-link ${isPathActive('/instructor/profile/') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('profile')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-user"></i>
                        </div>
                        {!sidebarCollapsed && <span>Profile</span>}
                        {sidebarCollapsed && activeHover === 'profile' && (
                            <div className="sidebar-tooltip">Profile</div>
                        )}
                    </Link>

                    <Link
                        to="/settings"
                        className={`nav-link ${isPathActive('/settings') ? 'active' : ''}`}
                        onMouseEnter={() => setActiveHover('settings')}
                        onMouseLeave={() => setActiveHover(null)}
                    >
                        <div className="nav-icon">
                            <i className="fas fa-cog"></i>
                        </div>
                        {!sidebarCollapsed && <span>Settings</span>}
                        {sidebarCollapsed && activeHover === 'settings' && (
                            <div className="sidebar-tooltip">Settings</div>
                        )}
                    </Link>
                </nav>

                {!sidebarCollapsed && (
                    <div className="sidebar-footer p-3 mt-auto border-top border-secondary">
                        <div className="d-grid">
                            <Link to="/logout" className="btn btn-outline-light btn-sm">
                                <i className="fas fa-sign-out-alt me-2"></i>Logout
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style>{
                `
                /* Enhanced Sidebar and Navbar Styles */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 80px;
  --navbar-height: 64px;
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --dark-bg: #111827;
  --darker-bg: #0f172a;
  --sidebar-active: #1e293b;
  --sidebar-hover: #1e293b;
  --transition-speed: 0.2s;
  --border-color: #1f2937;
}

/* Main Layout */
body {
  margin-top: var(--navbar-height);
  overflow-x: hidden;
  background-color: #f3f4f6;
}

.wrapper {
  display: flex;
  width: 100%;
  min-height: calc(100vh - var(--navbar-height));
}

.main-content {
  width: 100%;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-speed);
  padding: 24px;
  background-color: #f3f4f6;
}

/* Enhanced Dark Navbar Styles */
.navbar {
  height: var(--navbar-height);
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1030;
  background-color: var(--dark-bg) !important;
}

.navbar-brand {
  font-size: 1.25rem;
  color: white !important;
  transition: all var(--transition-speed);
}

.navbar-brand:hover {
  opacity: 0.9;
}

.text-gradient {
  background: linear-gradient(90deg, var(--primary-color), #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-nav .nav-link {
  padding: 0.5rem 1rem;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  transition: all var(--transition-speed);
}

.navbar-nav .nav-link:hover {
  color: white;
}

.dropdown-menu-dark {
  background-color: var(--darker-bg);
  border: 1px solid var(--border-color);
}

.dropdown-item {
  color: rgba(255, 255, 255, 0.8);
  transition: all var(--transition-speed);
}

.dropdown-item:hover {
  background-color: var(--sidebar-active);
  color: white;
}

.dropdown-divider {
  border-color: var(--border-color);
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.input-group-sm .form-control {
  background-color: var(--darker-bg);
  color: white;
  border-color: var(--border-color);
}

.input-group-sm .form-control:focus {
  background-color: var(--darker-bg);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.input-group-sm .btn {
  border-color: var(--border-color);
}

/* Enhanced Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  height: calc(100vh - var(--navbar-height));
  z-index: 1020;
  transition: width var(--transition-speed);
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--dark-bg);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-nav {
  padding-top: 0.5rem;
  display: flex;
  flex-direction: column;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  transition: all var(--transition-speed);
  position: relative;
  margin: 0.125rem 0.5rem;
  border-radius: 0.375rem;
}

.sidebar-nav .nav-link:hover {
  color: white;
  background-color: var(--sidebar-hover);
}

.sidebar-nav .nav-link.active {
  color: white;
  background-color: var(--primary-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar-nav .nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed);
}

.sidebar-nav .submenu {
  padding-left: 0;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
  margin: 0.25rem 0.75rem;
  overflow: hidden;
}

.sidebar-nav .submenu .nav-link {
  padding-left: 2.5rem;
  font-size: 0.875rem;
  margin: 0;
  border-radius: 0;
}

.sidebar-nav .submenu .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sidebar-nav .submenu .nav-link.active {
  background-color: var(--primary-color);
}

.sidebar-footer {
  border-top: 1px solid var(--border-color);
}

.sidebar-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--darker-bg);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  margin-left: 1rem;
  white-space: nowrap;
  z-index: 1050;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.sidebar.collapsed .nav-link:hover .sidebar-tooltip {
  opacity: 1;
}

.transition-all {
  transition: all var(--transition-speed);
}

/* Responsive */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width) !important;
  }

  .sidebar.collapsed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
  }
}

/* Animation for badge */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.badge-pulse {
  animation: pulse 1.5s infinite;
}

/* Custom scrollbar for sidebar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
            `}
            </style>
        </>
    );
};

export default TBaseSidebar;