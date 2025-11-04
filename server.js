import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import authRoutes from "./routes/authRoutes.js"
import reportWasteRoute from "./routes/reportWasteRoute.js";
import userRoutes from "./routes/userRoutes.js";
import pickupRoute from "./routes/pickupRoute.js";
import path from "path"
dotenv.config();
const app = express();

//middlewares
app.use(cookieParser());
app.use(cors({
    origin: "https://swm-frontend-neon.vercel.app",
    credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//routes 
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reportWaste", reportWasteRoute);
app.use("/api/pickup", pickupRoute);

//mongodb connection 
mongoose.connect(process.env.MONGO_URI).then(() => console.log("connection has been set successfully")).catch((err) => console.log("error connecting to the database", err));

//starting server
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`server has been started on port:${PORT}`))
