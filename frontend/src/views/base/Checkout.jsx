import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import apiInstance from "../../utils/axios";
import Toast from "../plugin/Toast";
import { PAYPAL_CLIENT_ID } from "../../utils/constants";

function Checkout() {
  const [order, setOrder] = useState({});
  const [coupon, setCoupon] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("sslcommerz");
  const [isLoading, setIsLoading] = useState(true);

  const param = useParams();
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await apiInstance.get(`/order/course-Check-Out-order/${param.order_oid}/`);
      setOrder(response.data);
    } catch (error) {
      console.log(error);
      Toast().fire({
        icon: "error",
        title: "Failed to load order details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) {
      Toast().fire({
        icon: "error",
        title: "Please enter a coupon code",
      });
      return;
    }

    try {
      const formdata = new FormData();
      formdata.append("order_oid", order?.oid);
      formdata.append("coupon_code", coupon);

      const response = await apiInstance.post(`order/coupon/`, formdata);
      Toast().fire({
        icon: response.data.icon,
        title: response.data.message,
      });
      fetchOrder();
    } catch (error) {
      Toast().fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to apply coupon",
      });
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      if (paymentMethod === "stripe") {
        // Stripe payment will submit the form
        e.target.form.submit();
      } else {
        // For Bangladeshi payment methods
        const response = await apiInstance.post(`/payment/${paymentMethod}-checkout/${order.oid}/`);
        if (response.data?.redirect_url) {
          window.location.href = response.data.redirect_url;
        }
      }
    } catch (error) {
      setPaymentLoading(false);
      Toast().fire({
        icon: "error",
        title: error.response?.data?.message || "Payment processing failed",
      });
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [param.order_oid]);

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
                <h1 className="text-white fw-bold mb-3">Complete Your Purchase</h1>
                <p className="lead text-white-80 mb-4">Review your order and select payment method</p>
                <nav aria-label="breadcrumb" className="d-flex justify-content-center">
                  <ol className="breadcrumb breadcrumb-light">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
                    <li className="breadcrumb-item"><Link to="/cart">Cart</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Checkout</li>
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
          <div className="row g-4">
            {/* Order Details */}
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
                    Order Summary
                  </h5>
                </div>

                <div className="card-body">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-borderless">
                          <tbody>
                            {order?.order_items?.map((item, index) => (
                              <tr key={index}>
                                <td width="80">
                                  <img
                                    src={item.course.image}
                                    className="img-fluid rounded-2"
                                    alt={item.course.title}
                                    style={{ height: "60px", objectFit: "cover" }}
                                  />
                                </td>
                                <td>
                                  <h6 className="mb-0">{item.course.title}</h6>
                                  <small className="text-muted">By {item.course.teacher.full_name}</small>
                                </td>
                                <td className="text-end">
                                  <h6 className="mb-0 text-success">৳{item.price}</h6>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-light p-3 rounded-2 mt-3">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter coupon code"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                          />
                          <button
                            className="btn btn-outline-primary"
                            type="button"
                            onClick={applyCoupon}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </>
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
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={order.full_name || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={order.email || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={order.phone || ""}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={order.country || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Payment Section */}
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
                    <i className="fas fa-credit-card text-primary me-2"></i>
                    Payment Details
                  </h5>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-light p-3 rounded-2 mb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span className="fw-medium">৳{parseFloat(order.sub_total || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Discount:</span>
                          <span className="fw-medium text-danger">-৳{parseFloat(order.saved || 0).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tax:</span>
                          <span className="fw-medium">৳{parseFloat(order.tax_fee || 0).toFixed(2)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold fs-5">
                          <span>Total:</span>
                          <span className="text-success">৳{parseFloat(order.total || 0).toFixed(2)}</span>
                        </div>
                      </div>


                      <div className="mb-4">
                        <h6 className="mb-3">Select Payment Method</h6>
                        <div className="btn-group-vertical w-100" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name="paymentMethod"
                            id="sslcommerz"
                            autoComplete="off"
                            checked={paymentMethod === "sslcommerz"}
                            onChange={() => setPaymentMethod("sslcommerz")}
                          />
                          <label className="btn btn-outline-primary text-start d-flex align-items-center" htmlFor="sslcommerz">
                            <img src="/images/sslcommerz.png" alt="SSLCOMMERZ" height="24" className="me-2" />
                            SSLCOMMERZ (Cards, Mobile Banking)
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="paymentMethod"
                            id="bkash"
                            autoComplete="off"
                            checked={paymentMethod === "bkash"}
                            onChange={() => setPaymentMethod("bkash")}
                          />
                          <label className="btn btn-outline-primary text-start d-flex align-items-center" htmlFor="bkash">
                            <img src="/images/bkash.png" alt="bKash" height="24" className="me-2" />
                            bKash
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="paymentMethod"
                            id="nagad"
                            autoComplete="off"
                            checked={paymentMethod === "nagad"}
                            onChange={() => setPaymentMethod("nagad")}
                          />
                          <label className="btn btn-outline-primary text-start d-flex align-items-center" htmlFor="nagad">
                            <img src="/images/nagad.png" alt="Nagad" height="24" className="me-2" />
                            Nagad
                          </label>

                          <input
                            type="radio"
                            className="btn-check"
                            name="paymentMethod"
                            id="stripe"
                            autoComplete="off"
                            checked={paymentMethod === "stripe"}
                            onChange={() => setPaymentMethod("stripe")}
                          />
                          <label className="btn btn-outline-primary text-start d-flex align-items-center" htmlFor="stripe">
                            <img src="/images/stripe.png" alt="Stripe" height="24" className="me-2" />
                            Stripe (International Cards)
                          </label>
                        </div>
                      </div>

                      <form action={`http://127.0.0.1:8000/api/payment/stripe-checkout/${order.oid}/`} method="POST">
                        <button
                          className="btn btn-primary w-100 py-3"
                          onClick={processPayment}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-lock me-2"></i>
                              ৳{parseFloat(order.total || 0).toFixed(2)}

                            </>
                          )}
                        </button>
                      </form>

                      <div className="text-center small text-muted mt-3">
                        <i className="fas fa-shield-alt text-success me-1"></i>
                        Secure SSL Encrypted Payment
                      </div>

                      <div className="mt-4 bg-success bg-opacity-10 p-3 rounded-2">
                        <div className="d-flex align-items-center text-success">
                          <i className="fas fa-check-circle me-2"></i>
                          <small>30-day money-back guarantee</small>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
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
        .btn-check:checked + .btn {
          background-color: var(--bs-primary);
          color: white;
        }
      `}</style>
    </>
  );
}

export default Checkout;