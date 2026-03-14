import User from "../models/User.model.js"
import jwt from "jsonwebtoken"
import asyncHandler from "../middlewares/trycatch.js"
import axios from "axios"
import { oauth2client } from "../config/googleConfig.js"
export const loginUser = asyncHandler(async (req,res)=>{

  const {code} = req.body

  if(!code){
    return res.status(400).json({
      message:"Authorization code is required"
    })
  }

  const googleRes = await oauth2client.getToken(code)
  const tokens= googleRes.tokens
  oauth2client.setCredentials(tokens)
  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  )

  const {email,name,picture} = userRes.data

  let user = await User.findOne({email})

  if(!user){
    user = await User.create({
      name,
      email,
      image:picture
    })
  }

  const token = jwt.sign({user},process.env.JWT_SEC,{
    expiresIn:"15d"
  })

  res.status(200).json({
    message:"logged in successfully",
    token,
    user
  })

})
export const addUserRole = asyncHandler(async (req,res)=>{
  const allowedRoles = ["customer","rider","seller"]

  const {role} = req.body

  if(!allowedRoles.includes(role)){
    return res.status(400).json({
      message:"invalid role"
    })
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {role},
    {new:true}
  )

  if(!user){
    return res.status(404).json({
      message:"user not found"
    })
  }

  const token = jwt.sign({user},process.env.JWT_SEC,{
    expiresIn:"15d"
  })

  res.json({user,token})
})
export const myProfile = asyncHandler(async (req,res)=>{
  const user = req.user
  res.json(user)
})