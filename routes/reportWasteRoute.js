import express from "express";
import multer from "multer";
import path from "path";
import WasteReport from "../models/WasteReport.js";

const router = express.Router();

// ✅ Setup multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Folder to save uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// ✅ Create new waste report (with image)
router.post("/", upload.single("wasteImage"), async (req, res) => {
    try {
        const { userId, latitude, longitude, estimatedWeight, carbonEmission } =
            req.body;

        // Validate required fields
        if (!userId || !latitude || !longitude) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }

        const newReport = new WasteReport({
            userId,
            pickupLocation: {
                lat: parseFloat(latitude),
                lng: parseFloat(longitude),
            },
            estimatedWeight,
            carbonEmission,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: "Waste reported successfully",
            report: newReport,
        });
    } catch (err) {
        console.error("Error saving waste report:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get reports by user
router.get("/:userId", async (req, res) => {
    try {
        const reports = await WasteReport.find({ userId: req.params.userId });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/all", async (req, res) => {
    try {
        const reports = await WasteReport.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        // Prevent changing after Verified
        const report = await WasteReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        if (report.status === "Verified") {
            return res.status(400).json({ message: "Verified reports cannot be changed" });
        }

        report.status = status;
        await report.save();

        res.status(200).json({ message: "Status updated successfully", report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
