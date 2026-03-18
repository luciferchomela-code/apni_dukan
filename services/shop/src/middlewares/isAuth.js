import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

export const isAuth = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please login"
            })
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                message: "Please login"
            })
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SEC as string) as any

        if (!decodedValue || !decodedValue.user) {
            return res.status(401).json({
                message: "Invalid token"
            })
        }

        req.user = decodedValue.user
        next()

    } catch (error) {
        return res.status(500).json({
            message: "Please login - JWT error"
        })
    }
}