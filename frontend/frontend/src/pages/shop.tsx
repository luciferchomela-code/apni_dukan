import { useEffect, useState } from "react";
import axios from "axios";
import { shopService } from "../main";
import AddShop from "./AddShop";
import { BiStore, BiPhone, BiMap, BiEdit, BiPackage, BiLogOut } from "react-icons/bi";
import { div } from "framer-motion/client";

interface props{
    restaurant : IShop;
    isSeller:boolean
}

const Shop = () => {
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchMyShop = async () => {
        try {
            const { data } = await axios.get(
                `${shopService}/api/shop/my`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setShop(data.shop || null);
            if (data.token && data.token !== localStorage.getItem("token")) {
                localStorage.setItem("token", data.token);
                window.location.reload();
            }
        } catch (error) {
            console.log("Error fetching shop:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyShop();
    }, []);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
                <p className="text-gray-500 font-medium">Loading your shop...</p>
            </div>
        </div>
    );

    if (!shop) {
        return <AddShop fetchMyShop={fetchMyShop} />;
    }

    return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6"></div>
        
    );
};

export default Shop;