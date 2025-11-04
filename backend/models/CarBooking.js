import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  // Customer Details
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Journey Details
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  returnDate: { type: Date, required: true },
  
  // Car Details
  carName: { type: String, required: true },
  carNumber: { type: String, required: true },
  carType: { type: String, required: true },
  brand: { type: String, required: true },
  fuelType: { type: String, required: true },
  seats: { type: Number, required: true },
  
  // Pricing Details
  pricePerDay: { type: Number, required: true },
  pricePerKm: { type: Number, required: true },
  numberOfDays: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  
  // Car Features
  features: [{ type: String }],
  rating: { type: Number },
  driverRequired: { type: Boolean, default: false },
  driverCharges: { type: Number, default: 0 },
  
  // Additional Information
  additionalInfo: { type: String },
  
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

const CarBooking = mongoose.model("CarBooking", carSchema);
export default CarBooking;
