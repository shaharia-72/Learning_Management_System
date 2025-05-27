import { useState, useEffect } from "react";
import moment from "moment";
import {
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiShoppingBag,
  FiFilter,
  FiSearch
} from "react-icons/fi";
import {
  FaSortAmountDown,
  FaSortAmountUp
} from "react-icons/fa";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import TBaseSidebar from "../partials/TBaseSidebar";
import ReactPaginate from "react-paginate";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ordersPerPage = 10;
  const pageCount = Math.ceil(filteredOrders.length / ordersPerPage);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const teacherId = UserData()?.teacher_id;
        if (!teacherId) return;

        const response = await useAxios().get(`teacher/course-order-list/${teacherId}/`);
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(order =>
        order.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order.oid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredOrders(result);
    setCurrentPage(0);
  }, [orders, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const getDisplayedOrders = () => {
    const startIndex = currentPage * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc'
      ? <FaSortAmountUp className="ms-1" />
      : <FaSortAmountDown className="ms-1" />;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <TBaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="container-fluid py-4 px-4">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-0">Order Management</h1>
              <p className="mb-0 text-muted">Track and manage all your course orders</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary me-3">
                {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FiSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by course name or invoice ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex">
                    <button className="btn btn-outline-secondary me-2">
                      <FiFilter className="me-1" /> Filter
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSearchTerm("");
                        setSortConfig({ key: "date", direction: "desc" });
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort("course.title")}
                    >
                      <div className="d-flex align-items-center">
                        Course
                        {getSortIcon("course.title")}
                      </div>
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort("price")}
                      className="text-end"
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        Amount
                        {getSortIcon("price")}
                      </div>
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort("order.oid")}
                    >
                      <div className="d-flex align-items-center">
                        Invoice
                        {getSortIcon("order.oid")}
                      </div>
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort("date")}
                    >
                      <div className="d-flex align-items-center">
                        Date
                        {getSortIcon("date")}
                      </div>
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayedOrders().map((order, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-3">
                            <div className="bg-light rounded p-2">
                              <FiShoppingBag className="text-primary" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0">{order.course.title}</h6>
                            <small className="text-muted">Order #{order.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold">${order.price}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          <FiFileText className="me-1" />
                          {order.order.oid}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FiCalendar className="me-2 text-muted" />
                          {moment(order.date).format("MMM D, YYYY")}
                        </div>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="card-body text-center py-5">
                <FiShoppingBag className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h4 className="text-muted">No orders found</h4>
                <p className="text-muted">
                  {searchTerm
                    ? "No orders match your search criteria"
                    : "You don't have any orders yet"}
                </p>
                {searchTerm && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
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
        .orders-management {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        .main-content {
          flex: 1;
          margin-left: 250px;
          transition: all 0.3s;
        }
        .main-content.collapsed {
          margin-left: 80px;
        }
        @media (max-width: 992px) {
          .main-content {
            margin-left: 0;
          }
        }
        .table th {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .pagination {
          flex-wrap: wrap;
        }
        .card {
          border: 1px solid #e9ecef;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default Orders;