import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import BaseSidebar from '../partials/BaseSidebar';
import Sidebar from "./Partials/Sidebar";
import useAxios from '../../utils/useAxios';
import UseData from '../plugin/UserData';
import Toast from "../plugin/Toast";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartCount, setCartCount] = useContext(CartContext);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const axiosInstance = useAxios();
    const userData = UseData();
    const country = GetCurrentAddress()?.country || "Unknown";

    const fetchWishlist = async () => {
        if (!userData?.user_id) return;

        try {
            setLoading(true);
            const res = await axiosInstance.get(`student/wishlist/${userData.user_id}/`);
            setWishlist(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch wishlist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const addToCart = async (courseId, price) => {
        const formdata = new FormData();
        formdata.append("course_id", courseId);
        formdata.append("user_id", userData?.user_id);
        formdata.append("price", price);
        formdata.append("country_name", country);
        formdata.append("cart_id", CartId());

        try {
            await axiosInstance.post(`course/cart/`, formdata);
            Toast().fire({
                title: "Added To Cart",
                icon: "success",
            });

            const res = await axiosInstance.get(`cart/course-Cart-List/${CartId()}/`);
            setCartCount(res.data?.length || 0);
        } catch (error) {
            console.error(error);
            Toast().fire({
                title: "Failed to add to cart",
                icon: "error",
            });
        }
    };

    const addToWishlist = async (courseId) => {
        const formdata = new FormData();
        formdata.append("user_id", userData?.user_id);
        formdata.append("course_id", courseId);

        try {
            const res = await axiosInstance.post(`student/wishlist/${userData?.user_id}/`, formdata);
            fetchWishlist();
            Toast().fire({
                icon: "success",
                title: res.data.message,
            });
        } catch (error) {
            console.error(error);
            Toast().fire({
                icon: "error",
                title: "Failed to update wishlist",
            });
        }
    };

    if (loading) return <div className="text-center py-5">Loading...</div>;
    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <section className="pb-5 bg-light">
            <div className="container">
                <BaseSidebar
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    user={userData}
                />

                <div className="main-content">
                    <div className="col-lg-9 col-md-8 col-12">
                        <h4 className="mb-0 mb-4">
                            <i className="fas fa-heart"></i> Wishlist
                        </h4>

                        <div className="row g-4">
                            {wishlist?.map((w) => (
                                <div className="col-lg-4 col-md-6" key={w.id}>
                                    <div className="card card-hover h-100">
                                        <Link to={`/course-detail/${w.course.slug}/`}>
                                            <img
                                                src={w.course.image}
                                                alt={w.course.title}
                                                className="card-img-top"
                                                style={{
                                                    width: "100%",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Link>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <span className="badge bg-info">{w.course.level}</span>
                                                    <span className="badge bg-success ms-2">{w.course.language}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToWishlist(w.course?.id)}
                                                    className="btn btn-link p-0 fs-5"
                                                >
                                                    <i className="fas fa-heart text-danger" />
                                                </button>
                                            </div>
                                            <h4 className="mb-2 text-truncate-line-2">
                                                <Link
                                                    to={`/course-detail/${w.course.slug}/`}
                                                    className="text-inherit text-decoration-none text-dark fs-5"
                                                >
                                                    {w.course.title}
                                                </Link>
                                            </h4>
                                            <small>By: {w.course?.teacher?.full_name}</small><br />
                                            <small>{w.course.students?.length || 0} Student{w.course.students?.length !== 1 ? 's' : ''}</small>
                                            <div className="lh-1 mt-3 d-flex align-items-center">
                                                <Rater total={5} rating={w.course.average_rating || 0} interactive={false} />
                                                <span className="text-warning ms-1">
                                                    {(w.course.average_rating || 0).toFixed(1)}
                                                </span>
                                                <span className="text-muted ms-2">
                                                    ({w.course.reviews?.length || 0} Reviews)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="row align-items-center g-0">
                                                <div className="col">
                                                    <h5 className="mb-0">${w.course.price}</h5>
                                                </div>
                                                <div className="col-auto">
                                                    <button
                                                        onClick={() => addToCart(w.course.id, w.course.price)}
                                                        className="btn btn-primary me-2"
                                                    >
                                                        <i className="fas fa-shopping-cart text-white" />
                                                    </button>
                                                    <Link
                                                        to={`/course-detail/${w.course.slug}/`}
                                                        className="btn btn-primary"
                                                    >
                                                        Enroll Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {wishlist.length === 0 && (
                                <div className="col-12">
                                    <div className="alert alert-info mt-4">No items in your wishlist</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Wishlist;
