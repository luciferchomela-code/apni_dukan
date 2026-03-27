import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import Shop from "./pages/shop.tsx";
import { useAppData } from "./context/AppContext";

const App = () => {
    const { user, loading } = useAppData(); // Add a 'loading' state if you have one

    // Prevent flickering: If we are still checking if the user is logged in, show nothing or a spinner
    if (loading) return <div>Loading...</div>;

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* <Route element={<PublicRoute />}> */}
                    <Route path="/login" element={<Login />} />
                {/* </Route> */}
                {/* <Route element={<ProtectedRoute />}> */}
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/select-role" element={<SelectRole />} />
                    <Route path="/account" element={<Account />} />
                {/* </Route> */}
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
};

export default App;