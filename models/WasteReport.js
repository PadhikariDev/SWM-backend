import mongoose from "mongoose";

const wasteReportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        imageUrl: { type: String, required: true },
        pickupLocation: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        estimatedWeight: { type: String },
        carbonEmission: { type: String },
        status: { type: String, default: "Pending" }, // Pending | Verified | Collected
    },
    { timestamps: true }
);

const WasteReport = mongoose.model("WasteReport", wasteReportSchema);
export default WasteReport;
