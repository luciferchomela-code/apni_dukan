import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import { Toaster } from "react-hot-toast";
import SelectRole from "./pages/SelectRole.jsx";
import Navbar from "./components/Navbar.jsx";
import Account from "./pages/Account.jsx";
import Shop from "./pages/Shop.jsx";
import ShopPage from "./pages/ShopPages.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { Address } from "./pages/address.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public only routes
                <Route element={<PublicRoute />}> */}
                    <Route path="/login" element={<Login />} />
                {/* </Route> */}

                {/* Protected routes
                <Route element={<ProtectedRoute />}> */}
                    <Route path="/select-role" element={<SelectRole />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success/:paymentId" element={<PaymentSuccess />} />
                {/* </Route> */}

                {/* Public routes */}
                {/* <Route element={<PublicRoute />}> */}
                    <Route path="/" element={<Home />} />
                    <Route path="/address" element={<Address />} />
                {/* </Route> */}
                <Route path="/shop/:id" element={<ShopPage />} />
            </Routes> 
            <Toaster />
        </BrowserRouter>
    );
};

export default App;