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
    full_name: "",
    email: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCartItem = async () => {
    setIsLoading(true);
    try {
      const [cartResponse, statsResponse] = await Promise.all([
        apiInstance.get(`course/cart-list/${CartId()}/`),
        apiInstance.get(`cart/stats/${CartId()}/`)
      ]);

      setCart(cartResponse.data);
      setCartStats(statsResponse.data);
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
      await apiInstance.delete(`course/cart-item-delete/${CartId()}/${itemId}/`);

      Toast().fire({
        icon: "success",
        title: "Item removed from cart",
      });

      // Fetch updated cart
      const [cartResponse, statsResponse] = await Promise.all([
        apiInstance.get(`course/cart-list/${CartId()}/`),
        apiInstance.get(`cart/stats/${CartId()}/`)
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
    if (!bioData.full_name || !bioData.email || !bioData.country) {
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
      formdata.append("full_name", bioData.full_name);
      formdata.append("email", bioData.email);
      formdata.append("country", bioData.country);
      formdata.append("cart_id", CartId());
      formdata.append("user_id", userId);

      const response = await apiInstance.post(`order/create-order/`, formdata);
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
    exit: { opacity: 0, x: -50 }
  };

  return (
    <>
      <BaseHeader />

      <section className="py-4 bg-gradient-primary text-white">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="p-4 text-center rounded-3">
                <h1 className="m-0 fw-bold">Your Shopping Cart</h1>
                <nav aria-label="breadcrumb" className="d-flex justify-content-center">
                  <ol className="breadcrumb breadcrumb-dots mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/" className="text-white-50 text-decoration-none">
                        Home
                      </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/courses" className="text-white-50 text-decoration-none">
                        Courses
                      </Link>
                    </li>
                    <li className="breadcrumb-item active text-white" aria-current="page">
                      Cart
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <form onSubmit={createOrder}>
            <div className="row g-4">
              {/* Main content START */}
              <div className="col-lg-8 mb-4 mb-sm-0">
                {/* Cart Items */}
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                  <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Your Cart ({cart?.length} {cart?.length === 1 ? 'Item' : 'Items'})
                    </h5>
                  </div>

                  <div className="card-body p-0">
                    {isLoading ? (
                      <div className="p-4 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading your cart...</p>
                      </div>
                    ) : cart?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th scope="col" className="border-0">Course</th>
                              <th scope="col" className="border-0 text-center">Price</th>
                              <th scope="col" className="border-0"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence>
                              {cart?.map((c, index) => (
                                <motion.tr
                                  key={c.id}
                                  variants={itemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  transition={{ duration: 0.3 }}
                                >
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="flex-shrink-0 me-3">
                                        <img
                                          src={c.course.image}
                                          style={{
                                            width: "80px",
                                            height: "60px",
                                            objectFit: "cover",
                                          }}
                                          className="rounded shadow-sm"
                                          alt={c.course.title}
                                        />
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className="mb-0">
                                          <Link to={`/course/${c.course.slug}/`} className="text-decoration-none text-dark">
                                            {c.course.title}
                                          </Link>
                                        </h6>
                                        <small className="text-muted">By {c.course.instructor.full_name}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <h5 className="text-success mb-0">${c.price.toFixed(2)}</h5>
                                  </td>
                                  <td className="text-end">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => cartItemDelete(c.id)}
                                      className="btn btn-sm btn-outline-danger px-2 mb-0"
                                      type="button"
                                      aria-label="Remove item"
                                    >
                                      <i className="fas fa-trash-alt" />
                                    </motion.button>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="mb-3">
                          <i className="fas fa-shopping-cart fa-3x text-muted"></i>
                        </div>
                        <h5 className="text-muted">Your cart is empty</h5>
                        <p className="text-muted">Browse our courses and find something to learn!</p>
                        <Link to="/courses" className="btn btn-primary mt-3">
                          Explore Courses
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Personal info */}
                <div className="card shadow-sm border-0 rounded-3 mt-4">
                  <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <i className="fas fa-user-circle me-2"></i>
                      Personal Details
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-md-12">
                        <label htmlFor="yourName" className="form-label fw-bold">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="fas fa-user"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            id="yourName"
                            placeholder="Your full name"
                            name="full_name"
                            value={bioData.full_name}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-12">
                        <label htmlFor="emailInput" className="form-label fw-bold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="fas fa-envelope"></i>
                          </span>
                          <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            placeholder="your@email.com"
                            name="email"
                            value={bioData.email}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Country */}
                      <div className="col-md-12">
                        <label htmlFor="countryInput" className="form-label fw-bold">
                          Country <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="fas fa-globe"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            id="countryInput"
                            placeholder="Your country"
                            name="country"
                            value={bioData.country}
                            onChange={handleBioDataChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <div className="card shadow-sm border-0 rounded-3 sticky-top" style={{ top: "20px" }}>
                  <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <i className="fas fa-receipt me-2"></i>
                      Order Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush mb-3">
                      <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 py-2">
                        <span>Subtotal</span>
                        <span className="fw-medium">${cartStats.price?.toFixed(2) || '0.00'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 py-2">
                        <span>Tax</span>
                        <span className="fw-medium">${cartStats.tax?.toFixed(2) || '0.00'}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 py-2">
                        <span className="fw-bold">Total</span>
                        <span className="fw-bold text-success">${cartStats.total?.toFixed(2) || '0.00'}</span>
                      </li>
                    </ul>

                    <div className="d-grid">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={isSubmitting || cart?.length === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock me-2"></i>
                            Proceed to Checkout
                          </>
                        )}
                      </motion.button>
                    </div>

                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        By proceeding, you agree to our{" "}
                        <Link to="/terms" className="text-decoration-none">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-decoration-none">
                          Privacy Policy
                        </Link>
                      </small>
                    </div>

                    <div className="mt-4">
                      <h6 className="text-uppercase text-muted mb-3 fw-bold">Secure Payment</h6>
                      <div className="d-flex justify-content-between">
                        <img src="https://via.placeholder.com/40x25?text=VISA" alt="Visa" className="img-fluid" />
                        <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="img-fluid" />
                        <img src="https://via.placeholder.com/40x25?text=AMEX" alt="Amex" className="img-fluid" />
                        <img src="https://via.placeholder.com/40x25?text=PP" alt="PayPal" className="img-fluid" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <BaseFooter />
    </>
  );
}

export default Cart;