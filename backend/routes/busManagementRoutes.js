import express from "express";
import Bus from "../models/Bus.js";

const router = express.Router();

// POST: Add a new bus
router.post("/add", async (req, res) => {
  try {
    console.log("=== ADDING NEW BUS ===");
    console.log("Request body:", req.body);
    
    const {
      busName,
      busNumber,
      operator,
      fromLocation,
      toLocation,
      departureTime,
      arrivalTime,
      type,
      totalSeats,
      price,
      rating = 4.0,
      amenities = ['WiFi', 'Charging Point'],
      cancellationPolicy = 'Free cancellation before 24 hours'
    } = req.body;

    // Validate required fields
    if (!busName || !busNumber || !operator || !fromLocation || !toLocation || 
        !departureTime || !arrivalTime || !type || !totalSeats || !price) {
      return res.status(400).json({ 
        error: "All required fields must be provided",
        required: ['busName', 'busNumber', 'operator', 'fromLocation', 'toLocation', 
                  'departureTime', 'arrivalTime', 'type', 'totalSeats', 'price']
      });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(409).json({ 
        error: `Bus with number ${busNumber} already exists` 
      });
    }

    // Create new bus
    const newBus = new Bus({
      busName,
      busNumber,
      operator,
      fromLocation,
      toLocation,
      departureTime,
      arrivalTime,
      type,
      totalSeats: parseInt(totalSeats),
      availableSeats: parseInt(totalSeats),
      price: parseInt(price),
      rating: parseFloat(rating),
      amenities,
      cancellationPolicy
    });

    console.log("New bus object:", newBus);
    await newBus.save();
    console.log("✅ Bus saved successfully with ID:", newBus._id);
    
    res.status(201).json({ 
      message: "Bus added successfully!", 
      bus: newBus
    });
  } catch (error) {
    console.error("Error adding bus:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Get all buses
router.get("/all", async (req, res) => {
  try {
    console.log("=== FETCHING ALL BUSES ===");
    
    const buses = await Bus.find({ isActive: true }).sort({ createdAt: -1 });
    
    console.log(`Found ${buses.length} buses`);
    res.json({
      message: "Buses retrieved successfully",
      totalBuses: buses.length,
      buses: buses
    });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Get single bus by ID
router.get("/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    res.json({
      message: "Bus retrieved successfully",
      bus: bus
    });
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Get bus by bus number
router.get("/number/:busNumber", async (req, res) => {
  try {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    res.json({
      message: "Bus retrieved successfully",
      bus: bus
    });
  } catch (error) {
    console.error("Error fetching bus by number:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT: Update bus details
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating certain fields directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    
    res.json({
      message: "Bus updated successfully",
      bus: bus
    });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Soft delete a bus (mark as inactive)
router.delete("/:id", async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    
    res.json({
      message: "Bus deleted successfully",
      bus: bus
    });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Hard delete a bus (permanent removal)
router.delete("/:id/hard", async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ error: "Bus not found" });
    }
    
    res.json({
      message: "Bus permanently deleted",
      bus: bus
    });
  } catch (error) {
    console.error("Error hard deleting bus:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Search buses by route
router.get("/search/:from/:to", async (req, res) => {
  try {
    const { from, to } = req.params;
    
    const buses = await Bus.find({ 
      fromLocation: { $regex: from, $options: 'i' },
      toLocation: { $regex: to, $options: 'i' },
      isActive: true 
    }).sort({ departureTime: 1 });
    
    res.json({
      message: "Buses found for the route",
      from: from,
      to: to,
      totalBuses: buses.length,
      buses: buses
    });
  } catch (error) {
    console.error("Error searching buses:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
