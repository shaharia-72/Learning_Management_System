import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import moment from 'moment'
import useAxios from '../../utils/useAxios'
import { useParams } from 'react-router-dom'
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import Toast from "../plugin/Toast";
import UserData from '../plugin/UserData'

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const param = useParams();
  const [cartCount, setCartCount] = useState(0);
  const [addToCartBtn, setAddToCartBtn] = useState("Add To Cart");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const currentAddress = GetCurrentAddress();

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await useAxios().get(`/course/course-detail/${param.slug}/`);
        setCourse(response.data);
        console.log(response.data);

        // Check if course is in wishlist
        if (UserData()?.user_id) {
          checkWishlistStatus(response.data.id);
        }
      } catch (error) {
        setError(error);
        console.error("Error fetching course: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
    fetchCartCount();
  }, [param.slug]);


  const fetchCartCount = async () => {
    try {
      const cartResponse = await useAxios().get(`course/cart-list/${CartId()}/`);
      setCartCount(cartResponse.data?.length || 0);
    } catch (error) {
      console.error("Failed to fetch cart list:", error);
    }
  };


  const checkWishlistStatus = async (courseId) => {
    try {
      const response = await useAxios().get(`student/wishlist-check/${UserData()?.user_id}/${courseId}/`);
      setIsInWishlist(response.data.is_in_wishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const addToCart = async () => {
    if (!course) return;

    setAddToCartBtn("Adding To Cart");

    const formdata = new FormData();
    formdata.append("course_id", course.id);
    formdata.append("user_id", UserData()?.user_id || "");
    formdata.append("price", course.price);
    formdata.append("country_name", currentAddress || "");
    formdata.append("cart_id", CartId());

    try {
      const response = await useAxios().post(`cart/course-Cart/`, formdata);
      console.log(response.data);
      setAddToCartBtn("Added To Cart");

      Toast().fire({
        title: "Added To Cart",
        icon: "success",
      });

      // Update cart count
      await fetchCartCount();
    } catch (error) {
      console.error("Add to cart failed:", error);
      setAddToCartBtn("Add To Cart");

      Toast().fire({
        title: error.response?.data?.message || "Failed to Add to Cart",
        icon: "error",
      });
    }
  };

  const addToWishlist = async () => {
    if (!course) return;

    const formdata = new FormData();
    formdata.append("user_id", UserData()?.user_id);
    formdata.append("course_id", course.id);

    try {
      const res = await useAxios().post(`student/wishlist/${UserData()?.user_id}/`, formdata);
      setIsInWishlist(!isInWishlist);

      Toast().fire({
        icon: "success",
        title: res.data.message || (isInWishlist ? "Removed from wishlist" : "Added to wishlist"),
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      Toast().fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to update wishlist",
      });
    }
  };


  return (
    <>
      <BaseHeader />

      <div className="course-details-page">
        {/* Hero Section */}
        {/* Enhanced Hero Section */}
        {/* Hero Section */}
        <section className="hero-section py-5 py-lg-7 bg-white">
          <div className="container">
            <div className="row align-items-center">
              {/* Left Content */}
              <div className="col-lg-7 order-lg-1 order-2">
                <div className="hero-content pe-lg-5">
                  {/* Badge */}
                  <span className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2">
                    <i className="fas fa-laptop-code me-2"></i> {course?.category?.title || "No information available"}
                  </span>

                  {/* Title */}
                  <h1 className="display-4 fw-bold mb-4 text-dark">
                    {course?.title || "No information available"}
                  </h1>

                  {/* Description */}
                  <p className="lead mb-4 text-muted">
                    The ultimate 12-course bundle to take you from beginner to job-ready full-stack developer.
                    Build modern web applications with React frontends and Django backends.
                  </p>

                  {/* Stats */}
                  <div className="d-flex flex-wrap gap-4 mb-4">
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-primary bg-opacity-10 text-primary rounded-circle me-3 p-2">
                        <i className="fas fa-star"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{course?.average_rating?.null ? course.average_rating : "0"}/5.0</h6>
                        <small className="text-muted">(2,450 reviews)</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-info bg-opacity-10 text-info rounded-circle me-3 p-2">
                        <i className="fas fa-users"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{course?.students?.length > 1 ? course?.students?.length : "0"}+</h6>
                        <small className="text-muted">Students</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="icon-box bg-success bg-opacity-10 text-success rounded-circle me-3 p-2">
                        <i className="fas fa-signal"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{course?.level}</h6>
                        <small className="text-muted">to Advanced</small>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="d-flex flex-wrap gap-3 mb-4">
                    {/* <button className="btn btn-primary px-4 py-3 fw-bold">
                      <i className="fas fa-shopping-cart me-2"></i> Enroll Now
                    </button> */}
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={addToCart}
                      disabled={addToCartBtn === "Added To Cart"}
                    >
                      <i className="fas fa-shopping-cart me-2"></i> {addToCartBtn}
                    </button>
                    <button
                      className="btn btn-outline-primary px-4 py-3 fw-bold"
                      data-bs-toggle="modal"
                      data-bs-target="#previewModal"
                    >
                      <i className="fas fa-play me-2"></i> Preview Course
                    </button>
                  </div>

                  {/* Last Updated & Guarantee */}
                  <div className="d-flex flex-wrap align-items-center gap-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-calendar-alt text-muted me-2"></i>
                      <small className="text-muted">{moment(course?.date).format("DD MMM, YYYY")}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-shield-alt text-muted me-2"></i>
                      <small className="text-muted">30-Day Money-Back Guarantee</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="col-lg-5 order-lg-2 order-1 mb-4 mb-lg-0">
                <div className="hero-image position-relative">
                  <div className="position-relative rounded-4 overflow-hidden shadow-lg" style={{ aspectRatio: '16 / 9' }}>
                    <img
                      src={course?.image}
                      alt={course?.title || "Course image"}
                      className="img-fluid w-100 h-100 object-fit-cover"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10"></div>
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <button
                        className="btn btn-danger btn-lg rounded-circle shadow"
                        data-bs-toggle="modal"
                        data-bs-target="#previewModal"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="position-absolute bottom-0 start-0 translate-middle-y ms-4">
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-white text-dark shadow-sm py-2 px-3">
                        <i className="fas fa-certificate text-warning me-2"></i>
                        Certificate Included
                      </span>
                      <span className="badge bg-white text-dark shadow-sm py-2 px-3">
                        <i className="fas fa-infinity text-primary me-2"></i>
                        Lifetime Access
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              {/* Left Content Column */}
              <div className="col-lg-8">
                {/* Course Navigation Tabs */}
                <div className="card shadow-sm mb-5">
                  <div className="card-header bg-white border-bottom">
                    <ul className="nav nav-tabs card-header-tabs" id="courseTabs" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="overview-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#overview"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-info-circle me-2"></i> Overview
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="curriculum-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#curriculum"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-list-ol me-2"></i> Curriculum
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="instructor-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#instructor"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-user-tie me-2"></i> Instructor
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="reviews-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#reviews"
                          type="button"
                          role="tab"
                        >
                          <i className="fas fa-star-half-alt me-2"></i> Reviews
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="card-body p-4">
                    <div className="tab-content" id="courseTabsContent">
                      {/* Overview Tab */}
                      <div className="tab-pane fade show active" id="overview" role="tabpanel">
                        <h3 className="mb-4">Course Description</h3>
                        <div >
                          <p className="lead text-muted lh-lg"
                            dangerouslySetInnerHTML={{
                              __html: course?.description?.slice(0, 200),
                            }}></p>


                        </div>
                        <h4 className="mb-3">What You'll Learn</h4>
                        <div className="row">
                          <div className="col-md-6">
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                React fundamentals and advanced concepts
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Django models, views, and templates
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                REST API development with Django REST Framework
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Authentication and authorization
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                State management with Redux
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Deployment to production
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Testing and debugging
                              </li>
                              <li className="mb-2">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Performance optimization
                              </li>
                            </ul>
                          </div>
                        </div>

                        <h4 className="mt-4 mb-3">Course Requirements</h4>
                        <ul className="list-group list-group-flush mb-4">
                          <li className="list-group-item bg-light">
                            <i className="fas fa-check me-2 text-primary"></i>
                            Basic understanding of HTML, CSS, and JavaScript
                          </li>
                          <li className="list-group-item bg-light">
                            <i className="fas fa-check me-2 text-primary"></i>
                            No prior React or Django experience required
                          </li>
                          <li className="list-group-item bg-light">
                            <i className="fas fa-check me-2 text-primary"></i>
                            A computer with internet access
                          </li>
                        </ul>

                        <h4 className="mt-4 mb-3">Who This Course Is For</h4>
                        <div className="alert alert-info">
                          <ul className="mb-0">
                            <li>Beginners who want to become full-stack developers</li>
                            <li>Frontend developers looking to learn backend development</li>
                            <li>Backend developers wanting to learn modern frontend frameworks</li>
                            <li>Anyone interested in building complete web applications</li>
                          </ul>
                        </div>
                      </div>

                      {/* Curriculum Tab */}
                      <div className="tab-pane fade" id="curriculum" role="tabpanel">
                        <h3 className="mb-4">Course Curriculum</h3>

                        <div className="accordion" id="curriculumAccordion">
                          {/* Module 1 */}
                          {course?.curriculum?.map((c, index) =>
                          (
                            <div className="accordion-item mb-3 border-0 shadow-sm" key={(c.module)}>
                              <h2 className="accordion-header" id={`heading-${c.module}`}>
                                <button
                                  className="accordion-button fw-bold"
                                  type="button" fas fa-play-circle text-danger me-2
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse-${c.module}`}
                                  aria-expanded={index === 0 ? "true" : "false"}
                                  aria-controls={`collapse-${c.module}`}
                                >
                                  <span className="badge bg-primary me-3">Module {c.module}</span>
                                  {c.title}
                                  <span className="ms-auto small text-muted">5 Lectures • 1h 45m</span>
                                </button>
                              </h2>
                              <div
                                id={`collapse-${c.module}`}
                                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}

                                aria-labelledby="headingOne"
                                data-bs-parent="#curriculumAccordion"
                              >
                                {c.variant_items?.map((l, index) =>
                                  <div className="accordion-body p-0">
                                    <ul className="list-group list-group-flush">
                                      <li className="list-group-item d-flex justify-content-between align-items-center">

                                        <div>

                                          <i className={l.preview ? "fas fa-play-circle text-danger me-2" : "fas fa-lock me-2"}></i>

                                          <span>{l.title}</span>
                                        </div>

                                        <span className="badge bg-light text-dark">{l?.content_duration || "00.00.00"}</span>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                        </div>

                        <div className="alert alert-warning mt-4">
                          <i className="fas fa-lock me-2"></i>
                          <strong>Premium Content:</strong> Some lessons are locked and require enrollment to access.
                        </div>
                      </div>

                      {/* Instructor Tab */}
                      <div className="tab-pane fade" id="instructor" role="tabpanel">
                        <h3 className="mb-4">About the Instructor</h3>

                        <div className="card border-0 shadow-sm mb-4">
                          <div className="row g-0">
                            <div className="col-md-4">
                              <img
                                src={course?.teacher?.image}
                                className="img-fluid rounded-start h-100 object-fit-cover"
                                alt="Instructor"
                              />
                            </div>
                            <div className="col-md-8">
                              <div className="card-body">
                                <h4 className="card-title mb-2">{course?.teacher?.full_name || "No information available"}</h4>
                                <p className="text-muted mb-3">{course?.teacher?.bio || "No information available"}</p>

                                <div className="d-flex flex-wrap gap-3 mb-3">
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-star text-warning me-2"></i>
                                    <span>4.8 Instructor Rating</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-users text-info me-2"></i>
                                    <span>45,678 Students</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-play-circle text-danger me-2"></i>
                                    <span>12 Courses</span>
                                  </div>
                                </div>
                                <p className="card-text" dangerouslySetInnerHTML={{ __html: course?.teacher?.about || "No information available" }}></p>
                                <div className="social-links mt-3">
                                  <a href="#" className="btn btn-sm btn-outline-primary me-2">
                                    <i className="fab fa-linkedin-in"></i>
                                  </a>
                                  <a href="#" className="btn btn-sm btn-outline-primary me-2">
                                    <i className="fab fa-github"></i>
                                  </a>
                                  <a href="#" className="btn btn-sm btn-outline-primary me-2">
                                    <i className="fab fa-twitter"></i>
                                  </a>
                                  <a href="#" className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-globe"></i>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h4 className="mb-3">More Courses by Alex Johnson</h4>
                        <div className="row row-cols-1 row-cols-md-2 g-4">
                          <div className="col">
                            <div className="card h-100 border-0 shadow-sm">
                              <img
                                src="https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                                className="card-img-top"
                                alt="Course"
                              />
                              <div className="card-body">
                                <h5 className="card-title">Advanced React Patterns</h5>
                                <p className="card-text text-muted small">Master advanced React concepts and patterns</p>
                              </div>
                              <div className="card-footer bg-white border-0">
                                <a href="#" className="btn btn-sm btn-outline-primary">View Course</a>
                              </div>
                            </div>
                          </div>
                          <div className="col">
                            <div className="card h-100 border-0 shadow-sm">
                              <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                                className="card-img-top"
                                alt="Course"
                              />
                              <div className="card-body">
                                <h5 className="card-title">Django for Professionals</h5>
                                <p className="card-text text-muted small">Build production-ready Django applications</p>
                              </div>
                              <div className="card-footer bg-white border-0">
                                <a href="#" className="btn btn-sm btn-outline-primary">View Course</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reviews Tab */}
                      <div className="tab-pane fade" id="reviews" role="tabpanel">
                        <h3 className="mb-4">Student Reviews</h3>

                        <div className="row mb-4">
                          <div className="col-md-4 mb-3 mb-md-0">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-body text-center">
                                <h2 className="display-4 fw-bold text-primary">4.8</h2>
                                <div className="mb-2">
                                  <i className="fas fa-star text-warning"></i>
                                  <i className="fas fa-star text-warning"></i>
                                  <i className="fas fa-star text-warning"></i>
                                  <i className="fas fa-star text-warning"></i>
                                  <i className="fas fa-star-half-alt text-warning"></i>
                                </div>
                                <p className="small text-muted mb-0">Based on 1,245 reviews</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-8">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                <div className="mb-3">
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="me-2 small">5 stars</span>
                                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "85%" }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">85%</span>
                                  </div>
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="me-2 small">4 stars</span>
                                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "10%" }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">10%</span>
                                  </div>
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="me-2 small">3 stars</span>
                                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "3%" }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">3%</span>
                                  </div>
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="me-2 small">2 stars</span>
                                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "1%" }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">1%</span>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <span className="me-2 small">1 star</span>
                                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                                      <div
                                        className="progress-bar bg-warning"
                                        role="progressbar"
                                        style={{ width: "1%" }}
                                      ></div>
                                    </div>
                                    <span className="ms-2 small">1%</span>
                                  </div>
                                </div>
                                <button className="btn btn-primary w-100">
                                  <i className="fas fa-star me-2"></i> Write a Review
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Review List */}
                        <div className="review-list">
                          <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between mb-3">
                                <div>
                                  <h5 className="mb-1">Sarah Williams</h5>
                                  <div className="mb-2">
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                  </div>
                                </div>
                                <small className="text-muted">2 weeks ago</small>
                              </div>
                              <h6 className="mb-2">Best course I've taken on React and Django</h6>
                              <p className="mb-0">
                                This course exceeded all my expectations. Alex explains complex concepts in a way
                                that's easy to understand. The projects are practical and helped me build a
                                portfolio that landed me my first developer job!
                              </p>
                            </div>
                          </div>

                          <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                              <div className="d-flex justify-content-between mb-3">
                                <div>
                                  <h5 className="mb-1">Michael Chen</h5>
                                  <div className="mb-2">
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star text-warning"></i>
                                    <i className="fas fa-star-half-alt text-warning"></i>
                                  </div>
                                </div>
                                <small className="text-muted">1 month ago</small>
                              </div>
                              <h6 className="mb-2">Comprehensive and well-structured</h6>
                              <p className="mb-0">
                                The course covers everything from basics to advanced topics. The Django REST
                                Framework section was particularly helpful for my current project at work.
                                Would love to see more about GraphQL in future updates.
                              </p>
                            </div>
                          </div>

                          <div className="text-center mt-4">
                            <button className="btn btn-outline-primary">
                              <i className="fas fa-arrow-down me-2"></i> Load More Reviews
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="col-lg-4">
                <div className="sticky-top" style={{ top: "20px" }}>
                  {/* Course Enrollment Card */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-img-top position-relative" style={{ height: "250px", overflow: "hidden", borderRadius: "0.5rem" }}>
                      <img
                        src={course?.image || "/backend/static/image/default-course.jpg"}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        alt="Course"
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
                      <button
                        className="btn btn-danger position-absolute top-50 start-50 translate-middle rounded-circle"
                        data-bs-toggle="modal"
                        data-bs-target="#previewModal"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    </div>

                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="mb-0">{course?.price} BDT</h3>
                        <span className="text-decoration-line-through text-muted">$299.99</span>
                      </div>

                      <div className="d-grid gap-2 mb-3">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={addToCart}
                          disabled={addToCartBtn === "Added To Cart"}
                        >
                          <i className="fas fa-shopping-cart me-2"></i> {addToCartBtn}
                        </button>
                        <button
                          className={`btn ${isInWishlist ? 'btn-danger' : 'btn-outline-primary'} btn-lg`}
                          onClick={addToWishlist}
                        >
                          <i className={`fas ${isInWishlist ? 'fa-heart' : 'fa-heart'} me-2`}></i>
                          {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                        </button>
                      </div>

                      <div className="text-center mb-3">
                        <small className="text-muted">30-Day Money-Back Guarantee</small>
                      </div>

                      <h5 className="mb-3">This course includes:</h5>
                      <ul className="list-group list-group-flush mb-4">
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-play-circle text-primary me-3"></i>
                          <span>35 hours on-demand video</span>
                        </li>
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-file-alt text-primary me-3"></i>
                          <span>12 articles</span>
                        </li>
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-download text-primary me-3"></i>
                          <span>48 downloadable resources</span>
                        </li>
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-infinity text-primary me-3"></i>
                          <span>Full lifetime access</span>
                        </li>
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-mobile-alt text-primary me-3"></i>
                          <span>Access on mobile and TV</span>
                        </li>
                        <li className="list-group-item d-flex align-items-center">
                          <i className="fas fa-trophy text-primary me-3"></i>
                          <span>Certificate of completion</span>
                        </li>
                      </ul>

                      <div className="d-grid">
                        <button className="btn btn-outline-secondary">
                          <i className="fas fa-share-alt me-2"></i> Share
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Discount Timer */}
                  <div className="card bg-primary text-white shadow-sm mb-4">
                    <div className="card-body text-center">
                      <h5 className="mb-3">
                        <i className="fas fa-bolt me-2"></i> Limited Time Offer
                      </h5>
                      <div className="countdown-timer mb-3">
                        <div className="d-flex justify-content-center gap-2">
                          <div className="bg-white text-primary rounded p-2">
                            <div className="fw-bold fs-4">12</div>
                            <small>Hours</small>
                          </div>
                          <div className="bg-white text-primary rounded p-2">
                            <div className="fw-bold fs-4">45</div>
                            <small>Minutes</small>
                          </div>
                          <div className="bg-white text-primary rounded p-2">
                            <div className="fw-bold fs-4">30</div>
                            <small>Seconds</small>
                          </div>
                        </div>
                      </div>
                      <p className="mb-0">50% discount ends soon!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Courses Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="fw-bold">You May Also Like</h2>
                <p className="text-muted">Explore these related courses to expand your skills</p>
              </div>
            </div>

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {/* Course 1 */}
              <div className="col">
                <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition">
                  <div className="position-relative">
                    <img
                      src="https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                      className="card-img-top"
                      alt="Course"
                    />
                    <div className="card-img-overlay d-flex align-items-start justify-content-end">
                      <button className="btn btn-sm btn-light rounded-circle">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-info me-2">Intermediate</span>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i> 25h
                      </small>
                    </div>
                    <h5 className="card-title">Advanced React Patterns</h5>
                    <p className="card-text text-muted small">
                      Master advanced React concepts and patterns used by senior developers
                    </p>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-star text-warning"></i>
                      <span className="ms-1">4.9</span>
                      <span className="text-muted ms-2">(1,245)</span>
                    </div>
                    <div>
                      <span className="fw-bold">$129.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course 2 */}
              <div className="col">
                <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition">
                  <div className="position-relative">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                      className="card-img-top"
                      alt="Course"
                    />
                    <div className="card-img-overlay d-flex align-items-start justify-content-end">
                      <button className="btn btn-sm btn-light rounded-circle">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-success me-2">Beginner</span>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i> 18h
                      </small>
                    </div>
                    <h5 className="card-title">Django for Beginners</h5>
                    <p className="card-text text-muted small">
                      Learn Django from scratch and build your first web application
                    </p>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-star text-warning"></i>
                      <span className="ms-1">4.7</span>
                      <span className="text-muted ms-2">(892)</span>
                    </div>
                    <div>
                      <span className="fw-bold">$89.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course 3 */}
              <div className="col">
                <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition">
                  <div className="position-relative">
                    <img
                      src="https://images.unsplash.com/photo-1624953587687-daf255b6b80a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                      className="card-img-top"
                      alt="Course"
                    />
                    <div className="card-img-overlay d-flex align-items-start justify-content-end">
                      <button className="btn btn-sm btn-light rounded-circle">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-warning me-2">Advanced</span>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i> 32h
                      </small>
                    </div>
                    <h5 className="card-title">Full Stack Development</h5>
                    <p className="card-text text-muted small">
                      Complete guide to becoming a full stack developer with MERN stack
                    </p>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-star text-warning"></i>
                      <span className="ms-1">4.8</span>
                      <span className="text-muted ms-2">(1,532)</span>
                    </div>
                    <div>
                      <span className="fw-bold">$149.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course 4 */}
              <div className="col">
                <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition">
                  <div className="position-relative">
                    <img
                      src="https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                      className="card-img-top"
                      alt="Course"
                    />
                    <div className="card-img-overlay d-flex align-items-start justify-content-end">
                      <button className="btn btn-sm btn-light rounded-circle">
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-info me-2">Intermediate</span>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i> 15h
                      </small>
                    </div>
                    <h5 className="card-title">JavaScript Mastery</h5>
                    <p className="card-text text-muted small">
                      Deep dive into modern JavaScript (ES6+) features and patterns
                    </p>
                  </div>
                  <div className="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-star text-warning"></i>
                      <span className="ms-1">4.9</span>
                      <span className="text-muted ms-2">(2,145)</span>
                    </div>
                    <div>
                      <span className="fw-bold">$79.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <button className="btn btn-outline-primary px-4">
                <i className="fas fa-book-open me-2"></i> Browse All Courses
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Preview Modal */}
      <div className="modal fade" id="previewModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Course Preview</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-0">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="modal-footer justify-content-center">
              <button type="button" className="btn btn-primary px-4">
                <i className="fas fa-shopping-cart me-2"></i> Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <BaseFooter />
    </>
  )
}

export default CourseDetail