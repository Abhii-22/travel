import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddBusForm, setShowAddBusForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    busName: '',
    busNumber: '',
    fromLocation: '',
    toLocation: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
    type: 'AC Sleeper',
    rating: '4.0',
    amenities: ['WiFi', 'Charging Point'],
    operator: '',
    cancellationPolicy: 'Free cancellation before 24 hours'
  });

  // Load buses and bookings from localStorage and database on component mount
  useEffect(() => {
    const storedBuses = localStorage.getItem('adminBuses');
    if (storedBuses) {
      setBuses(JSON.parse(storedBuses));
    }
    
    // Fetch bookings from database
    fetchBookingsFromDatabase();
  }, []);

  // Function to fetch bookings from database
  const fetchBookingsFromDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/bus/bookings");
      if (response.ok) {
        const data = await response.json();
        // Transform database data to match frontend format
        const transformedBookings = data.bookings.map(booking => ({
          id: booking._id,
          name: booking.name,
          phone: booking.phone,
          email: booking.email,
          busName: booking.busName,
          busNumber: booking.busNumber,
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          travelDate: new Date(booking.travelDate).toISOString().split('T')[0],
          seats: booking.selectedSeats,
          totalPrice: booking.totalPrice,
          bookingDate: booking.bookingDate,
          paymentMethod: booking.paymentMethod
        }));
        setBookings(transformedBookings);
        console.log(`Loaded ${transformedBookings.length} bookings from database`);
      } else {
        console.error("Failed to fetch bookings from database");
        // Fallback to localStorage if database fails
        const storedBookings = localStorage.getItem('busBookings');
        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        }
      }
    } catch (error) {
      console.error("Error fetching bookings from database:", error);
      // Fallback to localStorage if database fails
      const storedBookings = localStorage.getItem('busBookings');
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      }
    } finally {
      setLoading(false);
    }
  };

  // Save buses to localStorage whenever they change
  useEffect(() => {
    if (buses.length > 0) {
      localStorage.setItem('adminBuses', JSON.stringify(buses));
    }
  }, [buses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter(amenity => amenity !== value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newBus = {
      id: Date.now(),
      ...formData,
      price: parseInt(formData.price),
      totalSeats: parseInt(formData.totalSeats),
      availableSeats: parseInt(formData.totalSeats),
      rating: parseFloat(formData.rating)
    };

    setBuses(prev => [...prev, newBus]);
    setFormData({
      busName: '',
      busNumber: '',
      fromLocation: '',
      toLocation: '',
      departureTime: '',
      arrivalTime: '',
      price: '',
      totalSeats: '',
      type: 'AC Sleeper',
      rating: '4.0',
      amenities: ['WiFi', 'Charging Point'],
      operator: '',
      cancellationPolicy: 'Free cancellation before 24 hours'
    });
    setShowAddBusForm(false);
  };

  const handleDeleteBus = (busId) => {
    setBuses(prev => prev.filter(bus => bus.id !== busId));
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      // Delete from database
      const response = await fetch(`http://localhost:5000/api/bus/delete/${bookingId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        console.log("Booking deleted from database successfully");
        // Refresh bookings from database
        fetchBookingsFromDatabase();
      } else {
        console.error("Failed to delete booking from database");
        // Fallback to localStorage deletion
        setBookings(prev => prev.filter(booking => booking.id !== bookingId));
        localStorage.setItem('busBookings', JSON.stringify(bookings.filter(booking => booking.id !== bookingId)));
      }
    } catch (error) {
      console.error("Error deleting booking from database:", error);
      // Fallback to localStorage deletion
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      localStorage.setItem('busBookings', JSON.stringify(bookings.filter(booking => booking.id !== bookingId)));
    }
  };

  // Group bookings by date and then by bus
  const groupBookingsByDateAndBus = () => {
    const grouped = {};
    
    bookings.forEach(booking => {
      const date = booking.travelDate;
      
      if (!grouped[date]) {
        grouped[date] = {};
      }
      
      const busKey = `${booking.busName} (${booking.busNumber})`;
      
      if (!grouped[date][busKey]) {
        grouped[date][busKey] = {
          busName: booking.busName,
          busNumber: booking.busNumber,
          fromLocation: booking.fromLocation,
          toLocation: booking.toLocation,
          bookings: []
        };
      }
      
      grouped[date][busKey].bookings.push(booking);
    });
    
    return grouped;
  };

  const availableAmenities = [
    'WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'TV', 
    'Snacks', 'Emergency Exit', 'Reading Light', 'Air Conditioning',
    'Music System', 'Curtains', 'Pillow', 'Safety Belt'
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-buttons">
          <button 
            className="refresh-btn"
            onClick={fetchBookingsFromDatabase}
          >
            🔄 Refresh Bookings
          </button>
          <button 
            className="add-bus-btn"
            onClick={() => setShowAddBusForm(!showAddBusForm)}
          >
            {showAddBusForm ? 'Cancel' : 'Add New Bus'}
          </button>
        </div>
      </div>

      {showAddBusForm && (
        <div className="add-bus-form-container">
          <h2>Add New Bus</h2>
          <form onSubmit={handleSubmit} className="add-bus-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Bus Name:</label>
                <input
                  type="text"
                  name="busName"
                  value={formData.busName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bus Number:</label>
                <input
                  type="text"
                  name="busNumber"
                  value={formData.busNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Operator:</label>
                <input
                  type="text"
                  name="operator"
                  value={formData.operator}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>From Location:</label>
                <input
                  type="text"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>To Location:</label>
                <input
                  type="text"
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Departure Time:</label>
                <input
                  type="text"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  placeholder="e.g. 10:00 AM"
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Time:</label>
                <input
                  type="text"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleInputChange}
                  placeholder="e.g. 10:00 PM"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price per Seat:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Seats:</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bus Type:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="AC Seater">AC Seater</option>
                  <option value="Non-AC Seater">Non-AC Seater</option>
                  <option value="Volvo AC">Volvo AC</option>
                  <option value="AC Semi-Sleeper">AC Semi-Sleeper</option>
                </select>
              </div>

              <div className="form-group">
                <label>Rating:</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                >
                  <option value="4.5">4.5 Stars</option>
                  <option value="4.0">4.0 Stars</option>
                  <option value="3.5">3.5 Stars</option>
                  <option value="3.0">3.0 Stars</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cancellation Policy:</label>
                <input
                  type="text"
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="amenities-section">
              <label>Amenities:</label>
              <div className="amenities-grid">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Bus</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowAddBusForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bookings-section">
        <h2>Bus Bookings ({bookings.length})</h2>
        {loading ? (
          <div className="loading-indicator">
            <p>🔄 Loading bookings from database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <p className="no-bookings">No bookings yet.</p>
        ) : (
          <div className="bookings-by-date">
            {Object.entries(groupBookingsByDateAndBus()).map(([date, buses]) => (
              <div key={date} className="date-section">
                <div className="date-header">
                  <h3>📅 {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <span className="booking-count">{Object.values(buses).reduce((acc, bus) => acc + bus.bookings.length, 0)} bookings</span>
                </div>
                
                {Object.entries(buses).map(([busKey, busData]) => (
                  <div key={busKey} className="bus-section">
                    <div className="bus-header-info">
                      <h4>🚌 {busData.busName} ({busData.busNumber})</h4>
                      <p className="route-info">{busData.fromLocation} → {busData.toLocation}</p>
                    </div>
                    
                    <div className="seats-grid">
                      {busData.bookings.map(booking => (
                        <div key={booking.id} className="seat-booking-card">
                          <div className="seat-info">
                            <span className="seat-number">Seats: {booking.seats.join(', ')}</span>
                            <span className="price">₹{booking.totalPrice}</span>
                          </div>
                          <div className="passenger-info">
                            <p><strong>Name:</strong> {booking.name}</p>
                            <p><strong>Phone:</strong> {booking.phone}</p>
                            <p><strong>Booking ID:</strong> #{booking.id}</p>
                            <p><strong>Booked on:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                          </div>
                          <div className="booking-actions">
                            <button 
                              className="delete-booking-btn"
                              onClick={() => handleDeleteBooking(booking.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="buses-list">
        <h2>Added Buses ({buses.length})</h2>
        {buses.length === 0 ? (
          <p className="no-buses">No buses added yet. Click "Add New Bus" to get started.</p>
        ) : (
          <div className="buses-grid">
            {buses.map(bus => (
              <div key={bus.id} className="bus-card">
                <div className="bus-header">
                  <h3>{bus.busName}</h3>
                  <span className="bus-number">{bus.busNumber}</span>
                </div>
                <div className="bus-details">
                  <p><strong>Operator:</strong> {bus.operator}</p>
                  <p><strong>Route:</strong> {bus.fromLocation} → {bus.toLocation}</p>
                  <p><strong>Time:</strong> {bus.departureTime} - {bus.arrivalTime}</p>
                  <p><strong>Type:</strong> {bus.type}</p>
                  <p><strong>Seats:</strong> {bus.availableSeats}/{bus.totalSeats}</p>
                  <p><strong>Price:</strong> ₹{bus.price}</p>
                  <p><strong>Rating:</strong> {bus.rating} ⭐</p>
                  <div className="amenities-list">
                    <strong>Amenities:</strong>
                    <div className="amenities-tags">
                      {bus.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                    </div>
                  </div>
                  <p><strong>Cancellation:</strong> {bus.cancellationPolicy}</p>
                </div>
                <div className="bus-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteBus(bus.id)}
                  >
                    Delete Bus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
