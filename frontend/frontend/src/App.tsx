import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import Shop from "./pages/shop.tsx";
import { useAppData } from "./context/AppContext";
import ShopPage from "./pages/shopPage";

const App = () => {
    const { loading } = useAppData(); // Add a 'loading' state if you have one

    // Prevent flickering: If we are still checking if the user is logged in, show nothing or a spinner
    if (loading) return <div>Loading...</div>;

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:id" element={<ShopPage />} />
                    <Route path="/select-role" element={<SelectRole />} />
                    <Route path="/account" element={<Account />} />
                {/* </Route> */}
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
};

export default App;