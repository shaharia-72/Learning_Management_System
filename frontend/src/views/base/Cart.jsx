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
    country: "Bangladesh",
    phone: ""
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
      const [cartResponse, statsResponse] = await Promise.all([
        apiInstance.get(`/cart/course-Cart-List/${CartId()}/`),
        apiInstance.get(`/cart/course-Cart-Statistic/${CartId()}/`)
      ]);
      setCart(cartResponse.data);
      setCartStats(statsResponse.data);
      setCartCount(cartResponse.data?.length);
    } catch (error) {
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
    if (!bioData.first_name || !bioData.last_name || !bioData.email || !bioData.phone) {
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
      const fullName = `${bioData.first_name.trim()} ${bioData.last_name.trim()}`.trim();
      formdata.append("full_name", fullName);
      formdata.append("email", bioData.email);
      formdata.append("country", bioData.country);
      formdata.append("phone", bioData.phone);
      formdata.append("cart_id", CartId());
      formdata.append("user_id", userId);

      const response = await apiInstance.post(`/order/course-create-order/`, formdata);
      navigate(`/checkout/${response.data.order_oid}/`);
    } catch (error) {
      Toast().fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to create order",
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

      {/* Hero Section */}
      <section className="checkout-hero bg-primary-gradient py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-white fw-bold mb-3">Your Learning Cart</h1>
                <p className="lead text-white-80 mb-4">Review your selected courses before checkout</p>
                <nav aria-label="breadcrumb" className="d-flex justify-content-center">
                  <ol className="breadcrumb breadcrumb-light">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Cart</li>
                  </ol>
                </nav>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5 bg-light">
        <div className="container">
          <form onSubmit={createOrder}>
            <div className="row g-4">
              {/* Cart Items Section */}
              <div className="col-lg-8">
                <motion.div
                  className="card shadow-sm border-0 rounded-3 overflow-hidden mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <i className="fas fa-shopping-cart text-primary me-2"></i>
                      Your Selected Courses ({cart?.length || 0})
                    </h5>
                  </div>

                  <div className="card-body p-0">
                    {isLoading ? (
                      <div className="p-5 text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Loading your cart...</p>
                      </div>
                    ) : cart?.length > 0 ? (
                      <div className="list-group list-group-flush">
                        <AnimatePresence>
                          {cart?.map((c, index) => (
                            <motion.div
                              key={c.id}
                              className="list-group-item border-0 py-3"
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              transition={{ duration: 0.3 }}
                            >
                              <div className="row align-items-center">
                                <div className="col-md-2">
                                  <img
                                    src={c.course.image}
                                    className="img-fluid rounded-2"
                                    alt={c.course.title}
                                    style={{ height: "80px", objectFit: "cover" }}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <h6 className="mb-1">
                                    <Link to={`/course/${c.course.slug}/`} className="text-dark">
                                      {c.course.title}
                                    </Link>
                                  </h6>
                                  <small className="text-muted">By {c.course.teacher.full_name}</small>
                                </div>
                                <div className="col-md-2 text-center">
                                  <h5 className="text-success mb-0">৳{c.price}</h5>
                                  {c.original_price && (
                                    <small className="text-muted text-decoration-line-through">৳{c.original_price}</small>
                                  )}
                                </div>
                                <div className="col-md-2 text-end">
                                  <button
                                    onClick={() => cartItemDelete(c.id)}
                                    className="btn btn-sm btn-outline-danger rounded-circle"
                                    type="button"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div
                        className="p-5 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="mb-4">
                          <i className="fas fa-shopping-cart fa-4x text-muted opacity-25"></i>
                        </div>
                        <h4 className="text-muted mb-3">Your cart is empty</h4>
                        <Link to="/courses" className="btn btn-primary px-4">
                          Browse Courses
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                  className="card shadow-sm border-0 rounded-3 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <i className="fas fa-user-circle text-primary me-2"></i>
                      Personal Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="first_name"
                          value={bioData.first_name}
                          onChange={handleBioDataChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="last_name"
                          value={bioData.last_name}
                          onChange={handleBioDataChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={bioData.email}
                          onChange={handleBioDataChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone *</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={bioData.phone}
                          onChange={handleBioDataChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={bioData.country}
                          onChange={handleBioDataChange}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-4">
                <motion.div
                  className="card shadow-sm border-0 rounded-3 sticky-top"
                  style={{ top: "20px" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="mb-0 d-flex align-items-center">
                      <i className="fas fa-receipt text-primary me-2"></i>
                      Order Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="bg-light p-3 rounded-2 mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span className="fw-medium">৳{cartStats.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Discount:</span>
                        <span className="fw-medium text-danger">-৳{cartStats.saved?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>
                        <span className="fw-medium">৳{cartStats.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between fw-bold fs-5">
                        <span>Total:</span>
                        <span className="text-success">৳{cartStats.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary w-100 py-3 mb-3"
                      type="submit"
                      disabled={isSubmitting || cart?.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-lock me-2"></i>
                          Proceed to Checkout
                        </>
                      )}
                    </button>

                    <div className="text-center small text-muted mb-4">
                      <i className="fas fa-shield-alt text-success me-1"></i>
                      Secure SSL Encrypted Payment
                    </div>

                    <div className="border-top pt-3">
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-credit-card me-2"></i>
                        Payment Methods
                      </h6>
                      <div className="row g-2">
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/sslcommerz.png" alt="SSLCOMMERZ" className="img-fluid" />
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/bkash.png" alt="bKash" className="img-fluid" />
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/nagad.png" alt="Nagad" className="img-fluid" />
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/stripe.png" alt="Stripe" className="img-fluid" />
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/mastercard.png" alt="Mastercard" className="img-fluid" />
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="payment-method bg-white p-2 rounded-2 text-center">
                            <img src="/images/visa.png" alt="Visa" className="img-fluid" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-success bg-opacity-10 p-3 rounded-2">
                      <div className="d-flex align-items-center text-success">
                        <i className="fas fa-check-circle me-2"></i>
                        <small>30-day money-back guarantee</small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <BaseFooter />

      <style jsx>{`
        .checkout-hero {
          background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        }
        .breadcrumb-light .breadcrumb-item + .breadcrumb-item::before {
          color: rgba(255,255,255,0.5);
        }
        .breadcrumb-light .breadcrumb-item a {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
        }
        .breadcrumb-light .breadcrumb-item.active {
          color: white;
        }
        .payment-method {
          border: 1px solid #eee;
          transition: all 0.3s ease;
        }
        .payment-method:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
}

export default Cart;