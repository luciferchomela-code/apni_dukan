import React, { useEffect, useState } from 'react'
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
        <div className='w-full bg-card shadow-sm'>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <Link
                    to={'/'}
                    className='text-2xl font-bold text-primary cursor-pointer'>
                    Apni Dukan
                </Link>
                <div className='flex items-center gap-4'>
                    <Link to='/cart' className='relative'>
                        <CgShoppingCart className='h-6 w-6 text-primary' />
                        <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white'>
                            0
                        </span>
                    </Link>
                    {isAuth ? (
                        <Link to="/account" className='font-medium text-primary'>
                            Account
                        </Link>
                    ) : (
                        <Link to="/login" className='font-medium text-primary'>
                            Login
                        </Link>
                    )}
                </div>
            </div>
            {isHomePage && (
                <div className='border-t border-border px-4 py-3'>
                    <div className='mx-auto flex max-w-7xl items-center rounded-lg border border-border shadow-sm'>
                        <div className='flex items-center gap-2 px-3 border-r border-border text-secondary'>
                            <BiMapPin className='h-4 w-4 text-primary' />
                            <span className='text-sm truncate max-w-[80px]'>{city}</span>
                        </div>
                        <div className='flex flex-1 items-center gap-2 px-3'>
                            <BiSearch className='h-4 w-4 text-muted-foreground' />
                            <input
                                type="text"
                                placeholder='Search for shop'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className='w-full py-2 text-sm outline-none bg-transparent text-secondary placeholder:text-muted-foreground'
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar