import React, { useState, useEffect, useContext } from "react";
import {
  FaCheckCircle, FaEdit, FaSpinner, FaTimes, FaLock,
  FaGlobe, FaUserTie, FaLink, FaTwitter, FaLinkedin,
  FaYoutube, FaGlobeAmericas, FaChalkboardTeacher, FaInfoCircle
} from "react-icons/fa";
import { BiEditAlt } from "react-icons/bi";
import { SiLinkedin, SiYoutube } from "react-icons/si";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import { ProfileContext } from "../plugin/Context";
import BaseSidebar from '../partials/BaseSidebar';
import { Link } from "react-router-dom";
import Toast from "../plugin/Toast";

function Profile() {
  const [profile, setProfile] = useContext(ProfileContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    country: "",
    expertise: "",
    personal_website: "",
    twitter: "",
    linkedIn: "",
    youtube: "",
    about: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await useAxios().get(`user/profile/${UserData()?.user_id}/`);
      console.log("API Response:", response.data);

      // Set profile context
      setProfile(response.data);
      console.log("this is data")
      console.log(response.data);

      // Set profile data with fallbacks for teacher and profile fields
      setProfileData({
        first_name: response.data.first_name || response.data.user?.first_name || "",
        last_name: response.data.last_name || response.data.user?.last_name || "",
        bio: response.data.bio || response.data.teacher?.bio || "",
        country: response.data.country || response.data.teacher?.country || "",
        expertise: response.data.expertise || "",
        personal_website: response.data.personal_website || response.data.teacher?.personal_website || "",
        twitter: response.data.twitter || response.data.teacher?.twitter || "",
        linkedIn: response.data.linkedIn || response.data.teacher?.linkedIn || "",
        youtube: response.data.youtube || response.data.teacher?.youtube || "",
        about: response.data.about || ""
      });

      // Set image preview with fallback
      setImagePreview(
        response.data.image ||
        response.data.teacher?.image ||
        "/default-avatar.png"
      );
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

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setProfileData({
        ...profileData,
        [event.target.name]: selectedFile,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
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

      Object.keys(profileData).forEach(key => {
        if (key === 'image' && typeof profileData[key] === 'string') return;
        formData.append(key, profileData[key]);
      });

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
      setEditMode(false);
      Toast("Profile updated successfully!", "success");
      fetchProfile(); // Refresh data
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
    fetchProfile(); // Reset to original data
    setErrors({});
  };

  const renderSocialLink = (platform, value) => {
    if (!value) return null;

    let icon, baseUrl;
    switch (platform) {
      case 'twitter':
        icon = <FaTwitter className="me-2" />;
        baseUrl = 'https://twitter.com/';
        break;
      case 'linkedIn':
        icon = <SiLinkedin className="me-2" />;
        baseUrl = 'https://linkedin.com/in/';
        break;
      case 'youtube':
        icon = <SiYoutube className="me-2" />;
        baseUrl = 'https://youtube.com/';
        break;
      case 'personal_website':
        icon = <FaGlobeAmericas className="me-2" />;
        baseUrl = '';
        break;
      default:
        icon = <FaLink className="me-2" />;
    }

    // Extract username from URL if it's a full URL
    let displayValue = value;
    try {
      const url = new URL(value);
      displayValue = url.pathname.replace(/^\//, '');
    } catch (e) {
      // Not a valid URL, use as is
    }

    return (
      <a
        href={value.startsWith('http') ? value : `${baseUrl}${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex align-items-center text-decoration-none text-primary mb-2"
      >
        {icon}
        <span className="text-truncate">{displayValue}</span>
      </a>
    );
  };

  return (
    <div className="d-flex">
      <BaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-9">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 pt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-1 fw-bold">
                        <FaUserTie className="me-2 text-primary" />
                        Instructor Profile
                      </h3>
                      <p className="mb-0 text-muted">
                        Manage your professional identity and presence
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      {!editMode && (
                        <button
                          className="btn btn-primary d-flex align-items-center"
                          onClick={handleEditClick}
                        >
                          <FaEdit className="me-2" />
                          Edit Profile
                        </button>
                      )}
                      <Link
                        className="btn btn-outline-danger d-flex align-items-center"
                        to="/instructor/change-password/"
                      >
                        <FaLock className="me-2" />
                        Password
                      </Link>
                    </div>
                  </div>
                </div>

                {loading && !profile ? (
                  <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading profile...</p>
                  </div>
                ) : (
                  <form className="card-body pt-0" onSubmit={handleFormSubmit}>
                    {/* Profile Header */}
                    <div className="d-flex align-items-center mb-4">
                      <div className="position-relative me-4">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            className="avatar-xxl rounded-circle shadow"
                            alt="Profile"
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="avatar-xxl rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FaUserTie className="text-secondary" style={{ fontSize: "50px" }} />
                          </div>
                        )}
                        {editMode && (
                          <label
                            htmlFor="profileImageUpload"
                            className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle"
                            style={{ width: "36px", height: "36px" }}
                            title="Change photo"
                          >
                            <BiEditAlt size={16} />
                            <input
                              id="profileImageUpload"
                              type="file"
                              className="d-none"
                              name="image"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <h2 className="mb-1 fw-bold">
                          {`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || "Your Name"}
                        </h2>
                        {profileData.expertise && (
                          <p className="text-muted mb-2">
                            <FaChalkboardTeacher className="me-2" />
                            {profileData.expertise}
                          </p>
                        )}
                        {profileData.country && (
                          <p className="text-muted mb-0">
                            <FaGlobe className="me-2" />
                            {profileData.country}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs mb-4" id="profileTabs" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === "basic" ? "active" : ""}`}
                          onClick={() => setActiveTab("basic")}
                          type="button"
                        >
                          Basic Info
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === "professional" ? "active" : ""}`}
                          onClick={() => setActiveTab("professional")}
                          type="button"
                        >
                          Professional
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeTab === "social" ? "active" : ""}`}
                          onClick={() => setActiveTab("social")}
                          type="button"
                        >
                          Social Links
                        </button>
                      </li>
                    </ul>

                    {/* Basic Information Tab */}
                    {activeTab === "basic" && (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">First Name <span className="text-danger">*</span></label>
                            {editMode ? (
                              <>
                                <input
                                  type="text"
                                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                                  placeholder="First Name"
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
                              <div className="p-3 bg-light rounded">
                                {profileData.first_name || "Not specified"}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">Last Name <span className="text-danger">*</span></label>
                            {editMode ? (
                              <>
                                <input
                                  type="text"
                                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                                  placeholder="Last Name"
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
                              <div className="p-3 bg-light rounded">
                                {profileData.last_name || "Not specified"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Country</label>
                            {editMode ? (
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FaGlobe />
                                </span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Your country"
                                  value={profileData.country}
                                  onChange={handleProfileChange}
                                  name="country"
                                  disabled={loading}
                                />
                              </div>
                            ) : (
                              <div className="p-3 bg-light rounded">
                                {profileData.country || "Not specified"}
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label fw-bold">About You</label>
                            {editMode ? (
                              <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Tell students about yourself"
                                value={profileData.about}
                                onChange={handleProfileChange}
                                name="about"
                                disabled={loading}
                              />
                            ) : (
                              <div className="p-3 bg-light rounded">
                                {profileData.about || "Not specified"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === "professional" && (
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Bio</label>
                            {editMode ? (
                              <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Your professional bio"
                                value={profileData.bio}
                                onChange={handleProfileChange}
                                name="bio"
                                disabled={loading}
                              />
                            ) : (
                              <div className="p-3 bg-light rounded">
                                {profileData.bio || "Not specified"}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Expertise</label>
                            {editMode ? (
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Your areas of expertise"
                                value={profileData.expertise}
                                onChange={handleProfileChange}
                                name="expertise"
                                disabled={loading}
                              />
                            ) : (
                              <div className="p-3 bg-light rounded">
                                {profileData.expertise || "Not specified"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Links Tab */}
                    {activeTab === "social" && (
                      <div className="row">
                        {editMode ? (
                          <>
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Personal Website</label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FaGlobeAmericas />
                                </span>
                                <input
                                  type="url"
                                  className="form-control"
                                  placeholder="https://yourwebsite.com"
                                  value={profileData.personal_website}
                                  onChange={handleProfileChange}
                                  name="personal_website"
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Twitter</label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FaTwitter />
                                </span>
                                <input
                                  type="url"
                                  className="form-control"
                                  placeholder="https://twitter.com/username"
                                  value={profileData.twitter}
                                  onChange={handleProfileChange}
                                  name="twitter"
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">LinkedIn</label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FaLinkedin />
                                </span>
                                <input
                                  type="url"
                                  className="form-control"
                                  placeholder="https://linkedin.com/in/username"
                                  value={profileData.linkedIn}
                                  onChange={handleProfileChange}
                                  name="linkedIn"
                                  disabled={loading}
                                />
                              </div>
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">YouTube</label>
                              <div className="input-group">
                                <span className="input-group-text">
                                  <FaYoutube />
                                </span>
                                <input
                                  type="url"
                                  className="form-control"
                                  placeholder="https://youtube.com/username"
                                  value={profileData.youtube}
                                  onChange={handleProfileChange}
                                  name="youtube"
                                  disabled={loading}
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="col-12">
                            <div className="p-4 bg-light rounded">
                              <h5 className="mb-3 fw-bold">Your Social Presence</h5>
                              <div className="row">
                                {profileData.personal_website && (
                                  <div className="col-md-6 mb-3">
                                    {renderSocialLink('personal_website', profileData.personal_website)}
                                  </div>
                                )}
                                {profileData.twitter && (
                                  <div className="col-md-6 mb-3">
                                    {renderSocialLink('twitter', profileData.twitter)}
                                  </div>
                                )}
                                {profileData.linkedIn && (
                                  <div className="col-md-6 mb-3">
                                    {renderSocialLink('linkedIn', profileData.linkedIn)}
                                  </div>
                                )}
                                {profileData.youtube && (
                                  <div className="col-md-6 mb-3">
                                    {renderSocialLink('youtube', profileData.youtube)}
                                  </div>
                                )}
                                {!profileData.personal_website && !profileData.twitter &&
                                  !profileData.linkedIn && !profileData.youtube && (
                                    <div className="col-12 text-center py-3 text-muted">
                                      <FaInfoCircle className="me-2" />
                                      No social links added yet
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {editMode && (
                      <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-4"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          <FaTimes className="me-2" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="me-2 fa-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="me-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                )}
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
          padding: 20px;
          background-color: #f8f9fa;
        }
        
        .main-content.collapsed {
          margin-left: 80px;
        }
        
        .avatar-xxl {
          width: 120px;
          height: 120px;
        }
        
        .nav-tabs {
          border-bottom: 2px solid #dee2e6;
        }
        
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          border-bottom: 3px solid transparent;
        }
        
        .nav-tabs .nav-link:hover {
          border-color: transparent;
          color: #0d6efd;
        }
        
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          background-color: transparent;
          border-color: transparent;
          border-bottom-color: #0d6efd;
        }
        
        .card {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .card-header {
          padding-bottom: 0;
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          
          .d-flex.align-items-center.mb-4 {
            flex-direction: column;
            text-align: center;
          }
          
          .position-relative.me-4 {
            margin-right: 0 !important;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;