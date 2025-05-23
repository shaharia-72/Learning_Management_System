import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { FaUser, FaShoppingCart, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

function BaseHeader() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { user, isLoggedIn, clearAuth } = useAuthStore();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    Desphixs
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/pages/contact-us/">
                                <i className="fas fa-phone me-1"></i> Contact
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/pages/about-us/">
                                <i className="fas fa-info-circle me-1"></i> About
                            </Link>
                        </li>

                        {isLoggedIn && (
                            <>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="instructorDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="fas fa-chalkboard-user me-1"></i> Instructor
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="instructorDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/instructor/dashboard/">
                                                <i className="bi bi-grid-fill me-2"></i> Dashboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/instructor/courses/">
                                                <i className="fas fa-book me-2"></i> My Courses
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/instructor/create-course/">
                                                <i className="fas fa-plus me-2"></i> Create Course
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link className="dropdown-item" to="/instructor/profile/">
                                                <i className="fas fa-cog me-2"></i> Profile
                                            </Link>
                                        </li>
                                    </ul>
                                </li>

                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="studentDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="fas fa-graduation-cap me-1"></i> Student
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="studentDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/student/dashboard/">
                                                <i className="bi bi-grid-fill me-2"></i> Dashboard
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/student/courses/">
                                                <i className="fas fa-book me-2"></i> My Courses
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/student/wishlist/">
                                                <i className="fas fa-heart me-2"></i> Wishlist
                                            </Link>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <Link className="dropdown-item" to="/student/profile/">
                                                <i className="fas fa-cog me-2"></i> Profile
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </ul>

                    <form className="d-flex me-3" onSubmit={handleSearchSubmit}>
                        <div className="input-group">
                            <input
                                className="form-control"
                                type="search"
                                placeholder="Search courses..."
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-outline-light" type="submit">
                                <FiSearch />
                            </button>
                        </div>
                    </form>

                    <div className="d-flex align-items-center">
                        {isLoggedIn ? (
                            <>
                                <Link to="/cart/" className="btn btn-outline-light me-2 position-relative">
                                    <FaShoppingCart />
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {/* {cartCount} */}
                                    </span>
                                </Link>

                                <div className="dropdown">
                                    <button
                                        className="btn btn-outline-light dropdown-toggle"
                                        type="button"
                                        id="userDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <FaUser className="me-1" />
                                        {user?.username || "Account"}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                        <li>
                                            <Link className="dropdown-item" to="/student/profile/">
                                                <i className="fas fa-user me-2"></i> Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={handleLogout}>
                                                <FaSignOutAlt className="me-2" /> Logout
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login/" className="btn btn-outline-light me-2">
                                    <FaSignInAlt className="me-1" /> Login
                                </Link>
                                <Link to="/register/" className="btn btn-primary">
                                    <FaUserPlus className="me-1" /> Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default BaseHeader;