import React, { useState } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import BaseSidebar from '../partials/BaseSidebar';
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

function ChangePassword() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });
    const [errors, setErrors] = useState({});

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPassword({
            ...password,
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

        if (!password.old_password) {
            newErrors.old_password = "Old password is required";
        }

        if (!password.new_password) {
            newErrors.new_password = "New password is required";
        } else if (password.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters";
        }

        if (password.confirm_new_password !== password.new_password) {
            newErrors.confirm_new_password = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            const formdata = new FormData();
            formdata.append("user_id", UserData()?.user_id);
            formdata.append("old_password", password.old_password);
            formdata.append("new_password", password.new_password);

            const response = await useAxios().post(`user/password-change/`, formdata);

            Toast().fire({
                icon: response.data.icon,
                title: response.data.message,
            });

            // Reset form on success
            setPassword({
                old_password: "",
                new_password: "",
                confirm_new_password: "",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            Toast().fire({
                icon: "error",
                title: error.response?.data?.message || "Failed to change password",
            });
        } finally {
            setLoading(false);
        }
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
                                                <h3 className="mb-1">Change Password</h3>
                                                <p className="mb-0 text-muted">
                                                    Update your account password
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="card-body">
                                        <form onSubmit={changePasswordSubmit}>
                                            <hr className="my-4" />

                                            <div>
                                                <h4 className="mb-3">Password Information</h4>

                                                {/* Old Password */}
                                                <div className="mb-4">
                                                    <label className="form-label" htmlFor="old_password">
                                                        Old Password <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="old_password"
                                                        className={`form-control ${errors.old_password ? 'is-invalid' : ''}`}
                                                        placeholder="Enter your current password"
                                                        required
                                                        value={password.old_password}
                                                        onChange={handlePasswordChange}
                                                        name="old_password"
                                                        disabled={loading}
                                                    />
                                                    {errors.old_password && (
                                                        <div className="invalid-feedback">{errors.old_password}</div>
                                                    )}
                                                </div>

                                                {/* New Password */}
                                                <div className="mb-4">
                                                    <label className="form-label" htmlFor="new_password">
                                                        New Password <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="new_password"
                                                        className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                                                        placeholder="Enter your new password"
                                                        required
                                                        value={password.new_password}
                                                        onChange={handlePasswordChange}
                                                        name="new_password"
                                                        disabled={loading}
                                                    />
                                                    {errors.new_password && (
                                                        <div className="invalid-feedback">{errors.new_password}</div>
                                                    )}
                                                </div>

                                                {/* Confirm New Password */}
                                                <div className="mb-4">
                                                    <label className="form-label" htmlFor="confirm_new_password">
                                                        Confirm New Password <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirm_new_password"
                                                        className={`form-control ${errors.confirm_new_password ? 'is-invalid' : ''}`}
                                                        placeholder="Confirm your new password"
                                                        required
                                                        value={password.confirm_new_password}
                                                        onChange={handlePasswordChange}
                                                        name="confirm_new_password"
                                                        disabled={loading}
                                                    />
                                                    {errors.confirm_new_password && (
                                                        <div className="invalid-feedback">{errors.confirm_new_password}</div>
                                                    )}
                                                </div>

                                                {/* Form Actions */}
                                                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
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
                                                                Save New Password
                                                            </>
                                                        )}
                                                    </button>
                                                    <Link
                                                        to="/student/profile/"
                                                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                                    >
                                                        <FaArrowLeft />
                                                        <span>Back to Profile</span>
                                                    </Link>
                                                </div>

                                            </div>
                                        </form>
                                    </div>
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
                
                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </>
    );
}

export default ChangePassword;