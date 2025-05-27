import { useState, useEffect } from "react";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

import BaseSidebar from "../partials/BaseSidebar";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function TeacherNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    useAxios()
      .get(`teacher/notice-list/${UserData()?.teacher_id}/`)
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsSeen = (notiId) => {
    const formdata = new FormData();
    formdata.append("teacher", UserData()?.teacher_id);
    formdata.append("pk", notiId);
    formdata.append("seen", true);

    useAxios()
      .patch(`teacher/notice-detail/${UserData()?.teacher_id}/${notiId}`, formdata)
      .then(() => {
        fetchNotifications();
        Toast().fire({
          icon: "success",
          title: "Notification marked as seen",
        });
      });
  };

  const markAllAsRead = () => {
    useAxios()
      .post(`teacher/mark-all-noti-seen/${UserData()?.teacher_id}/`)
      .then(() => {
        fetchNotifications();
        Toast().fire({
          icon: "success",
          title: "All notifications marked as seen",
        });
      });
  };

  return (
    <div className="d-flex">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <div className="main-content flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Notifications</h2>
            <p className="text-muted mb-0">View and manage your notifications</p>
          </div>
          {notifications.length > 0 && (
            <button
              className="btn btn-outline-primary d-flex align-items-center"
              onClick={markAllAsRead}
            >
              <i className="fas fa-check-double me-2"></i>
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                <h5>No notifications yet</h5>
                <p className="text-muted">You'll see important updates here</p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((notification, index) => (
                  <div
                    className={`list-group-item p-4 ${index !== notifications.length - 1 ? 'border-bottom' : ''}`}
                    key={index}
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">
                            <Badge bg="info" className="me-2">
                              {notification.type}
                            </Badge>
                            {notification.title || "Notification"}
                          </h5>
                          <small className="text-muted">
                            {moment(notification.date).fromNow()}
                          </small>
                        </div>
                        {notification.message && (
                          <p className="mb-3">{notification.message}</p>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {moment(notification.date).format("MMMM Do YYYY, h:mm a")}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleMarkAsSeen(notification.id)}
                          >
                            <i className="fas fa-check me-1"></i> Mark as Seen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherNotification;