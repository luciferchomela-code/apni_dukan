import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { shopService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";
import axios from "axios";

const SHOP_TYPES = [
    "Clothing & Accessories",
    "Food & Beverages",
    "Electronics",
    "Grocery",
    "Pharmacy",
    "Books & Stationery",
    "Furniture & Home",
    "Beauty & Wellness",
    "Sports & Fitness",
    "Other",
];

interface props{
    fetchMyShop:()=> Promise<void>;
}

const AddShop = ({fetchMyShop}:props) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [shoptype, setShoptype] = useState(""); 
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { loadingLocation, location } = useAppData();

    const handleSubmit = async () => {
        // Precise Validation
        if (!name || !image || !location || !shoptype || shoptype === "") {
            toast.error("All fields are required, including shop type");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("latitude", String(location.latitude));
        formData.append("longitude", String(location.longitude));
        formData.append("formattedAddress", location.formattedAddress);
        formData.append("file", image);
        formData.append("phone", phone);
        formData.append("shoptype", shoptype); 

        try {
            setSubmitting(true);
            await axios.post(
                `${shopService}/api/shop/new`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Shop added successfully");
            fetchMyShop();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 space-y-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-800">Add Your Shop</h1>
                    <p className="text-sm text-gray-400">Fill in the details to list your shop</p>
                </div>

                <input
                    type="text"
                    placeholder="Shop name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 transition"
                />

                <input
                    type="number"
                    placeholder="Contact number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 transition"
                />

                <textarea
                    placeholder="Shop description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 transition resize-none"
                />

                <select
                    value={shoptype}
                    onChange={e => setShoptype(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 transition bg-white"
                >
                    <option value="">Select shop type</option>
                    {SHOP_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-gray-300 px-4 py-3 hover:border-red-400 transition">
                    <BiUpload className="h-5 w-5 text-red-500 shrink-0"/>
                    <span className="text-sm text-gray-500 truncate">
                        {image ? image.name : "Upload your shop image"}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => setImage(e.target.files?.[0] || null)}
                    />
                </label>

                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <BiMapPin className="mt-0.5 h-5 w-5 text-red-500 shrink-0"/>
                    <p className="text-sm text-gray-600">
                        {loadingLocation
                            ? "Fetching your location..."
                            : location?.formattedAddress || "Location not available"}
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition"
                >
                    {submitting ? "Submitting..." : "Add Shop"}
                </button>
            </div>
        </div>
    );
};

export default AddShop;