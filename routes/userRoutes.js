import express from "express";
import User from "../models/Users.js";

const router = express.Router();

// ✅ Get all registered users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password"); // exclude password
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

export default router;
