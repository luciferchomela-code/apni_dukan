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
import { Address } from "./pages/Address.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import RiderDashboard from "./pages/RiderDashboard.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public-only: logged-in users get redirected to "/" */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                </Route>

                {/* Protected: must be logged in to access */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/select-role" element={<SelectRole />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success/:paymentId" element={<PaymentSuccess />} />
                    <Route path="/address" element={<Address />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/orders/:id" element={<OrdersPage />} />
                    <Route path="/rider-dashboard" element={<RiderDashboard />} />
                </Route>

                {/* Open: accessible to everyone */}
                <Route path="/" element={<Home />} />
                <Route path="/shop/:id" element={<ShopPage />} />
            </Routes> 
            <Toaster />
        </BrowserRouter>
    );
};

export default App;