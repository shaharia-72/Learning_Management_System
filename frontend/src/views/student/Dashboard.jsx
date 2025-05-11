import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import useAxios from '../../utils/useAxios';
import UseData from '../plugin/UserData';

function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const axiosInstance = useAxios();
    const userData = UseData();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsResponse = await axiosInstance.get(`student/summary/${userData?.user_id}/`);
                setStats(statsResponse.data[0]);

                const coursesResponse = await axiosInstance.get(`student/CoursesList/${userData?.user_id}/`);
                setCourses(coursesResponse.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        if (userData?.user_id) {
            fetchData();
        }
    }, [userData?.user_id]);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.course.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'in-progress') {
            return matchesSearch && course.completed_lesson?.length < course.lectures?.length;
        }
        if (activeTab === 'completed') {
            return matchesSearch && course.completed_lesson?.length === course.lectures?.length;
        }
        return matchesSearch;
    });

    return (
        <>
            <BaseHeader />

            <div className="dashboard-wrapper">
                {/* Sidebar with Bootstrap styling */}
                <div className={`sidebar bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
                        <h5 className="mb-0 text-white">
                            {!sidebarCollapsed && <span>EduPortal</span>}
                        </h5>
                        <button
                            className="btn btn-link text-white p-0"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <i className={`fas fa-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
                        </button>
                    </div>
                    <hr className="border-light m-0" />
                    <nav className="sidebar-nav">
                        <Link to="/dashboard" className="nav-link active">
                            <i className="fas fa-tachometer-alt me-3"></i>
                            {!sidebarCollapsed && <span>Dashboard</span>}
                        </Link>
                        <Link to="/courses" className="nav-link">
                            <i className="fas fa-book me-3"></i>
                            {!sidebarCollapsed && <span>My Courses</span>}
                        </Link>
                        <Link to="/progress" className="nav-link">
                            <i className="fas fa-chart-line me-3"></i>
                            {!sidebarCollapsed && <span>Progress</span>}
                        </Link>
                        <Link to="/certificates" className="nav-link">
                            <i className="fas fa-certificate me-3"></i>
                            {!sidebarCollapsed && <span>Certificates</span>}
                        </Link>
                        <Link to="/settings" className="nav-link">
                            <i className="fas fa-cog me-3"></i>
                            {!sidebarCollapsed && <span>Settings</span>}
                        </Link>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="main-content">
                    {/* Top Navigation */}
                    <nav className="navbar navbar-light bg-white shadow-sm">
                        <div className="container-fluid">
                            <button
                                className="navbar-toggler d-lg-none"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            >
                                <i className="fas fa-bars"></i>
                            </button>
                            <div className="d-flex align-items-center ms-auto">
                                <div className="dropdown">
                                    <button
                                        className="btn btn-light rounded-circle"
                                        id="userDropdown"
                                        data-bs-toggle="dropdown"
                                    >
                                        <i className="fas fa-user"></i>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li><span className="dropdown-item-text">Hi, {userData?.username}</span></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                                        <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
                                        <li><Link className="dropdown-item" to="/logout">Logout</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Dashboard Content */}
                    <div className="container-fluid py-4">
                        {/* Welcome Header */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h2 className="mb-1">Welcome back, {userData?.username}!</h2>
                                <p className="text-muted">Here's what's happening with your courses today</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="row mb-4 g-3">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                                                <i className="fas fa-tv text-primary fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="mb-0 fw-bold">{stats.total_course || 0}</h3>
                                                <span className="text-muted small">Total Courses</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                                                <i className="fas fa-clipboard-check text-success fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="mb-0 fw-bold">{stats.completed_lessons || 0}</h3>
                                                <span className="text-muted small">Completed Lessons</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                                                <i className="fas fa-medal text-warning fs-4"></i>
                                            </div>
                                            <div>
                                                <h3 className="mb-0 fw-bold">{stats.achieved_certificates || 0}</h3>
                                                <span className="text-muted small">Certificates</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courses Section */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom-0">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                    <div className="mb-2 mb-md-0">
                                        <h4 className="mb-1">
                                            <i className="fas fa-book me-2 text-primary"></i>
                                            My Courses
                                        </h4>
                                        <p className="text-muted small mb-0">Continue your learning journey</p>
                                    </div>
                                    <div className="d-flex">
                                        <div className="input-group me-3" style={{ width: '250px' }}>
                                            <span className="input-group-text bg-transparent">
                                                <i className="fas fa-search"></i>
                                            </span>
                                            <input
                                                type="search"
                                                className="form-control"
                                                placeholder="Search courses..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="btn-group">
                                            <button
                                                className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => setActiveTab('all')}
                                            >
                                                All
                                            </button>
                                            <button
                                                className={`btn btn-sm ${activeTab === 'in-progress' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => setActiveTab('in-progress')}
                                            >
                                                In Progress
                                            </button>
                                            <button
                                                className={`btn btn-sm ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => setActiveTab('completed')}
                                            >
                                                Completed
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {filteredCourses.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
                                        <h5>No courses found</h5>
                                        <p className="text-muted">Try changing your filters or enroll in new courses</p>
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {filteredCourses.map((c) => {
                                            const progress = c.lectures?.length > 0
                                                ? Math.round((c.completed_lesson?.length / c.lectures?.length) * 100)
                                                : 0;

                                            return (
                                                <div className="col-lg-4 col-md-6" key={c.id}>
                                                    <div className="card h-100 border-0 shadow-sm hover-lift">
                                                        <div className="card-img-top overflow-hidden" style={{ height: '160px' }}>
                                                            <img
                                                                src={c.course.image}
                                                                alt={c.course.title}
                                                                className="img-fluid w-100 h-100 object-cover"
                                                            />
                                                            <div className="badge bg-dark position-absolute top-2 end-2">
                                                                {c.course.level}
                                                            </div>
                                                        </div>
                                                        <div className="card-body">
                                                            <h5 className="card-title">{c.course.title}</h5>
                                                            <div className="d-flex justify-content-between small text-muted mb-3">
                                                                <span>
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    {c.lectures?.length} lessons
                                                                </span>
                                                                <span>
                                                                    <i className="fas fa-check-circle me-1"></i>
                                                                    {c.completed_lesson?.length} completed
                                                                </span>
                                                            </div>
                                                            <div className="mb-3">
                                                                <div className="progress" style={{ height: '6px' }}>
                                                                    <div
                                                                        className="progress-bar bg-success"
                                                                        style={{ width: `${progress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <small className="text-muted">{progress}% complete</small>
                                                            </div>
                                                        </div>
                                                        <div className="card-footer bg-white border-0">
                                                            <Link
                                                                to={`/course/${c.course.id}`}
                                                                className="btn btn-primary w-100"
                                                            >
                                                                {progress === 100 ? 'View Certificate' : 'Continue'}
                                                                <i className="fas fa-arrow-right ms-2"></i>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BaseFooter />

            {/* Custom CSS */}
            <style jsx global>{`
                :root {
                    --sidebar-width: 250px;
                    --sidebar-collapsed-width: 70px;
                }

                body {
                    overflow-x: hidden;
                }

                .dashboard-wrapper {
                    display: flex;
                    min-height: calc(100vh - 56px);
                }

                .sidebar {
                    width: var(--sidebar-width);
                    transition: all 0.3s;
                    position: fixed;
                    height: 100vh;
                    z-index: 1000;
                }

                .sidebar.collapsed {
                    width: var(--sidebar-collapsed-width);
                }

                .sidebar-nav {
                    padding: 1rem 0;
                }

                .sidebar-nav .nav-link {
                    color: rgba(255, 255, 255, 0.8);
                    padding: 0.75rem 1.5rem;
                    margin: 0.25rem 0;
                    transition: all 0.3s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sidebar-nav .nav-link:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.1);
                }

                .sidebar-nav .nav-link.active {
                    color: white;
                    background: rgba(255, 255, 255, 0.2);
                    border-left: 3px solid white;
                }

                .sidebar.collapsed .nav-link span {
                    display: none;
                }

                .sidebar.collapsed .nav-link {
                    text-align: center;
                    padding: 0.75rem 0;
                }

                .sidebar.collapsed .nav-link i {
                    margin-right: 0;
                    font-size: 1.25rem;
                }

                .main-content {
                    margin-left: var(--sidebar-width);
                    width: calc(100% - var(--sidebar-width));
                    transition: all 0.3s;
                }

                .sidebar.collapsed + .main-content {
                    margin-left: var(--sidebar-collapsed-width);
                    width: calc(100% - var(--sidebar-collapsed-width));
                }

                .hover-lift {
                    transition: all 0.2s ease;
                }

                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1) !important;
                }

                @media (max-width: 992px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }

                    .sidebar.collapsed {
                        transform: translateX(0);
                        width: var(--sidebar-collapsed-width);
                    }

                    .main-content {
                        margin-left: 0;
                        width: 100%;
                    }

                    .sidebar.show {
                        transform: translateX(0);
                    }

                    .sidebar.show + .main-content {
                        margin-left: var(--sidebar-width);
                    }
                }
            `}</style>
        </>
    );
}

export default Dashboard;