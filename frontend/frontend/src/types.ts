import type React from "react"

export interface User {
    _id: string
    name: string
    email: string
    image: string
    role: string | "customer" | "seller" | null
}

export interface LocationData {
    latitude: number
    longitude: number
    formattedAddress: string
}

export interface AppContextType {
    user: User | null
    loading: boolean
    isAuth: boolean
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    location: LocationData | null
    loadingLocation: boolean
    city: string
    cart: ICart[]
    subTotal: number
    quantity: number
    setCart: React.Dispatch<React.SetStateAction<ICart[]>>
    setSubTotal: React.Dispatch<React.SetStateAction<number>>
    setQuantity: React.Dispatch<React.SetStateAction<number>>
    fetchCart: () => Promise<void>
}

export interface ICart {
    _id: string;
    userId: string;
    shopId: IShop;
    itemId: IItem;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface IShop {
    _id: string;
    name: string;
    description: string;
    image: string;
    autoLocation?: {
        type: string;
        coordinates: [number, number];
        formattedAddress: string;
    };
    isOpen?: boolean;
    isVerified?: boolean;
}

export interface IItem {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    shopId: string;
    isAvailable?: boolean;
}