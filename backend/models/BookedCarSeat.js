import mongoose from "mongoose";

const bookedCarSeatSchema = new mongoose.Schema({
  carNumber: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  bookedSeats: [{ type: String, required: true }],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create a compound index for efficient queries
bookedCarSeatSchema.index({ carNumber: 1, pickupDate: 1 }, { unique: true });

const BookedCarSeat = mongoose.model("BookedCarSeat", bookedCarSeatSchema);
export default BookedCarSeat;
