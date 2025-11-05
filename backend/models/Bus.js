import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
  // Basic Bus Information
  busName: { type: String, required: true },
  busNumber: { type: String, required: true, unique: true },
  operator: { type: String, required: true },
  
  // Route Information
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  
  // Schedule Information
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  
  // Bus Details
  type: { 
    type: String, 
    required: true,
    enum: ['AC Sleeper', 'AC Seater', 'Non-AC Seater', 'Volvo AC', 'AC Semi-Sleeper']
  },
  totalSeats: { type: Number, required: true, min: 1, max: 50 },
  availableSeats: { type: Number, required: true, min: 0 },
  
  // Pricing
  price: { type: Number, required: true, min: 0 },
  
  // Features
  rating: { type: Number, min: 0, max: 5, default: 4.0 },
  amenities: [{ type: String }],
  cancellationPolicy: { type: String, default: 'Free cancellation before 24 hours' },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create index for busNumber for faster queries
busSchema.index({ busNumber: 1 });

// Pre-save middleware to ensure availableSeats doesn't exceed totalSeats
busSchema.pre('save', function(next) {
  if (this.availableSeats > this.totalSeats) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

const Bus = mongoose.model("Bus", busSchema);
export default Bus;
