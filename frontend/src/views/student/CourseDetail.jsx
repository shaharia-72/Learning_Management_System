import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useAxios from '../../utils/useAxios';
import UseData from '../plugin/UserData';
import BaseSidebar from '../partials/BaseSidebar';
import { Rating } from 'react-simple-star-rating';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CourseDetail() {
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [noteShow, setNoteShow] = useState(false);
  const [conversationShow, setConversationShow] = useState(false);
  const [activeTab, setActiveTab] = useState('lectures');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', message: '' });
  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const axiosInstance = useAxios();
  const userData = UseData();

  // Sample data - replace with your API calls
  const courseLectures = [
    {
      id: 1,
      title: "Introduction of Digital Marketing",
      lectures: [
        { id: 1, title: "Introduction", duration: "3m 9s", completed: true, premium: false },
        { id: 2, title: "What is Digital Marketing", duration: "15m 10s", completed: true, premium: false },
        { id: 3, title: "Type of Digital Marketing", duration: "18m 10s", completed: false, premium: true }
      ]
    },
    {
      id: 2,
      title: "Customer Life cycle",
      lectures: [
        { id: 4, title: "What is Digital Marketing", duration: "11m 20s", completed: true, premium: false },
        { id: 5, title: "15 Tips for Writing Magnetic Headlines", duration: "25m 20s", completed: false, premium: false },
        { id: 6, title: "How to Write Like Your Customers Talk", duration: "11m 30s", completed: false, premium: false },
        { id: 7, title: "How to Flip Features Into Benefits", duration: "35m 30s", completed: false, premium: true }
      ]
    }
  ];

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture);
    setShowLectureModal(true);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    setNotes([...notes, { ...newNote, id: notes.length + 1, date: new Date().toLocaleDateString() }]);
    setNewNote({ title: '', content: '' });
    setNoteShow(false);
    toast.success('Note saved successfully!');
  };

  const handleDiscussionSubmit = (e) => {
    e.preventDefault();
    setDiscussions([...discussions, {
      ...newDiscussion,
      id: discussions.length + 1,
      author: userData.name,
      avatar: userData.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
      date: new Date().toLocaleString(),
      replies: []
    }]);
    setNewDiscussion({ title: '', message: '' });
    toast.success('Discussion started!');
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([...messages, {
      id: messages.length + 1,
      author: userData.name,
      avatar: userData.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
      content: newMessage,
      date: new Date().toLocaleTimeString()
    }]);
    setNewMessage('');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    toast.success('Review submitted successfully!');
    setRating(0);
    setReview('');
  };

  // Calculate course progress
  const totalLectures = courseLectures.reduce((acc, section) => acc + section.lectures.length, 0);
  const completedLectures = courseLectures.reduce((acc, section) =>
    acc + section.lectures.filter(lecture => lecture.completed).length, 0);
  const progressPercentage = Math.round((completedLectures / totalLectures) * 100);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="course-detail-container">
        <BaseSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          user={userData}
        />

        <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="container-fluid py-4">
            {/* Course Progress */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Course Progress</h5>
                  <span className="badge bg-primary">{progressPercentage}% Complete</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${progressPercentage}%` }}
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            </div>

            {/* Course Content Tabs */}
            <div className="card shadow-sm">
              <div className="card-header border-bottom bg-white">
                <ul className="nav nav-tabs card-header-tabs" id="courseTabs" role="tablist">
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
                      className={`nav-link ${activeTab === 'discussions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('discussions')}
                    >
                      <i className="fas fa-comments me-2"></i> Discussions
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'review' ? 'active' : ''}`}
                      onClick={() => setActiveTab('review')}
                    >
                      <i className="fas fa-star me-2"></i> Leave Review
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-0">
                {/* Lectures Tab */}
                {activeTab === 'lectures' && (
                  <div className="p-4">
                    {courseLectures.map((section) => (
                      <div key={section.id} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">{section.title}</h5>
                          <span className="badge bg-light text-dark">
                            {section.lectures.length} Lectures
                          </span>
                        </div>

                        <div className="list-group">
                          {section.lectures.map((lecture) => (
                            <div
                              key={lecture.id}
                              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${lecture.completed ? 'bg-light-success' : ''}`}
                              onClick={() => handleLectureClick(lecture)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  {lecture.completed ? (
                                    <i className="fas fa-check-circle text-success"></i>
                                  ) : lecture.premium ? (
                                    <i className="fas fa-lock text-warning"></i>
                                  ) : (
                                    <i className="fas fa-play-circle text-primary"></i>
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-0">{lecture.title}</h6>
                                  {lecture.premium && (
                                    <span className="badge bg-warning text-dark small mt-1">
                                      Premium Content
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="badge bg-light text-dark">{lecture.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5>My Notes</h5>
                      <button
                        className="btn btn-primary"
                        onClick={() => setNoteShow(true)}
                      >
                        <i className="fas fa-plus me-2"></i> Add Note
                      </button>
                    </div>

                    {notes.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="fas fa-sticky-note fa-3x text-muted mb-3"></i>
                        <h5>No Notes Yet</h5>
                        <p className="text-muted">Add your first note to get started</p>
                        <button
                          className="btn btn-primary"
                          onClick={() => setNoteShow(true)}
                        >
                          Create Note
                        </button>
                      </div>
                    ) : (
                      <div className="row g-4">
                        {notes.map((note) => (
                          <div key={note.id} className="col-md-6">
                            <div className="card h-100 shadow-sm">
                              <div className="card-body">
                                <h5 className="card-title">{note.title}</h5>
                                <p className="card-text text-muted">{note.content.substring(0, 150)}...</p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <small className="text-muted">{note.date}</small>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-outline-primary me-2"
                                      onClick={() => {
                                        setNewNote({ title: note.title, content: note.content });
                                        setNoteShow(true);
                                      }}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger">
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Discussions Tab */}
                {activeTab === 'discussions' && (
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5>Course Discussions</h5>
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#newDiscussionModal"
                      >
                        <i className="fas fa-plus me-2"></i> New Discussion
                      </button>
                    </div>

                    {discussions.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                        <h5>No Discussions Yet</h5>
                        <p className="text-muted">Be the first to start a discussion</p>
                        <button
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#newDiscussionModal"
                        >
                          Start Discussion
                        </button>
                      </div>
                    ) : (
                      <div className="list-group">
                        {discussions.map((discussion) => (
                          <div
                            key={discussion.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => {
                              setCurrentDiscussion(discussion);
                              setConversationShow(true);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex">
                              <img
                                src={discussion.avatar}
                                alt={discussion.author}
                                className="rounded-circle me-3"
                                width="48"
                                height="48"
                              />
                              <div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <h6 className="mb-0">{discussion.title}</h6>
                                  <small className="text-muted">{discussion.date}</small>
                                </div>
                                <p className="mb-1 text-muted">{discussion.author}</p>
                                <p className="mb-0">{discussion.message.substring(0, 100)}...</p>
                                <div className="mt-2">
                                  <span className="badge bg-light text-dark me-2">
                                    <i className="fas fa-comment me-1"></i>
                                    {discussion.replies.length} Replies
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Review Tab */}
                {activeTab === 'review' && (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <h4>Rate This Course</h4>
                      <p className="text-muted">Share your experience to help others</p>
                    </div>

                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4 text-center">
                        <Rating
                          onClick={(rate) => setRating(rate)}
                          ratingValue={rating}
                          size={40}
                          transition
                          fillColor="#ffc107"
                          emptyColor="#e4e5e9"
                          className="rating-stars"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="reviewText" className="form-label">Your Review</label>
                        <textarea
                          className="form-control"
                          id="reviewText"
                          rows="5"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your thoughts about this course..."
                        ></textarea>
                      </div>

                      <div className="text-center">
                        <button type="submit" className="btn btn-primary px-4">
                          <i className="fas fa-paper-plane me-2"></i> Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Lecture Modal */}
        <Modal show={showLectureModal} onHide={() => setShowLectureModal(false)} size="xl" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentLecture && (
                <>
                  <i className="fas fa-play-circle me-2 text-primary"></i>
                  {currentLecture.title}
                </>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="ratio ratio-16x9">
              <ReactPlayer
                url="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                width="100%"
                height="100%"
                controls
                playing
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => setShowLectureModal(false)}>
              <i className="fas fa-times me-2"></i> Close
            </Button>
            <div>
              <Button variant="outline-primary me-2">
                <i className="fas fa-sticky-note me-2"></i> Take Notes
              </Button>
              <Button variant="primary">
                <i className="fas fa-check-circle me-2"></i> Mark Complete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* Note Modal */}
        <Modal show={noteShow} onHide={() => {
          setNoteShow(false);
          setNewNote({ title: '', content: '' });
        }} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-sticky-note me-2 text-primary"></i>
              {newNote.id ? 'Edit Note' : 'Add New Note'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleNoteSubmit}>
              <div className="mb-3">
                <label className="form-label">Note Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows="8"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => {
                    setNoteShow(false);
                    setNewNote({ title: '', content: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Note
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        {/* Discussion Modal */}
        <Modal show={conversationShow} onHide={() => setConversationShow(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-comments me-2 text-primary"></i>
              {currentDiscussion && currentDiscussion.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="discussion-container">
              <div className="discussion-messages">
                {messages.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                    <h5>No Messages Yet</h5>
                    <p className="text-muted">Be the first to reply to this discussion</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="message mb-3">
                      <div className="d-flex">
                        <img
                          src={message.avatar}
                          alt={message.author}
                          className="rounded-circle me-3"
                          width="40"
                          height="40"
                        />
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <strong className="me-2">{message.author}</strong>
                            <small className="text-muted">{message.date}</small>
                          </div>
                          <div className="message-bubble p-3 rounded">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleMessageSubmit} className="mt-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </div>
          </Modal.Body>
        </Modal>

        {/* New Discussion Modal */}
        <div className="modal fade" id="newDiscussionModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2 text-primary"></i>
                  New Discussion
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleDiscussionSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Discussion Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDiscussion.title}
                      onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Question/Message</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={newDiscussion.message}
                      onChange={(e) => setNewDiscussion({ ...newDiscussion, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                    >
                      Post Discussion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .course-detail-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .main-content {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
        }
        
        .main-content.collapsed {
          margin-left: 80px;
        }
        
        .card {
          border: none;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .list-group-item {
          border-radius: 8px !important;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .list-group-item:hover {
          background-color: #f8f9fa;
          transform: translateX(5px);
        }
        
        .message-bubble {
          background-color: #f1f3f5;
          position: relative;
          max-width: 80%;
        }
        
        .message-bubble:after {
          content: '';
          position: absolute;
          left: -10px;
          top: 15px;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-right-color: #f1f3f5;
          border-left: 0;
        }
        
        .discussion-messages {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        /* Custom scrollbar */
        .discussion-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .discussion-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .discussion-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .discussion-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .rating-stars {
          display: inline-block;
        }
        
        @media (max-width: 992px) {
          .main-content {
            margin-left: 0;
          }
          
          .main-content.collapsed {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}

export default CourseDetail;