import { useState, useEffect } from "react";
import moment from "moment";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import TBaseSidebar from "../partials/TBaseSidebar";
import ReactPaginate from "react-paginate";
import BaseSidebar from '../partials/BaseSidebar';

function Review() {
  // State management
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortOrder, setSortOrder] = useState("priority");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 10;
  const pageCount = Math.ceil(filteredReviews.length / reviewsPerPage);

  // Get teacher ID from UserData
  const teacherId = UserData()?.teacher_id;

  // Calculate review statistics
  const calculateStats = (reviews) => {
    const total = reviews.length;
    const replied = reviews.filter(r => r.reply).length;
    const unreplied = total - replied;
    const averageRating = total > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1)
      : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const count = reviews.filter(r => r.rating === rating).length;
      return {
        rating,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      };
    });

    return { total, replied, unreplied, averageRating, ratingDistribution };
  };

  const stats = calculateStats(filteredReviews);

  // Fetch reviews data
  const fetchReviewsData = async () => {
    try {
      setIsLoading(true);
      if (!teacherId) throw new Error("Teacher ID not available");

      const response = await useAxios().get(`teacher/review-lists/${teacherId}/`);
      setReviews(response.data);
      applyFilters(response.data, searchTerm, selectedRating, sortOrder);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError(error.message);
      Toast().fire({
        icon: "error",
        title: "Failed to load reviews",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all filters and sorting
  const applyFilters = (data, term, rating, order) => {
    let filtered = [...data];

    // Filter by search term
    if (term) {
      filtered = filtered.filter(review =>
        review.course?.title?.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Filter by rating
    if (rating > 0) {
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Sort based on priority (unreplied first, then newest)
    if (order === "priority") {
      filtered.sort((a, b) => {
        // Unreplied reviews first
        if (!a.reply && b.reply) return -1;
        if (a.reply && !b.reply) return 1;

        // Then sort by date (newest first)
        return new Date(b.date) - new Date(a.date);
      });
    } else {
      // Sort by date only
      filtered.sort((a, b) => {
        return order === "Newest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      });
    }

    setFilteredReviews(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Update displayed reviews when page or filtered reviews change
  useEffect(() => {
    const startIndex = currentPage * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    setDisplayedReviews(filteredReviews.slice(startIndex, endIndex));
  }, [currentPage, filteredReviews]);

  // Handle reply submission
  const handleSubmitReply = async (reviewId) => {
    if (!reply.trim()) {
      Toast().fire({
        icon: "warning",
        title: "Please enter a reply",
      });
      return;
    }

    try {
      await useAxios().patch(`teacher/review-detail/${teacherId}/${reviewId}/`, {
        reply: reply,
      });
      Toast().fire({
        icon: "success",
        title: "Reply sent successfully",
      });
      fetchReviewsData();
      setReply("");
      setActiveReplyId(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
      Toast().fire({
        icon: "error",
        title: "Failed to send reply",
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    switch (type) {
      case "search":
        setSearchTerm(value);
        applyFilters(reviews, value, selectedRating, sortOrder);
        break;
      case "rating":
        setSelectedRating(value);
        applyFilters(reviews, searchTerm, value, sortOrder);
        break;
      case "sort":
        setSortOrder(value);
        applyFilters(reviews, searchTerm, selectedRating, value);
        break;
      default:
        break;
    }
  };

  // Fetch data on component mount and when teacherId changes
  useEffect(() => {
    if (teacherId) fetchReviewsData();
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
        <p className="mt-3">Loading reviews...</p>
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
    <div className="review-management">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <main className="main-content">
        <div className="container-fluid py-4 px-4">
          {/* Header Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-0">Course Reviews</h1>
              <p className="mb-0 text-muted">Manage and respond to student feedback</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary me-3">
                {stats.total} Review{stats.total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Review Statistics */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 col-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                          <i className="fas fa-star text-primary fa-lg"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">{stats.averageRating}</h5>
                          <small className="text-muted">Average Rating</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                          <i className="fas fa-check-circle text-success fa-lg"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">{stats.replied}</h5>
                          <small className="text-muted">Replied</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                          <i className="fas fa-exclamation-circle text-warning fa-lg"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">{stats.unreplied}</h5>
                          <small className="text-muted">Unreplied</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 p-3 rounded me-3">
                          <i className="fas fa-chart-pie text-info fa-lg"></i>
                        </div>
                        <div>
                          <h5 className="mb-0">{stats.total}</h5>
                          <small className="text-muted">Total Reviews</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="mt-4">
                    <h6 className="mb-3">Rating Distribution</h6>
                    <div className="row">
                      {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="col-md-2 col-4 mb-3">
                          <div className="d-flex align-items-center mb-1">
                            <Rater total={1} rating={1} interactive={false} />
                            <span className="ms-1 fw-bold">{rating}</span>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: rating >= 4 ? '#28a745' : rating >= 3 ? '#ffc107' : '#dc3545'
                              }}
                            ></div>
                          </div>
                          <small className="text-muted">{count} ({percentage}%)</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by course name..."
                      value={searchTerm}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={selectedRating}
                    onChange={(e) => handleFilterChange("rating", parseInt(e.target.value))}
                  >
                    <option value={0}>All Ratings</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                  >
                    <option value="priority">Priority (Unreplied)</option>
                    <option value="Newest">Newest First</option>
                    <option value="Oldest">Oldest First</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedRating(0);
                      setSortOrder("priority");
                      setFilteredReviews(reviews);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              {displayedReviews.length > 0 ? (
                <div className="list-group list-group-flush">
                  {displayedReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`list-group-item p-4 border-bottom ${!review.reply ? 'bg-light bg-opacity-10' : ''}`}
                    >
                      <div className="d-flex position-relative">
                        {!review.reply && (
                          <span className="badge bg-warning position-absolute top-0 end-0 m-2">
                            <i className="fas fa-exclamation-circle me-1"></i> Needs Reply
                          </span>
                        )}
                        <div className="flex-shrink-0 me-3">
                          <img
                            src={review.profile?.image || '/default-avatar.png'}
                            alt={review.profile?.full_name || 'User'}
                            className="rounded-circle"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              border: "2px solid #f8f9fa"
                            }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="mb-1">{review.profile?.first_name || 'Anonymous'}</h5>
                              <small className="text-muted">
                                {moment(review.date).format("MMMM D, YYYY [at] h:mm A")}
                              </small>
                            </div>
                          </div>

                          <div className="mb-2">
                            <div className="d-flex align-items-center">
                              <Rater
                                total={5}
                                rating={review.rating || 0}
                                interactive={false}
                              />
                              <span className="ms-2 text-muted">for</span>
                              <span className="ms-2 fw-bold">
                                {review.course?.title || 'Unknown Course'}
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="bg-light p-3 rounded">
                              <p className="mb-0 fw-semibold">Student's Review:</p>
                              <p className="mb-0">{review.review || 'No review text provided'}</p>
                            </div>
                          </div>

                          {review.reply && (
                            <div className="mb-3">
                              <div className="bg-primary bg-opacity-10 p-3 rounded">
                                <p className="mb-0 fw-semibold">Your Response:</p>
                                <p className="mb-0">{review.reply}</p>
                              </div>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              className={`btn btn-sm ${review.reply ? 'btn-outline-primary' : 'btn-primary'}`}
                              onClick={() => setActiveReplyId(activeReplyId === review.id ? null : review.id)}
                            >
                              <i className="fas fa-reply me-1"></i>
                              {review.reply ? 'Update Response' : 'Send Response'}
                            </button>
                          </div>

                          {activeReplyId === review.id && (
                            <div className="mt-3">
                              <div className="card border-primary">
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                      {review.reply ? 'Update Your Response' : 'Write a Response'}
                                    </label>
                                    <textarea
                                      className="form-control"
                                      rows="3"
                                      value={reply}
                                      onChange={(e) => setReply(e.target.value)}
                                      placeholder="Type your response here..."
                                      style={{ minHeight: "100px" }}
                                    />
                                  </div>
                                  <div className="d-flex justify-content-end gap-2">
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() => setActiveReplyId(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => handleSubmitReply(review.id)}
                                    >
                                      <i className="fas fa-paper-plane me-1"></i> Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="py-5">
                    <i className="fas fa-comment-slash text-muted fa-3x mb-3"></i>
                    <h4 className="text-muted">No reviews found</h4>
                    <p className="text-muted">
                      {searchTerm || selectedRating > 0
                        ? "Try adjusting your filters"
                        : "You haven't received any reviews yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {filteredReviews.length > reviewsPerPage && (
            <div className="d-flex justify-content-center">
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
        .review-management {
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
        .progress {
          background-color: #e9ecef;
        }
        .list-group-item {
          transition: all 0.2s;
        }
        .pagination {
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

export default Review;