import { useEffect, useState } from 'react'
import { useAppData } from '../context/AppContext'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CgShoppingCart } from 'react-icons/cg'
import { BiMapPin, BiSearch } from 'react-icons/bi'

const Navbar = () => {
    const { isAuth ,city} = useAppData()

    const currLocation = useLocation()
    const isHomePage = currLocation.pathname === '/'
    const [searchParams, setSearchParams] = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) {
                setSearchParams({ search });
            } else {
                setSearchParams({});
            }
        }, 400)
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className='w-full bg-[#0A0A0A] border-b border-[#1F1F1F] sticky top-0 z-[100]'>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                <Link
                    to={'/'}
                    className='text-2xl font-serif italic font-black text-[#D4AF37] tracking-[0.2em] uppercase cursor-pointer hover:opacity-80 transition-opacity'>
                    Apni Dukan
                </Link>
                
                <div className='flex items-center gap-8'>
                    <Link to='/cart' className='relative group'>
                        <CgShoppingCart className='h-6 w-6 text-[#A0A0A0] group-hover:text-[#D4AF37] transition-colors' />
                        <span className='absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-black text-[#0A0A0A]'>
                            0
                        </span>
                    </Link>
                    
                    {isAuth ? (
                        <Link to="/account" className='text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity'>
                            Account
                        </Link>
                    ) : (
                        <Link to="/login" className='text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] bg-[#D4AF37]/10 px-6 py-2.5 border border-[#D4AF37]/20 rounded-full hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all'>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {isHomePage && (
                <div className='border-t border-[#1F1F1F] px-6 py-4 bg-[#121212]/50 backdrop-blur-md'>
                    <div className='mx-auto flex max-w-3xl items-center rounded-full border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden focus-within:border-[#D4AF37]/40 transition-all'>
                        <div className='flex items-center gap-3 px-6 border-r border-[#1F1F1F] bg-[#121212] py-3'>
                            <BiMapPin className='h-3.5 w-3.5 text-[#D4AF37]' />
                            <span className='text-[10px] font-black text-[#A0A0A0] uppercase tracking-widest truncate max-w-[100px]'>{city || "Location"}</span>
                        </div>
                        <div className='flex flex-1 items-center gap-3 px-6'>
                            <BiSearch className='h-4 w-4 text-[#A0A0A0]/40' />
                            <input
                                type="text"
                                placeholder='SEARCH FOR SHOPS...'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className='w-full py-3 text-[10px] font-bold tracking-widest outline-none bg-transparent text-[#F8F8F8] placeholder:text-[#A0A0A0]/20 uppercase'
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar