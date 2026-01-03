import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }
        const decorded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decorded) {
            return res.status(401).json({ message: "Unauthorized - Token Invalid" });
        }

        const user = await User.findById(decorded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User is not found" });
        }
        req.user = user

        next()
    } catch (error) {
        console.log("Error in autheticate the user", error.message);
        return res.status(501).json({ message: "Internal Server Error while autheticate the user" });
    }
}
