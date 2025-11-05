import React, { useState } from "react";
import "./CarBooking.css";

const CarBooking = () => {
  const [searchData, setSearchData] = useState({
    pickupLocation: "",
    dropLocation: "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    carType: ""
  });
  
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showSeatLayout, setShowSeatLayout] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState({});
  const [bookingData, setBookingData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    driverRequired: false, 
    additionalInfo: "",
    paymentMethod: "cash",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    upiId: "",
    bankName: ""
  });

  // Mock car data
  const mockCars = [
    {
      id: 1,
      carName: "Maruti Swift Dzire",
      carNumber: "DL-01-AB-1234",
      carType: "Sedan",
      brand: "Maruti Suzuki",
      fuelType: "Petrol",
      seats: 4,
      totalSeats: 4,
      pricePerDay: 1500,
      pricePerKm: 8,
      available: true,
      rating: 4.2,
      features: ["AC", "Music System", "GPS", "Airbags"]
    },
    {
      id: 2,
      carName: "Honda City",
      carNumber: "DL-02-CD-5678",
      carType: "Sedan",
      brand: "Honda",
      fuelType: "Diesel",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 2000,
      pricePerKm: 10,
      available: true,
      rating: 4.5,
      features: ["AC", "Leather Seats", "GPS", "Sunroof", "Airbags"]
    },
    {
      id: 3,
      carName: "Toyota Innova",
      carNumber: "DL-03-EF-9012",
      carType: "SUV",
      brand: "Toyota",
      fuelType: "Diesel",
      seats: 7,
      totalSeats: 7,
      pricePerDay: 3000,
      pricePerKm: 12,
      available: true,
      rating: 4.7,
      features: ["AC", "Captain Seats", "GPS", "Airbags", "ABS"]
    },
    {
      id: 4,
      carName: "Mahindra XUV500",
      carNumber: "DL-04-GH-3456",
      carType: "SUV",
      brand: "Mahindra",
      fuelType: "Diesel",
      seats: 7,
      totalSeats: 7,
      pricePerDay: 2800,
      pricePerKm: 11,
      available: true,
      rating: 4.3,
      features: ["AC", "AWD", "GPS", "Airbags", "Touchscreen"]
    },
    {
      id: 5,
      carName: "Tata Nexon",
      carNumber: "DL-05-IJ-7890",
      carType: "Compact SUV",
      brand: "Tata",
      fuelType: "Petrol",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 1800,
      pricePerKm: 9,
      available: true,
      rating: 4.1,
      features: ["AC", "Turbo", "GPS", "Airbags", "Android Auto"]
    },
    {
      id: 6,
      carName: "Hyundai Creta",
      carNumber: "DL-06-KL-2345",
      carType: "Compact SUV",
      brand: "Hyundai",
      fuelType: "Diesel",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 2200,
      pricePerKm: 10,
      available: true,
      rating: 4.4,
      features: ["AC", "Sunroof", "GPS", "Airbags", "Wireless Charging"]
    },
    {
      id: 7,
      carName: "Maruti Alto",
      carNumber: "DL-07-MN-6789",
      carType: "Hatchback",
      brand: "Maruti Suzuki",
      fuelType: "Petrol",
      seats: 4,
      totalSeats: 4,
      pricePerDay: 800,
      pricePerKm: 6,
      available: true,
      rating: 3.8,
      features: ["AC", "Music System", "GPS"]
    },
    {
      id: 8,
      carName: "Hyundai i20",
      carNumber: "DL-08-OP-0123",
      carType: "Hatchback",
      brand: "Hyundai",
      fuelType: "Petrol",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 1200,
      pricePerKm: 7,
      available: true,
      rating: 4.0,
      features: ["AC", "Music System", "GPS", "Airbags", "Android Auto"]
    },
    {
      id: 9,
      carName: "Toyota Fortuner",
      carNumber: "DL-09-QR-4567",
      carType: "Luxury SUV",
      brand: "Toyota",
      fuelType: "Diesel",
      seats: 7,
      totalSeats: 7,
      pricePerDay: 5000,
      pricePerKm: 15,
      available: true,
      rating: 4.8,
      features: ["AC", "4WD", "Leather Seats", "GPS", "Sunroof", "Airbags", "ABS", "Cruise Control"]
    },
    {
      id: 10,
      carName: "Mercedes E-Class",
      carNumber: "DL-10-ST-8901",
      carType: "Luxury Sedan",
      brand: "Mercedes-Benz",
      fuelType: "Diesel",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 8000,
      pricePerKm: 20,
      available: true,
      rating: 4.9,
      features: ["AC", "Leather Seats", "GPS", "Sunroof", "Airbags", "ABS", "Cruise Control", "Premium Audio"]
    },
    {
      id: 11,
      carName: "Honda WR-V",
      carNumber: "DL-11-UV-2345",
      carType: "Compact SUV",
      brand: "Honda",
      fuelType: "Petrol",
      seats: 5,
      totalSeats: 5,
      pricePerDay: 1600,
      pricePerKm: 8,
      available: true,
      rating: 4.0,
      features: ["AC", "GPS", "Airbags", "Touchscreen", "Android Auto"]
    },
    {
      id: 12,
      carName: "Maruti Ertiga",
      carNumber: "DL-12-WX-6789",
      carType: "MUV",
      brand: "Maruti Suzuki",
      fuelType: "Petrol",
      seats: 7,
      totalSeats: 7,
      pricePerDay: 2000,
      pricePerKm: 9,
      available: true,
      rating: 4.2,
      features: ["AC", "Captain Seats", "GPS", "Airbags", "ABS"]
    },
    {
      id: 13,
      carName: "Tata Tiago",
      carNumber: "DL-13-YZ-0123",
      carType: "Hatchback",
      brand: "Tata",
      fuelType: "Petrol",
      seats: 5,
      pricePerDay: 900,
      pricePerKm: 6,
      available: true,
      rating: 3.9,
      features: ["AC", "Music System", "GPS", "Airbags"]
    }
  ];

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter cars based on search criteria
    let filteredCars = mockCars.filter(car => car.available);
    
    if (searchData.carType) {
      filteredCars = filteredCars.filter(car => 
        car.carType.toLowerCase().includes(searchData.carType.toLowerCase())
      );
    }
    
    setCars(filteredCars);
  };

  const handleShowAll = () => {
    setCars(mockCars.filter(car => car.available));
  };

  const handleCarSelect = async (car) => {
    setSelectedCar(car);
    setShowSeatLayout(true);
    setSelectedSeats([]);
    
    // Always fetch booked seats for this car and date from database
    if (searchData.pickupDate) {
      try {
        console.log(`Fetching booked seats for car: ${car.carNumber}, date: ${searchData.pickupDate}`);
        const response = await fetch(`http://localhost:5000/api/car/booked-seats/${car.carNumber}/${searchData.pickupDate}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log("Booked seats endpoint not found (404) - backend may need restart");
            setBookedSeats([]);
            alert("Backend server is running but the booked seats endpoint is not available.\n\nPlease restart the backend server to enable seat locking:\n1. Stop the current backend server (Ctrl+C in terminal)\n2. Run: npm start\n3. Try booking again");
            return;
          } else {
            console.log("Backend not available (HTTP " + response.status + "), using empty booked seats");
            setBookedSeats([]);
            alert("Backend server is not running. Seat bookings will not be saved to database.\n\nPlease start the backend server to enable permanent seat locking.");
            return;
          }
        }
        
        const data = await response.json();
        const bookedSeatsList = data.bookedSeats || [];
        setBookedSeats(bookedSeatsList);
        
        // Update available seats for this car based on actual database data
        const availableCount = car.totalSeats - bookedSeatsList.length;
        setAvailableSeats(prev => ({
          ...prev,
          [car.carNumber]: availableCount
        }));
        
        console.log(`Successfully loaded ${bookedSeatsList.length} booked seats for ${car.carNumber} on ${searchData.pickupDate}`);
        console.log("Booked seats from database:", bookedSeatsList);
        
        // Show user feedback about booked seats
        if (bookedSeatsList.length > 0) {
          console.log(`🔒 Seats ${bookedSeatsList.join(', ')} are already booked for this date`);
        }
        
      } catch (error) {
        console.error("Error fetching booked seats:", error);
        // Set empty booked seats if backend is not available
        setBookedSeats([]);
        alert("Cannot connect to backend server. Seat bookings will not be saved to database.\n\nPlease start the backend server to enable permanent seat locking.");
      }
    } else {
      setBookedSeats([]);
      // Use original available seats if no date selected
      setAvailableSeats(prev => ({
        ...prev,
        [car.carNumber]: car.seats
      }));
    }
  };

  const generateSeats = () => {
    const seats = [];
    const totalSeats = selectedCar ? selectedCar.totalSeats : 4;
    
    // For cars, create a simple seat layout (1 row for small cars, 2 rows for larger cars)
    if (totalSeats <= 5) {
      // Small car: 2 front + 3 back
      for (let seat = 1; seat <= totalSeats; seat++) {
        const seatNumber = `S${seat}`;
        const isBooked = bookedSeats.includes(seatNumber);
        seats.push({ number: seatNumber, isBooked });
      }
    } else {
      // Large car/SUV: 2 front + 3 middle + 2 back (7 seats)
      for (let seat = 1; seat <= totalSeats; seat++) {
        const seatNumber = `S${seat}`;
        const isBooked = bookedSeats.includes(seatNumber);
        seats.push({ number: seatNumber, isBooked });
      }
    }
    return seats;
  };

  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) {
      return 'booked';
    }
    if (selectedSeats.includes(seatNumber)) {
      return 'selected';
    }
    return 'available';
  };

  const handleSeatClick = (seatNumber) => {
    // Check if seat is already booked
    if (bookedSeats.includes(seatNumber)) {
      alert(`Seat ${seatNumber} is already booked for ${searchData.pickupDate}. Please select a different seat.`);
      return;
    }
    
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      if (selectedSeats.length < selectedCar.totalSeats) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        alert(`You can select maximum ${selectedCar.totalSeats} seats`);
      }
    }
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    setShowSeatLayout(false);
    setShowBookingForm(true);
  };

  const handleBookingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData({ 
      ...bookingData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate critical data before sending
    if (!searchData.pickupDate) {
      alert("Please select a pickup date");
      return;
    }
    
    if (!selectedSeats || selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    
    const totalPrice = calculateTotalPrice() + (bookingData.driverRequired ? 500 : 0);
    const paymentMethod = bookingData.paymentMethod || 'cash'; // Default to cash if undefined
    
    // Validate payment method exists
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    
    const bookingInfo = {
      // Customer Details
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      
      // Journey Details
      pickupLocation: searchData.pickupLocation,
      dropLocation: searchData.dropLocation,
      pickupDate: searchData.pickupDate,
      pickupTime: searchData.pickupTime,
      returnDate: searchData.returnDate,
      
      // Car Details
      carName: selectedCar.carName,
      carNumber: selectedCar.carNumber,
      carType: selectedCar.carType,
      brand: selectedCar.brand,
      fuelType: selectedCar.fuelType,
      seats: selectedCar.seats,
      
      // Seat Details
      selectedSeats: selectedSeats,
      numberOfSeats: selectedSeats.length,
      
      // Pricing Details
      pricePerDay: selectedCar.pricePerDay,
      pricePerKm: selectedCar.pricePerKm,
      numberOfDays: Math.ceil((new Date(searchData.returnDate) - new Date(searchData.pickupDate)) / (1000 * 60 * 60 * 24)),
      totalPrice: totalPrice,
      
      // Car Features
      features: selectedCar.features,
      rating: selectedCar.rating,
      driverRequired: bookingData.driverRequired,
      driverCharges: bookingData.driverRequired ? 500 : 0,
      
      // Additional Information
      additionalInfo: bookingData.additionalInfo,
      
      // Payment Details
      paymentMethod: paymentMethod,
      cardNumber: paymentMethod !== 'cash' ? (bookingData.cardNumber || '') : '',
      cardExpiry: paymentMethod !== 'cash' ? (bookingData.cardExpiry || '') : '',
      cardCVV: paymentMethod !== 'cash' ? (bookingData.cardCVV || '') : '',
      upiId: paymentMethod === 'upi' ? (bookingData.upiId || '') : '',
      bankName: paymentMethod === 'net_banking' ? (bookingData.bankName || '') : ''
    };
    
    // Log the data being sent for debugging
    console.log("=== CAR BOOKING DATA BEING SENT TO BACKEND ===");
    console.log("Pickup Date:", bookingInfo.pickupDate);
    console.log("Selected Seats:", bookingInfo.selectedSeats);
    console.log("Car Number:", bookingInfo.carNumber);
    console.log("Passenger Name:", bookingInfo.name);
    console.log("Full Booking Object:", bookingInfo);
    console.log("===============================================");
    
    try {
      console.log("Submitting car booking to backend...");
      console.log("Booking data:", bookingInfo);
      
      const response = await fetch("http://localhost:5000/api/car/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingInfo),
      });
      
      if (!response.ok) {
        console.log("Backend booking failed (HTTP " + response.status + "), showing mock booking");
        const mockBookingId = `MOCK${Date.now()}`;
        const mockTransactionId = `TXN${Date.now()}`;
        
        // Get payment method from booking info to avoid undefined error
        const paymentMethodDisplay = paymentMethod || 'cash';
        
        alert(`Mock Car Booking Confirmed!\n\nBooking ID: ${mockBookingId}\nTransaction ID: ${mockTransactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: PAID\n\nSeats ${selectedSeats.join(', ')} temporarily booked!\n\n⚠️ Backend server not running - seats not permanently stored in database.\nPlease start the backend server to enable permanent seat locking.`);
        
        // Reset form after mock booking
        setSelectedCar(null);
        setShowSeatLayout(false);
        setShowBookingForm(false);
        setSelectedSeats([]);
        setBookingData({ 
          name: "", 
          email: "", 
          phone: "", 
          driverRequired: false, 
          additionalInfo: "",
          paymentMethod: "cash",
          cardNumber: "",
          cardExpiry: "",
          cardCVV: "",
          upiId: "",
          bankName: ""
        });
        return;
      }
      
      const data = await response.json();
      console.log("Backend car booking successful:", data);
      
      // Get payment method from booking info to avoid undefined error
      const paymentMethodDisplay = paymentMethod || 'cash';
      
      alert(`Car booking confirmed!\n\nBooking ID: ${data.bookingId}\nTransaction ID: ${data.transactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: ${data.paymentStatus.toUpperCase()}\n\n✅ Seats ${selectedSeats.join(', ')} are now PERMANENTLY booked in database!`);
      
      // Reset form
      setSelectedCar(null);
      setShowSeatLayout(false);
      setShowBookingForm(false);
      setSelectedSeats([]);
      setBookingData({ 
        name: "", 
        email: "", 
        phone: "", 
        driverRequired: false, 
        additionalInfo: "",
        paymentMethod: "cash",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        upiId: "",
        bankName: ""
      });
    } catch (error) {
      console.error("Car booking error:", error);
      // Show mock confirmation if backend is not available
      const mockBookingId = `MOCK${Date.now()}`;
      const mockTransactionId = `TXN${Date.now()}`;
      
      // Get payment method from booking info to avoid undefined error
      const paymentMethodDisplay = paymentMethod || 'cash';
      
      alert(`Mock Car Booking Confirmed!\n\nBooking ID: ${mockBookingId}\nTransaction ID: ${mockTransactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: PAID\n\nSeats ${selectedSeats.join(', ')} temporarily booked!\n\n⚠️ Backend server not running - seats not permanently stored in database.\nPlease start the backend server to enable permanent seat locking.`);
      
      // Reset form after mock booking
      setSelectedCar(null);
      setShowSeatLayout(false);
      setShowBookingForm(false);
      setSelectedSeats([]);
      setBookingData({ 
        name: "", 
        email: "", 
        phone: "", 
        driverRequired: false, 
        additionalInfo: "",
        paymentMethod: "cash",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        upiId: "",
        bankName: ""
      });
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedCar || !searchData.pickupDate || !searchData.returnDate) return 0;
    
    const pickup = new Date(searchData.pickupDate);
    const returnDate = new Date(searchData.returnDate);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return selectedCar.pricePerDay;
    
    return selectedCar.pricePerDay * days;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push("⭐");
    }
    if (hasHalfStar) {
      stars.push("✨");
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push("☆");
    }
    
    return stars.join("");
  };

  return (
    <div className="car-booking-container">
      <div className="search-section">
        <h2>Search Cars</h2>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Pickup Location:</label>
            <input
              type="text"
              name="pickupLocation"
              value={searchData.pickupLocation}
              onChange={handleSearchChange}
              placeholder="Enter pickup city/location"
              required
            />
          </div>
          <div className="form-group">
            <label>Drop Location:</label>
            <input
              type="text"
              name="dropLocation"
              value={searchData.dropLocation}
              onChange={handleSearchChange}
              placeholder="Enter drop location"
              required
            />
          </div>
          <div className="form-group">
            <label>Pickup Date:</label>
            <input
              type="date"
              name="pickupDate"
              value={searchData.pickupDate}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Pickup Time:</label>
            <input
              type="time"
              name="pickupTime"
              value={searchData.pickupTime}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Return Date:</label>
            <input
              type="date"
              name="returnDate"
              value={searchData.returnDate}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Car Type:</label>
            <select
              name="carType"
              value={searchData.carType}
              onChange={handleSearchChange}
            >
              <option value="">All Types</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Compact SUV">Compact SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Luxury SUV">Luxury SUV</option>
              <option value="Luxury Sedan">Luxury Sedan</option>
              <option value="MUV">MUV</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="search-btn">Search Cars</button>
            <button type="button" onClick={handleShowAll} className="show-all-btn">Show All Cars</button>
          </div>
        </form>
      </div>

      {cars.length > 0 && !showBookingForm && (
        <div className="car-list">
          <h3>Available Cars</h3>
          {cars.map(car => (
            <div key={car.id} className="car-card">
              <div className="car-image">
                <div className="car-placeholder">🚗</div>
              </div>
              <div className="car-info">
                <div className="car-header">
                  <h4>{car.carName}</h4>
                  <span className="car-number">{car.carNumber}</span>
                  <div className="rating">{renderStars(car.rating)} ({car.rating})</div>
                </div>
                <div className="car-details">
                  <div className="car-meta">
                    <span className="brand">{car.brand}</span>
                    <span className="type">{car.carType}</span>
                    <span className="fuel">{car.fuelType}</span>
                    <span className="seats">{car.seats} Seats</span>
                  </div>
                  <div className="features">
                    {car.features.slice(0, 4).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                    {car.features.length > 4 && (
                      <span className="feature-tag">+{car.features.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="car-action">
                <div className="price-info">
                  <div className="price">₹{car.pricePerDay}/day</div>
                  <div className="price-per-km">₹{car.pricePerKm}/km</div>
                </div>
                <button onClick={() => handleCarSelect(car)} className="select-btn">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSeatLayout && selectedCar && (
        <div className="seat-selection">
          <div className="seat-header">
            <div>
              <h3>Select Seats - {selectedCar.carName}</h3>
              <p className="car-summary">{selectedCar.carNumber} • {selectedCar.pickupLocation} → {selectedCar.dropLocation}</p>
            </div>
            <button onClick={() => setShowSeatLayout(false)} className="back-btn">
              ← Back to Car List
            </button>
          </div>
          
          <div className="seat-layout">
            <div className="car-indicator">
              <div className="driver-seat">Driver</div>
            </div>
            
            {/* Show booked seats info */}
            {bookedSeats.length > 0 && (
              <div className="booked-seats-info">
                <p>🔒 <strong>Already Booked for {searchData.pickupDate}:</strong> {bookedSeats.join(', ')}</p>
              </div>
            )}
            
            <div className="seats-grid">
              {generateSeats().map((seat) => (
                <button
                  key={seat.number}
                  className={`seat ${seat.isBooked ? 'booked' : ''} ${
                    selectedSeats.includes(seat.number) ? 'selected' : ''
                  }`}
                  onClick={() => !seat.isBooked && handleSeatClick(seat.number)}
                  disabled={seat.isBooked}
                  title={seat.isBooked ? `Seat ${seat.number} is already booked` : `Select seat ${seat.number}`}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            <div className="seat-legend">
              <div className="legend-item">
                <div className="seat available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="seat selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="seat booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="booking-summary">
              <h4>Seat Selection Summary</h4>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Selected Seats:</span>
                  <span>{selectedSeats.join(', ')}</span>
                </div>
                <div className="summary-row">
                  <span>Number of Seats:</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <div className="summary-row">
                  <span>Pickup Date:</span>
                  <span>{searchData.pickupDate}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{calculateTotalPrice()}</span>
                </div>
              </div>
              <button onClick={handleProceedToBooking} className="proceed-btn">
                Proceed to Booking →
              </button>
            </div>
          )}
        </div>
      )}

      {showBookingForm && selectedCar && (
        <div className="booking-section">
          <div className="booking-header">
            <h3>Complete Your Booking</h3>
            <button onClick={() => setShowBookingForm(false)} className="back-btn">
              ← Back to Car List
            </button>
          </div>
          
          <div className="booking-summary">
            <div className="selected-car">
              <h4>Selected Car: {selectedCar.carName}</h4>
              <div className="car-summary-details">
                <p><strong>Car Number:</strong> {selectedCar.carNumber}</p>
                <p><strong>Type:</strong> {selectedCar.carType} ({selectedCar.fuelType})</p>
                <p><strong>Seats:</strong> {selectedCar.seats}</p>
                <p><strong>Pickup:</strong> {searchData.pickupLocation} on {searchData.pickupDate} at {searchData.pickupTime}</p>
                <p><strong>Drop:</strong> {searchData.dropLocation} on {searchData.returnDate}</p>
                <p className="total-price"><strong>Total Price: ₹{calculateTotalPrice()}</strong></p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleBookingSubmit} className="booking-form">
            <h5>Your Details</h5>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleBookingChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleBookingChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={bookingData.phone}
                onChange={handleBookingChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="driverRequired"
                  checked={bookingData.driverRequired}
                  onChange={handleBookingChange}
                />
                Driver Required (+₹500/day)
              </label>
            </div>
            <div className="form-group">
              <label>Additional Information:</label>
              <textarea
                name="additionalInfo"
                value={bookingData.additionalInfo}
                onChange={handleBookingChange}
                rows="3"
                placeholder="Any special requirements..."
              ></textarea>
            </div>
            <button type="submit" className="confirm-btn">
              Confirm Booking - ₹{calculateTotalPrice() + (bookingData.driverRequired ? 500 : 0)}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CarBooking;
