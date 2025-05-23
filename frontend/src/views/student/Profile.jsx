import React, { useState, useEffect, useContext } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import { ProfileContext } from "../plugin/Context";
import BaseSidebar from '../partials/BaseSidebar';
import { FaCheckCircle, FaEdit, FaSpinner, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await useAxios().get(`user/profile/${UserData()?.user_id}/`);
      setProfile(response.data);
      setProfileData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
      });
      console.log(response.data);
      setImagePreview(response.data.image || "/default-avatar.png");
    } catch (error) {
      console.error("Error fetching profile:", error);
      Toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!profileData.last_name) {
      newErrors.last_name = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("first_name", profileData.first_name);
      formData.append("last_name", profileData.last_name);

      const response = await useAxios().patch(
        `user/profile/${UserData()?.user_id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);
      console.log(response.data);
      setEditMode(false);
      Toast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    // Reset form to original values
    setProfileData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
    });
    setErrors({});
  };

  return (
    <>
      <div className="d-flex">
        <BaseSidebar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          user={UserData()}
        />

        <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="container py-4">
            <div className="row justify-content-center">
              <div className="col-lg-9 col-md-8">
                {/* Card */}
                <div className="card shadow-sm">
                  {/* Card header */}
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h3 className="mb-1">Profile Details</h3>
                        <p className="mb-0 text-muted">
                          Manage your account settings and personal information
                        </p>
                      </div>
                      {!editMode && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={handleEditClick}
                        >
                          <FaEdit className="me-2" />
                          Edit Profile
                        </button>
                      )}
                      <Link
                        className="btn btn-outline-danger d-flex align-items-center gap-2"
                        to="/student/change-password/"
                      >
                        <FaLock style={{ color: "red" }} />
                        <span>Change Password</span>
                      </Link>
                    </div>
                  </div>

                  {/* Card body */}
                  {loading && !profile ? (
                    <div className="card-body text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading profile...</p>
                    </div>
                  ) : (
                    <form className="card-body" onSubmit={handleFormSubmit}>
                      <hr className="my-4" />

                      {/* Personal Details Section */}
                      <div>
                        <h4 className="mb-3">Personal Information</h4>

                        {/* First Name */}
                        <div className="mb-4">
                          <label className="form-label" htmlFor="first_name">
                            First Name <span className="text-danger">*</span>
                          </label>
                          {editMode ? (
                            <>
                              <input
                                type="text"
                                id="first_name"
                                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                placeholder="Enter your first name"
                                required
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                name="first_name"
                                disabled={loading}
                              />
                              {errors.first_name && (
                                <div className="invalid-feedback">{errors.first_name}</div>
                              )}
                            </>
                          ) : (
                            <p className="form-control-static">
                              {profileData.first_name || "Not specified"}
                            </p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="mb-4">
                          <label className="form-label" htmlFor="last_name">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          {editMode ? (
                            <>
                              <input
                                type="text"
                                id="last_name"
                                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                placeholder="Enter your last name"
                                required
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                name="last_name"
                                disabled={loading}
                              />
                              {errors.last_name && (
                                <div className="invalid-feedback">{errors.last_name}</div>
                              )}
                            </>
                          ) : (
                            <p className="form-control-static">
                              {profileData.last_name || "Not specified"}
                            </p>
                          )}
                        </div>

                        {/* Full Name Display */}
                        <div className="mb-4">
                          <label className="form-label">
                            Full Name
                          </label>
                          <p className="form-control-static">
                            {`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || "Not specified"}
                          </p>
                        </div>

                        {/* Form Actions */}
                        {editMode && (
                          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              <FaTimes className="me-2" />
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <FaSpinner className="me-2 fa-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="me-2" />
                                  Update Profile
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-content {
          flex: 1;
          margin-left: 250px;
          transition: margin-left 0.3s ease;
        }
        
        .main-content.collapsed {
          margin-left: 80px;
        }
        
        .form-control-static {
          padding: 0.375rem 0.75rem;
          border: 1px solid transparent;
          min-height: calc(1.5em + 0.75rem + 2px);
          display: block;
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
}

export default Profile;