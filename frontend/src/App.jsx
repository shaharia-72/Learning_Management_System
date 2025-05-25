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
              </Route>
            </Routes>
          </MainWrapper>
        </BrowserRouter>
      </ProfileContext.Provider >
    </CartContext.Provider>

  )
}

export default App
