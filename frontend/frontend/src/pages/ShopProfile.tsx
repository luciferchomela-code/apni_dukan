import { head } from 'framer-motion/client';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import axios from 'axios';
import { shopService } from '../main';

interface props{
    shop : IShop;
    isSeller:boolean
    onUpdatate:(updatedShop:IShop)=>void
}
const ShopProfile = ({shop,isSeller, onUpdate}:props) => {
    const [editMode,setEditMode] =useState(false)
    const [name,setName]= useState(shop.name)
    const [description,setdescription]= useState(shop.description)
    const [isOpen,setIsOpen] = useState(shop.isOpen)
    const [loading,setLoading] = useState(false)

    const toggleOpenStatus = async()=>{
        try {
            const{data} = await axios.put(`${shopService}/api/shop/status`,
                {staus:!isOpen},{
                    headers:{
                        Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            }
            )
            toast.success(data.message)
            setIsOpen(data.shop.isOpen)
        } catch (error) {
            console.log(error)
            toast.error("Failed to update shop status")
        }
    }
    const saveChanges = async()=>{
        setLoading(true)
        try {
            const {data} = await axios.put(`${shpoService}/api/shop/edit`,{
                name,
                description
            },{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            });
            onUpdatate(data.shop)
            toast.success(data.message)
        } catch (error) {
            console.log(error)
            toast.error("Failed to update shop details")
        } finally {
            setLoading(false)
        }
    }
  return (
    <>
    <div className='mx-auto max-w-l rounded-xl bg-white shadow-sm overflow-hidden'>
      {
        shop.image && (
            <img src={shop.image.url} alt="h-48 w-full object-cover" />
        )
      }
    </div>
    <div className='p-5 space-y-4'>
        {
            isSeller && <div className='flex items-start justify-between'>
                <div>
                    {
                        editMode ? (
                            <input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='w-full rounded border '
                            />
                        ) 
                    }
                </div>
            </div>
        }
    </div>
    </>
  )
}

export default ShopProfile
