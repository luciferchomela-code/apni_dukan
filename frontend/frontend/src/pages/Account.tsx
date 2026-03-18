import React from "react"
import { useAppData } from "../context/AppContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { BiPackage, BiLogOut, BiMapPin } from "react-icons/bi"

const Account = () => {

  const { user, setUser, setIsAuth } = useAppData()
  const navigate = useNavigate()

  const firstLetter = user?.name?.charAt(0).toUpperCase() || ""

  const logoutHandler = () => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuth(false)
    toast.success("Logged out successfully")
    navigate("/login")
  }

  return (
    <div className='min-h-screen bg-background px-4 py-6'>

      {/* Profile Card */}
      <div className='mx-auto max-w-md rounded-xl bg-card border border-border p-5 shadow-sm'>
        <div className='flex items-center gap-4'>

          {/* Avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              referrerPolicy="no-referrer"
              className='h-14 w-14 rounded-full object-cover'
            />
          ) : (
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white'>
              {firstLetter}
            </div>
          )}

          {/* Info */}
          <div>
            <h2 className='text-lg font-semibold text-secondary'>
              {user?.name || "—"}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {user?.email || "—"}
            </p>
            {user?.role && (
              <span className='mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary'>
                {user.role}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Menu Card */}
      <div className='mx-auto mt-4 max-w-md divide-y divide-border rounded-xl bg-card border border-border shadow-sm'>

        <div
          onClick={() => navigate("/orders")}
          className='flex cursor-pointer items-center gap-4 p-5 hover:bg-muted transition-colors'
        >
          <BiPackage className='h-5 w-5 text-primary' />
          <span className='font-medium text-secondary'>Your Orders</span>
        </div>
        <div
          onClick={() => navigate("/address")}
          className='flex cursor-pointer items-center gap-4 p-5 hover:bg-muted transition-colors'
        >
          <BiMapPin className='h-5 w-5 text-primary' />
          <span className='font-medium text-secondary'>Addresses</span>
        </div>
        <div
          onClick={logoutHandler}
          className='flex cursor-pointer items-center gap-4 p-5 hover:bg-muted transition-colors'
        >
          <BiLogOut className='h-5 w-5 text-primary' />
          <span className='font-medium text-primary'>Logout</span>
        </div>

      </div>

    </div>
  )
}

export default Account