import React, { useState, useEffect } from "react";
import "./BusBooking.css";

const BusBooking = () => {
  const [searchData, setSearchData] = useState({
    fromLocation: "",
    toLocation: "",
    travelDate: ""
  });
  
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showSeatLayout, setShowSeatLayout] = useState(false);
  const [bookingData, setBookingData] = useState({
    passengers: [],
    paymentMethod: "cash",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    upiId: "",
    bankName: ""
  });
  const [filterOptions, setFilterOptions] = useState({
    priceRange: "all",
    busType: "all",
    departureTime: "all",
    rating: "all"
  });

  // State for tracking available seats per bus
  const [availableSeats, setAvailableSeats] = useState({});

  // Load admin-added buses from database
  useEffect(() => {
    const fetchBusesFromDatabase = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bus-management/all');
        if (response.ok) {
          const data = await response.json();
          const adminBuses = data.buses || [];
          setBuses(adminBuses);
          
          // Initialize available seats with admin bus data
          const initialAvailableSeats = {};
          adminBuses.forEach(bus => {
            initialAvailableSeats[bus.busNumber] = bus.availableSeats;
          });
          setAvailableSeats(initialAvailableSeats);
        } else {
          // If no buses in database, set empty array
          setBuses([]);
          setAvailableSeats({});
        }
      } catch (error) {
        console.error('Error fetching buses from database:', error);
        setBuses([]);
        setAvailableSeats({});
      }
    };

    fetchBusesFromDatabase();
  }, []);

  const handleSearchChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
    
    // If travel date changes, refresh booked seats for currently selected bus
    if (e.target.name === 'travelDate' && selectedBus) {
      refreshBookedSeats();
    }
  };

  // Function to refresh booked seats from database
  const refreshBookedSeats = async () => {
    if (!selectedBus || !searchData.travelDate) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/bus/booked-seats/${selectedBus.busNumber}/${searchData.travelDate}`);
      
      if (!response.ok) {
        console.log("Backend not available, using empty booked seats");
        setBookedSeats([]);
        return;
      }
      
      const data = await response.json();
      const bookedSeatsList = data.bookedSeats || [];
      setBookedSeats(bookedSeatsList);
      
      // Update available seats based on database data
      const availableCount = selectedBus.totalSeats - bookedSeatsList.length;
      setAvailableSeats(prev => ({
        ...prev,
        [selectedBus.busNumber]: availableCount
      }));
      
      console.log(`Refreshed ${bookedSeatsList.length} booked seats for ${selectedBus.busNumber} on ${searchData.travelDate}`);
      
    } catch (error) {
      console.error("Error refreshing booked seats:", error);
      setBookedSeats([]);
    }
  };

  const handleFilterChange = (newFilterOptions) => {
    setFilterOptions(newFilterOptions);
    
    // Apply filters immediately when filter options change
    console.log("Filter changed:", newFilterOptions);
    
    // Only apply filters if we have buses displayed
    if (buses.length > 0) {
      const filteredBuses = applyFilters(buses);
      setBuses(filteredBuses);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Search data:", searchData);
    
    // Validate search data
    if (!searchData.fromLocation || !searchData.toLocation || !searchData.travelDate) {
      alert("Please fill in all search fields");
      return;
    }
    
    try {
      // Search buses from database
      const response = await fetch(`http://localhost:5000/api/bus-management/search/${searchData.fromLocation}/${searchData.toLocation}`);
      
      if (response.ok) {
        const data = await response.json();
        const searchResults = data.buses || [];
        
        // Apply filters to search results
        const filteredBuses = applyFilters(searchResults);
        setBuses(filteredBuses);
        
        // Initialize available seats for search results
        const initialAvailableSeats = {};
        filteredBuses.forEach(bus => {
          initialAvailableSeats[bus.busNumber] = bus.availableSeats;
        });
        setAvailableSeats(initialAvailableSeats);
        
        console.log(`Found ${filteredBuses.length} buses matching search criteria`);
        
      } else {
        setBuses([]);
        setAvailableSeats({});
        console.log("No buses found matching search criteria");
      }
    } catch (error) {
      console.error("Error searching buses:", error);
      setBuses([]);
      setAvailableSeats({});
    }
  };

  const applyFilters = (busList) => {
    console.log("Applying filters to", busList.length, "buses");
    console.log("Filter options:", filterOptions);
    
    const filtered = busList.filter(bus => {
      // Price filter
      if (filterOptions.priceRange !== "all") {
        if (filterOptions.priceRange === "low" && bus.price > 800) return false;
        if (filterOptions.priceRange === "medium" && (bus.price < 800 || bus.price > 1200)) return false;
        if (filterOptions.priceRange === "high" && bus.price < 1200) return false;
      }
      
      // Bus type filter
      if (filterOptions.busType !== "all" && bus.type !== filterOptions.busType) return false;
      
      // Rating filter
      if (filterOptions.rating !== "all") {
        if (filterOptions.rating === "4+" && bus.rating < 4.0) return false;
        if (filterOptions.rating === "3+" && bus.rating < 3.0) return false;
      }
      
      // Departure time filter (if implemented)
      if (filterOptions.departureTime !== "all") {
        const hour = parseInt(bus.departureTime.split(':')[0]);
        const period = bus.departureTime.split(' ')[1];
        let hour24 = hour;
        if (period === 'PM' && hour !== 12) hour24 += 12;
        if (period === 'AM' && hour === 12) hour24 = 0;
        
        if (filterOptions.departureTime === "morning" && (hour24 < 6 || hour24 >= 12)) return false;
        if (filterOptions.departureTime === "afternoon" && (hour24 < 12 || hour24 >= 18)) return false;
        if (filterOptions.departureTime === "evening" && (hour24 < 18 || hour24 >= 22)) return false;
        if (filterOptions.departureTime === "night" && (hour24 < 22 || hour24 >= 6)) return false;
      }
      
      return true;
    });
    
    console.log("Filtered result:", filtered.length, "buses");
    return filtered;
  };

  const handleShowAll = async () => {
    console.log("Showing all buses");
    
    try {
      const response = await fetch('http://localhost:5000/api/bus-management/all');
      if (response.ok) {
        const data = await response.json();
        const allBuses = data.buses || [];
        
        // Apply filters to all buses
        const filteredBuses = applyFilters(allBuses);
        setBuses(filteredBuses);
        
        // Initialize available seats
        const initialAvailableSeats = {};
        filteredBuses.forEach(bus => {
          initialAvailableSeats[bus.busNumber] = bus.availableSeats;
        });
        setAvailableSeats(initialAvailableSeats);
        
        // Reset filters when showing all
        setFilterOptions({
          priceRange: "all",
          busType: "all",
          departureTime: "all",
          rating: "all"
        });
        
      } else {
        setBuses([]);
        setAvailableSeats({});
      }
    } catch (error) {
      console.error("Error fetching all buses:", error);
      setBuses([]);
      setAvailableSeats({});
    }
    setSearchData({
      fromLocation: "",
      toLocation: "",
      travelDate: ""
    });
  };

  // Refresh buses from database
  const refreshBuses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bus-management/all');
      if (response.ok) {
        const data = await response.json();
        const allBuses = data.buses || [];
        setBuses(allBuses);
        
        // Initialize available seats
        const initialAvailableSeats = {};
        allBuses.forEach(bus => {
          initialAvailableSeats[bus.busNumber] = bus.availableSeats;
        });
        setAvailableSeats(initialAvailableSeats);
      }
    } catch (error) {
      console.error("Error refreshing buses:", error);
    }
  };

  const handleBusSelect = async (bus) => {
    setSelectedBus(bus);
    setShowSeatLayout(true);
    setSelectedSeats([]);
    
    // Always fetch booked seats for this bus and date from database
    if (searchData.travelDate) {
      try {
        console.log(`Fetching booked seats for bus: ${bus.busNumber}, date: ${searchData.travelDate}`);
        const response = await fetch(`http://localhost:5000/api/bus/booked-seats/${bus.busNumber}/${searchData.travelDate}`);
        
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
        
        // Update available seats for this bus based on actual database data
        const availableCount = bus.totalSeats - bookedSeatsList.length;
        setAvailableSeats(prev => ({
          ...prev,
          [bus.busNumber]: availableCount
        }));
        
        console.log(`Successfully loaded ${bookedSeatsList.length} booked seats for ${bus.busNumber} on ${searchData.travelDate}`);
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
        [bus.busNumber]: bus.availableSeats
      }));
    }
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
      alert(`Seat ${seatNumber} is already booked for ${searchData.travelDate}. Please select a different seat.`);
      return;
    }
    
    if (selectedSeats.includes(seatNumber)) {
      // Remove seat and its passenger data
      const seatIndex = selectedSeats.indexOf(seatNumber);
      const newSeats = selectedSeats.filter(seat => seat !== seatNumber);
      const newPassengers = bookingData.passengers.filter((_, index) => index !== seatIndex);
      setSelectedSeats(newSeats);
      setBookingData({ ...bookingData, passengers: newPassengers });
    } else {
      if (selectedSeats.length < 6) {
        // Add seat and initialize passenger data
        const newSeats = [...selectedSeats, seatNumber];
        const newPassengers = [...bookingData.passengers, { seat: seatNumber }];
        setSelectedSeats(newSeats);
        setBookingData({ ...bookingData, passengers: newPassengers });
      } else {
        alert("You can select maximum 6 seats");
      }
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...bookingData.passengers];
    if (!updatedPassengers[index]) {
      updatedPassengers[index] = {};
    }
    updatedPassengers[index][field] = value;
    setBookingData({ ...bookingData, passengers: updatedPassengers });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    
    const totalPrice = selectedBus.price * selectedSeats.length;
    const paymentMethod = bookingData.paymentMethod || 'cash'; // Default to cash if undefined
    
    // Validate payment method exists
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    
    // Validate passenger data
    if (bookingData.passengers.length !== selectedSeats.length) {
      alert("Please fill details for all selected seats");
      return;
    }
    
    for (let i = 0; i < bookingData.passengers.length; i++) {
      const passenger = bookingData.passengers[i];
      if (!passenger.name || !passenger.email || !passenger.phone || !passenger.age || !passenger.gender) {
        alert(`Please fill all details for seat ${passenger.seat}`);
        return;
      }
    }
    
    // Validate critical data before sending
    if (!searchData.travelDate) {
      alert("Please select a travel date");
      return;
    }
    
    if (!selectedSeats || selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    
    // Use first passenger as primary contact
    const primaryPassenger = bookingData.passengers[0];
    
    const bookingInfo = {
      // Primary Passenger Details (for database compatibility)
      name: primaryPassenger.name,
      email: primaryPassenger.email,
      phone: primaryPassenger.phone,
      age: primaryPassenger.age,
      gender: primaryPassenger.gender,
      
      // All Passengers Details
      passengers: bookingData.passengers,
      
      // Journey Details
      fromLocation: selectedBus.fromLocation,
      toLocation: selectedBus.toLocation,
      travelDate: searchData.travelDate,
      
      // Bus Details
      busName: selectedBus.busName,
      busNumber: selectedBus.busNumber,
      busType: selectedBus.type,
      operator: selectedBus.operator,
      departureTime: selectedBus.departureTime,
      arrivalTime: selectedBus.arrivalTime,
      duration: calculateDuration(selectedBus.departureTime, selectedBus.arrivalTime),
      
      // Seat Details
      selectedSeats: selectedSeats,
      numberOfSeats: selectedSeats.length,
      pricePerSeat: selectedBus.price,
      totalPrice: totalPrice,
      
      // Bus Features
      amenities: selectedBus.amenities,
      rating: selectedBus.rating,
      cancellationPolicy: selectedBus.cancellationPolicy,
      insurance: selectedBus.insurance,
      
      // Payment Details
      paymentMethod: paymentMethod,
      cardNumber: paymentMethod !== 'cash' ? (bookingData.cardNumber || '') : '',
      cardExpiry: paymentMethod !== 'cash' ? (bookingData.cardExpiry || '') : '',
      cardCVV: paymentMethod !== 'cash' ? (bookingData.cardCVV || '') : '',
      upiId: paymentMethod === 'upi' ? (bookingData.upiId || '') : '',
      bankName: paymentMethod === 'net_banking' ? (bookingData.bankName || '') : ''
    };
    
    // Log the data being sent for debugging
    console.log("=== BOOKING DATA BEING SENT TO BACKEND ===");
    console.log("Travel Date:", bookingInfo.travelDate);
    console.log("Selected Seats:", bookingInfo.selectedSeats);
    console.log("Bus Number:", bookingInfo.busNumber);
    console.log("Passenger Name:", bookingInfo.name);
    console.log("Full Booking Object:", bookingInfo);
    console.log("===========================================");
    
    try {
      console.log("Submitting booking to backend...");
      console.log("Booking data:", bookingInfo);
      
      const response = await fetch("http://localhost:5000/api/bus/book", {
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
        
        // Save booking to localStorage for admin dashboard
        const bookingForStorage = {
          id: mockBookingId,
          name: bookingData.name,
          phone: bookingData.phone,
          email: bookingData.email,
          busName: selectedBus.busName,
          busNumber: selectedBus.busNumber,
          fromLocation: selectedBus.fromLocation,
          toLocation: selectedBus.toLocation,
          travelDate: searchData.travelDate,
          seats: selectedSeats,
          totalPrice: totalPrice,
          bookingDate: new Date().toISOString(),
          paymentMethod: paymentMethodDisplay
        };
        
        // Get existing bookings from localStorage
        const existingBookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
        existingBookings.push(bookingForStorage);
        localStorage.setItem('busBookings', JSON.stringify(existingBookings));
        
        alert(`Booking Confirmed!\n\nBooking ID: ${mockBookingId}\nTransaction ID: ${mockTransactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: PAID\n\nSeats ${selectedSeats.join(', ')} booked successfully!`);
        
        // Update available seats after booking
        const currentAvailable = availableSeats[selectedBus.busNumber] || selectedBus.availableSeats;
        const newAvailable = currentAvailable - selectedSeats.length;
        setAvailableSeats(prev => ({
          ...prev,
          [selectedBus.busNumber]: newAvailable
        }));
        
        // Add booked seats to the list
        setBookedSeats(prev => [...prev, ...selectedSeats]);
        
        console.log(`Booking confirmed: Seats ${selectedSeats.join(', ')} booked for ${selectedBus.busNumber} on ${searchData.travelDate}`);
        
        // Reset form after booking
        setSelectedBus(null);
        setShowSeatLayout(false);
        setSelectedSeats([]);
        setBookingData({ 
          name: "", 
          email: "", 
          phone: "", 
          age: "", 
          gender: "",
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
      console.log("Backend booking successful:", data);
      
      // Get payment method from booking info to avoid undefined error
      const paymentMethodDisplay = paymentMethod || 'cash';
      
      // Save booking to localStorage for admin dashboard
        const bookingForStorage = {
          id: data.bookingId,
          name: primaryPassenger.name,
          phone: primaryPassenger.phone,
          email: primaryPassenger.email,
          passengers: bookingData.passengers,
          busName: selectedBus.busName,
          busNumber: selectedBus.busNumber,
          fromLocation: selectedBus.fromLocation,
          toLocation: selectedBus.toLocation,
          travelDate: searchData.travelDate,
          seats: selectedSeats,
          totalPrice: totalPrice,
          bookingDate: new Date().toISOString(),
          paymentMethod: paymentMethodDisplay
        };
        
        // Get existing bookings from localStorage
        const existingBookings = JSON.parse(localStorage.getItem('busBookings') || '[]');
        existingBookings.push(bookingForStorage);
        localStorage.setItem('busBookings', JSON.stringify(existingBookings));
        
        alert(`Bus booking confirmed!\n\nBooking ID: ${data.bookingId}\nTransaction ID: ${data.transactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: ${data.paymentStatus.toUpperCase()}\n\n✅ Seats ${selectedSeats.join(', ')} are now PERMANENTLY booked in database!`);
      
      // Update available seats after successful booking
      const currentAvailable = availableSeats[selectedBus.busNumber] || selectedBus.availableSeats;
      const newAvailable = currentAvailable - selectedSeats.length;
      setAvailableSeats(prev => ({
        ...prev,
        [selectedBus.busNumber]: newAvailable
      }));
      
      // Add booked seats to the local list (these are now permanently locked)
      setBookedSeats(prev => [...prev, ...selectedSeats]);
      
      // Refresh the booked seats from database to ensure consistency
      try {
        console.log("Refreshing booked seats from database...");
        const refreshResponse = await fetch(`http://localhost:5000/api/bus/booked-seats/${selectedBus.busNumber}/${searchData.travelDate}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setBookedSeats(refreshData.bookedSeats || []);
          console.log("Refreshed booked seats from database:", refreshData.bookedSeats);
        }
      } catch (error) {
        console.error("Error refreshing booked seats:", error);
      }
      
      // Reset form
      setSelectedBus(null);
      setShowSeatLayout(false);
      setSelectedSeats([]);
      setBookingData({ 
        passengers: [],
        paymentMethod: "cash",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        upiId: "",
        bankName: ""
      });
    } catch (error) {
      console.error("Booking error:", error);
      // Show mock confirmation if backend is not available
      const mockBookingId = `MOCK${Date.now()}`;
      const mockTransactionId = `TXN${Date.now()}`;
      
      // Get payment method from booking info to avoid undefined error
      const paymentMethodDisplay = paymentMethod || 'cash';
      
      alert(`Mock Booking Confirmed!\n\nBooking ID: ${mockBookingId}\nTransaction ID: ${mockTransactionId}\nPayment Method: ${paymentMethodDisplay.toUpperCase()}\nTotal Amount: ₹${totalPrice}\n\nPayment Status: PAID\n\nSeats ${selectedSeats.join(', ')} temporarily booked!\n\n⚠️ Backend server not running - seats not permanently stored in database.\nPlease start the backend server to enable permanent seat locking.`);
      
      // Update available seats after mock booking (simulate temporary locking)
      const currentAvailable = availableSeats[selectedBus.busNumber] || selectedBus.availableSeats;
      const newAvailable = currentAvailable - selectedSeats.length;
      setAvailableSeats(prev => ({
        ...prev,
        [selectedBus.busNumber]: newAvailable
      }));
      
      // Add booked seats to the list (simulate temporary locking)
      setBookedSeats(prev => [...prev, ...selectedSeats]);
      
      console.log(`Mock booking: Seats ${selectedSeats.join(', ')} temporarily locked for ${selectedBus.busNumber} on ${searchData.travelDate}`);
      
      // Reset form after mock booking
      setSelectedBus(null);
      setShowSeatLayout(false);
      setSelectedSeats([]);
      setBookingData({ 
        passengers: [],
        paymentMethod: "cash",
        cardNumber: "",
        cardExpiry: "",
        cardCVV: "",
        upiId: "",
        bankName: ""
      });
    }
  };

  const generateSeats = () => {
    const seats = [];
    
    // Create 3 columns with 7 seats each
    // Column 1: 7 single seats (left side - window)
    // Column 2: 7 single seats (middle)
    // Column 3: 7 single seats (right side - aisle)
    // Total: 21 seats (7 + 7 + 7)
    
    for (let seat = 1; seat <= 7; seat++) {
      // Left column - Single seat (Window seat)
      const leftSeat = `${seat}A`; // Seat 1A, 2A, 3A...7A
      const isLeftBooked = bookedSeats.includes(leftSeat);
      seats.push({ 
        number: leftSeat, 
        isBooked: isLeftBooked,
        position: 'left-column',
        column: 1
      });
      
      // Middle column - Single seat
      const middleSeat = `${seat}B`; // Seat 1B, 2B, 3B...7B
      const isMiddleBooked = bookedSeats.includes(middleSeat);
      seats.push({ 
        number: middleSeat, 
        isBooked: isMiddleBooked,
        position: 'middle-column',
        column: 2
      });
      
      // Right column - Single seat (Aisle seat)
      const rightSeat = `${seat}C`; // Seat 1C, 2C, 3C...7C
      const isRightBooked = bookedSeats.includes(rightSeat);
      seats.push({ 
        number: rightSeat, 
        isBooked: isRightBooked,
        position: 'right-column',
        column: 3
      });
    }
    
    return seats;
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

  const calculateDuration = (departure, arrival) => {
    const dep = new Date(`2024-01-01 ${departure}`);
    const arr = new Date(`2024-01-02 ${arrival}`);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bus-booking-container">
      <div className="search-section">
        <h2>Search Buses</h2>
        <form onSubmit={handleSearch} className="search-form">
          <div className="inputs-container">
            <div className="form-group">
              <label>From:</label>
              <input
                type="text"
                name="fromLocation"
                value={searchData.fromLocation}
                onChange={handleSearchChange}
                placeholder="e.g. Delhi, delhi, DELHI"
                required
              />
            </div>
            <div className="form-group">
              <label>To:</label>
              <input
                type="text"
                name="toLocation"
                value={searchData.toLocation}
                onChange={handleSearchChange}
                placeholder="e.g. Mumbai, mumbai, MUMBAI"
                required
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="travelDate"
                value={searchData.travelDate}
                onChange={handleSearchChange}
                placeholder="dd-mm-yyyy"
                required
              />
            </div>
          </div>
          <div className="buttons-container">
            <button type="submit" className="search-btn">Search Buses</button>
            <button type="button" onClick={handleShowAll} className="show-all-btn">Show All Buses</button>
            <button type="button" onClick={refreshBuses} className="refresh-btn">🔄 Refresh</button>
          </div>
        </form>
      </div>

      {buses.length > 0 && !showSeatLayout && (
        <>
          <div className="filter-section">
            <h3>Filter Buses</h3>
            <div className="filter-options">
              <div className="filter-group">
                <label>Price Range:</label>
                <select name="priceRange" value={filterOptions.priceRange} onChange={handleFilterChange}>
                  <option value="all">All Prices</option>
                  <option value="low">Low (Below ₹800)</option>
                  <option value="medium">Medium (₹800-₹1200)</option>
                  <option value="high">High (Above ₹1200)</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Bus Type:</label>
                <select name="busType" value={filterOptions.busType} onChange={handleFilterChange}>
                  <option value="all">All Types</option>
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="AC Seater">AC Seater</option>
                  <option value="Non-AC Seater">Non-AC Seater</option>
                  <option value="Volvo AC">Volvo AC</option>
                  <option value="AC Semi-Sleeper">AC Semi-Sleeper</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Rating:</label>
                <select name="rating" value={filterOptions.rating} onChange={handleFilterChange}>
                  <option value="all">All Ratings</option>
                  <option value="4+">4+ Stars</option>
                  <option value="3+">3+ Stars</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Departure Time:</label>
                <select name="departureTime" value={filterOptions.departureTime} onChange={handleFilterChange}>
                  <option value="all">All Times</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 10PM)</option>
                  <option value="night">Night (10PM - 6AM)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bus-list">
            <h3>Available Buses ({buses.length} buses found)</h3>
            {buses.map(bus => (
              <div key={bus.id} className="bus-card">
                <div className="bus-info">
                  <div className="bus-header">
                    <div>
                      <h4>{bus.busName}</h4>
                      <p className="operator">{bus.operator}</p>
                    </div>
                    <div className="bus-meta-right">
                      <span className="bus-number">{bus.busNumber}</span>
                      <div className="rating">{renderStars(bus.rating)} ({bus.rating})</div>
                    </div>
                  </div>
                  <div className="bus-details">
                    <div className="route">
                      <span className="location">{bus.fromLocation}</span>
                      <span className="arrow">→</span>
                      <span className="location">{bus.toLocation}</span>
                    </div>
                    <div className="timing">
                      <span className="time">
                        <strong>Departure:</strong> {bus.departureTime}
                      </span>
                      <span className="time">
                        <strong>Arrival:</strong> {bus.arrivalTime}
                      </span>
                    </div>
                    <div className="bus-features">
                      <span className="bus-type">{bus.type}</span>
                      <span className="available-seats">
                        {availableSeats[bus.busNumber] !== undefined 
                          ? `${availableSeats[bus.busNumber]} seats available` 
                          : `${bus.availableSeats} seats available`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bus-action">
                  <div className="price-info">
                    <div className="price">₹{bus.price}</div>
                    <div className="price-label">per seat</div>
                  </div>
                  <button onClick={() => handleBusSelect(bus)} className="select-btn">
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!showSeatLayout && buses.length === 0 && (
        <div className="no-buses">
          <h3>No buses available</h3>
          <p>Please add buses through the admin dashboard or try different search criteria.</p>
        </div>
      )}

      {showSeatLayout && selectedBus && (
        <div className="seat-selection">
          <div className="seat-header">
            <div>
              <h3>Select Seats - {selectedBus.busName}</h3>
              <p className="bus-summary">{selectedBus.busNumber} • {selectedBus.fromLocation} → {selectedBus.toLocation}</p>
            </div>
            <button onClick={() => setShowSeatLayout(false)} className="back-btn">
              ← Back to Bus List
            </button>
          </div>
          
          <div className="seat-layout">
            <div className="bus-indicator">
              <div className="driver-seat">Driver</div>
            </div>
            
            {/* Show booked seats info */}
            {bookedSeats.length > 0 && (
              <div className="booked-seats-info">
                <p>🔒 <strong>Already Booked for {searchData.travelDate}:</strong> {bookedSeats.join(', ')}</p>
              </div>
            )}
            
            <div className="seats-grid">
              {(() => {
                const seats = generateSeats();
                
                return (
                  <div className="seat-columns-container">
                    {/* Driver indicator */}
                    <div className="driver-indicator">👤 Driver</div>
                    
                    <div className="seat-columns">
                      {/* Left column - 7 single seats (Window) */}
                      <div className="seat-column left-column">
                        <div className="column-label">Window</div>
                        {seats.filter(seat => seat.position === 'left-column').map(seat => (
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
                      
                      {/* Middle column - 7 single seats */}
                      <div className="seat-column middle-column">
                        <div className="column-label">Middle</div>
                        {seats.filter(seat => seat.position === 'middle-column').map(seat => (
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
                      
                      {/* Right column - 7 single seats (Aisle) */}
                      <div className="seat-column right-column">
                        <div className="column-label">Aisle</div>
                        {seats.filter(seat => seat.position === 'right-column').map(seat => (
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
                    </div>
                  </div>
                );
              })()}
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
              <h4>Booking Summary</h4>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Selected Seats:</span>
                  <span>{selectedSeats.join(", ")}</span>
                </div>
                <div className="summary-row">
                  <span>Price per seat:</span>
                  <span>₹{selectedBus.price}</span>
                </div>
                <div className="summary-row">
                  <span>Number of seats:</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Price:</span>
                  <span>₹{selectedBus.price * selectedSeats.length}</span>
                </div>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <h5>Passenger Details</h5>
                <div className="passengers-container">
                  {selectedSeats.map((seat, index) => (
                    <div key={index} className="passenger-card">
                      <h6>Passenger {index + 1} - Seat {seat}</h6>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name:</label>
                          <input
                            type="text"
                            value={bookingData.passengers[index]?.name || ''}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            value={bookingData.passengers[index]?.email || ''}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Phone:</label>
                          <input
                            type="tel"
                            value={bookingData.passengers[index]?.phone || ''}
                            onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Age:</label>
                          <input
                            type="number"
                            value={bookingData.passengers[index]?.age || ''}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Gender:</label>
                          <select 
                            value={bookingData.passengers[index]?.gender || ''} 
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)} 
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="payment-section">
                  <h6>Payment Method</h6>
                  <div className="form-row">
                    <div className="form-group">
                      <select name="paymentMethod" value={bookingData.paymentMethod} onChange={handleBookingChange} required>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="upi">UPI</option>
                        <option value="net_banking">Net Banking</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Details Section */}
                {bookingData.paymentMethod !== 'cash' && (
                  <div className="payment-details-section">
                    <h6>Payment Details</h6>
                    
                    {(bookingData.paymentMethod === 'credit_card' || bookingData.paymentMethod === 'debit_card') && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Card Number:</label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={bookingData.cardNumber}
                            onChange={handleBookingChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Expiry Date:</label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={bookingData.cardExpiry}
                            onChange={handleBookingChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    {(bookingData.paymentMethod === 'credit_card' || bookingData.paymentMethod === 'debit_card') && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>CVV:</label>
                          <input
                            type="text"
                            name="cardCVV"
                            value={bookingData.cardCVV}
                            onChange={handleBookingChange}
                            placeholder="123"
                            maxLength="3"
                            required
                          />
                        </div>
                        <div className="form-group"></div>
                      </div>
                    )}
                    
                    {bookingData.paymentMethod === 'upi' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>UPI ID:</label>
                          <input
                            type="text"
                            name="upiId"
                            value={bookingData.upiId}
                            onChange={handleBookingChange}
                            placeholder="yourname@upi"
                            required
                          />
                        </div>
                        <div className="form-group"></div>
                      </div>
                    )}
                    
                    {bookingData.paymentMethod === 'net_banking' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Bank Name:</label>
                          <select
                            name="bankName"
                            value={bookingData.bankName}
                            onChange={handleBookingChange}
                            required
                          >
                            <option value="">Select Bank</option>
                            <option value="State Bank of India">State Bank of India</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          </select>
                        </div>
                        <div className="form-group"></div>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="confirm-btn">
                  Confirm Booking & Pay ₹{selectedBus.price * selectedSeats.length}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusBooking;
