import express from "express";
import CarBooking from "../models/CarBooking.js";
import BookedCarSeat from "../models/BookedCarSeat.js";

const router = express.Router();

// POST: Book a Car with all details
router.post("/book", async (req, res) => {
  try {
    console.log("=== RECEIVED CAR BOOKING REQUEST ===");
    console.log("Request body:", req.body);
    
    const {
      // Customer Details
      name,
      email,
      phone,
      
      // Journey Details
      pickupLocation,
      dropLocation,
      pickupDate,
      pickupTime,
      returnDate,
      
      // Car Details
      carName,
      carNumber,
      carType,
      brand,
      fuelType,
      seats,
      
      // Seat Details
      selectedSeats,
      numberOfSeats,
      
      // Pricing Details
      pricePerDay,
      pricePerKm,
      numberOfDays,
      totalPrice,
      
      // Car Features
      features,
      rating,
      driverRequired,
      driverCharges,
      
      // Additional Information
      additionalInfo,
      
      // Payment Details
      paymentMethod = 'cash',
      cardNumber,
      cardExpiry,
      cardCVV,
      upiId,
      bankName
    } = req.body;

    console.log("=== EXTRACTED CAR BOOKING DATA ===");
    console.log("Pickup Date:", pickupDate);
    console.log("Selected Seats:", selectedSeats);
    console.log("Car Number:", carNumber);
    console.log("Passenger Name:", name);
    console.log("Number of Seats:", numberOfSeats);
    console.log("===================================");

    // Validate required fields
    if (!name || !email || !phone || !pickupLocation || !dropLocation || !pickupDate || 
        !carName || !carNumber || !carType || !brand || !fuelType || !seats ||
        !selectedSeats || !numberOfSeats || !pricePerDay || !pricePerKm || !numberOfDays || !totalPrice) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Check if seats are already booked
    const pickupDateObj = new Date(pickupDate);
    const existingBookedSeats = await BookedCarSeat.findOne({ 
      carNumber, 
      pickupDate: pickupDateObj 
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
    const carBooking = new CarBooking({
      // Customer Details
      name,
      email,
      phone,
      
      // Journey Details
      pickupLocation,
      dropLocation,
      pickupDate: pickupDateObj,
      pickupTime,
      returnDate: new Date(returnDate),
      
      // Car Details
      carName,
      carNumber,
      carType,
      brand,
      fuelType,
      seats,
      
      // Seat Details
      selectedSeats,
      numberOfSeats,
      
      // Pricing Details
      pricePerDay,
      pricePerKm,
      numberOfDays,
      totalPrice,
      
      // Car Features
      features: features || [],
      rating: rating || 0,
      driverRequired: driverRequired || false,
      driverCharges: driverCharges || 0,
      
      // Additional Information
      additionalInfo: additionalInfo || "",
      
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

    console.log("=== SAVING CAR BOOKING TO DATABASE ===");
    console.log("Booking object before save:", carBooking);
    await carBooking.save();
    console.log(" Car booking saved successfully with ID:", carBooking._id);
    
    // Update booked seats
    if (existingBookedSeats) {
      console.log("=== UPDATING EXISTING BOOKED CAR SEATS ===");
      console.log("Existing seats:", existingBookedSeats.bookedSeats);
      console.log("Adding seats:", selectedSeats);
      existingBookedSeats.bookedSeats.push(...selectedSeats);
      existingBookedSeats.lastUpdated = new Date();
      await existingBookedSeats.save();
      console.log(" Updated existing booked car seats:", existingBookedSeats.bookedSeats);
    } else {
      console.log("=== CREATING NEW BOOKED CAR SEATS RECORD ===");
      const newBookedCarSeat = new BookedCarSeat({
        carNumber,
        pickupDate: pickupDateObj,
        bookedSeats: selectedSeats
      });
      console.log("New booked car seat object:", newBookedCarSeat);
      await newBookedCarSeat.save();
      console.log(" Created new booked car seats record with ID:", newBookedCarSeat._id);
    }
    
    res.status(201).json({ 
      message: "Car booking successful!", 
      bookingId: carBooking._id,
      transactionId: carBooking.transactionId,
      bookingDetails: {
        name: carBooking.name,
        carName: carBooking.carName,
        carNumber: carBooking.carNumber,
        pickupLocation: carBooking.pickupLocation,
        dropLocation: carBooking.dropLocation,
        pickupDate: carBooking.pickupDate,
        selectedSeats: carBooking.selectedSeats,
        totalPrice: carBooking.totalPrice
      },
      paymentStatus: carBooking.paymentStatus
    });
  } catch (error) {
    console.error("Car booking error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET: View all car bookings with detailed information
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await CarBooking.find().sort({ createdAt: -1 });
    res.json({
      message: "Car bookings retrieved successfully",
      totalBookings: bookings.length,
      bookings: bookings
    });
  } catch (err) {
    console.error("Error fetching car bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Get single car booking by ID
router.get("/booking/:id", async (req, res) => {
  try {
    const booking = await CarBooking.findById(req.params.id);
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
    const booking = await CarBooking.findByIdAndUpdate(
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

// DELETE: Remove a car booking by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const booking = await CarBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ 
      message: "Car booking deleted successfully!",
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
    const bookings = await CarBooking.find({ email: req.params.email }).sort({ createdAt: -1 });
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

// GET: Get available cars for a specific date range
router.get("/available", async (req, res) => {
  try {
    const { pickupDate, returnDate } = req.query;
    
    // This is a placeholder for car availability logic
    // In a real application, you would check existing bookings to determine availability
    res.json({
      message: "Available cars retrieved successfully",
      availableCars: [] // This would contain actual available cars
    });
  } catch (err) {
    console.error("Error fetching available cars:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Get booked seats for a specific car and date
router.get("/booked-seats/:carNumber/:pickupDate", async (req, res) => {
  try {
    const { carNumber, pickupDate } = req.params;
    console.log("=== BOOKED CAR SEATS REQUEST ===");
    console.log("Car Number:", carNumber);
    console.log("Pickup Date:", pickupDate);
    
    const pickupDateObj = new Date(pickupDate);
    console.log("Parsed Date:", pickupDateObj);
    
    const bookedSeatRecord = await BookedCarSeat.findOne({ 
      carNumber, 
      pickupDate: pickupDateObj 
    });
    
    console.log("Found Booked Car Seat Record:", bookedSeatRecord);
    
    if (bookedSeatRecord) {
      console.log("Returning booked seats:", bookedSeatRecord.bookedSeats);
    } else {
      console.log("No booked seats found for this car/date");
    }
    
    res.json({
      carNumber,
      pickupDate: pickupDateObj,
      bookedSeats: bookedSeatRecord ? bookedSeatRecord.bookedSeats : []
    });
  } catch (err) {
    console.error("Error fetching booked car seats:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
