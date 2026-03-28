import React, { useState, useRef } from 'react'
import axios from 'axios'
import { shopService } from '../main'
import toast from 'react-hot-toast'
import { BiImageAdd, BiTrash, BiLoaderAlt, BiPlus } from 'react-icons/bi'
import { motion, AnimatePresence } from 'framer-motion'

const AddItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setName("")
    setPrice("")
    setDescription("")
    setImage(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !image) {
      return toast.error("Please complete all required fields")
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("price", price)
    formData.append("description", description)
    formData.append("file", image)

    try {
      setLoading(true)
      await axios.post(`${shopService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(`Exclusive item added to gallery`)
      resetForm()
      onItemAdded()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to authenticate item`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className='max-w-2xl mx-auto py-12 px-4 sm:px-0'
    >
      <div className='bg-[#121212] rounded-[1rem] border border-[#1F1F1F] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative'>
        {/* Luxe Detail: Gold Top Edge */}
        <div className='absolute top-0 left-0 w-full h-[1px] bg-[#D4AF37]/50'></div>
        
        <div className='p-10 pb-6 space-y-2'>
           <h2 className='text-3xl font-black text-[#F8F8F8] tracking-tight uppercase'>Add New Item</h2>
           <p className='text-[#A0A0A0] text-[10px] font-bold uppercase tracking-[0.3em]'>Fill in the details to list your item</p>
        </div>

        <form onSubmit={handleSubmit} className='p-10 pt-6 space-y-12'>
          {/* Minimalist Luxe Image Upload */}
          <div className='space-y-4'>
            <label className='text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] ml-1'>Visual Proof</label>
            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='relative h-80 w-full rounded-[0.5rem] overflow-hidden border border-[#D4AF37]/20 bg-[#0A0A0A] group'
                >
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain mix-blend-lighten" />
                  <div className="absolute inset-0 bg-[#0A0A0A]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                    <button 
                      type="button"
                      onClick={() => { setImage(null); setPreviewUrl(null); }}
                      className="bg-[#0A0A0A]/80 p-4 rounded-full text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                    >
                      <BiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className='h-80 border border-[#D4AF37]/10 rounded-[0.5rem] bg-[#0A0A0A] flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/40 transition-all group'
                >
                  <div className='p-6 rounded-full border border-[#D4AF37]/5 group-hover:border-[#D4AF37]/20 transition-all'>
                    <BiImageAdd className='h-10 w-10 text-[#D4AF37]/20 group-hover:text-[#D4AF37]' />
                  </div>
                  <p className='mt-6 text-[10px] font-bold text-[#D4AF37]/30 group-hover:text-[#D4AF37] tracking-[0.5em] uppercase transition-colors'>Upload Image</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className='hidden' accept='image/*' />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>
            <div className='space-y-3'>
              <label className='text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] ml-1'>Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Item Title'
                className='w-full rounded-[0.25rem] border-b border-[#1F1F1F] bg-transparent px-2 py-4 text-sm font-medium text-[#F8F8F8] outline-none focus:border-[#D4AF37]/40 transition-all placeholder:text-[#A0A0A0]/20'
              />
            </div>
            <div className='space-y-3'>
              <label className='text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] ml-1'>Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder='0.00'
                className='w-full rounded-[0.25rem] border-b border-[#1F1F1F] bg-transparent px-2 py-4 text-sm font-black text-[#D4AF37] outline-none focus:border-[#D4AF37]/40 transition-all placeholder:text-[#A0A0A0]/20'
              />
            </div>
          </div>

          <div className='space-y-3'>
            <label className='text-[10px] font-bold text-[#A0A0A0] uppercase tracking-[0.3em] ml-1'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Draft the narrative...'
              rows={4}
              className='w-full rounded-[0.5rem] border border-[#1F1F1F] bg-[#0A0A0A]/50 px-6 py-5 text-sm font-medium text-[#A0A0A0] outline-none focus:border-[#D4AF37]/20 transition-all resize-none shadow-inner'
            />
          </div>

          <div className='pt-8'>
            <button
              type='submit'
              disabled={loading}
              className='w-full group relative h-20 bg-transparent border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all active:scale-[0.99] disabled:opacity-30'
            >
              <div className='absolute inset-0 bg-[#D4AF37] opacity-0 group-hover:opacity-5 transition-opacity'></div>
              <div className='relative h-full flex items-center justify-center gap-4'>
                {loading ? (
                  <BiLoaderAlt className='h-6 w-6 text-[#D4AF37] animate-spin' />
                ) : (
                  <>
                    <span className='text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.5em]'>Confirm & List Item</span>
                    <BiPlus className='h-5 w-5 text-[#D4AF37]' />
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default AddItem