import React, { useState, useEffect, } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CartContext, ProfileContext } from "./views/plugin/Context";
import MainWrapper from "./layouts/MainWrapper"
import PrivateRoute from "./layouts/PrivateRoute"

import Register from "../src/views/auth/Register"
import Logout from "../src/views/auth/Logout"
import Login from "../src/views/auth/Login"
import ForgotPassword from "../src/views/auth/ForgotPassword"
import CreateNewPassword from "../src/views/auth/CreateNewPassword"

import Index from "./views/base/Index"
import CourseDetail from "./views/base/CourseDetail"
import StudentDashboard from "./views/student/Dashboard"
import StudentCourseDetail from "./views/student/CourseDetail"
import StudentCourses from "./views/student/Courses"
import Wishlist from "./views/student/Wishlist";
import StudentProfile from "./views/student/Profile";
import StudentChangePassword from "./views/student/ChangePassword";

import useAxios from '../../frontend/src/utils/useAxios';
import UseData from '../src/views/plugin/UserData';

import CartId from "./views/plugin/CartId";

import Dashboard from "./views/instructor/Dashboard";
import Courses from "./views/instructor/Courses";
import Review from "./views/instructor/Review";
import Students from "./views/instructor/Students";
import Earning from "./views/instructor/Earning";
import Orders from "./views/instructor/Orders";
import Coupons from "./views/instructor/Coupon";
import TeacherNotification from "./views/instructor/TeacherNotification";
import QA from "./views/instructor/QA";
import Profile from "./views/instructor/Profile";
import CourseCreate from "./views/instructor/CourseCreate";
import CourseEdit from "./views/instructor/CourseEdit";
import PaymentSuccess from "./views/base/PaymentSuccess"

import Cart from "./views/base/Cart";
import Checkout from "./views/base/Checkout";
import Success from "./views/base/Success";
import Search from "./views/base/Search";

function App() {

  const axiosInstance = useAxios();
  const userData = UseData();
  const [cartCount, setCartCount] = useState(0);
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    axiosInstance.get(`cart/course-Cart-List/${CartId()}/`).then((res) => {
      setCartCount(res.data?.length);
    });

    axiosInstance
      .get(`user/profile/${userData?.user_id}/`)
      .then((res) => {
        setProfile(res.data);
      });
  }, []);


  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ProfileContext.Provider value={[profile, setProfile]}>
        <BrowserRouter>
          <MainWrapper>
            <Routes>
              <Route>
                <Route path="/register/" element={<Register />} />
                <Route path="/logout/" element={<Logout />} />
                <Route path="/login/" element={<Login />} />
                <Route path="/forgot-password/" element={<ForgotPassword />} />
                <Route path="/Create-New-Password/" element={<CreateNewPassword />} />


                {/* base route */}
                <Route path="/" element={<Index />} />
                <Route path="course-detail/:slug/" element={<CourseDetail />} />
                <Route path="/cart/" element={<Cart />} />
                <Route path="/checkout/:order_oid/" element={<Checkout />} />
                <Route path="/payment-success/:order_oid/" element={<Success />} />
                <Route path="/search/" element={<Search />} />




                {/* Student Routes */}
                <Route path="/student/dashboard/" element={<StudentDashboard />} />
                <Route path="/student/courses/" element={<StudentCourses />} />
                <Route path="/student/course-detail/:user_id/:enrollment_id/" element={<StudentCourseDetail />} />
                <Route path="/student/wishlist/" element={<Wishlist />} />
                <Route path="/student/profile/" element={<StudentProfile />} />
                <Route path="/student/change-password/" element={<StudentChangePassword />} />

                {/* Teacher Routes */}

                <Route path="/instructor/dashboard/" element={<Dashboard />} />
                <Route path="/instructor/courses/" element={<Courses />} />
                <Route path="/instructor/reviews/" element={<Review />} />
                <Route path="/instructor/students/" element={<Students />} />
                <Route path="/instructor/earning/" element={<Earning />} />
                <Route path="/instructor/orders/" element={<Orders />} />
                <Route path="/instructor/coupons/" element={<Coupons />} />
                <Route path="/instructor/teacherNotifications/" element={<TeacherNotification />} />
                <Route path="/instructor/questions-answers/" element={<QA />} />
                <Route path="/instructor/profile/" element={<Profile />} />
                <Route path="/instructor/create-course/" element={<CourseCreate />} />
                <Route path="/instructor/edit-course/:course_id/" element={<CourseEdit />} />
                <Route path="/payment-success/:order_oid" element={<PaymentSuccess />} />

              </Route>
            </Routes>
          </MainWrapper>
        </BrowserRouter>
      </ProfileContext.Provider >
    </CartContext.Provider>

  )
}

export default App
