import express from "express";
import PickupSchedule from "../models/PickupSchedule.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, pickupLocation, collectionCenter, trafficStatus } = req.body;

    if (!userId || !pickupLocation?.lat || !pickupLocation?.lng || !collectionCenter) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newPickup = new PickupSchedule({
      userId,
      pickupLocation,
      collectionCenter,
      trafficStatus,
    });

    await newPickup.save();
    res.status(201).json({ message: "Pickup scheduled successfully", data: newPickup });
  } catch (error) {
    console.error("Error creating pickup:", error);
    res.status(500).json({ message: "Failed to schedule pickup" });
  }
});

// ✅ Get pickups by user
router.get("/:userId", async (req, res) => {
  try {
    const pickups = await PickupSchedule.find({ userId: req.params.userId });
    res.json(pickups);
  } catch (error) {
    console.error("Error fetching pickups:", error);
    res.status(500).json({ message: "Failed to fetch pickups" });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const pickup = await PickupSchedule.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    pickup.status = status;
    await pickup.save();

    // If changed to "Inbound to Collect", schedule auto update to "Collected"
    if (status === "Inbound to Collect") {
      setTimeout(async () => {
        pickup.status = "Collected";
        await pickup.save();
      }, 60000); // 1 minute later
    }

    res.status(200).json({ message: "Pickup status updated successfully", pickup });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
