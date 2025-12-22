import express, { Router } from "express"
import { login, logout, signup, updateProfile, checkauth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkauth);

export default router;