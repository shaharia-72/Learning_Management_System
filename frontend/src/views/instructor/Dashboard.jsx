import { useState, useEffect } from "react";
import moment from "moment";
import { Link, Route, Routes } from "react-router-dom";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import BaseSidebar from '../partials/BaseSidebar';
import CourseCreate from "./CourseCreate";
import CourseEdit from "./CourseEdit";

import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchCourseData = () => {
    useAxios()
      .get(`teacher/summary/${UserData()?.teacher_id}/`)
      .then((res) => {
        setStats(res.data[0]);
      });

    useAxios()
      .get(`teacher/course-lists/${UserData()?.teacher_id}/`)
      .then((res) => {
        setCourses(res.data);
      });
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchCourseData();
    } else {
      const filtered = courses.filter((c) => {
        return c.title.toLowerCase().includes(query);
      });
      setCourses(filtered);
    }
  };

  return (
    <>

      <div className="d-flex">
        <BaseSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          user={UserData()}
        />

        <div className="main-content flex-grow-1">
          <section className="pt-5 pb-5">
            <div className="container-fluid px-4">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="mb-0">
                          <i className="bi bi-grid-fill me-2"></i>Dashboard Overview
                        </h2>
                        <Link
                          to="/instructor/create-course/"
                          className="btn btn-primary"
                        >
                          <i className="fas fa-plus me-2"></i>Create New Course
                        </Link>
                      </div>

                      <div className="row mb-4">
                        {/* Stats Cards */}
                        <div className="col-md-4 mb-3">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                                <i className="fas fa-tv fa-2x text-primary"></i>
                              </div>
                              <div>
                                <h3 className="mb-0 fw-bold">{stats.total_courses || 0}</h3>
                                <p className="mb-0 text-muted">Total Courses</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                                <i className="fas fa-users fa-2x text-success"></i>
                              </div>
                              <div>
                                <h3 className="mb-0 fw-bold">{stats.total_students || 0}</h3>
                                <p className="mb-0 text-muted">Total Students</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                                <i className="fas fa-dollar-sign fa-2x text-info"></i>
                              </div>
                              <div>
                                <h3 className="mb-0 fw-bold">${stats.total_revenue?.toFixed(2) || '0.00'}</h3>
                                <p className="mb-0 text-muted">Total Revenue</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Courses Table */}
                      <div className="card shadow-sm border-0">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                          <div>
                            <h4 className="mb-0">Your Courses</h4>
                            <p className="mb-0 text-muted">Manage all your courses in one place</p>
                          </div>
                          <div className="w-25">
                            <input
                              type="search"
                              className="form-control"
                              placeholder="Search courses..."
                              onChange={handleSearch}
                            />
                          </div>
                        </div>
                        <div className="card-body p-0">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Course</th>
                                  <th>Students</th>
                                  <th>Level</th>
                                  <th>Status</th>
                                  <th>Created</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courses?.map((c, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img
                                          src={c.image}
                                          alt={c.title}
                                          className="rounded me-3"
                                          style={{
                                            width: "80px",
                                            height: "60px",
                                            objectFit: "cover"
                                          }}
                                        />
                                        <div>
                                          <h6 className="mb-1">{c.title}</h6>
                                          <div className="d-flex text-muted small">
                                            <span className="me-2">
                                              <i className="fas fa-language me-1"></i>
                                              {c.language}
                                            </span>
                                            <span className="me-2">
                                              <i className="fas fa-dollar-sign me-1"></i>
                                              {c.price}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="badge bg-primary rounded-pill">
                                        {c.students?.length || 0}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge ${c.level === 'Beginner' ? 'bg-info' :
                                        c.level === 'Intermediate' ? 'bg-warning text-dark' : 'bg-danger'
                                        }`}>
                                        {c.level}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="badge bg-secondary">Active</span>
                                    </td>
                                    <td>
                                      {moment(c.date).format("MMM D, YYYY")}
                                    </td>
                                    <td>
                                      <div className="d-flex">
                                        <Link
                                          to={`/instructor/edit-course/${c.id}/`}
                                          className="btn btn-sm btn-outline-primary me-2"
                                          title="Edit"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Link>
                                        <button
                                          className="btn btn-sm btn-outline-danger me-2"
                                          title="Delete"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          title="View"
                                        >
                                          <i className="fas fa-eye"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                />
                <Route path="/instructor/create-course/" element={<CourseCreate />} />
                <Route path="/instructor/edit-course/:course_id/" element={<CourseEdit />} />
              </Routes>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default Dashboard;