import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";
import BaseSidebar from '../partials/BaseSidebar';
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import useAxios from "../../utils/useAxios";
import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";
import ReactPaginate from "react-paginate";

function Wishlist() {
    const [activeTab, setActiveTab] = useState('all');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartCount, setCartCount] = useContext(CartContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        level: "",
        language: "",
        minRating: 0,
        maxPrice: "",
    });
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 8; // 4 cards per row × 2 rows = 8 items per page

    const axiosInstance = useAxios();
    const userData = UserData();
    const country = GetCurrentAddress()?.country || "Unknown";

    const fetchWishlist = async () => {
        if (!userData?.user_id) return;

        try {
            setLoading(true);
            const res = await axiosInstance.get(`student/wishlist/${userData.user_id}/`);
            setWishlist(res.data || []);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError("Failed to fetch wishlist");
            setWishlist([]);
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

            const res = await axiosInstance.get(`course/cart-list/${CartId()}/`);
            setCartCount(res.data?.length || 0);
        } catch (error) {
            console.error("Error adding to cart:", error);
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
            console.error("Error updating wishlist:", error);
            Toast().fire({
                icon: "error",
                title: "Failed to update wishlist",
            });
        }
    };

    // Extract unique filter options from wishlist
    const filterOptions = useMemo(() => {
        const levels = new Set();
        const languages = new Set();
        let maxPrice = 0;

        if (wishlist && wishlist.length > 0) {
            wishlist.forEach(item => {
                if (item && item.course) {
                    if (item.course.level) levels.add(item.course.level);
                    if (item.course.language) languages.add(item.course.language);
                    if (item.course.price && item.course.price > maxPrice) {
                        maxPrice = item.course.price;
                    }
                }
            });
        }

        return {
            levels: Array.from(levels),
            languages: Array.from(languages),
            maxPrice,
        };
    }, [wishlist]);

    // Filter wishlist based on search and filters
    const filteredWishlist = useMemo(() => {
        if (!wishlist || wishlist.length === 0) return [];

        return wishlist.filter(item => {
            if (!item || !item.course) return false;

            const matchesSearch = !searchQuery.trim() ||
                (item.course.title && item.course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.course.teacher?.full_name && item.course.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesLevel = !filters.level || item.course.level === filters.level;
            const matchesLanguage = !filters.language || item.course.language === filters.language;
            const matchesRating = filters.minRating === 0 || (item.course.average_rating && item.course.average_rating >= filters.minRating);
            const matchesPrice = !filters.maxPrice || (item.course.price !== undefined && item.course.price <= parseFloat(filters.maxPrice));

            return matchesSearch && matchesLevel && matchesLanguage && matchesRating && matchesPrice;
        });
    }, [wishlist, searchQuery, filters]);

    // Pagination logic
    const pageCount = Math.ceil(filteredWishlist.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = filteredWishlist.slice(offset, offset + itemsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setFilters({
            level: "",
            language: "",
            minRating: 0,
            maxPrice: "",
        });
        setCurrentPage(0);
    };

    if (error) return <div className="text-center py-5 text-danger">{error}</div>;

    return (
        <div className="d-flex">
            <BaseSidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                user={userData}
            />

            <div className="main-content flex-grow-1 p-4">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">
                            <i className="fas fa-heart text-danger me-2"></i> My Wishlist
                        </h4>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">
                                {filteredWishlist.length} {filteredWishlist.length === 1 ? 'Item' : 'Items'}
                            </span>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={resetFilters}
                                disabled={!searchQuery && !filters.level && !filters.language && filters.minRating === 0 && !filters.maxPrice}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            <i className="fas fa-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search courses or instructors..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="row g-2">
                                        <div className="col-sm-3">
                                            <select
                                                className="form-select"
                                                value={filters.level}
                                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                            >
                                                <option value="">All Levels</option>
                                                {filterOptions.levels.map(level => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-sm-3">
                                            <select
                                                className="form-select"
                                                value={filters.language}
                                                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                                            >
                                                <option value="">All Languages</option>
                                                {filterOptions.languages.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-sm-3">
                                            <select
                                                className="form-select"
                                                value={filters.minRating}
                                                onChange={(e) => setFilters({ ...filters, minRating: parseInt(e.target.value) })}
                                            >
                                                <option value="0">Any Rating</option>
                                                <option value="3">3+ Stars</option>
                                                <option value="4">4+ Stars</option>
                                                <option value="5">5 Stars</option>
                                            </select>
                                        </div>
                                        <div className="col-sm-3">
                                            <select
                                                className="form-select"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                            >
                                                <option value="">Any Price</option>
                                                <option value="50">Under $50</option>
                                                <option value="100">Under $100</option>
                                                <option value="200">Under $200</option>
                                                {filterOptions.maxPrice > 200 && (
                                                    <option value={filterOptions.maxPrice}>All Prices</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Skeleton */}
                    {loading && (
                        <div className="row g-4">
                            {[...Array(8)].map((_, index) => (
                                <div className="col-lg-3 col-md-4 col-sm-6" key={index}>
                                    <div className="card h-100">
                                        <div className="placeholder-glow">
                                            <div className="placeholder" style={{ height: "150px" }}></div>
                                        </div>
                                        <div className="card-body">
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-3"></span>
                                                <h5 className="placeholder-glow mt-2">
                                                    <span className="placeholder col-8"></span>
                                                </h5>
                                                <div className="d-flex mt-2">
                                                    <span className="placeholder col-2 me-2"></span>
                                                    <span className="placeholder col-2"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Wishlist Items */}
                    {!loading && (
                        <>
                            <div className="row bg-white rounded shadow-sm">
                                {currentItems.length > 0 ? (
                                    currentItems.map((w) => (
                                        <div className="col-xl-3 col-lg-4 col-md-6" key={w.id}>
                                            <div className="card card-hover h-100 border-0 bg-white shadow-sm">
                                                <Link to={`/course-detail/${w.course.slug}/`} className="position-relative">
                                                    <img
                                                        src={w.course.image}
                                                        alt={w.course.title}
                                                        className="card-img-top"
                                                        style={{
                                                            width: "100%",
                                                            height: "150px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <div className="card-img-overlay d-flex justify-content-end align-items-start p-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addToWishlist(w.course?.id);
                                                            }}
                                                            className="btn btn-icon btn-sm btn-light rounded-circle shadow-sm"
                                                            title="Remove from wishlist"
                                                        >
                                                            <i className="fas fa-heart text-danger" />
                                                        </button>
                                                    </div>
                                                </Link>
                                                <div className="card-body p-3 bg-white rounded-bottom">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="badge bg-info small">{w.course.level}</span>
                                                        <div className="text-muted small">
                                                            <i className="fas fa-users me-1"></i> {w.course.students?.length || 0}
                                                        </div>
                                                    </div>
                                                    <h6 className="mb-2 text-truncate" style={{ maxWidth: "100%" }}>
                                                        <Link
                                                            to={`/course-detail/${w.course.slug}/`}
                                                            className="text-inherit text-decoration-none text-dark"
                                                        >
                                                            {w.course.title}
                                                        </Link>
                                                    </h6>
                                                    <p className="text-muted small mb-2 text-truncate">
                                                        <i className="fas fa-user-tie me-1"></i> {w.course?.teacher?.full_name}
                                                    </p>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="text-warning me-1 small">
                                                            <Rater
                                                                total={5}
                                                                rating={w.course.average_rating || 0}
                                                                interactive={false}
                                                            />
                                                        </div>
                                                        <span className="text-warning fw-bold small me-1">
                                                            {(w.course.average_rating || 0).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            {w.course.price === 0 ? (
                                                                <span className="text-success fw-bold">Free</span>
                                                            ) : (
                                                                <span className="text-dark fw-bold">${w.course.price}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <button
                                                                onClick={() => addToCart(w.course.id, w.course.price)}
                                                                className="btn btn-sm btn-outline-primary me-1"
                                                                title="Add to cart"
                                                            >
                                                                <i className="fas fa-cart-plus"></i>
                                                            </button>
                                                            <Link
                                                                to={`/course-detail/${w.course.slug}/`}
                                                                className="btn btn-sm btn-primary"
                                                            >
                                                                <i className="fas fa-play"></i>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12">
                                        <div className="card border-0 bg-white shadow-sm">
                                            <div className="card-body text-center py-5 bg-white rounded">
                                                <div className="display-4 text-muted mb-4">
                                                    <i className="fas fa-heart-broken"></i>
                                                </div>
                                                <h3 className="mb-3">
                                                    {searchQuery || Object.values(filters).some(f => f !== "" && f !== 0)
                                                        ? "No matching courses found"
                                                        : "Your wishlist is empty"}
                                                </h3>
                                                <p className="text-muted mb-4">
                                                    {searchQuery || Object.values(filters).some(f => f !== "" && f !== 0)
                                                        ? "Try adjusting your search or filter criteria"
                                                        : "Start adding courses you love to see them here"}
                                                </p>
                                                <Link to="/courses" className="btn btn-primary">
                                                    Browse Courses
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Pagination */}
                            {filteredWishlist.length > itemsPerPage && (
                                <div className="d-flex justify-content-center mt-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <ReactPaginate
                                            previousLabel={"← Previous"}
                                            nextLabel={"Next →"}
                                            breakLabel={"..."}
                                            pageCount={pageCount}
                                            marginPagesDisplayed={2}
                                            pageRangeDisplayed={5}
                                            onPageChange={handlePageClick}
                                            containerClassName={"pagination mb-0"}
                                            activeClassName={"active"}
                                            pageClassName={"page-item"}
                                            pageLinkClassName={"page-link"}
                                            previousClassName={"page-item"}
                                            previousLinkClassName={"page-link"}
                                            nextClassName={"page-item"}
                                            nextLinkClassName={"page-link"}
                                            breakClassName={"page-item"}
                                            breakLinkClassName={"page-link"}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Wishlist;