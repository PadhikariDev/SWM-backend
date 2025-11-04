import mongoose from "mongoose";

const pickupScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickupLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    collectionCenter: { type: String, required: true },
    trafficStatus: { type: String, default: "Normal" }, // High | Medium | Low
    scheduledTime: { type: Date },
    status: { type: String, default: "Requested" }, // Requested | Scheduled | Completed
}, { timestamps: true });

const PickupSchedule = mongoose.model("PickupSchedule", pickupScheduleSchema);
export default PickupSchedule;
