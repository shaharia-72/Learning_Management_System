import { useState, useEffect } from "react";
import moment from "moment";
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiChevronDown
} from "react-icons/fi";
import {
  FaChartLine,
  FaBook,
  FaUserGraduate,
  FaStar
} from "react-icons/fa";
import {
  BsGraphUp,
  BsThreeDotsVertical
} from "react-icons/bs";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import TBaseSidebar from "../partials/TBaseSidebar";
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Earning() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    monthly_revenue: 0,
    total_students: 0,
    growth_rate: 0
  });
  const [earnings, setEarnings] = useState([]);
  const [bestSellingCourses, setBestSellingCourses] = useState([]);
  const [timeRange, setTimeRange] = useState("year");
  const [viewMode, setViewMode] = useState("chart");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const chartData = {
    labels: filteredEarnings.map(earning => monthNames[earning.month - 1]),
    datasets: [
      {
        label: 'Earnings',
        data: filteredEarnings.map(earning => earning.total_earning),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `$${value}`;
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earning-management">
      <TBaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <main className={`main-content`}>
        <div className="container-fluid py-4 px-4">
          {/* Header Section */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <h1 className="h2 mb-1">Earnings Dashboard</h1>
              <p className="text-muted mb-0">Track and analyze your teaching income</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="timeRangeDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FiCalendar className="fs-5" />
                  {timeRange === "all" ? "All Time" : "Last 12 Months"}
                  <FiChevronDown className="ms-1" />
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="timeRangeDropdown">
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => setTimeRange("year")}
                    >
                      <FiCalendar /> Last 12 Months
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2"
                      onClick={() => setTimeRange("all")}
                    >
                      <FiCalendar /> All Time
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FiDollarSign className="text-primary fs-4" />
                    </div>
                    <div>
                      <h3 className="mb-0">${stats.total_revenue?.toFixed(2)}</h3>
                      <small className="text-muted">Total Earnings</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                      <FiTrendingUp className="text-success fs-4" />
                    </div>
                    <div>
                      <h3 className="mb-0">${stats.monthly_revenue?.toFixed(2)}</h3>
                      <small className="text-muted">This Month</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                      <FaUserGraduate className="text-info fs-4" />
                    </div>
                    <div>
                      <h3 className="mb-0">{stats.total_students || 0}</h3>
                      <small className="text-muted">Total Students</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                      <BsGraphUp className="text-warning fs-4" />
                    </div>
                    <div>
                      <h3 className="mb-0">{stats.growth_rate || 0}%</h3>
                      <small className="text-muted">Growth Rate</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <h4 className="mb-0">Earnings Trend</h4>
              <div className="d-flex gap-2">
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    id="chartTypeDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {viewMode === "chart" ? (
                      <>
                        <FaChartLine /> Chart
                      </>
                    ) : (
                      <>
                        <FiBarChart2 /> Table
                      </>
                    )}
                    <FiChevronDown className="ms-1" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="chartTypeDropdown">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setViewMode("chart")}
                      >
                        <FaChartLine /> Chart View
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setViewMode("table")}
                      >
                        <FiBarChart2 /> Table View
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body">
              {viewMode === "chart" ? (
                <div style={{ height: '300px' }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Month</th>
                        <th className="text-end">Earnings</th>
                        <th className="text-end">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEarnings.map((earning, index) => {
                        const prevMonthEarning = index > 0
                          ? filteredEarnings[index - 1].total_earning
                          : earning.total_earning;
                        const growth = ((earning.total_earning - prevMonthEarning) / prevMonthEarning * 100).toFixed(1);

                        return (
                          <tr key={index}>
                            <td>
                              <strong>{monthNames[earning.month - 1]}</strong>
                            </td>
                            <td className="text-end">
                              ${earning.total_earning?.toFixed(2)}
                            </td>
                            <td className={`text-end ${growth >= 0 ? 'text-success' : 'text-danger'}`}>
                              {growth}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Best Selling Courses */}
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <h4 className="mb-0">Top Performing Courses</h4>
                  <button className="btn btn-sm btn-outline-primary">
                    View All Courses
                  </button>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Course</th>
                          <th className="text-end">Students</th>
                          <th className="text-end">Revenue</th>
                          <th className="text-end">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bestSellingCourses.map((course, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 me-3">
                                  <img
                                    src={course.course_image ? `http://127.0.0.1:8000${course.course_image}` : '/default-course.png'}
                                    alt={course.course_title}
                                    className="rounded"
                                    style={{
                                      width: "60px",
                                      height: "45px",
                                      objectFit: "cover"
                                    }}
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0">{course.course_title}</h6>
                                  <small className="text-muted">
                                    ${course.price?.toFixed(2)} per enrollment
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">{course.sales}</td>
                            <td className="text-end">${course.revenue?.toFixed(2)}</td>
                            <td className="text-end">
                              <div className="d-flex align-items-center justify-content-end">
                                <FaStar className="text-warning me-1" />
                                {course.rating?.toFixed(1) || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0">
                  <h4 className="mb-0">Revenue Distribution</h4>
                </div>
                <div className="card-body d-flex flex-column">
                  <div style={{ height: '250px' }}>
                    <Pie
                      data={{
                        labels: bestSellingCourses.slice(0, 5).map(course => course.course_title),
                        datasets: [{
                          data: bestSellingCourses.slice(0, 5).map(course => course.revenue),
                          backgroundColor: [
                            '#6366f1',
                            '#8b5cf6',
                            '#ec4899',
                            '#f97316',
                            '#10b981'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `${context.label}: $${context.raw.toFixed(2)}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="mt-auto pt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Top 5 Courses</span>
                      <span className="fw-bold">
                        ${bestSellingCourses.slice(0, 5).reduce((sum, course) => sum + course.revenue, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f97316, #10b981)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .earning-management {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .main-content {
          flex: 1;
          margin-left: 250px;
          transition: all 0.3s;
          padding-top: 1rem;
        }
        .main-content.collapsed {
          margin-left: 80px;
        }
        @media (max-width: 992px) {
          .main-content {
            margin-left: 0;
          }
        }
        .card {
          transition: transform 0.2s, box-shadow 0.2s;
          border-radius: 0.75rem !important;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.1) !important;
        }
        .card-header {
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem 0.75rem 0 0 !important;
        }
        .card-body {
          padding: 1.5rem;
        }
        .dropdown-menu {
          border: none;
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1);
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
        .dropdown-item {
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
        }
        .table th {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          color: #6c757d;
        }
        .progress {
          background-color: #e9ecef;
          border-radius: 0.375rem;
        }
        .bg-opacity-10 {
          background-opacity: 0.1;
        }
      `}</style>
    </div>
  );
}

export default Earning;