import express from 'express'

export const loginUser = async(req,res)=>{
    res.json(req.body);
}