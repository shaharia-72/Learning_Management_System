import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import apiInstance from "../../utils/axios";
import CartId from "../plugin/CartId";
import Toast from "../plugin/Toast";
import { CartContext } from "../plugin/Context";
import { userId } from "../../utils/constants";

function Cart() {
  const [cart, setCart] = useState([]);
  const [cartStats, setCartStats] = useState([]);
  const [cartCount, setCartCount] = useContext(CartContext);
  const [bioData, setBioData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCartItem = async () => {
    setIsLoading(true);
    try {
      const [cartResponse, statsResponse] = await Promise.all([
        apiInstance.get(`/cart/course-Cart-List/${CartId()}/`),
        apiInstance.get(`/cart/course-Cart-Statistic/${CartId()}/`)
      ]);

      setCart(cartResponse.data);
      setCartStats(statsResponse.data);
      console.log(statsResponse.data)
    } catch (error) {
      console.log(error);
      Toast().fire({
        icon: "error",
        title: "Failed to load cart items",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItem();
  }, []);

  const navigate = useNavigate();

  const cartItemDelete = async (itemId) => {
    try {
      await apiInstance.delete(`/cart/course-Cart-List/${CartId()}/${itemId}/`);

      Toast().fire({
        icon: "success",
        title: "Item removed from cart",
      });

      // Fetch updated cart
      const [cartResponse, statsResponse] = await Promise.all([
        apiInstance.get(`/cart/course-Cart-List/${CartId()}/`),
        apiInstance.get(`/cart/course-Cart-Statistic/${CartId()}/`)
      ]);

      setCart(cartResponse.data);
      setCartStats(statsResponse.data);
      setCartCount(cartResponse.data?.length);
    } catch (error) {
      console.log(error);
      Toast().fire({
        icon: "error",
        title: "Failed to remove item",
      });
    }
  };

  const handleBioDataChange = (event) => {
    setBioData({
      ...bioData,
      [event.target.name]: event.target.value,
    });
  };

  const createOrder = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!bioData.first_name || !bioData.last_name || !bioData.email || !bioData.country) {
      Toast().fire({
        icon: "error",
        title: "Please fill all required fields",
      });
      return;
    }

    if (cart.length === 0) {
      Toast().fire({
        icon: "error",
        title: "Your cart is empty",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formdata = new FormData();
      // Combine first_name and last_name to create full_name
      const fullName = `${bioData.first_name.trim()} ${bioData.last_name.trim()}`.trim();

      formdata.append("full_name", fullName);
      formdata.append("first_name", bioData.first_name);
      formdata.append("last_name", bioData.last_name);
      formdata.append("email", bioData.email);
      formdata.append("country", bioData.country);
      formdata.append("cart_id", CartId());
      formdata.append("user_id", userId);

      const response = await apiInstance.post(`/order/course-create-order/`, formdata);
      navigate(`/checkout/${response.data.order_oid}/`);
    } catch (error) {
      console.log(error);
      Toast().fire({
        icon: "error",
        title: "Failed to create order",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <BaseHeader />

      <section className="py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
          <div className="position-absolute" style={{ top: "10%", left: "10%", width: "100px", height: "100px", background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}></div>
          <div className="position-absolute" style={{ top: "60%", right: "20%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)" }}></div>
        </div>
        <div className="container position-relative">
          <motion.div
            className="row"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="col-12">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-3"
                >
                  <i className="fas fa-shopping-cart fa-3x text-white-50 mb-3"></i>
                </motion.div>
                <h1 className="display-4 fw-bold mb-3 text-shadow">Your Learning Cart</h1>
                <p className="lead mb-4 text-white-75">Ready to start your learning journey?</p>
                <nav aria-label="breadcrumb" className="d-flex justify-content-center">
                  <ol className="breadcrumb breadcrumb-dots mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-white-50 text-decoration-none hover-text-white transition-colors">
                        <i className="fas fa-home me-1"></i>Home
                      </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/courses" className="text-white-50 text-decoration-none hover-text-white transition-colors">
                        <i className="fas fa-graduation-cap me-1"></i>Courses
                      </Link>
                    </li>
                    <li className="breadcrumb-item active text-white" aria-current="page">
                      <i className="fas fa-shopping-cart me-1"></i>Cart
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <form onSubmit={createOrder}>
            <motion.div
              className="row g-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Main content START */}
              <motion.div className="col-lg-8 mb-4 mb-sm-0" variants={itemVariants}>
                {/* Cart Items */}
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-4">
                  <div className="card-header bg-gradient-to-r from-blue-50 to-purple-50 border-bottom-0 py-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="mb-0 fw-bold d-flex align-items-center text-dark">
                        <div className="bg-primary rounded-circle p-2 me-3">
                          <i className="fas fa-shopping-cart text-white"></i>
                        </div>
                        Your Cart
                      </h5>
                      <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                        {cart?.length} {cart?.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    {isLoading ? (
                      <motion.div
                        className="p-5 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <h6 className="text-muted">Loading your cart...</h6>
                        <p className="text-muted mb-0">Please wait while we fetch your courses</p>
                      </motion.div>
                    ) : cart?.length > 0 ? (
                      <div className="p-3">
                        <AnimatePresence mode="wait">
                          {cart?.map((c, index) => (
                            <motion.div
                              key={c.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="border rounded-3 p-3 mb-3 bg-white shadow-sm hover-shadow-md transition-shadow"
                            >
                              <div className="row align-items-center">
                                <div className="col-md-8">
                                  <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0 me-3 position-relative">
                                      <img
                                        src={c.course.image}
                                        style={{
                                          width: "100px",
                                          height: "70px",
                                          objectFit: "cover",
                                        }}
                                        className="rounded-3 shadow-sm"
                                        alt={c.course.title}
                                      />
                                      <div className="position-absolute top-0 start-0 bg-success rounded-pill px-2 py-1" style={{ fontSize: "0.7rem", transform: "translate(-5px, -5px)" }}>
                                        <i className="fas fa-check text-white"></i>
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1 fw-bold">
                                        <Link to={`/course/${c.course.slug}/`} className="text-decoration-none text-dark hover-text-primary transition-colors">
                                          {c.course.title}
                                        </Link>
                                      </h6>
                                      <div className="d-flex align-items-center mb-2">
                                        <div className="me-3">
                                          <small className="text-muted">
                                            <i className="fas fa-user-tie me-1"></i>
                                            By {c.course.teacher.first_name}
                                          </small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                          <div className="text-warning me-1">
                                            {'★'.repeat(5)}
                                          </div>
                                          <small className="text-muted">(4.8)</small>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2">
                                        <span className="badge bg-light text-dark">
                                          <i className="fas fa-clock me-1"></i>
                                          Lifetime Access
                                        </span>
                                        <span className="badge bg-light text-dark">
                                          <i className="fas fa-certificate me-1"></i>
                                          Certificate
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-2 text-center">
                                  <h4 className="text-success mb-0 fw-bold">
                                    ${c.price ? Number(c.price).toFixed(2) : "0.00"}
                                  </h4>
                                  <small className="text-muted text-decoration-line-through">$99.99</small>
                                </div>
                                <div className="col-md-2 text-end">
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => cartItemDelete(c.id)}
                                    className="btn btn-outline-danger btn-sm rounded-circle p-2"
                                    type="button"
                                    aria-label="Remove item"
                                    style={{ width: "40px", height: "40px" }}
                                  >
                                    <i className="fas fa-trash-alt" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div
                        className="p-5 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="mb-4">
                          <i className="fas fa-shopping-cart fa-4x text-muted opacity-50"></i>
                        </div>
                        <h4 className="text-muted mb-3">Your cart is empty</h4>
                        <p className="text-muted mb-4">Discover amazing courses and start your learning journey today!</p>
                        <Link to="/courses" className="btn btn-primary btn-lg rounded-pill px-4">
                          <i className="fas fa-search me-2"></i>
                          Explore Courses
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Personal info */}
                <motion.div
                  className="card shadow-lg border-0 rounded-4 overflow-hidden"
                  variants={itemVariants}
                >
                  <div className="card-header bg-gradient-to-r from-green-50 to-blue-50 border-bottom-0 py-4">
                    <h5 className="mb-0 fw-bold d-flex align-items-center text-dark">
                      <div className="bg-success rounded-circle p-2 me-3">
                        <i className="fas fa-user-circle text-white"></i>
                      </div>
                      Personal Details
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* First Name */}
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label fw-bold text-dark">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-user text-primary"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 shadow-sm"
                            id="firstName"
                            placeholder="John"
                            name="first_name"
                            value={bioData.first_name}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label fw-bold text-dark">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-user text-primary"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 shadow-sm"
                            id="lastName"
                            placeholder="Doe"
                            name="last_name"
                            value={bioData.last_name}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-12">
                        <label htmlFor="emailInput" className="form-label fw-bold text-dark">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-envelope text-primary"></i>
                          </span>
                          <input
                            type="email"
                            className="form-control border-start-0 shadow-sm"
                            id="emailInput"
                            placeholder="john.doe@example.com"
                            name="email"
                            value={bioData.email}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="col-md-12">
                        <label htmlFor="countryInput" className="form-label fw-bold text-dark">
                          Country <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-globe text-primary"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 shadow-sm"
                            id="countryInput"
                            placeholder="United States"
                            name="country"
                            value={bioData.country}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Order Summary */}
              <motion.div className="col-lg-4" variants={itemVariants}>
                <div className="card shadow-lg border-0 rounded-4 sticky-top overflow-hidden" style={{ top: "20px" }}>
                  <div className="card-header bg-gradient-to-r from-purple-50 to-pink-50 border-bottom-0 py-4">
                    <h5 className="mb-0 fw-bold d-flex align-items-center text-dark">
                      <div className="bg-info rounded-circle p-2 me-3">
                        <i className="fas fa-receipt text-white"></i>
                      </div>
                      Order Summary
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="bg-light rounded-3 p-3 mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Subtotal</span>
                        <span className="fw-medium">${cartStats.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Tax</span>
                        <span className="fw-medium">${cartStats.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">Total</span>
                        <span className="fw-bold text-success fs-4">${cartStats.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <div className="d-grid mb-4">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary btn-lg py-3 rounded-3 fw-bold"
                        disabled={isSubmitting || cart?.length === 0}
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none"
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock me-2"></i>
                            Secure Checkout
                          </>
                        )}
                      </motion.button>
                    </div>

                    <div className="text-center mb-4">
                      <small className="text-muted">
                        <i className="fas fa-shield-alt text-success me-1"></i>
                        By proceeding, you agree to our{" "}
                        <Link to="/terms" className="text-decoration-none text-primary">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-decoration-none text-primary">
                          Privacy Policy
                        </Link>
                      </small>
                    </div>

                    <div className="border-top pt-4">
                      <h6 className="text-uppercase text-muted mb-3 fw-bold fs-7">
                        <i className="fas fa-credit-card me-2"></i>
                        Secure Payment Options
                      </h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="bg-white rounded-2 shadow-sm p-2 flex-fill mx-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="img-fluid" style={{ height: "20px" }} />
                        </div>
                        <div className="bg-white rounded-2 shadow-sm p-2 flex-fill mx-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="img-fluid" style={{ height: "20px" }} />
                        </div>
                        <div className="bg-white rounded-2 shadow-sm p-2 flex-fill mx-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="img-fluid" style={{ height: "20px" }} />
                        </div>
                        <div className="bg-white rounded-2 shadow-sm p-2 flex-fill mx-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="img-fluid" style={{ height: "20px" }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-3">
                      <div className="d-flex align-items-center text-success">
                        <i className="fas fa-check-circle me-2"></i>
                        <small className="fw-medium">30-day money-back guarantee</small>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </form>
        </div>
      </section>

      <BaseFooter />

      <style jsx>{`
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .hover-text-white:hover {
          color: white !important;
        }
        .hover-text-primary:hover {
          color: var(--bs-primary) !important;
        }
        .transition-colors {
          transition: color 0.3s ease;
        }
        .transition-shadow {
          transition: box-shadow 0.3s ease;
        }
        .hover-shadow-md:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .bg-gradient-to-r {
          background: linear-gradient(90deg, var(--tw-gradient-stops));
        }
        .from-blue-600 {
          --tw-gradient-from: #2563eb;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
        }
        .via-purple-600 {
          --tw-gradient-stops: var(--tw-gradient-from), #9333ea, var(--tw-gradient-to, rgba(147, 51, 234, 0));
        }
        .to-blue-800 {
          --tw-gradient-to: #1e40af;
        }
        .from-blue-50 {
          --tw-gradient-from: #eff6ff;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
        }
        .to-purple-50 {
          --tw-gradient-to: #faf5ff;
        }
        .from-green-50 {
          --tw-gradient-from: #f0fdf4;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(240, 253, 244, 0));
        }
        .from-purple-50 {
          --tw-gradient-from: #faf5ff;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));
        }
        .to-pink-50 {
          --tw-gradient-to: #fdf2f8;
        }
        .fs-7 {
          font-size: 0.875rem;
        }
      `}</style>
    </>
  );
}

export default Cart;