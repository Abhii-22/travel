import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddBusForm, setShowAddBusForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [analytics, setAnalytics] = useState({
    totalBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    popularRoutes: [],
    peakHours: []
  });
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

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalBuses = buses.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    const totalSeats = buses.reduce((sum, bus) => sum + (bus.totalSeats || 0), 0);
    const bookedSeats = bookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0);
    const occupancyRate = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;

    // Find popular routes
    const routeCounts = {};
    bookings.forEach(booking => {
      const route = `${booking.fromLocation} → ${booking.toLocation}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const popularRoutes = Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([route, count]) => ({ route, count }));

    setAnalytics({
      totalBuses,
      totalBookings,
      totalRevenue,
      occupancyRate,
      popularRoutes,
      peakHours: ['6:00 AM - 9:00 AM', '5:00 PM - 8:00 PM']
    });
  };

  // Load buses and bookings from database on component mount
  useEffect(() => {
    fetchBusesFromDatabase();
    fetchBookingsFromDatabase();
    
    // Hide header when admin dashboard mounts
    const header = document.querySelector('header') || document.querySelector('.header');
    if (header) {
      header.style.display = 'none';
    }
    
    // Cleanup function to show header when leaving admin page
    return () => {
      if (header) {
        header.style.display = 'block';
      }
    };
  }, []);

  // Update analytics when data changes
  useEffect(() => {
    calculateAnalytics();
  }, [buses, bookings]);

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

  // Note: localStorage dependency removed as we now use database for bus storage

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/bus-management/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Bus added to database:", data.bus);
        
        // Add to local state for immediate UI update
        const newBus = {
          id: data.bus._id,
          ...data.bus
        };
        setBuses(prev => [...prev, newBus]);
        
        // Reset form
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
        
        alert("Bus added successfully to database!");
      } else {
        const errorData = await response.json();
        console.error("Failed to add bus to database:", errorData.error);
        alert(`Failed to add bus: ${errorData.error}`);
        
        // Fallback to localStorage if database fails
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
      }
    } catch (error) {
      console.error("Error adding bus to database:", error);
      alert("Error adding bus to database. Please try again.");
      
      // Fallback to localStorage if database fails
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
    }
  };

  // Function to fetch buses from database
  const fetchBusesFromDatabase = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bus-management/all");
      if (response.ok) {
        const data = await response.json();
        // Transform database data to match frontend format
        const transformedBuses = data.buses.map(bus => ({
          id: bus._id,
          ...bus
        }));
        setBuses(transformedBuses);
        console.log(`Loaded ${transformedBuses.length} buses from database`);
      } else {
        console.error("Failed to fetch buses from database");
        // Fallback to localStorage if database fails
        const storedBuses = localStorage.getItem('adminBuses');
        if (storedBuses) {
          setBuses(JSON.parse(storedBuses));
        }
      }
    } catch (error) {
      console.error("Error fetching buses from database:", error);
      // Fallback to localStorage if database fails
      const storedBuses = localStorage.getItem('adminBuses');
      if (storedBuses) {
        setBuses(JSON.parse(storedBuses));
      }
    }
  };

  const handleDeleteBus = async (busId) => {
    try {
      // Delete from database
      const response = await fetch(`http://localhost:5000/api/bus-management/${busId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        console.log("Bus deleted from database successfully");
        // Remove from local state
        setBuses(prev => prev.filter(bus => bus.id !== busId));
        alert("Bus deleted successfully from database!");
      } else {
        const errorData = await response.json();
        console.error("Failed to delete bus from database:", errorData.error);
        alert(`Failed to delete bus: ${errorData.error}`);
        // Fallback to localStorage deletion
        setBuses(prev => prev.filter(bus => bus.id !== busId));
        localStorage.setItem('adminBuses', JSON.stringify(buses.filter(bus => bus.id !== busId)));
      }
    } catch (error) {
      console.error("Error deleting bus from database:", error);
      alert("Error deleting bus from database. Please try again.");
      // Fallback to localStorage deletion
      setBuses(prev => prev.filter(bus => bus.id !== busId));
      localStorage.setItem('adminBuses', JSON.stringify(buses.filter(bus => bus.id !== busId)));
    }
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
    'Music System', 'Curtains', 'Pillow', 'Safety Belt', 'USB Port',
    'Personal TV', 'Bedding', 'Meals', 'Restroom', 'Recliner Seats'
  ];

  const navigationItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'buses', icon: '🚌', label: 'Bus Management' },
    { id: 'bookings', icon: '📋', label: 'Bookings Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Admin Dashboard</h1>
          <p>Control Center</p>
        </div>
        
        <nav className="nav-menu">
          {navigationItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Content Header */}
        <div className="content-header">
          <div className="header-title">
            <h2>{navigationItems.find(item => item.id === activeSection)?.label}</h2>
            <p>Real-time data synchronization active</p>
          </div>
          <div className="quantum-actions">
            <button 
              className="quantum-btn"
              onClick={() => {
                fetchBusesFromDatabase();
                fetchBookingsFromDatabase();
              }}
            >
              <span>🔄</span>
              <span>Refresh Data</span>
            </button>
            {activeSection === 'buses' && (
              <button 
                className="quantum-btn primary"
                onClick={() => setShowAddBusForm(!showAddBusForm)}
              >
                <span>➕</span>
                <span>Add Bus</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <>
            {/* Analytics Grid */}
            <div className="analytics-grid">
              <div className="quantum-card">
                <div className="card-header">
                  <span className="card-title">Total Buses</span>
                  <div className="card-icon">🚌</div>
                </div>
                <div className="card-value">{analytics.totalBuses}</div>
                <div className="card-change positive">
                  <span>↑</span>
                  <span>12% from last month</span>
                </div>
              </div>
              
              <div className="quantum-card">
                <div className="card-header">
                  <span className="card-title">Total Bookings</span>
                  <div className="card-icon">📋</div>
                </div>
                <div className="card-value">{analytics.totalBookings}</div>
                <div className="card-change positive">
                  <span>↑</span>
                  <span>23% from last week</span>
                </div>
              </div>
              
              <div className="quantum-card">
                <div className="card-header">
                  <span className="card-title">Total Revenue</span>
                  <div className="card-icon">💰</div>
                </div>
                <div className="card-value">₹{analytics.totalRevenue.toLocaleString()}</div>
                <div className="card-change positive">
                  <span>↑</span>
                  <span>18% growth</span>
                </div>
              </div>
              
              <div className="quantum-card">
                <div className="card-header">
                  <span className="card-title">Occupancy Rate</span>
                  <div className="card-icon">📊</div>
                </div>
                <div className="card-value">{analytics.occupancyRate}%</div>
                <div className="card-change negative">
                  <span>↓</span>
                  <span>3% from optimal</span>
                </div>
              </div>
            </div>

            {/* Data Visualization */}
            <div className="data-viz-container">
              <div className="viz-header">
                <h3 className="viz-title">📈 Analytics Overview</h3>
                <div className="viz-controls">
                  <button className="viz-btn active">Revenue</button>
                  <button className="viz-btn">Bookings</button>
                  <button className="viz-btn">Routes</button>
                </div>
              </div>
              <div className="holographic-chart">
                <div className="chart-placeholder">
                  <div className="loading-spinner"></div>
                  <p>Loading analytics data...</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bus Management Section */}
        {activeSection === 'buses' && (
          <>
            {showAddBusForm && (
              <div className="neural-form">
                <h2 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  marginBottom: '1.5rem',
                  fontFamily: 'Orbitron, monospace'
                }}>
                  🚌 Add New Bus
                </h2>
                <form onSubmit={handleSubmit}>
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

                  <div className="amenities-quantum">
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

                  <div className="neural-actions">
                    <button type="submit" className="quantum-submit">Add Bus</button>
                    <button 
                      type="button" 
                      className="quantum-cancel"
                      onClick={() => setShowAddBusForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Buses List */}
            <div className="quantum-bus-section">
              <div className="section-header">
                <h3 className="section-title">
                  <span>🚌</span>
                  <span>Bus Fleet ({buses.length})</span>
                </h3>
              </div>
              {buses.length === 0 ? (
                <div className="quantum-empty">
                  <div>🚍</div>
                  <p>No buses in fleet</p>
                </div>
              ) : (
                <div className="quantum-bus-grid">
                  {buses.map(bus => (
                    <div key={bus.id} className="holo-bus-card">
                      <div className="bus-neural-header">
                        <h3>{bus.busName}</h3>
                        <span className="bus-quantum-id">{bus.busNumber}</span>
                      </div>
                      <div className="bus-neural-details">
                        <p><strong>Operator:</strong> {bus.operator}</p>
                        <p><strong>Route:</strong> {bus.fromLocation} → {bus.toLocation}</p>
                        <p><strong>Time:</strong> {bus.departureTime} - {bus.arrivalTime}</p>
                        <p><strong>Type:</strong> {bus.type}</p>
                        <p><strong>Seats:</strong> {bus.availableSeats}/{bus.totalSeats}</p>
                        <p><strong>Price:</strong> ₹{bus.price}</p>
                        <p><strong>Rating:</strong> {bus.rating} ⭐</p>
                        <div className="neural-amenities">
                          <strong>Amenities:</strong>
                          <div className="neural-tags">
                            {bus.amenities.map((amenity, index) => (
                              <span key={index} className="neural-tag">{amenity}</span>
                            ))}
                          </div>
                        </div>
                        <p><strong>Cancellation:</strong> {bus.cancellationPolicy}</p>
                      </div>
                      <div className="bus-neural-actions">
                        <button 
                          className="quantum-delete"
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
          </>
        )}
        
        {/* Bookings Analytics Section */}
        {activeSection === 'bookings' && (
          <div className="quantum-bus-section">
            <div className="section-header">
              <h3 className="section-title">
                <span>📋</span>
                <span>Booking Analytics ({bookings.length})</span>
              </h3>
            </div>
            {loading ? (
              <div className="quantum-loading">
                <div className="loading-spinner"></div>
                <p>🔄 Analyzing booking patterns...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="quantum-empty">
                <div>📊</div>
                <p>No booking data available</p>
              </div>
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
        )}
        
        {/* Other Sections (Placeholder) */}
        {activeSection !== 'dashboard' && activeSection !== 'buses' && activeSection !== 'bookings' && (
          <div className="quantum-bus-section">
            <div className="section-header">
              <h3 className="section-title">
                <span>🚧</span>
                <span>Features Coming Soon</span>
              </h3>
            </div>
            <div className="quantum-empty">
              <div>⚙️</div>
              <p>Advanced features for {navigationItems.find(item => item.id === activeSection)?.label} are being developed...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
