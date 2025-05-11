import { useEffect, useState, useMemo } from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import { Link } from 'react-router-dom';
import useAxios from "../../utils/useAxios";
import Rater from 'react-rater';
import "react-rater/lib/react-rater.css";

function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await useAxios().get("/course/course-list/");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Pagination logic
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(courses.length / itemsPerPage)),
    [courses.length, itemsPerPage]
  );

  const indexOfLastItem = useMemo(
    () => currentPage * itemsPerPage,
    [currentPage, itemsPerPage]
  );

  const indexOfFirstItem = useMemo(
    () => indexOfLastItem - itemsPerPage,
    [indexOfLastItem, itemsPerPage]
  );

  const currentItems = useMemo(
    () => courses.slice(indexOfFirstItem, indexOfLastItem),
    [courses, indexOfFirstItem, indexOfLastItem]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), totalPages));
  };

  return (
    <>
      <BaseHeader />

      {/* Hero Section with Gradient Background */}
      <section className="py-lg-8 py-5" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating elements */}
        <div className="position-absolute top-0 end-0 w-50 h-100 bg-primary opacity-10 rounded-circle" style={{
          transform: 'translate(30%, -30%)',
          zIndex: 0
        }}></div>
        <div className="position-absolute bottom-0 start-0 w-25 h-50 bg-info opacity-10 rounded-circle" style={{
          transform: 'translate(-30%, 30%)',
          zIndex: 0
        }}></div>

        {/* container */}
        <div className="container my-lg-8 position-relative" style={{ zIndex: 1 }}>
          {/* row */}
          <div className="row align-items-center">
            {/* col */}
            <div className="col-lg-6 mb-6 mb-lg-0">
              <div>
                {/* heading with animated checkmark */}
                <h5 className="text-dark mb-4">
                  <i className="bi bi-patch-check-fill icon-xxs icon-shape bg-light-success text-success rounded-circle me-2"
                    style={{ animation: 'pulse 2s infinite' }} />
                  Most trusted education platform
                </h5>
                {/* main heading with gradient text */}
                <h1 className="display-3 fw-bold mb-3" style={{
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Grow your skills and advance career
                </h1>
                {/* para */}
                <p className="pe-lg-10 mb-5 fs-5">
                  Start, switch, or advance your career with more than 5,000
                  courses, Professional Certificates, and degrees from world-class
                  universities and companies.
                </p>
                {/* buttons with hover effects */}
                <div className="d-flex flex-wrap gap-3">
                  <a href="#" className="btn btn-primary fs-4 text-inherit px-4 py-3 rounded-pill shadow-hover">
                    Join Free Now <i className='bi bi-plus-lg ms-2'></i>
                  </a>
                  <a href="https://www.youtube.com/watch?v=Nfzi7034Kbg"
                    className="btn btn-outline-success fs-4 text-inherit px-4 py-3 rounded-pill hover-scale">
                    Watch Demo <i className='bi bi-play-circle ms-2'></i>
                  </a>
                </div>
              </div>
            </div>
            {/* col */}
            <div className="col-lg-6 d-flex justify-content-center">
              {/* images with floating animation */}
              <div className="position-relative">
                <img
                  src="https://geeksui.codescandy.com/geeks/assets/images/background/acedamy-img/girl-image.png"
                  alt="girl"
                  className="end-0 bottom-0 floating-animation"
                  style={{ maxHeight: '500px' }}
                />
                {/* floating elements around image */}
                <div className="position-absolute top-0 start-0 translate-middle" style={{ zIndex: -1 }}>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-4"></div>
                </div>
                <div className="position-absolute bottom-0 end-0 translate-middle" style={{ zIndex: -1 }}>
                  <div className="bg-info bg-opacity-10 rounded-circle p-5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Cards */}
      <section className="pb-8 position-relative">
        {/* Background pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'radial-gradient(circle, rgba(200,200,200,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: -1
        }}></div>

        <div className="container mb-lg-8">
          {/* row */}
          <div className="row mb-5 g-4">
            <div className="col-md-6 col-lg-3">
              {/* card with hover effect */}
              <div className="py-7 text-center bg-white rounded-4 shadow-sm hover-shadow h-100">
                <div className="mb-3">
                  <i className="bi bi-trophy fs-2 text-info bg-light-info p-3 rounded-circle"></i>
                </div>
                <div className="lh-1">
                  <h2 className="mb-1 display-5 fw-bold">316,000+</h2>
                  <span className="text-muted">Qualified Instructor</span>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              {/* card with hover effect */}
              <div className="py-7 text-center bg-white rounded-4 shadow-sm hover-shadow h-100">
                <div className="mb-3">
                  <i className="bi bi-people fs-2 text-warning bg-light-warning p-3 rounded-circle"></i>
                </div>
                {/* text */}
                <div className="lh-1">
                  <h2 className="mb-1 display-5 fw-bold">1.8B+</h2>
                  <span className="text-muted">Course enrolments</span>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              {/* card with hover effect */}
              <div className="py-7 text-center bg-white rounded-4 shadow-sm hover-shadow h-100">
                <div className="mb-3">
                  <i className="bi bi-translate fs-2 text-primary bg-light-primary p-3 rounded-circle"></i>
                </div>
                {/* text */}
                <div className="lh-1">
                  <h2 className="mb-1 display-5 fw-bold">41,000+</h2>
                  <span className="text-muted">Courses in 42 languages</span>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              {/* card with hover effect */}
              <div className="py-7 text-center bg-white rounded-4 shadow-sm hover-shadow h-100">
                <div className="mb-3">
                  <i className="bi bi-camera-video fs-2 text-success bg-light-success p-3 rounded-circle"></i>
                </div>
                {/* text */}
                <div className="lh-1">
                  <h2 className="mb-1 display-5 fw-bold">179,000+</h2>
                  <span className="text-muted">Online Videos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className='mb-5'>
        <div className="container mb-lg-8">
          <div className="row mb-5 mt-3">
            {/* col */}
            <div className="col-12">
              <div className="mb-6">
                <h2 className="mb-1 h1 d-flex align-items-center">
                  <span className="bg-danger bg-opacity-10 text-danger p-2 rounded-circle me-3">
                    <i className="bi bi-fire"></i>
                  </span>
                  Most Popular Courses
                </h2>
                <p className="text-muted">
                  These are the most popular courses among Geeks Courses learners
                  worldwide in year {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {currentItems?.map((c, index) => (
                      <div key={c.id || index} className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                        <Link to={`/course-detail/${c.slug}`} className="d-block overflow-hidden">
                          <img
                            src={c.image || "https://via.placeholder.com/300x200"}
                            alt={c.title}
                            className="card-img-top img-fluid"
                            style={{ height: "200px", objectFit: "cover", transition: "0.3s ease" }}
                          />
                        </Link>
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              {c.level && (
                                <span className="badge bg-opacity-10 bg-info text-dark me-1">{c.level}</span>
                              )}
                              {c.language && (
                                <span className="badge bg-opacity-10 bg-danger text-dark">{c.language}</span>
                              )}
                            </div>
                            <button className="fs-5 text-muted hover-danger border-0 bg-transparent">
                              <i className="bi bi-heart"></i>
                            </button>
                          </div>

                          <h6 className="card-title mb-2 text-truncate">
                            <Link to={`/course-detail/${c.slug}`} className="text-dark text-decoration-none fw-bold">
                              {c.title}
                            </Link>
                          </h6>

                          <p
                            className="text-muted small mb-3"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                            title={c.description}
                          >
                            {c.description || "No description available"}
                          </p>

                          {c.category?.title && (
                            <div className="mb-2">
                              <span className="badge bg-opacity-10 bg-secondary text-dark">{c.category.title}</span>
                            </div>
                          )}

                          <div className="mb-2 small text-muted">
                            <strong>By:</strong> {c.teacher?.full_name || "Unknown"}<br />
                            <strong>Students:</strong> {c.students?.length || 0} Student{c.students?.length !== 1 ? "s" : ""}
                          </div>

                          <div className="d-flex align-items-center mb-3">
                            <div className="d-inline-flex align-items-center px-2 py-1 bg-light rounded-pill shadow-sm">
                              <span className="me-1" style={{ color: '#fbc02d' }}>
                                <Rater total={5} rating={c.average_rating || 0} interactive={false} />
                              </span>
                              <span className="text-muted small">({c.reviews?.length || 0} Reviews)</span>
                            </div>
                          </div>

                          <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                            <span className="fw-bold">BDT {c.price || 0}</span>
                            <div>
                              <button className="btn btn-sm btn-outline-primary rounded-circle me-2">
                                <i className="bi bi-cart"></i>
                              </button>
                              <Link to={`/course/course-detail/${c.slug}`} className="btn btn-sm btn-primary rounded-pill">
                                Enroll Now <i className="bi bi-arrow-right ms-1"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="d-flex mt-5 justify-content-center align-items-center">
                      <ul className="pagination mb-0">
                        {/* Previous Button */}
                        <li className="page-item">
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="page-link me-1 rounded-pill px-3 py-2 d-flex align-items-center"
                            aria-label="Previous"
                          >
                            <i className="bi bi-chevron-left me-2"></i>
                            <span className="d-none d-sm-inline">Previous</span>
                          </button>
                        </li>

                        {/* First Page */}
                        {currentPage > 2 && totalPages > 3 && (
                          <li className="page-item d-none d-md-block">
                            <button
                              onClick={() => goToPage(1)}
                              className={`page-link rounded-circle ${currentPage === 1 ? 'active' : ''}`}
                            >
                              1
                            </button>
                          </li>
                        )}

                        {/* Ellipsis */}
                        {currentPage > 3 && totalPages > 4 && (
                          <li className="page-item disabled d-none d-md-block">
                            <span className="page-link">...</span>
                          </li>
                        )}

                        {/* Page Numbers */}
                        {pageNumbers.map((number) => {
                          if (Math.abs(number - currentPage) <= 1 ||
                            number === 1 ||
                            number === totalPages) {
                            return (
                              <li key={number} className="page-item">
                                <button
                                  onClick={() => goToPage(number)}
                                  className={`page-link rounded-circle ${currentPage === number ? 'active' : ''}`}
                                >
                                  {number}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        })}

                        {/* Ellipsis */}
                        {currentPage < totalPages - 2 && totalPages > 4 && (
                          <li className="page-item disabled d-none d-md-block">
                            <span className="page-link">...</span>
                          </li>
                        )}

                        {/* Last Page */}
                        {currentPage < totalPages - 1 && totalPages > 3 && (
                          <li className="page-item d-none d-md-block">
                            <button
                              onClick={() => goToPage(totalPages)}
                              className={`page-link rounded-circle ${currentPage === totalPages ? 'active' : ''}`}
                            >
                              {totalPages}
                            </button>
                          </li>
                        )}

                        {/* Next Button */}
                        <li className="page-item">
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="page-link ms-1 rounded-pill px-3 py-2 d-flex align-items-center"
                            aria-label="Next"
                          >
                            <span className="d-none d-sm-inline">Next</span>
                            <i className="bi bi-chevron-right ms-2"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax Effect */}
      <section className="my-8 py-lg-8 position-relative overflow-hidden">
        {/* Background elements */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-5"></div>
        <div className="position-absolute top-0 end-0 w-50 h-100 bg-white opacity-10" style={{
          clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)'
        }}></div>

        {/* container */}
        <div className="container position-relative">
          {/* row */}
          <div className="row align-items-center bg-primary gx-0 rounded-4 overflow-hidden shadow-lg">
            {/* col */}
            <div className="col-lg-6 col-12 d-none d-lg-block">
              <div className="d-flex justify-content-center pt-4">
                {/* img with parallax effect */}
                <div className="position-relative parallax-container">
                  <img
                    src="https://geeksui.codescandy.com/geeks/assets/images/png/cta-instructor-1.png"
                    alt="instructor"
                    className="img-fluid mt-n8 parallax-element"
                    data-speed="0.2"
                  />
                  <div className="ms-n8 position-absolute bottom-0 start-0 mb-6 floating-animation">
                    <img src="https://geeksui.codescandy.com/geeks/assets/images/svg/dollor.svg" alt="dollar" />
                  </div>
                  {/* img */}
                  <div className="me-n4 position-absolute top-0 end-0 floating-animation-delay">
                    <img src="https://geeksui.codescandy.com/geeks/assets/images/svg/graph.svg" alt="graph" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-12">
              <div className="text-white p-5 p-lg-0">
                {/* text */}
                <h2 className="h1 text-white mb-4">Become an instructor today</h2>
                <p className="mb-4 fs-5">
                  Instructors from around the world teach millions of students on
                  Geeks. We provide the tools and skills to teach what you love.
                </p>
                <a href="#" className="btn btn-light text-dark fw-bold mt-4 px-4 py-3 rounded-pill hover-scale">
                  Start Teaching Today <i className='bi bi-arrow-right ms-2'></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-200 pt-8 pb-8 mt-5 position-relative">
        {/* Background pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-05" style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          zIndex: 0
        }}></div>

        <div className="container pb-8 position-relative" style={{ zIndex: 1 }}>
          {/* row */}
          <div className="row mb-lg-8 mb-5">
            <div className="offset-lg-1 col-lg-10 col-12">
              <div className="row align-items-center">
                {/* col */}
                <div className="col-lg-6 col-md-8">
                  {/* rating */}
                  <div>
                    <div className="mb-3">
                      <span className="lh-1">
                        <span className="align-text-top ms-2">
                          <i className='bi bi-star-fill text-warning'></i>
                          <i className='bi bi-star-fill text-warning'></i>
                          <i className='bi bi-star-fill text-warning'></i>
                          <i className='bi bi-star-fill text-warning'></i>
                          <i className='bi bi-star-fill text-warning'></i>
                        </span>
                        <span className="text-dark fw-semibold">4.5/5.0</span>
                      </span>
                      <span className="ms-2 text-muted">(Based on 3265 ratings)</span>
                    </div>
                    {/* heading */}
                    <h2 className="h1 mb-3">What our students say</h2>
                    <p className="mb-0 text-muted">
                      Hear from
                      <span className="text-dark fw-bold"> teachers</span>,
                      <span className="text-dark fw-bold"> trainers</span>, and
                      <span className="text-dark fw-bold"> leaders</span>
                      in the learning space about how Geeks empowers them to provide
                      quality online learning experiences.
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 col-md-4 text-md-end mt-4 mt-md-0">
                  {/* btn */}
                  <a href="#" className="btn btn-primary px-4 py-3 rounded-pill shadow-hover">
                    View Reviews
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* row */}
          <div className="row">
            {/* col */}
            <div className="col-md-12">
              <div className="position-relative">
                {/* slider */}
                <div className="row g-4">
                  <div className="col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                      <div className="card-body text-center p-6">
                        {/* img */}
                        <div className="avatar avatar-xl rounded-circle mx-auto mb-3 position-relative">
                          <img
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            alt="Gladys Colbert"
                            className="avatar avatar-lg rounded-circle"
                          />
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2 border border-3 border-white"></div>
                        </div>
                        <p className="mb-0 mt-3 text-muted">
                          "The generated lorem Ipsum is therefore always free from
                          repetition, injected humour, or words etc generate lorem
                          Ipsum which looks racteristic reasonable."
                        </p>
                        {/* rating */}
                        <div className="lh-1 mb-3 mt-4">
                          <span className="fs-6 align-top">
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                          </span>
                          <span className="text-warning fw-bold">5</span>
                          {/* text */}
                        </div>
                        <h3 className="mb-0 h4">Gladys Colbert</h3>
                        <span className="text-muted">Software Engineer at Palantir</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                      <div className="card-body text-center p-6">
                        {/* img */}
                        <div className="avatar avatar-xl rounded-circle mx-auto mb-3 position-relative">
                          <img
                            src="https://randomuser.me/api/portraits/men/32.jpg"
                            alt="Michael Chen"
                            className="avatar avatar-lg rounded-circle"
                          />
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2 border border-3 border-white"></div>
                        </div>
                        <p className="mb-0 mt-3 text-muted">
                          "The generated lorem Ipsum is therefore always free from
                          repetition, injected humour, or words etc generate lorem
                          Ipsum which looks racteristic reasonable."
                        </p>
                        {/* rating */}
                        <div className="lh-1 mb-3 mt-4">
                          <span className="fs-6 align-top">
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                          </span>
                          <span className="text-warning fw-bold">5</span>
                          {/* text */}
                        </div>
                        <h3 className="mb-0 h4">Michael Chen</h3>
                        <span className="text-muted">Data Scientist at Google</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                      <div className="card-body text-center p-6">
                        {/* img */}
                        <div className="avatar avatar-xl rounded-circle mx-auto mb-3 position-relative">
                          <img
                            src="https://randomuser.me/api/portraits/women/68.jpg"
                            alt="Sarah Johnson"
                            className="avatar avatar-lg rounded-circle"
                          />
                          <div className="position-absolute bottom-0 end-0 bg-success rounded-circle p-2 border border-3 border-white"></div>
                        </div>
                        <p className="mb-0 mt-3 text-muted">
                          "The generated lorem Ipsum is therefore always free from
                          repetition, injected humour, or words etc generate lorem
                          Ipsum which looks racteristic reasonable."
                        </p>
                        {/* rating */}
                        <div className="lh-1 mb-3 mt-4">
                          <span className="fs-6 align-top">
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                            <i className="bi bi-star-fill text-warning"></i>
                          </span>
                          <span className="text-warning fw-bold">5</span>
                          {/* text */}
                        </div>
                        <h3 className="mb-0 h4">Sarah Johnson</h3>
                        <span className="text-muted">UX Designer at Apple</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BaseFooter />

      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        .floating-animation-delay {
          animation: float 6s ease-in-out 1s infinite;
        }
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        .shadow-hover:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
        }
        .hover-scale {
          transition: all 0.3s ease;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        .hover-danger:hover {
          color: #dc3545 !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .parallax-container {
          overflow: hidden;
          position: relative;
        }
        .parallax-element {
          transition: transform 0.1s ease-out;
        }
      `}</style>
    </>
  );
}

export default Index;