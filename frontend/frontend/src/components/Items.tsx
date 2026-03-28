import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { shopService } from '../main'
import toast from 'react-hot-toast'
import { BiTrash, BiPackage, BiCrown, BiShow, BiHide } from 'react-icons/bi'
import { motion, AnimatePresence } from 'framer-motion'
interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

const Items = ({ shopId }: { shopId: string }) => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(`${shopService}/api/item/all/${shopId}`)
      setItems(data.items)
    } catch (error) {
      console.error(error)
      toast.error("Collection Retrieval Failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shopId) fetchItems()
  }, [shopId])

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm(`Are you sure you want to delete this item?`)
    if (!confirm) return

    try {
      const { data } = await axios.delete(`${shopService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      toast.success(data.message || "Item removed")
      setItems(prev => prev.filter(i => i._id !== itemId))
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete item")
    }
  }

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(`${shopService}/api/item/status/${itemId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      toast.success(data.message || "Availability updated")
      setItems(prev => prev.map(item => item._id === itemId ? { ...item, isAvailable: !item.isAvailable } : item))
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status")
    }
  }

  if (loading) return (
    <div className='flex flex-col justify-center items-center py-40 space-y-6'>
      <motion.div 
        animate={{ opacity: [0.1, 0.5, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className='text-[#D4AF37] font-serif uppercase tracking-[0.5em] text-xs px-8 italic border-x border-[#D4AF37]/20 py-4'
      >
        Syncing your creations...
      </motion.div>
    </div>
  )

  if (items.length === 0) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col items-center justify-center py-32 text-center space-y-8 max-w-sm mx-auto'
    >
      <div className='p-12 rounded-full border border-[#D4AF37]/5 bg-[#121212] shadow-2xl relative'>
         <div className='absolute inset-0 bg-[#D4AF37]/5 blur-3xl opacity-50 rounded-full'></div>
         <BiPackage className='h-20 w-20 text-[#D4AF37]/10 relative z-10' />
      </div>
      <div className='space-y-3 relative z-10'>
        <h3 className='text-3xl font-serif text-[#F8F8F8] italic tracking-widest uppercase'>No Items Yet</h3>
        <p className='text-[#A0A0A0] text-xs font-medium leading-relaxed tracking-wider'>Your shop is empty. Start adding items to sell.</p>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      layout
      className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 pb-32'
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div 
            key={item._id} 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, duration: 0.8 }}
            className='group bg-[#121212] border border-[#1F1F1F] rounded-[0.25rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-1000'
          >
            {/* Luxe Vertical Edge Accent */}
            <div className='absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity'></div>

            {/* Luxe Image Container */}
            <div className='relative h-80 w-full bg-[#0A0A0A] p-10 overflow-hidden'>
               <img 
                src={item.image} 
                alt={item.name} 
                className={`h-full w-full object-contain relative z-10 filter transition-all duration-1000 ${item.isAvailable ? 'group-hover:brightness-110' : 'grayscale brightness-50'}`} 
              />
              
              <div className='absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/40 z-20 pointer-events-none'></div>

              <div className='absolute top-6 right-6 z-30 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button 
                  onClick={() => toggleAvailability(item._id)}
                  className='p-3 bg-[#0A0A0A]/80 border border-[#D4AF37]/10 rounded-full text-[#A0A0A0] hover:text-[#D4AF37] transition-all'
                  title={item.isAvailable ? "Hide Item" : "Show Item"}
                >
                  {item.isAvailable ? <BiShow className='h-4 w-4' /> : <BiHide className='h-4 w-4' />}
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className='p-3 bg-[#0A0A0A]/80 border border-[#D4AF37]/10 rounded-full text-[#A0A0A0] hover:text-red-500 hover:border-red-500/40 transition-all'
                  title="Remove Item"
                >
                  <BiTrash className='h-4 w-4' />
                </button>
              </div>

               <div className='absolute bottom-6 left-6 z-30'>
                  <div className='flex items-center gap-2 bg-[#0A0A0A]/60 px-4 py-1.5 rounded-full border border-[#D4AF37]/5 backdrop-blur-sm'>
                     <BiCrown className='h-3 w-3 text-[#D4AF37]' />
                     <span className='text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.3em]'>Signature Edition</span>
                  </div>
               </div>
            </div>

            <div className='p-8 space-y-6'>
              <div className='space-y-1.5'>
                <div className='flex justify-between items-end gap-6'>
                    <h3 className={`text-xl font-serif text-[#F8F8F8] italic tracking-widest truncate flex-1 uppercase ${!item.isAvailable && 'opacity-30'}`}>{item.name}</h3>
                    <p className={`text-xl font-black text-[#D4AF37] tracking-tighter ${!item.isAvailable && 'opacity-30'}`}>₹{item.price}</p>
                </div>
                <div className='h-[1px] w-12 bg-[#D4AF37]/40'></div>
              </div>

              <p className={`text-[11px] text-[#A0A0A0] font-medium leading-relaxed tracking-wider opacity-80 min-h-[3rem] line-clamp-3 ${!item.isAvailable && 'opacity-20'}`}>
                {item.description || "High quality product for your collection."}
              </p>

              <div className='pt-6 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                     <div className={`h-1.5 w-1.5 rounded-full transition-all ${item.isAvailable ? 'bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' : 'bg-red-900 shadow-none'}`}></div>
                     <span className='text-[9px] font-black text-[#F3E5AB] uppercase tracking-[0.4em]'>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                     </span>
                  </div>
                  <button className='text-[10px] font-black text-[#D4AF37] border border-[#D4AF37]/20 px-6 py-3 rounded-full hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all uppercase tracking-[0.2em]'>
                    Buy
                  </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default Items