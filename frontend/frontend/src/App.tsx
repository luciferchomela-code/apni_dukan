import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/login"
import { Toaster } from "react-hot-toast"
import ProtectedRoute from "./components/protectedRoute"
import PublicRoute from "./components/publicRoute"
import SelectRole from "./pages/SelectRole"
import Navbar from "./components/Navbar"
import Account from "./pages/Account"
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>

          {/* <Route element={<PublicRoute/>}> */}
            <Route path="/login" element={<Login/>}/>
          {/* </Route> */}

          {/* <Route element={<ProtectedRoute/>}> */}
            <Route path="/" element={<Home/>}/>
            <Route path="/select-role" element={<SelectRole/>}/>
            <Route path="/account" element={<Account/>}/>
          {/* </Route> */}

        </Routes>

      </BrowserRouter>

      <Toaster/>

    </>
  )
}

export default App