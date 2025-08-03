import express from "express";
import { login, signup ,onboard,  logout } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);  
router.post("/onboarding",protectRoute, onboard)

//check is the user logged in or not
router.get("/me",protectRoute,(req,res)=>{
    res.status(200).json({sucess:true,user:req.user});
})

export default router