import { useState, useEffect } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { shopService } from "../main";
import { BiMapPin, BiUpload, BiX } from "react-icons/bi";
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
    "kitchenwear",
    "Other",
];

interface props {
    fetchMyShop: () => Promise<void>;
}

const AddShop = ({ fetchMyShop }: props) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [shoptype, setShoptype] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { loadingLocation, location } = useAppData();

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
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
                        "Content-Type": "multipart/form-data",
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
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl space-y-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-[#4F46E5] tracking-tight">Launch Your Shop</h1>
                    <p className="text-[#475569] font-medium opacity-80 uppercase tracking-widest text-xs">Empower your business with modern tools</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-12 space-y-8">
                    {/* Premium Image Upload */}
                    <div className="relative group">
                        {previewUrl ? (
                            <div className="relative h-56 w-full rounded-3xl overflow-hidden border-2 border-gray-50 shadow-inner">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button 
                                        onClick={() => { setImage(null); setPreviewUrl(null); }}
                                        className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/40 transition-all border border-white/30"
                                    >
                                        <BiX className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="w-full flex flex-col items-center justify-center h-56 rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50 hover:bg-red-50/30 hover:border-red-200 cursor-pointer transition-all group">
                                <div className="bg-white p-4 rounded-3xl shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
                                    <BiUpload className="h-8 w-8 text-emerald-500" />
                                </div>
                                <span className="mt-4 text-sm font-bold text-gray-400 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">Upload Banner</span>
                                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                            </label>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Shop Information</label>
                            <input
                                type="text"
                                placeholder="What's your shop's name?"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full rounded-2xl bg-gray-50 border-2 border-[#E2E8F0]/50 px-6 py-4 text-sm font-semibold text-[#475569] outline-none focus:bg-white focus:border-[#4F46E5]/30 focus:ring-4 focus:ring-[#4F46E5]/5 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Phone number"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full rounded-2xl bg-gray-50 border-2 border-transparent px-6 py-4 text-sm font-semibold text-gray-800 outline-none focus:bg-white focus:border-amber-500/10 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                            <select
                                value={shoptype}
                                onChange={e => setShoptype(e.target.value)}
                                className="w-full rounded-2xl bg-gray-50 border-2 border-[#E2E8F0]/50 px-6 py-4 text-sm font-semibold text-[#475569] outline-none focus:bg-white focus:border-[#4F46E5]/30 focus:ring-4 focus:ring-[#4F46E5]/5 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Category</option>
                                {SHOP_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <textarea
                            placeholder="Tell us about your shop..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-2xl bg-gray-50 border-2 border-[#E2E8F0]/50 px-6 py-4 text-sm font-semibold text-[#475569] outline-none focus:bg-white focus:border-[#4F46E5]/30 focus:ring-4 focus:ring-[#4F46E5]/5 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                        <div className="bg-white p-2.5 rounded-2xl shadow-sm">
                            <BiMapPin className="h-5 w-5 text-[#4F46E5]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Location</p>
                            <p className="text-xs font-bold text-gray-700 truncate max-w-[250px]">
                                {loadingLocation ? "Detecting location..." : location?.formattedAddress || "Unknown Location"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loadingLocation}
                        className="w-full rounded-[1.5rem] bg-[#4F46E5] py-5 text-sm font-black text-white hover:bg-[#4338CA] disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-xl shadow-[#4F46E5]/10 active:scale-[0.98] uppercase tracking-widest"
                    >
                        {submitting ? "Launching..." : "Register Shop"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddShop;