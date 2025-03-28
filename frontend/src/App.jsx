import { Route, Routes, BrowserRouter } from "react-router-dom"

import MainWrapper from "./layouts/MainWrapper"
import PrivateRoute from "./layouts/PrivateRoute"

import Register from "../src/views/auth/Register"
import Logout from "../src/views/auth/Logout"

function App() {
  return (
    <BrowserRouter>
      <MainWrapper>
        <Routes>
          <Route>
            <Route path="/register/" element={<Register/>}/>
            <Route path="/logout/" element={<Logout/>}/>
          </Route>
        </Routes>
      </MainWrapper>
    </BrowserRouter>

  )

}

export default App
