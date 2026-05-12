import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet"

import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { shopService } from "../main"
import L from "leaflet"
import { motion, AnimatePresence } from "framer-motion"

import { LuLocateFixed } from "react-icons/lu"
import { BiLoader, BiPlus, BiTrash, BiMapPin, BiPhone, BiCrosshair } from "react-icons/bi"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const LocationPicker = ({ setLocation }) => {
    useMapEvents({
        click(e) {
            setLocation(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

const LocateMeButton = ({ onLocate }) => {
    const map = useMap()

    const locateUser = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                map.flyTo([latitude, longitude], 16, { animate: true })
                onLocate(latitude, longitude)
            },
            () => toast.error("Location permission denied")
        )
    }

    return (
        <button
            onClick={locateUser}
            className="absolute right-3 top-3 z-[1000] flex items-center gap-2 bg-[#121212] border border-[#D4AF37]/20 text-[#D4AF37] px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all shadow-2xl"
        >
            <BiCrosshair size={14} />
            Current Location
        </button>
    )
}

const AddAddressPage = () => {
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [mobile, setMobile] = useState("")
    const [formattedAddress, setFormattedAddress] = useState("")
    const [latitude, setLatitude] = useState(null)
    const [longitude, setLongitude] = useState(null)

    const fetchFormattedAddress = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
            const data = await res.json()
            setFormattedAddress(data.display_name || "")
        } catch {
            toast.error("Failed to fetch address")
        }
    }

    const setLocation = (lat, lng) => {
        setLatitude(lat)
        setLongitude(lng)
        fetchFormattedAddress(lat, lng)
    }

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get(
                `${shopService}/api/address/all`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            setAddresses(data.addresses || [])
        } catch {
            toast.error("Failed to load addresses")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const addAddress = async () => {
        if (!mobile || !formattedAddress || latitude === null || longitude === null) {
            toast.error("Please fill all fields and select location on map")
            return
        }

        try {
            setAdding(true)
            await axios.post(
                `${shopService}/api/address/new`,
                { formattedAddress, mobile, latitude, longitude },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            toast.success("Address saved")
            setMobile("")
            setFormattedAddress("")
            setLatitude(null)
            setLongitude(null)
            fetchAddresses()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save address")
        } finally {
            setAdding(false)
        }
    }

    const deleteAddress = async (id) => {
        if (!window.confirm("Remove this address?")) return

        try {
            setDeletingId(id)
            await axios.delete(
                `${shopService}/api/address/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            toast.success("Address removed")
            fetchAddresses()
        } catch {
            toast.error("Failed to delete address")
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#A0A0A0] pb-32">

            {/* Header */}
            <div className="h-[25vh] flex flex-col items-center justify-center border-b border-[#1F1F1F] bg-[#0A0A0A] px-6 text-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                    <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">
                        Delivery
                    </span>
                    <div className="h-[1px] w-8 bg-[#D4AF37]/30"></div>
                </div>
                <h1 className="text-4xl font-serif italic text-[#F8F8F8] tracking-[0.2em] uppercase">
                    Your Addresses
                </h1>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121212] border border-[#1F1F1F] rounded-[0.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                >
                    <div className="px-8 py-6 border-b border-[#1F1F1F] flex items-center gap-3">
                        <BiMapPin className="h-4 w-4 text-[#D4AF37]" />
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">
                            Pin Your Location
                        </span>
                    </div>

                    <div className="relative h-[400px] w-full">
                        <MapContainer
                            center={[latitude || 28.6139, longitude || 77.209]}
                            zoom={13}
                            className="h-full w-full"
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <LocationPicker setLocation={setLocation} />
                            <LocateMeButton onLocate={setLocation} />
                            {latitude && longitude && (
                                <Marker position={[latitude, longitude]} />
                            )}
                        </MapContainer>
                    </div>

                    {/* Address & Mobile Inputs */}
                    <div className="p-8 space-y-6 border-t border-[#1F1F1F]">

                        {formattedAddress && (
                            <div className="flex items-start gap-4 bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-[0.25rem] p-5">
                                <BiMapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                <p className="text-[12px] text-[#A0A0A0] leading-relaxed tracking-wider">
                                    {formattedAddress}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.3em] ml-1">
                                Mobile Number
                            </label>
                            <div className="flex items-center gap-3 border-b border-[#1F1F1F] focus-within:border-[#D4AF37]/40 transition-all">
                                <BiPhone className="h-4 w-4 text-[#D4AF37]/40" />
                                <input
                                    type="number"
                                    placeholder="Enter mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full bg-transparent py-4 text-sm font-medium text-[#F8F8F8] outline-none placeholder:text-[#A0A0A0]/20 tracking-wider"
                                />
                            </div>
                        </div>

                        <button
                            disabled={adding}
                            onClick={addAddress}
                            className="w-full group relative h-16 bg-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all active:scale-[0.99] disabled:opacity-30 rounded-[0.25rem]"
                        >
                            <div className="absolute inset-0 bg-[#D4AF37] opacity-0 group-hover:opacity-5 transition-opacity rounded-[0.25rem]"></div>
                            <div className="relative h-full flex items-center justify-center gap-4">
                                {adding ? (
                                    <BiLoader className="h-5 w-5 text-[#D4AF37] animate-spin" />
                                ) : (
                                    <>
                                        <BiPlus className="h-4 w-4 text-[#D4AF37]" />
                                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.5em]">
                                            Save Address
                                        </span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Saved Addresses */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">
                            Saved Addresses ({addresses.length})
                        </span>
                        <div className="flex-1 h-[1px] bg-[#1F1F1F]"></div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="h-10 w-10 border border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em]">
                                Loading...
                            </p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 space-y-6 bg-[#121212] border border-[#1F1F1F] rounded-[0.5rem]"
                        >
                            <div className="p-8 rounded-full border border-[#D4AF37]/5 bg-[#0A0A0A]">
                                <BiMapPin className="h-12 w-12 text-[#D4AF37]/10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-serif text-[#F8F8F8] italic tracking-widest uppercase">No Addresses</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                    Pin a location on the map to save your first address
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {addresses.map((addr, index) => (
                                    <motion.div
                                        key={addr._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group flex items-center gap-6 bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem] p-6 hover:border-[#D4AF37]/20 transition-all"
                                    >
                                        <div className="p-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-full flex-shrink-0">
                                            <BiMapPin className="h-5 w-5 text-[#D4AF37]" />
                                        </div>

                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <p className="text-[13px] font-medium text-[#F8F8F8] tracking-wider truncate">
                                                {addr.formattedAddress}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <BiPhone className="h-3 w-3 text-[#D4AF37]/40" />
                                                <span className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.2em]">
                                                    {addr.mobile}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteAddress(addr._id)}
                                            disabled={deletingId === addr._id}
                                            className="p-3 text-[#666] hover:text-red-500 border border-[#1F1F1F] rounded-full hover:border-red-500/20 transition-all disabled:opacity-30 flex-shrink-0"
                                        >
                                            {deletingId === addr._id ? (
                                                <BiLoader size={16} className="animate-spin" />
                                            ) : (
                                                <BiTrash size={16} />
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddAddressPage
export { AddAddressPage as Address }