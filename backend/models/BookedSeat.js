import mongoose from "mongoose";

const bookedSeatSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  travelDate: { type: Date, required: true },
  bookedSeats: [{ type: String, required: true }],
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create a compound index for efficient queries
bookedSeatSchema.index({ busNumber: 1, travelDate: 1 }, { unique: true });

const BookedSeat = mongoose.model("BookedSeat", bookedSeatSchema);
export default BookedSeat;
