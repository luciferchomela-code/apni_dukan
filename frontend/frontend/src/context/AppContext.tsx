import { createContext, useState, useEffect, type ReactNode, useContext } from "react"
import axios from "axios"
import { authService, shopService } from "../main"
import type { AppContextType, LocationData, User, ICart } from "../types"

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {

    const [user, setUser] = useState<User | null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true)
    const [location, setLocation] = useState<LocationData | null>(null)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [city, setCity] = useState("Fetching Location...")
    
    // Cart States
    const [cart, setCart] = useState<ICart[]>([])
    const [subTotal, setSubTotal] = useState(0)
    const [quantity, setQuantity] = useState(0)

    async function fetchUser() {
        console.log("Starting Auth Retrieval...")
        try {
            const token = localStorage.getItem("token")
            
            if (!token || token === "undefined" || token === "null") {
                console.log("No valid token found. Disabling global loading.")
                setLoading(false)
                setIsAuth(false)
                return
            }

            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            console.log("User data retrieved:", data.user?.role)
            if (data.user) {
                setUser(data.user)
                setIsAuth(true)
                // If the user is NOT a customer, we can release loading immediately!
                if (data.user.role !== "customer") {
                    console.log("Non-customer identified. Disabling global loading.")
                    setLoading(false)
                }
            } else {
                setLoading(false)
                setIsAuth(false)
            }
        } catch (error) {
            console.error("Auth Retrieval Error:", error)
            setLoading(false)
            setIsAuth(false)
        }
    }

    async function fetchCart() {
        console.log("Starting Cart Syncing...")
        const token = localStorage.getItem("token")
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const { data } = await axios.get(`${shopService}/api/cart/all`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCart(data.cart || [])
            setSubTotal(data.subTotal || 0)
            setQuantity(data.cartLength || 0)
            console.log("Cart Syncing Complete.")
        } catch (error) {
            console.error("Cart Syncing Failed:", error)
        } finally {
            setLoading(false)
        }
    }

    // Effect 1: Core Boot (Fetch User once)
    useEffect(() => {
        fetchUser()
        
        // Failsafe: If anything hangs for more than 5 seconds, release the site anyway
        const timeout = setTimeout(() => {
            setLoading(false)
        }, 5000)
        
        return () => clearTimeout(timeout)
    }, [])

    // Effect 2: User-Dependent Fetching (Cart, etc.)
    useEffect(() => {
        if (user && user.role === "customer") {
            fetchCart()
        }
    }, [user])

    // Effect 3: Location Boot (Non-blocking)
    useEffect(() => {
        if (!navigator.geolocation) {
            return
        }

        setLoadingLocation(true)

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await res.json()
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "Current Location"
                })
                setCity(
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.state_district ||
                    "Your Location"
                )
            } catch (error) {
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: "Current Location"
                })
                setCity("Failed to load")
            } finally {
                setLoadingLocation(false)
            }
        }, () => {
            setCity("Location denied")
            setLoadingLocation(false)
        })
    }, [])

    const contextValue: AppContextType = {
        user,
        isAuth,
        loading,
        setUser,
        setIsAuth,
        setLoading,
        location,
        loadingLocation,
        city,
        cart,
        subTotal,
        quantity,
        setCart,
        setSubTotal,
        setQuantity,
        fetchCart
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }
    return context
}