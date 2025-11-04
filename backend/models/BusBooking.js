import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  // Passenger Details
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  
  // Journey Details
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  travelDate: { type: Date, required: true },
  
  // Bus Details
  busName: { type: String, required: true },
  busNumber: { type: String, required: true },
  busType: { type: String, required: true },
  operator: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  
  // Seat Details
  selectedSeats: [{ type: String, required: true }],
  numberOfSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  
  // Bus Features
  amenities: [{ type: String }],
  rating: { type: Number },
  cancellationPolicy: { type: String },
  insurance: { type: String },
  
  // Payment Details
  paymentMethod: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash'],
    default: 'cash'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  transactionId: { type: String },
  paymentDate: { type: Date },
  amountPaid: { type: Number },
  
  // Card Details (for credit/debit cards)
  cardNumber: { type: String },
  cardExpiry: { type: String },
  cardCVV: { type: String },
  
  // UPI Details
  upiId: { type: String },
  
  // Net Banking Details
  bankName: { type: String },
  
  // Booking Metadata
  bookingDate: { type: Date, default: Date.now },
  bookingStatus: { 
    type: String, 
    enum: ['confirmed', 'pending', 'cancelled'], 
    default: 'confirmed' 
  }
}, {
  timestamps: true
});

const BusBooking = mongoose.model("BusBooking", busSchema);
export default BusBooking;
