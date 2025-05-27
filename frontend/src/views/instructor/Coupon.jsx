import { useState, useEffect } from "react";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import TBaseSidebar from '../partials/TBaseSidebar';
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";

function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [createCoupon, setCreateCoupon] = useState({ code: "", discount: 0 });
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = () => {
    setLoading(true);
    useAxios()
      .get(`teacher/coupon-list/${UserData()?.teacher_id}/`)
      .then((res) => {
        setCoupons(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCouponChange = (event) => {
    setCreateCoupon({
      ...createCoupon,
      [event.target.name]: event.target.value,
    });
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("teacher", UserData()?.teacher_id);
    formdata.append("code", createCoupon.code);
    formdata.append("discount", createCoupon.discount);

    useAxios()
      .post(`teacher/coupon-list/${UserData()?.teacher_id}/`, formdata)
      .then(() => {
        fetchCoupons();
        setShowCreateModal(false);
        setCreateCoupon({ code: "", discount: 0 });
        Toast().fire({
          icon: "success",
          title: "Coupon created successfully",
        });
      });
  };

  const handleDeleteCoupon = (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      useAxios()
        .delete(`teacher/coupon-detail/${UserData()?.teacher_id}/${couponId}/`)
        .then(() => {
          fetchCoupons();
          Toast().fire({
            icon: "success",
            title: "Coupon deleted successfully",
          });
        });
    }
  };

  const handleCouponUpdateSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("teacher", UserData()?.teacher_id);
    formdata.append("code", createCoupon.code);
    formdata.append("discount", createCoupon.discount);

    useAxios()
      .patch(
        `teacher/coupon-detail/${UserData()?.teacher_id}/${selectedCoupon.id}/`,
        formdata
      )
      .then(() => {
        fetchCoupons();
        setShowEditModal(false);
        Toast().fire({
          icon: "success",
          title: "Coupon updated successfully",
        });
      });
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setCreateCoupon({
      code: coupon.code,
      discount: coupon.discount
    });
    setShowEditModal(true);
  };

  return (
    <div className="d-flex">
      <TBaseSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        user={UserData()}
      />

      <div className="main-content flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Coupon Management</h2>
            <p className="text-muted mb-0">Create and manage discount coupons for your courses</p>
          </div>
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i> New Coupon
          </button>
        </div>

        {/* Coupons List */}
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                <h5>No coupons created yet</h5>
                <p className="text-muted">Create your first coupon to offer discounts</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Coupon
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {coupons.map((coupon) => (
                  <div className="col-md-6 col-lg-4" key={coupon.id}>
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Badge bg="success" className="fs-6">
                            {coupon.discount}% OFF
                          </Badge>
                          <span className="text-muted small">
                            {moment(coupon.date).format("MMM D, YYYY")}
                          </span>
                        </div>
                        <h4 className="mb-3">
                          <code className="fs-3">{coupon.code}</code>
                        </h4>
                        <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-users me-2 text-muted"></i>
                          <span className="small">Used by {coupon.used_by} students</span>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent border-top-0 d-flex justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(coupon)}
                        >
                          <i className="fas fa-edit me-1"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                        >
                          <i className="fas fa-trash-alt me-1"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-ticket-alt me-2 text-primary"></i>
            Create New Coupon
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCouponSubmit}>
            <div className="mb-3">
              <label className="form-label">Coupon Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SUMMER20"
                name="code"
                value={createCoupon.code}
                onChange={handleCreateCouponChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Discount Percentage</label>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  placeholder="10"
                  name="discount"
                  value={createCoupon.discount}
                  onChange={handleCreateCouponChange}
                  required
                />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="outline-secondary" className="me-2" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <i className="fas fa-save me-1"></i> Create Coupon
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Coupon Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2 text-primary"></i>
            Edit Coupon
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleCouponUpdateSubmit}>
            <div className="mb-3">
              <label className="form-label">Coupon Code</label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={createCoupon.code}
                onChange={handleCreateCouponChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Discount Percentage</label>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  name="discount"
                  value={createCoupon.discount}
                  onChange={handleCreateCouponChange}
                  required
                />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <Button variant="outline-secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <i className="fas fa-save me-1"></i> Save Changes
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Coupon;