import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { FaEnvelope, FaArrowRight, FaPaperPlane } from "react-icons/fa";
import BaseSidebar from "../partials/BaseSidebar";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";

function QA() {
  const [questions, setQuestions] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastElementRef = useRef();
  const [createMessage, setCreateMessage] = useState({ message: "" });
  const [conversationShow, setConversationShow] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await useAxios().get(
        `teacher/question-answer-list/${UserData()?.teacher_id}/`
      );
      setQuestions(response.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleConversationClose = () => {
    setConversationShow(false);
    setSelectedConversation(null);
  };

  const handleConversationShow = (conversation) => {
    setConversationShow(true);
    setSelectedConversation(conversation);
  };

  const handleMessageChange = (event) => {
    setCreateMessage({
      ...createMessage,
      [event.target.name]: event.target.value,
    });
  };

  const sendNewMessage = async (e) => {
    e.preventDefault();
    if (!createMessage.message.trim()) return;

    try {
      const formData = new FormData();
      formData.append("course_id", selectedConversation.course);
      formData.append("user_id", UserData()?.user_id);
      formData.append("message", createMessage.message);
      formData.append("qa_id", selectedConversation?.qa_id);

      const response = await useAxios().post(
        `teacher/question-answer-message-create/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSelectedConversation(response.data.question);
      setCreateMessage({ message: "" });
      fetchQuestions(); // Refresh the questions list
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please check your permissions and try again.");

      if (err.response?.status === 403) {
        // Check if it's a permission issue or token issue
        if (err.response.data?.code === "token_not_valid") {
          try {
            // Attempt to refresh token
            const refreshResponse = await useAxios().post('auth/token/refresh/', {
              refresh: localStorage.getItem('refresh_token')
            });

            localStorage.setItem('access_token', refreshResponse.data.access);
            // Retry the original request
            await sendNewMessage(e);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Redirect to login or show login modal
            window.location.href = '/login';
          }
        } else {
          // It's a permission issue, not token
          setError("You don't have permission to perform this action.");
        }
      }
    }
  };

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSearchQuestion = (event) => {
    const query = event.target.value.toLowerCase();
    if (query === "") {
      fetchQuestions();
    } else {
      const filtered = questions.filter((question) =>
        question.title.toLowerCase().includes(query)
      );
      setQuestions(filtered);
    }
  };

  return (
    <div className="d-flex">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <main
        className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          flex: 1,
          padding: '20px',
          transition: 'margin-left 0.3s ease',
          marginLeft: sidebarCollapsed ? '80px' : '250px'
        }}
      >
        <div className="container-fluid py-4">
          <div className="d-flex align-items-center mb-4">
            <FaEnvelope className="me-2 text-primary" />
            <h4 className="mb-0">Question and Answer</h4>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 p-3">Discussion</h5>
              <div className="p-3 pt-0">
                <div className="input-group">
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search questions..."
                    aria-label="Search"
                    onChange={handleSearchQuestion}
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : questions.length === 0 ? (
                <div className="text-center py-5">
                  <p>No questions found</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {questions.map((q, index) => (
                    <div
                      key={`question-${index}`}
                      className="list-group-item list-group-item-action p-4 mb-3 rounded"
                    >
                      <div className="d-flex align-items-start">
                        <img
                          src={q.profile.image}
                          className="rounded-circle me-3"
                          alt={q.profile.full_name}
                          width="60"
                          height="60"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <h6 className="mb-0">{q.profile.full_name}</h6>
                              <small className="text-muted">
                                {moment(q.date).format("DD MMM, YYYY")}
                              </small>
                            </div>
                            <span className="badge bg-success">
                              {q.messages?.length || 0} replies
                            </span>
                          </div>
                          <h5 className="mb-3">{q.title}</h5>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleConversationShow(q)}
                          >
                            Join Conversation <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Modal
        show={conversationShow}
        size="lg"
        onHide={handleConversationClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Discussion: {selectedConversation?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="border rounded-3 p-3">
            <div
              className="mb-3"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {selectedConversation?.messages?.map((m, index) => (
                <div key={`message-${index}`} className="mb-3">
                  <div className="d-flex">
                    <img
                      src={
                        m.profile.image?.startsWith("http://127.0.0.1:8000")
                          ? m.profile.image
                          : `http://127.0.0.1:8000${m.profile.image}`
                      }
                      className="rounded-circle me-3"
                      alt={m.profile.full_name}
                      width="40"
                      height="40"
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 fw-bold">
                            {m.profile.full_name}
                          </h6>
                          <small className="text-muted">
                            {moment(m.date).format("DD MMM, YYYY h:mm A")}
                          </small>
                        </div>
                        <p className="mb-0">{m.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={lastElementRef} />
            </div>

            <form className="mt-3" onSubmit={sendNewMessage}>
              <div className="input-group">
                <textarea
                  name="message"
                  className="form-control"
                  rows="3"
                  value={createMessage.message}
                  onChange={handleMessageChange}
                  placeholder="Type your reply..."
                  required
                />
                <button className="btn btn-primary" type="submit">
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default QA;