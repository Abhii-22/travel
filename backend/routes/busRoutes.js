import express from "express";
import BusBooking from "../models/BusBooking.js";
import BookedSeat from "../models/BookedSeat.js";

const router = express.Router();

// POST: Book a Bus with all details
router.post("/book", async (req, res) => {
  try {
    console.log("=== RECEIVED BOOKING REQUEST ===");
    console.log("Request body:", req.body);
    
    const {
      // Passenger Details
      name,
      email,
      phone,
      age,
      gender,
      
      // Journey Details
      fromLocation,
      toLocation,
      travelDate,
      
      // Bus Details
      busName,
      busNumber,
      busType,
      operator,
      departureTime,
      arrivalTime,
      duration,
      
      // Seat Details
      selectedSeats,
      numberOfSeats,
      pricePerSeat,
      totalPrice,
      
      // Bus Features
      amenities,
      rating,
      cancellationPolicy,
      insurance,
      
      // Payment Details
      paymentMethod = 'cash',
      cardNumber,
      cardExpiry,
      cardCVV,
      upiId,
      bankName
    } = req.body;

    console.log("=== EXTRACTED BOOKING DATA ===");
    console.log("Travel Date:", travelDate);
    console.log("Selected Seats:", selectedSeats);
    console.log("Bus Number:", busNumber);
    console.log("Passenger Name:", name);
    console.log("Number of Seats:", numberOfSeats);
    console.log("===============================");

    // Validate required fields
    if (!name || !email || !phone || !age || !gender || !fromLocation || !toLocation || !travelDate || 
        !busName || !busNumber || !busType || !operator || !departureTime || !arrivalTime || !duration ||
        !selectedSeats || !numberOfSeats || !pricePerSeat || !totalPrice) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Check if seats are already booked
    const travelDateObj = new Date(travelDate);
    const existingBookedSeats = await BookedSeat.findOne({ 
      busNumber, 
      travelDate: travelDateObj 
    });
    
    if (existingBookedSeats) {
      const conflictingSeats = selectedSeats.filter(seat => 
        existingBookedSeats.bookedSeats.includes(seat)
      );
      
      if (conflictingSeats.length > 0) {
        return res.status(409).json({ 
          error: `Seats ${conflictingSeats.join(', ')} are already booked` 
        });
      }
    }

    // Create booking
    const busBooking = new BusBooking({
      // Passenger Details
      name,
      email,
      phone,
      age,
      gender,
      
      // Journey Details
      fromLocation,
      toLocation,
      travelDate: travelDateObj,
      
      // Bus Details
      busName,
      busNumber,
      busType,
      operator,
      departureTime,
      arrivalTime,
      duration,
      
      // Seat Details
      selectedSeats,
      numberOfSeats,
      pricePerSeat,
      totalPrice,
      
      // Bus Features
      amenities: amenities || [],
      rating: rating || 0,
      cancellationPolicy: cancellationPolicy || "",
      insurance: insurance || "",
      
      // Payment Details
      paymentMethod,
      paymentStatus: 'paid',
      transactionId: `TXN${Date.now()}`,
      paymentDate: new Date(),
      amountPaid: totalPrice,
      
      // Card Details (for credit/debit cards)
      cardNumber: cardNumber || '',
      cardExpiry: cardExpiry || '',
      cardCVV: cardCVV || '',
      
      // UPI Details
      upiId: upiId || '',
      
      // Net Banking Details
      bankName: bankName || ''
    });

    console.log("=== SAVING BOOKING TO DATABASE ===");
    console.log("Booking object before save:", busBooking);
    await busBooking.save();
    console.log("✅ Booking saved successfully with ID:", busBooking._id);
    
    // Update booked seats
    if (existingBookedSeats) {
      console.log("=== UPDATING EXISTING BOOKED SEATS ===");
      console.log("Existing seats:", existingBookedSeats.bookedSeats);
      console.log("Adding seats:", selectedSeats);
      existingBookedSeats.bookedSeats.push(...selectedSeats);
      existingBookedSeats.lastUpdated = new Date();
      await existingBookedSeats.save();
      console.log("✅ Updated existing booked seats:", existingBookedSeats.bookedSeats);
    } else {
      console.log("=== CREATING NEW BOOKED SEATS RECORD ===");
      const newBookedSeat = new BookedSeat({
        busNumber,
        travelDate: travelDateObj,
        bookedSeats: selectedSeats
      });
      console.log("New booked seat object:", newBookedSeat);
      await newBookedSeat.save();
      console.log("✅ Created new booked seats record with ID:", newBookedSeat._id);
    }
    
    res.status(201).json({ 
      message: "Bus booking successful!", 
      bookingId: busBooking._id,
      transactionId: busBooking.transactionId,
      bookingDetails: {
        name: busBooking.name,
        busName: busBooking.busName,
        busNumber: busBooking.busNumber,
        fromLocation: busBooking.fromLocation,
        toLocation: busBooking.toLocation,
        travelDate: busBooking.travelDate,
        selectedSeats: busBooking.selectedSeats,
        totalPrice: busBooking.totalPrice,
        paymentStatus: busBooking.paymentStatus,
        paymentMethod: busBooking.paymentMethod
      }
    });
  } catch (error) {
    console.error("Bus booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: Get booked seats for a specific bus and date
router.get("/booked-seats/:busNumber/:travelDate", async (req, res) => {
  try {
    const { busNumber, travelDate } = req.params;
    console.log("=== BOOKED SEATS REQUEST ===");
    console.log("Bus Number:", busNumber);
    console.log("Travel Date:", travelDate);
    
    const travelDateObj = new Date(travelDate);
    console.log("Parsed Date:", travelDateObj);
    
    const bookedSeatRecord = await BookedSeat.findOne({ 
      busNumber, 
      travelDate: travelDateObj 
    });
    
    console.log("Found Booked Seat Record:", bookedSeatRecord);
    
    if (bookedSeatRecord) {
      console.log("Returning booked seats:", bookedSeatRecord.bookedSeats);
    } else {
      console.log("No booked seats found for this bus/date");
    }
    
    res.json({
      busNumber,
      travelDate: travelDateObj,
      bookedSeats: bookedSeatRecord ? bookedSeatRecord.bookedSeats : []
    });
  } catch (err) {
    console.error("Error fetching booked seats:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: View all bookings with detailed information
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await BusBooking.find().sort({ createdAt: -1 });
    res.json({
      message: "Bus bookings retrieved successfully",
      totalBookings: bookings.length,
      bookings: bookings
    });
  } catch (err) {
    console.error("Error fetching bus bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Get single booking by ID
router.get("/booking/:id", async (req, res) => {
  try {
    const booking = await BusBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({
      message: "Booking retrieved successfully",
      booking: booking
    });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update booking status
router.put("/booking/:id/status", async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await BusBooking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus, paymentStatus },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json({
      message: "Booking status updated successfully",
      booking: booking
    });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a booking by ID and free up seats
router.delete("/delete/:id", async (req, res) => {
  try {
    const booking = await BusBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Remove seats from booked seats collection
    const bookedSeatRecord = await BookedSeat.findOne({ 
      busNumber: booking.busNumber, 
      travelDate: booking.travelDate 
    });
    
    if (bookedSeatRecord) {
      bookedSeatRecord.bookedSeats = bookedSeatRecord.bookedSeats.filter(
        seat => !booking.selectedSeats.includes(seat)
      );
      await bookedSeatRecord.save();
    }
    
    res.json({ 
      message: "Bus booking deleted successfully!",
      deletedBooking: booking
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Get bookings by email
router.get("/bookings/email/:email", async (req, res) => {
  try {
    const bookings = await BusBooking.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json({
      message: "Bookings retrieved successfully",
      totalBookings: bookings.length,
      bookings: bookings
    });
  } catch (err) {
    console.error("Error fetching bookings by email:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
