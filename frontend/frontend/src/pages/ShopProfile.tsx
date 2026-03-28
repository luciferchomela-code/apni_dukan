import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { shopService } from '../main';
import { BiEdit, BiMapPin, BiCamera, BiCrown } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

interface IShop {
    name: string;
    description: string;
    isOpen: boolean;
    image?: string;
    autoLocation: { formattedAddress?: string };
    createdAt: string;
}

interface Props {
    shop: IShop;
    isSeller: boolean;
    onUpdate: () => void;
}

const ShopProfile = ({ shop, isSeller, onUpdate }: Props) => {
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(shop.name);
    const [description, setDescription] = useState(shop.description);
    const [isOpen, setIsOpen] = useState(shop.isOpen);
    const [loading, setLoading] = useState(false);
    
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                return toast.error("Unsupported Media Format");
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const toggleOpenStatus = async () => {
        setLoading(true);
        try {
            await axios.put(`${shopService}/api/shop/status`, {
                status: !isOpen
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setIsOpen(!isOpen);
            toast.success("Status updated");
            onUpdate();
        } catch (error: any) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const cancelEdits = () => {
        setEditMode(false);
        setName(shop.name);
        setDescription(shop.description);
        setSelectedImage(null);
        setPreviewUrl(null);
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            
            if (selectedImage) {
                formData.append('file', selectedImage);
            }

            await axios.put(`${shopService}/api/shop/edit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            toast.success("Updated successfully");
            setEditMode(false);
            onUpdate();
        } catch (error: any) {
            toast.error("Failed to commit changes");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='mx-auto max-w-lg rounded-[0.5rem] bg-[#121212] border border-[#1F1F1F] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] mb-20 relative'
        >
            {/* Luxe Detail: Signature Gold Ribbon */}
            <div className='absolute top-0 right-10 w-8 h-20 bg-gradient-to-b from-[#D4AF37] to-transparent opacity-40 z-30'></div>

            {/* Profile Gallery Header */}
            <div className="relative h-80 w-full bg-[#0A0A0A] group overflow-hidden border-b border-[#1F1F1F]">
                <img 
                    src={previewUrl || shop.image || 'https://via.placeholder.com/800x400?text=Curated+Exhibit'} 
                    alt={shop.name} 
                    className="h-full w-full object-contain mix-blend-lighten transition-all duration-1000 group-hover:scale-105" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent"></div>
                
                <AnimatePresence>
                    {editMode && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-[#0A0A0A]/80 flex flex-col items-center justify-center cursor-pointer z-40 backdrop-blur-sm"
                        >
                            <div className="bg-[#121212] p-5 rounded-full border border-[#D4AF37]/20 mb-4 hover:border-[#D4AF37] transition-all">
                                <BiCamera className="text-[#D4AF37] h-8 w-8" />
                            </div>
                            <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.4em] uppercase">Update Cover Photo</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

                <div className="absolute bottom-10 left-10 right-10 z-30 space-y-4">
                    <div className='flex items-center gap-3'>
                        <BiCrown className='h-4 w-4 text-[#D4AF37]' />
                        <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] pt-0.5">Shop Identity</span>
                    </div>
                    <h1 className='text-4xl font-serif text-[#F8F8F8] italic tracking-[0.2em] uppercase'>{shop.name}</h1>
                </div>
            </div>

            <div className='p-12 space-y-12'>
                <div className='flex items-start justify-between'>
                    <div className="flex-1 space-y-6">
                        {editMode ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] ml-2">Shop Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='w-full border-b border-[#1F1F1F] bg-transparent pb-3 text-xl font-serif text-[#F8F8F8] outline-none focus:border-[#D4AF37]/40 transition-all uppercase tracking-widest'
                                />
                            </div>
                        ) : (
                            <div className='flex items-center gap-4 text-[#A0A0A0] bg-[#1A1A1A] w-fit px-6 py-3 rounded-full border border-[#1F1F1F] shadow-xl'>
                                <BiMapPin className='h-3 w-3 text-[#D4AF37]' />
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase leading-none mt-0.5">{shop.autoLocation?.formattedAddress || "Location Details Hidden"}</span>
                            </div>
                        )}
                    </div>

                    {isSeller && !editMode && (
                        <button 
                            onClick={() => setEditMode(true)} 
                            className='p-4 text-[#A0A0A0] hover:text-[#D4AF37] transition-all border border-[#1F1F1F] rounded-full hover:bg-[#1A1A1A]'
                        >
                            <BiEdit className='h-5 w-5' />
                        </button>
                    )}
                </div>

                <div className="relative">
                    {editMode ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] ml-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className='w-full rounded-[0.25rem] border border-[#1F1F1F] bg-[#0A0A0A] px-6 py-5 text-sm font-medium text-[#A0A0A0] outline-none focus:border-[#D4AF37]/20 transition-all resize-none shadow-inner'
                                rows={4}
                            />
                        </div>
                    ) : (
                        <div className='border-l border-[#D4AF37]/30 pl-8 py-2'>
                           <p className='text-[#A0A0A0] text-[13px] font-medium leading-[2] tracking-wider italic'>
                                "{shop.description || "The craft of excellence is a journey of precision and a legacy of quality. This proprietor is currently redefining the standard."}"
                           </p>
                        </div>
                    )}
                </div>

                <div className='flex gap-10 pt-4'>
                    {editMode ? (
                        <div className='flex gap-4 w-full'>
                            <button 
                                onClick={cancelEdits}
                                className='flex-1 text-[10px] font-black text-[#666] py-5 rounded-[0.25rem] border border-[#1F1F1F] hover:bg-[#0A0A0A] transition-all uppercase tracking-[0.3em]'
                            >
                                Discard
                            </button>
                            <button 
                                onClick={saveChanges} 
                                disabled={loading}
                                className='flex-[2] bg-transparent border border-[#D4AF37]/20 text-[#D4AF37] py-5 rounded-[0.25rem] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all text-[10px] font-black uppercase tracking-[0.3em]'
                            >
                                Save Profile
                            </button>
                        </div>
                    ) : (
                        isSeller && (
                            <button 
                                onClick={toggleOpenStatus} 
                                disabled={loading}
                                className={`w-full h-20 text-[10px] font-black py-4 rounded-[0.25rem] transition-all flex items-center justify-center gap-6 border ${
                                    isOpen 
                                    ? 'bg-transparent text-[#666] border-[#1F1F1F] hover:text-[#A0A0A0]' 
                                    : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/20 hover:border-[#D4AF37]'
                                } uppercase tracking-[0.5em]`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-red-900' : 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]'} transition-all`}></span>
                                {loading ? 'WAITING...' : (isOpen ? 'CLOSE SHOP TEMPORARILY' : 'OPEN SHOP FOR BUSINESS')}
                            </button>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ShopProfile;