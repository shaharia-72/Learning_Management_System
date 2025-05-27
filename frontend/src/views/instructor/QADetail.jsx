import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BaseSidebar from '../partials/BaseSidebar';
import UserData from '../plugin/UserData';
import useAxios from '../../utils/useAxios';
import moment from 'moment';

function TeacherQADetail() {
    const { courseId } = useParams();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCourseQuestions = async () => {
        try {
            const response = await useAxios().get(`teacher/question-answer-detail/${UserData()?.teacher_id}/${courseId}/`);
            setCourse(response.data.course);
            setMessages(response.data.messages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const formData = new FormData();
            formData.append('course_id', courseId);
            formData.append('message', newMessage);
            formData.append('teacher_id', UserData()?.teacher_id);

            const response = await useAxios().post('teacher/question-answer-reply/', formData);
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        fetchCourseQuestions();
    }, [courseId]);

    return (
        <div className="d-flex">
            <BaseSidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                user={UserData()}
            />

            <div className="main-content flex-grow-1 p-4">
                <h4 className="mb-4">
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    {course ? `Discussion: ${course.title}` : 'Loading...'}
                </h4>

                <div className="card shadow-sm">
                    <div className="card-header bg-white">
                        {course && (
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-1">{course.title}</h5>
                                    <small className="text-muted">{messages.length} messages</small>
                                </div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 p-md-4">
                            <div className="mb-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {messages.map((message) => (
                                    <div key={message.id} className={`mb-3 ${message.is_teacher ? 'text-end' : ''}`}>
                                        <div className="d-flex" style={message.is_teacher ? { flexDirection: 'row-reverse' } : {}}>
                                            <img
                                                src={message.sender_image ||
                                                    (message.is_teacher
                                                        ? "https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-2.jpg"
                                                        : "https://geeksui.codescandy.com/geeks/assets/images/avatar/avatar-1.jpg")}
                                                className="rounded-circle me-3"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                alt="avatar"
                                            />
                                            <div>
                                                <div
                                                    className={`p-3 rounded ${message.is_teacher ? 'bg-primary text-white' : 'bg-light'}`}
                                                >
                                                    <div className="d-flex justify-content-between small mb-1">
                                                        <strong>{message.sender_name}</strong>
                                                        <span>{moment(message.created_at).fromNow()}</span>
                                                    </div>
                                                    <p className="mb-0">{message.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="mt-3">
                                <div className="input-group">
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Write your response..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-paper-plane"></i> Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherQADetail;