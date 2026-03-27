import { createContext, useState, useEffect, type ReactNode, useContext } from "react"
import axios from "axios"
import { authService } from "../main"
import type { AppContextType, LocationData, User } from "../types"

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

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }
            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUser(data.user)
            setIsAuth(true)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    useEffect(() => {
        if (!navigator.geolocation) {
            alert("Please allow location to continue")
            return
        }

        setLoadingLocation(true)

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords  // fixed: was using () and - instead of {} and .
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await res.json()
                console.log(data) //kyoki jharkhand ek state district ha city nahi
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

    return (
        <AppContext.Provider value={{ user, isAuth, loading, setUser, setIsAuth, setLoading, location, loadingLocation, city }}>
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
/* App Start
      │
      ├──▶ fetchUser()
      │         │
      │         ├── LocalStorage mein token hai?
      │         │         │
      │         │    NO ──▶ loading = false, return
      │         │         │
      │         │    YES ──▶ Backend call /api/auth/me
      │         │                   │
      │         │              Success ──▶ setUser() + setIsAuth(true)
      │         │              Error   ──▶ console.log(error)
      │         │                   │
      │         └──────────── setLoading(false)
      │
      ├──▶ getLocation()
      │         │
      │         ├── Browser geolocation support hai?
      │         │         │
      │         │    NO ──▶ Alert show karo
      │         │         │
      │         │    YES ──▶ GPS se latitude & longitude lo
      │         │                   │
      │         │              Success ──▶ OpenStreetMap API call
      │         │                               │
      │         │                          Success ──▶ setLocation() + setCity()
      │         │                          Error   ──▶ setCity("Failed to load")
      │         │                               │
      │         │              Denied  ──▶ setCity("Location denied")
      │         │                   │
      │         └──────────── setLoadingLocation(false)
      │
      └──▶ Context Provider
                │
                └── Saara data (user, isAuth, city, location...)
                    har component ko available hai via useAppData()
*/