import React, { useEffect, useState, useRef } from 'react'
import BaseHeader from '../partials/BaseHeader'
import BaseFooter from '../partials/BaseFooter'
import Sidebar from './Partials/Sidebar'
import Header from './Partials/Header'
import BaseSidebar from '../partials/BaseSidebar';
import Toast from "../plugin/Toast";
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useAxios from '../../utils/useAxios';
import UseData from '../plugin/UserData';
import { useParams } from 'react-router-dom'
import moment from "moment";



function CourseDetail() {

  // State management for course and progress tracking
  const [course, setCourse] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [markAsCompletedStatus, setMarkAsCompletedStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for UI elements
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for lecture modal
  const [show, setShow] = useState(false);
  const [variantItem, setVariantItem] = useState(null);

  // State for notes
  const [noteShow, setNoteShow] = useState(false);
  const [createNote, setCreateNote] = useState({ title: "", note: "" });
  const [selectedNote, setSelectedNote] = useState(null);

  // State for questions and conversations
  const [questions, setQuestions] = useState([]);
  const [addQuestionShow, setAddQuestionShow] = useState(false);
  const [createMessage, setCreateMessage] = useState({ title: "", message: "" });
  const [ConversationShow, setConversationShow] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // State for reviews
  const [createReview, setCreateReview] = useState({ rating: 1, review: "" });
  const [studentReview, setStudentReview] = useState([]);

  // Hooks and utilities
  const axiosInstance = useAxios();
  const userData = UseData();
  const param = useParams();
  const lastElementRef = useRef();

  /**
   * Fetch course details including lectures, progress, questions, and reviews
   */
  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/student/course-detail/${userData.user_id}/${param.enrollment_id}`);

      // Set main course data
      setCourse(res.data);
      setQuestions(res.data.question_answer);
      setStudentReview(res.data.review);

      // Calculate completion percentage
      const totalLectures = res.data.lectures?.length || 0;
      const completedLessons = res.data.completed_lesson?.length || 0;
      const percentageCompleted = totalLectures > 0 ? (completedLessons / totalLectures) * 100 : 0;
      setCompletionPercentage(percentageCompleted.toFixed(0));

      // Map completed lessons for easy lookup
      const completedLessonsMap = {};
      res.data.completed_lesson?.forEach(lesson => {
        completedLessonsMap[lesson.variant_item.id] = true;
      });
      setMarkAsCompletedStatus(completedLessonsMap);

      setError(null);
    } catch (err) {
      console.error('Error fetching course detail:', err);
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize course data on component mount
  useEffect(() => {
    if (userData?.user_id && param?.enrollment_id) {
      fetchCourseDetail();
    }
  }, []);

  // Scroll to bottom of conversation when messages change
  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  /**
   * Modal handlers for various features
   */
  const handleClose = () => setShow(false);
  const handleShow = (variant_item) => {
    setShow(true);
    setVariantItem(variant_item);
  };

  const handleNoteClose = () => setNoteShow(false);
  const handleNoteShow = (note) => {
    setNoteShow(true);
    setSelectedNote(note);
  };

  const handleConversationClose = () => setConversationShow(false);
  const handleConversationShow = (conversation) => {
    setConversationShow(true);
    setSelectedConversation(conversation);
  };

  const handleQuestionClose = () => setAddQuestionShow(false);
  const handleQuestionShow = () => setAddQuestionShow(true);

  /**
   * Mark lesson as completed
   * @param {number} variantItemId - ID of the lesson to mark as completed
   */
  const handleMarkLessonAsCompleted = (variantItemId) => {
    if (markAsCompletedStatus[variantItemId]) {
      // If already completed, don't do anything
      return;
    }

    const key = `lecture_${variantItemId}`;
    setMarkAsCompletedStatus({
      ...markAsCompletedStatus,
      [key]: "Updating",
    });

    const formData = new FormData();
    formData.append("user_id", userData?.user_id || 0);
    formData.append("course_id", course.course?.id);
    formData.append("variant_item_id", variantItemId);

    axiosInstance
      .post(`student/course-completed/`, formData)
      .then((res) => {
        fetchCourseDetail();
        setMarkAsCompletedStatus((prev) => ({
          ...prev,
          [key]: "Updated",
        }));
      });
  };

  /**
   * Course progress bar component
   */
  const CourseProgressBar = () => {
    return (
      <div className="progress mb-3" style={{ height: "20px", borderRadius: "10px" }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{
            width: `${completionPercentage}%`,
            transition: "width 0.5s ease-in-out"
          }}
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {completionPercentage}% Completed
        </div>
      </div>
    );
  };

  /**
   * Note management functions
   */
  const handleNoteChange = (event) => {
    setCreateNote({
      ...createNote,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmitCreateNote = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("user_id", userData?.user_id);
    formData.append("enrollment_id", param.enrollment_id);
    formData.append("title", createNote.title);
    formData.append("note", createNote.note);

    try {
      await axiosInstance.post(
        `student/course-note/${userData?.user_id}/${param.enrollment_id}/`,
        formData
      );
      fetchCourseDetail();
      handleNoteClose();
      Toast().fire({
        icon: "success",
        title: "Note created",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitEditNote = (e, noteId) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("user_id", userData?.user_id);
    formData.append("enrollment_id", param.enrollment_id);
    formData.append("title", createNote.title || selectedNote?.title);
    formData.append("note", createNote.note || selectedNote?.note);

    axiosInstance
      .patch(
        `student/course-note-detail/${userData?.user_id}/${param.enrollment_id}/${noteId}/`,
        formData
      )
      .then((res) => {
        fetchCourseDetail();
        Toast().fire({
          icon: "success",
          title: "Note updated",
        });
      });
  };

  const handleDeleteNote = (noteId) => {
    axiosInstance
      .delete(
        `student/course-note-detail/${userData?.user_id}/${param.enrollment_id}/${noteId}/`
      )
      .then(() => {
        fetchCourseDetail();
        Toast().fire({
          icon: "success",
          title: "Note deleted",
        });
      });
  };

  /**
   * Question and conversation management functions
   */
  const handleMessageChange = (event) => {
    setCreateMessage({
      ...createMessage,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("course_id", course.course?.id);
    formData.append("user_id", userData?.user_id);
    formData.append("title", createMessage.title);
    formData.append("message", createMessage.message);

    await axiosInstance
      .post(
        `student/question-answer-list-create/${course.course?.id}/`,
        formData
      )
      .then(() => {
        fetchCourseDetail();
        handleQuestionClose();
        Toast().fire({
          icon: "success",
          title: "Question sent",
        });
      });
  };

  const sendNewMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("course_id", course.course?.id);
    formData.append("user_id", userData?.user_id);
    formData.append("message", createMessage.message);
    formData.append("qa_id", selectedConversation?.qa_id);

    await axiosInstance
      .post(`student/question-answer-message-create/`, formData)
      .then((res) => {
        setSelectedConversation(res.data.question);

        // Clear message input after sending
        setCreateMessage({
          ...createMessage,
          message: ""
        });
      });
  };

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchCourseDetail();
    } else {
      const filtered = questions?.filter((question) =>
        question.title.toLowerCase().includes(query)
      );
      setQuestions(filtered);
    }
  };

  /**
   * Review management functions
   */
  const handleReviewChange = (event) => {
    setCreateReview({
      ...createReview,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateReviewSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("course_id", course.course?.id);
    formData.append("user_id", userData?.user_id);
    formData.append("rating", createReview.rating);
    formData.append("review", createReview.review);

    axiosInstance
      .post(`student/rate-course/`, formData)
      .then(() => {
        fetchCourseDetail();
        Toast().fire({
          icon: "success",
          title: "Review created",
        });

        // Reset form
        setCreateReview({ rating: 1, review: "" });
      });
  };

  const handleUpdateReviewSubmit = (e) => {
    e.preventDefault();

    if (!studentReview || !studentReview.id) {
      console.error("studentReview or studentReview.id is undefined");
      Toast().fire({
        icon: "error",
        title: "Something went wrong. Please refresh and try again.",
      });
      return;
    }

    const formData = new FormData();

    formData.append("course", course.course?.id);
    formData.append("user", userData?.user_id);
    formData.append("rating", createReview.rating || studentReview?.rating);
    formData.append("review", createReview.review || studentReview?.review);

    axiosInstance
      .patch(
        `student/review-detail/${userData?.user_id}/${studentReview?.id}/`,
        formData
      )
      .then(() => {
        fetchCourseDetail();
        Toast().fire({
          icon: "success",
          title: "Review updated",
        });
      })
      .catch((error) => {
        console.error("Error updating review:", error);
        Toast().fire({
          icon: "error",
          title: "Failed to update review",
        });
      });
  };

  return (
    <>
      <section className="pb-5 bg-light">
        <div className="container">
          <BaseSidebar
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            user={userData}
          />

          <div className="main-content">
            <div className="col-lg-9 col-md-8 col-12">
              <section className="mt-4">
                <div className="container-fluid px-0">
                  {/* Course Progress Bar */}
                  <div className="card shadow-sm mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">Course Progress</h4>
                        <span className="badge bg-primary">{completionPercentage}% Complete</span>
                      </div>
                      <CourseProgressBar />
                    </div>
                  </div>

                  {/* Main Content Card */}
                  <div className="card shadow rounded-2 overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="card-header border-bottom px-4 pt-3 pb-0 bg-white">
                      <ul className="nav nav-tabs nav-bottom-line flex-nowrap overflow-auto" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === 'lectures' ? 'active' : ''}`}
                            onClick={() => setActiveTab('lectures')}
                          >
                            <i className="fas fa-play-circle me-2"></i> Lectures
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notes')}
                          >
                            <i className="fas fa-sticky-note me-2"></i> Notes
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === 'discussion' ? 'active' : ''}`}
                            onClick={() => setActiveTab('discussion')}
                          >
                            <i className="fas fa-comments me-2"></i> Discussion
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button
                            className={`nav-link ${activeTab === 'review' ? 'active' : ''}`}
                            onClick={() => setActiveTab('review')}
                          >
                            <i className="fas fa-star me-2"></i> Review
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Tab Content */}
                    <div className="card-body p-4">
                      {/* Lectures Tab */}
                      {activeTab === 'lectures' && (
                        <div className="accordion accordion-flush" id="lecturesAccordion">
                          {course?.curriculum?.map((c, index) => (
                            <div className="accordion-item border-0 mb-3" key={c.variant_id}>
                              <h2 className="accordion-header" id={`heading-${c.variant_id}`}>
                                <button
                                  className="accordion-button bg-light rounded shadow-sm"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse-${c.variant_id}`}
                                  aria-expanded={index === 0}
                                  aria-controls={`collapse-${c.variant_id}`}
                                >
                                  <div className="d-flex w-100 justify-content-between align-items-center">
                                    <span className="fw-bold">{c.title}</span>
                                    <span className="badge bg-secondary ms-2">
                                      {c.variant_items?.length || 0} Lectures
                                    </span>
                                  </div>
                                </button>
                              </h2>
                              <div
                                id={`collapse-${c.variant_id}`}
                                className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                aria-labelledby={`heading-${c.variant_id}`}
                              >
                                <div className="accordion-body px-0 pt-3">
                                  {c.variant_items?.map((l, idx) => (
                                    <div
                                      key={l.id}
                                      className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded ${markAsCompletedStatus[l.id] ? 'bg-success bg-opacity-10' : 'bg-light'}`}
                                    >
                                      <div className="d-flex align-items-center">
                                        <button
                                          onClick={() => handleShow(l)}
                                          className="btn btn-sm btn-danger rounded-circle me-3 d-flex align-items-center justify-content-center"
                                          style={{ width: '36px', height: '36px' }}
                                        >
                                          <i className="fas fa-play small" />
                                        </button>
                                        <div>
                                          <h6 className="mb-0">{l.title}</h6>
                                          <small className="text-muted">
                                            {l.content_duration || "0m 0s"}
                                          </small>
                                        </div>
                                      </div>
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          checked={markAsCompletedStatus[l.id]}
                                          onChange={() => handleMarkLessonAsCompleted(l.id)}
                                          style={{ width: '2.5em', height: '1.25em' }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes Tab */}
                      {activeTab === 'notes' && (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0">My Notes</h4>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setCreateNote({ title: "", note: "" });
                                setNoteShow(true);
                              }}
                            >
                              <i className="fas fa-plus me-2"></i> Add Note
                            </button>
                          </div>

                          {course?.note?.length > 0 ? (
                            <div className="row g-4">
                              {course.note.map((n) => (
                                <div className="col-md-6" key={n.id}>
                                  <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                      <h5 className="card-title">{n.title}</h5>
                                      <p className="card-text text-muted">
                                        {n.note.length > 150 ? `${n.note.substring(0, 150)}...` : n.note}
                                      </p>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0">
                                      <div className="d-flex justify-content-end gap-2">
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => {
                                            setSelectedNote(n);
                                            setNoteShow(true);
                                          }}
                                        >
                                          <i className="fas fa-edit me-1"></i> Edit
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDeleteNote(n.id)}
                                        >
                                          <i className="fas fa-trash me-1"></i> Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <i className="fas fa-sticky-note text-muted fa-4x mb-3"></i>
                              <h5>No Notes Yet</h5>
                              <p className="text-muted">Add your first note to get started</p>
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setCreateNote({ title: "", note: "" });
                                  setNoteShow(true);
                                }}
                              >
                                <i className="fas fa-plus me-2"></i> Create Note
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Discussion Tab */}
                      {activeTab === 'discussion' && (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="mb-0">Course Discussions</h4>
                            <button
                              className="btn btn-primary"
                              onClick={handleQuestionShow}
                            >
                              <i className="fas fa-plus me-2"></i> Ask Question
                            </button>
                          </div>

                          <div className="input-group mb-4">
                            <span className="input-group-text bg-white">
                              <i className="fas fa-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search discussions..."
                              onChange={handleSearchQuestion}
                            />
                          </div>

                          {questions?.length > 0 ? (
                            <div className="list-group">
                              {questions.map((q) => (
                                <div key={q.id} className="list-group-item border-0 shadow-sm mb-3 rounded">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div className="d-flex align-items-center mb-2">
                                      <img
                                        src={q.profile.image || "https://via.placeholder.com/40"}
                                        className="rounded-circle me-3"
                                        width="40"
                                        height="40"
                                        alt="Profile"
                                      />
                                      <div>
                                        <h6 className="mb-0">{q.profile.first_name} {q.profile.last_name}</h6>
                                        <small className="text-muted">
                                          {moment(q.date_created).format("MMMM D, YYYY")}
                                        </small>
                                      </div>
                                    </div>
                                    <span className="badge bg-info">
                                      {q.messages?.length || 0} replies
                                    </span>
                                  </div>
                                  <h5 className="mt-2 mb-3">{q.title}</h5>
                                  <p className="text-muted mb-3">{q.message}</p>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleConversationShow(q)}
                                  >
                                    <i className="fas fa-comment me-1"></i> Join Discussion
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-5">
                              <i className="fas fa-comments text-muted fa-4x mb-3"></i>
                              <h5>No Discussions Yet</h5>
                              <p className="text-muted">Be the first to start a discussion</p>
                              <button
                                className="btn btn-primary"
                                onClick={handleQuestionShow}
                              >
                                <i className="fas fa-plus me-2"></i> Ask Question
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Tab */}
                      {activeTab === 'review' && (
                        <div>
                          <h4 className="mb-4">Leave a Review</h4>

                          {studentReview ? (
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h5 className="mb-0">Your Review</h5>
                                  <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                      <i
                                        key={i}
                                        className={`fas fa-star ${i < studentReview.rating ? 'text-warning' : 'text-secondary'}`}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <form onSubmit={handleUpdateReviewSubmit}>
                                  <div className="mb-3">
                                    <label className="form-label">Rating</label>
                                    <select
                                      className="form-select"
                                      name="rating"
                                      value={createReview.rating || studentReview.rating}
                                      onChange={handleReviewChange}
                                    >
                                      {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>
                                          {num} Star{num !== 1 ? 's' : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Your Review</label>
                                    <textarea
                                      className="form-control"
                                      rows="4"
                                      name="review"
                                      defaultValue={studentReview.review}
                                      onChange={handleReviewChange}
                                      placeholder="Share your experience with this course..."
                                    ></textarea>
                                  </div>
                                  <button type="submit" className="btn btn-primary">
                                    Update Review
                                  </button>
                                </form>
                              </div>
                            </div>
                          ) : (
                            <div className="card border-0 shadow-sm">
                              <div className="card-body">
                                <h5 className="mb-3">Share Your Experience</h5>
                                <form onSubmit={handleCreateReviewSubmit}>
                                  <div className="mb-3">
                                    <label className="form-label">Rating</label>
                                    <div className="rating-input mb-2">
                                      {[1, 2, 3, 4, 5].map((num) => (
                                        <React.Fragment key={num}>
                                          <input
                                            type="radio"
                                            id={`star-${num}`}
                                            name="rating"
                                            value={num}
                                            onChange={handleReviewChange}
                                            className="d-none"
                                          />
                                          <label
                                            htmlFor={`star-${num}`}
                                            className={`star-label ${num <= (createReview.rating || 0) ? 'text-warning' : 'text-secondary'}`}
                                          >
                                            <i className="fas fa-star fa-2x"></i>
                                          </label>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Your Review</label>
                                    <textarea
                                      className="form-control"
                                      rows="4"
                                      name="review"
                                      value={createReview.review}
                                      onChange={handleReviewChange}
                                      placeholder="Share your experience with this course..."
                                    ></textarea>
                                  </div>
                                  <button type="submit" className="btn btn-primary">
                                    Submit Review
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture Modal */}
      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-play-circle text-danger me-2"></i>
            {variantItem?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="ratio ratio-16x9">
            <ReactPlayer
              url={variantItem?.file}
              controls
              playing
              width="100%"
              height="100%"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button className="btn btn-outline-secondary" onClick={handleClose}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Note Modal */}
      <Modal show={noteShow} onHide={handleNoteClose} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-sticky-note text-primary me-2"></i>
            {selectedNote ? "Edit Note" : "Create New Note"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={selectedNote ?
            (e) => handleSubmitEditNote(e, selectedNote.id) :
            handleSubmitCreateNote
          }>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                defaultValue={selectedNote?.title || createNote.title}
                onChange={handleNoteChange}
                placeholder="Note title"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control"
                name="note"
                rows="8"
                defaultValue={selectedNote?.note || createNote.note}
                onChange={handleNoteChange}
                placeholder="Write your note here..."
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleNoteClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {selectedNote ? "Update Note" : "Save Note"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Discussion Modal */}
      <Modal show={ConversationShow} onHide={handleConversationClose} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-comments text-info me-2"></i>
            {selectedConversation?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="chat-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedConversation?.messages?.map((m) => (
              <div key={m.id} className={`mb-3 d-flex ${m.profile.id === userData.user_id ? 'justify-content-end' : ''}`}>
                <div className={`d-flex ${m.profile.id === userData.user_id ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={m.profile.image || "https://via.placeholder.com/40"}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                    alt="Profile"
                  />
                  <div>
                    <div className={`p-3 rounded ${m.profile.id === userData.user_id ? 'bg-primary text-white' : 'bg-light'}`}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong>{m.profile.first_name}</strong>
                        <small className="text-muted">
                          {moment(m.date).format("h:mm A")}
                        </small>
                      </div>
                      <p className="mb-0">{m.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={lastElementRef}></div>
          </div>
          <form onSubmit={sendNewMessage} className="mt-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                name="message"
                value={createMessage.message}
                onChange={handleMessageChange}
                placeholder="Type your message..."
                required
              />
              <button className="btn btn-primary" type="submit">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Ask Question Modal */}
      <Modal show={addQuestionShow} onHide={handleQuestionClose} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="fas fa-question-circle text-warning me-2"></i>
            Ask a Question
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveQuestion}>
            <div className="mb-3">
              <label className="form-label">Question Title</label>
              <input
                type="text"
                className="form-control"
                name="title"
                value={createMessage.title}
                onChange={handleMessageChange}
                placeholder="What's your question about?"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Details</label>
              <textarea
                className="form-control"
                name="message"
                rows="6"
                value={createMessage.message}
                onChange={handleMessageChange}
                placeholder="Provide more details about your question..."
                required
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleQuestionClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning text-white">
                Post Question
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CourseDetail