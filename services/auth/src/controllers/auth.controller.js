import express from "express"
import User from "../models/User.model.js"
import jwt from "jsonwebtoken"
import asyncHandler from "../middlewares/trycatch.js"

export const loginUser = asyncHandler(async(req,res)=>{
    const {email,name,picture}=req.body

    let user=await User.findOne({email})

    if(!user){
        user=await User.create({
            name,
            email,
            image:picture
        })
    }

    const token=jwt.sign({user},process.env.JWT_SEC,{
        expiresIn:"15d"
    })

    console.log("creating user")
    console.log(user)

    res.status(200).json({
        message:"logged in successfully",
        token,
        user
    })
})

const allowedRoles=["customer","rider","seller"]

export const addUserRole=asyncHandler(async(req,res)=>{
    // if(!req.user?._id){
    //     return res.status(401).json({
    //         message:"unauthorized"
    //     })
    // }

    const {role}=req.body

    if(!allowedRoles.includes(role)){
        return res.status(400).json({
            message:"invalid role"
        })
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {role},
        {new:true}
    )

    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    const token=jwt.sign({user},process.env.JWT_SEC,{
        expiresIn:"15d"
    })

    res.json({user,token})
})
export const myProfile = asyncHandler(async(req,res)=>{
    const user = req.user;
    res.json(user);
})