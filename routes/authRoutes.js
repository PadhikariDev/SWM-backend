import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/Users.js"

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";
//Register Routes 
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        //checking if user already exist
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ messasge: "Email has already been registered." });

        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ messasge: "User registered successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ messasge: "server error" });
    }
})

//login Routes
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, email: user.email, fullName: user.fullName },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, fullName: user.fullName, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

//verification

router.get("/me", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decoded.id).select("-password");

        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

router.post("/logout", (req, res) => {
    console.log("Logout route hit");

    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });

    // fail-safe: force cookie to expire
    res.cookie("token", "", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
});




export default router;