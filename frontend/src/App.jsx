import { Route, Routes, BrowserRouter } from "react-router-dom"

import MainWrapper from "./layouts/MainWrapper"
import PrivateRoute from "./layouts/PrivateRoute"

import Register from "../src/views/auth/Register"
import Logout from "../src/views/auth/Logout"
import Login from "../src/views/auth/Login"
import ForgotPassword from "../src/views/auth/ForgotPassword"
import CreateNewPassword from "../src/views/auth/CreateNewPassword"

function App() {
  return (
    <BrowserRouter>
      <MainWrapper>
        <Routes>
          <Route>
            <Route path="/register/" element={<Register/>}/>
            <Route path="/logout/" element={<Logout/>}/>
            <Route path="/login/" element={<Login/>}/>
            <Route path="/forgot-password/" element={<ForgotPassword/>}/>
            <Route path="/Create-New-Password/" element={<CreateNewPassword/>}/>
          </Route>
        </Routes>
      </MainWrapper>
    </BrowserRouter>

  )

}

export default App
