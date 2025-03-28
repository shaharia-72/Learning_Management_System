// import React from "react";
import { useState, useEffect } from "react";
import { Link} from "react-router-dom";

import apiInstance from "../../utils/axios";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { register } from "../../utils/auth";

function Register() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  // const [about, setAbout] = useState("");
  // const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // console.log(first_name);
  // console.log(last_name);
  // console.log(email);
  // console.log(password);
  // console.log(confirm_password);
  // console.log(about);
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const {error} = register(first_name, last_name, email, password, confirm_password)
    if (error)
    {
      alert(error);
      isLoading(false);
    }
    else {
      // alert("Registration Successful!");
      setIsLoading(true);
    }

  }
  return (
    <>
      {/* <BaseHeader /> */}

      <section className="container d-flex flex-column vh-100" style={{ marginTop: "150px" }}>
        <div className="row align-items-center justify-content-center g-0 h-lg-100 py-8">
          <div className="col-lg-5 col-md-8 py-8 py-xl-0">
            <div className="card shadow">
              <div className="card-body p-6">
                <div className="mb-4">
                  <h1 className="mb-1 fw-bold">Sign up</h1>
                  <span>
                    Already have an account?
                    <Link to="/login/" className="ms-1">Sign In</Link>
                  </span>
                </div>
                {/* Form */}
                <form className="needs-validation" noValidate="" onSubmit={handleSubmit}>
                  {/* First Name */}
                  <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      className="form-control"
                      placeholder="John"
                      required
                      onChange={(e) => setFirstName(e.target.value)}
                      // onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      className="form-control"
                      placeholder="Doe"
                      required
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  {/* Email Address */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="johndoe@gmail.com"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="**************"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label htmlFor="password2" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="password2"
                      className="form-control"
                      placeholder="**************"
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                          Sign Up <i className="fas fa-user-plus"></i>
                        </button>

                  
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <BaseFooter /> */}
    </>
  );
};

  


export default Register;
