import { useState, useEffect } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import TBaseSidebar from "../partials/TBaseSidebar";
import BaseSidebar from "../partials/BaseSidebar";
import ReactPaginate from "react-paginate";
import {
  FiMapPin,
  FiCalendar,
  FiMail,
  FiBook,
  FiUser,
  FiBarChart2,
  FiMessageSquare
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaRegStar,
  FaStar
} from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { generateColorFromName } from "../../utils/colorGenerator";

function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const studentsPerPage = 9;
  const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);
  const teacherId = UserData()?.teacher_id;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    topStudents: []
  });

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      if (!teacherId) throw new Error("Teacher ID not available");

      const response = await useAxios().get(`teacher/student-lists/${teacherId}/`);
      const data = response.data.map(student => ({
        ...student,
        full_name: student.first_name || "Anonymous",
        initials: getInitials(student.full_name),
        color: generateColorFromName(student.full_name || "Anonymous")
      }));

      setStudents(data);
      applyFilters(data, searchTerm, sortOrder, activeFilter);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(s => s.last_active && moment().diff(moment(s.last_active), 'days') <= 30).length;
    const newThisMonth = data.filter(s => moment(s.date).isSame(moment(), 'month')).length;
    const topStudents = [...data]
      .sort((a, b) => (b.completed_courses_count || 0) - (a.completed_courses_count || 0))
      .slice(0, 3);

    setStats({
      total,
      active,
      newThisMonth,
      topStudents
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0][0];
  };

  // Apply filters and sorting
  const applyFilters = (data, term, order, filter) => {
    let filtered = [...data];

    // Apply active filter
    if (filter === "active") {
      filtered = filtered.filter(s => s.last_active && moment().diff(moment(s.last_active), 'days') <= 30);
    } else if (filter === "new") {
      filtered = filtered.filter(s => moment(s.date).isSame(moment(), 'month'));
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(student =>
        student.full_name?.toLowerCase().includes(term.toLowerCase()) ||
        student.email?.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      return order === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    });

    setFilteredStudents(filtered);
    setCurrentPage(0);
  };

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Update displayed students when page or filtered students change
  useEffect(() => {
    const startIndex = currentPage * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    setDisplayedStudents(filteredStudents.slice(startIndex, endIndex));
  }, [currentPage, filteredStudents]);

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    switch (type) {
      case "search":
        setSearchTerm(value);
        applyFilters(students, value, sortOrder, activeFilter);
        break;
      case "sort":
        setSortOrder(value);
        applyFilters(students, searchTerm, value, activeFilter);
        break;
      case "filter":
        setActiveFilter(value);
        applyFilters(students, searchTerm, sortOrder, value);
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStudents();
  }, [teacherId]);

  // Loading and error states
  if (!teacherId) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle me-2"></i>
          Teacher ID not available. Please ensure you're logged in as a teacher.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="students-management">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <main className="main-content">
        <div className="container-fluid py-4 px-4">
          <div className="my-students-section">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 mb-0">My Students</h1>
                <p className="mb-0 text-muted">Manage and connect with your students</p>
              </div>
              <div className="d-flex align-items-center">
                <button className="btn btn-outline-primary me-3">
                  <FiMessageSquare className="me-1" /> Send Group Message
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                        <FaUserGraduate className="text-primary fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0">{stats.total}</h5>
                        <small className="text-muted">Total Students</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                        <FiUser className="text-success fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0">{stats.active}</h5>
                        <small className="text-muted">Active This Month</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                        <IoMdNotificationsOutline className="text-info fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0">{stats.newThisMonth}</h5>
                        <small className="text-muted">New This Month</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                        <FaStar className="text-warning fs-4" />
                      </div>
                      <div>
                        <h5 className="mb-0">
                          {stats.topStudents[0]?.full_name || "None"}
                        </h5>
                        <small className="text-muted">Top Student</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-lg-5 col-md-12">
                    <label className="form-label">Search Students</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <label className="form-label">Filter By</label>
                    <select
                      className="form-select"
                      value={activeFilter}
                      onChange={(e) => handleFilterChange("filter", e.target.value)}
                    >
                      <option value="all">All Students</option>
                      <option value="active">Active Students</option>
                      <option value="new">New This Month</option>
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-3 col-sm-3">
                    <label className="form-label">Sort By</label>
                    <select
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => handleFilterChange("sort", e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>

                  <div className="col-lg-2 col-md-3 col-sm-3">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm("");
                        setSortOrder("newest");
                        setActiveFilter("all");
                        setFilteredStudents(students);
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Students Grid */}
          <div className="row">
            {displayedStudents.length > 0 ? (
              displayedStudents.map((student) => (
                <div key={student.id} className="col-xl-4 col-lg-6 col-md-6 col-12 mb-4">
                  <div className="card shadow-sm h-100 hover-scale">
                    <div className="card-body text-center p-4">
                      <div className="position-relative mb-3">
                        {student.image ? (
                          <img
                            src={student.image}
                            className="rounded-circle avatar-xxl mb-3 border border-3 border-white shadow"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                            alt={student.full_name}
                          />
                        ) : (
                          <div
                            className="rounded-circle avatar-xxl mb-3 border border-3 border-white shadow d-flex align-items-center justify-content-center mx-auto"
                            style={{
                              width: "100px",
                              height: "100px",
                              backgroundColor: student.color,
                              color: "white",
                              fontSize: "2rem",
                              fontWeight: "bold"
                            }}
                          >
                            {student.initials}
                          </div>
                        )}
                        <span className={`position-absolute bottom-0 end-0 rounded-circle p-2 border border-2 border-white ${student.last_active && moment().diff(moment(student.last_active), 'days') <= 7
                          ? "bg-success"
                          : "bg-secondary"
                          }`}>
                          <FiUser className="text-white" />
                        </span>
                      </div>

                      <h4 className="mb-1">{student.full_name}</h4>
                      <p className="text-muted mb-3">
                        <FiMail className="me-2" />
                        {student.email || "No email provided"}
                      </p>

                      <div className="d-flex justify-content-center mb-3 flex-wrap">
                        {student.country && (
                          <span className="badge bg-light text-dark me-2 mb-1">
                            <FiMapPin className="me-1" />
                            {student.country}
                          </span>
                        )}
                        <span className="badge bg-light text-dark mb-1">
                          <FiCalendar className="me-1" />
                          Joined {moment(student.date).format("MMM YYYY")}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between border-top border-bottom py-3 my-3">
                        <div className="text-center px-2">
                          <div className="h5 mb-1">{student.enrolled_courses_count || 0}</div>
                          <small className="text-muted">Enrolled</small>
                        </div>
                        <div className="text-center px-2">
                          <div className="h5 mb-1">{student.completed_courses_count || 0}</div>
                          <small className="text-muted">Completed</small>
                        </div>
                        <div className="text-center px-2">
                          <div className="h5 mb-1">{student.active_courses_count || 0}</div>
                          <small className="text-muted">Active</small>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-3">
                        <Link
                          to={`/teacher/student/${student.id}`}
                          className="btn btn-outline-primary btn-sm flex-grow-1 me-2"
                          title="View student progress"
                        >
                          <FiBarChart2 className="me-1" /> Progress
                        </Link>
                        {student.email && (
                          <Link
                            to={`mailto:${student.email}`}
                            className="btn btn-primary btn-sm flex-grow-1"
                            title="Send message"
                          >
                            <FiMail className="me-1" /> Message
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body text-center py-5">
                    <FiBook className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                    <h4 className="text-muted">No students found</h4>
                    <p className="text-muted mb-4">
                      {searchTerm || activeFilter !== "all"
                        ? "No students match your current filters"
                        : "You don't have any students yet"}
                    </p>
                    {searchTerm || activeFilter !== "all" ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSearchTerm("");
                          setActiveFilter("all");
                        }}
                      >
                        Clear Filters
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredStudents.length > studentsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <ReactPaginate
                previousLabel={<i className="fas fa-chevron-left"></i>}
                nextLabel={<i className="fas fa-chevron-right"></i>}
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName="pagination"
                activeClassName="active"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakClassName="page-item"
                breakLinkClassName="page-link"
                forcePage={currentPage}
              />
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .students-management {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .main-content {
          flex: 1;
          margin-left: 250px;
          transition: all 0.3s;
        }
        @media (max-width: 992px) {
          .main-content {
            margin-left: 0;
          }
        }
        .avatar-xxl {
          width: 100px;
          height: 100px;
        }
        .hover-scale {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .hover-scale:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .pagination {
          flex-wrap: wrap;
        }
        .border-start {
          border-left: 4px solid !important;
        }
      `}</style>
    </div>
  );
}

export default Students;