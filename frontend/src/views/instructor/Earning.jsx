import { useState, useEffect } from "react";
import moment from "moment";
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiAward } from "react-icons/fi";
import { FaChartLine, FaChartPie } from "react-icons/fa";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Header from "./Partials/Header";
import Sidebar from "./Partials/Sidebar";

function Earning() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    monthly_revenue: 0,
    total_students: 0,
    growth_rate: 0
  });
  const [earnings, setEarnings] = useState([]);
  const [bestSellingCourses, setBestSellingCourses] = useState([]);
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = UserData()?.user_id;
        if (!userId) return;

        setIsLoading(true);

        const [summaryRes, earningsRes, bestCoursesRes] = await Promise.all([
          useAxios().get(`teacher/summary/${userId}/`),
          useAxios().get(`teacher/all-months-earning/${userId}/`),
          useAxios().get(`teacher/best-course-earning/${userId}/`)
        ]);

        setStats(summaryRes.data[0] || {});
        setEarnings(earningsRes.data || []);
        setBestSellingCourses(bestCoursesRes.data || []);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEarnings = timeRange === "year"
    ? earnings.slice(-12)
    : earnings;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (isLoading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <>
      <BaseHeader />

      <section className="pt-5 pb-5">
        <div className="container">
          <Header />
          <div className="row mt-0 mt-md-4">
            <Sidebar />

            <div className="col-lg-9 col-md-8 col-12">
              {/* Earnings Overview Card */}
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h3 className="mb-1">Earnings Overview</h3>
                      <p className="mb-0 text-muted">Track your teaching income and growth</p>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary dropdown-toggle"
                        type="button"
                        id="timeRangeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {timeRange === "all" ? "All Time" : "This Year"}
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="timeRangeDropdown">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setTimeRange("all")}
                          >
                            All Time
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setTimeRange("year")}
                          >
                            This Year
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-4 mb-md-0">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                              <FiDollarSign className="text-primary fs-4" />
                            </div>
                            <div>
                              <h5 className="mb-0">${stats.total_revenue?.toFixed(2)}</h5>
                              <small className="text-muted">Total Earnings</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                              <FiTrendingUp className="text-success fs-4" />
                            </div>
                            <div>
                              <h5 className="mb-0">${stats.monthly_revenue?.toFixed(2)}</h5>
                              <small className="text-muted">Current Month</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Selling Courses */}
              <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Best Selling Courses</h4>
                    <button className="btn btn-sm btn-outline-primary">
                      View All
                    </button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Course</th>
                        <th className="text-end">Sales</th>
                        <th className="text-end">Revenue</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestSellingCourses.map((course, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={course.course_image ? `http://127.0.0.1:8000${course.course_image}` : '/default-course.png'}
                                alt={course.course_title}
                                className="rounded me-3"
                                style={{
                                  width: "60px",
                                  height: "45px",
                                  objectFit: "cover"
                                }}
                              />
                              <div>
                                <h6 className="mb-0">{course.course_title}</h6>
                                <small className="text-muted">${course.revenue?.toFixed(2)} each</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">{course.sales}</td>
                          <td className="text-end">${course.revenue?.toFixed(2)}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-secondary">
                              <i className="fe fe-more-vertical" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Earnings History */}
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Earnings History</h4>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        id="chartTypeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <FaChartLine className="me-1" /> View as Chart
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="chartTypeDropdown">
                        <li>
                          <button className="dropdown-item">
                            <FaChartLine className="me-2" /> Line Chart
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item">
                            <FaChartPie className="me-2" /> Pie Chart
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Month</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEarnings.map((earning, index) => (
                        <tr key={index}>
                          <td>{monthNames[earning.month - 1]}</td>
                          <td className="text-end">${earning.total_earning?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />

      <style jsx>{`
        .card {
          border: 1px solid #e9ecef;
        }
        .table th {
          border-top: none;
        }
        .table-responsive {
          border-radius: 0 0 0.375rem 0.375rem;
          overflow: hidden;
        }
        .card-header {
          border-bottom: 1px solid #e9ecef;
        }
      `}</style>
    </>
  );
}

export default Earning;