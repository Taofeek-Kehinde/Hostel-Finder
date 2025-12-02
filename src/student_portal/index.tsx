import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';
import icon from '../assets/icon.png';


interface Hostel {
  _id: string;
  name: string;
  school: string;
  location: string;
  price: string;
  description: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  images: string[];
  amenities: string[];
  createdAt: string;
}

const Index: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Dropdown states
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  const navigate = useNavigate();

  // Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // School types
  const schoolTypes = [
    'University',
    'Polytechnic', 
    'College',
    'All Types'
  ];

  // Nigerian institutions
  const nigerianInstitutions = [
    'University of Lagos (UNILAG)',
    'University of Ibadan (UI)',
    'University of Nigeria, Nsukka (UNN)',
    'Obafemi Awolowo University (OAU)',
    'Covenant University',
    'University of Benin (UNIBEN)',
    'University of Ilorin (UNILORIN)',
    'Ahmadu Bello University (ABU)',
    'University of Port Harcourt (UNIPORT)',
    'Federal University of Technology, Akure (FUTA)',
    'Yaba College of Technology (YABATECH)',
    'Lagos State Polytechnic (LASPOTECH)',
    'Auchi Polytechnic',
    'Kaduna Polytechnic',
    'Federal Polytechnic, Nekede',
    'College of Education, Ikere-Ekiti',
    'Federal College of Education (Technical), Akoka',
    'All Institutions'
  ];

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    filterHostels();
  }, [searchTerm, selectedSchool, selectedState, selectedType, hostels]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.custom-select')) {
        setShowSchoolDropdown(false);
        setShowStateDropdown(false);
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hostels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHostels(data.hostels);
      } else {
        console.error('Failed to fetch hostels');
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHostels = () => {
    let filtered = hostels;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hostel =>
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.school.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected school
    if (selectedSchool && selectedSchool !== 'All Institutions') {
      filtered = filtered.filter(hostel =>
        hostel.school.toLowerCase().includes(selectedSchool.toLowerCase())
      );
    }

    // Filter by state
    if (selectedState) {
      filtered = filtered.filter(hostel =>
        hostel.location.toLowerCase().includes(selectedState.toLowerCase())
      );
    }

    // Filter by school type
    if (selectedType && selectedType !== 'All Types') {
      filtered = filtered.filter(hostel => {
        const schoolName = hostel.school.toLowerCase();
        if (selectedType === 'University') {
          return schoolName.includes('university') || schoolName.includes('uni');
        } else if (selectedType === 'Polytechnic') {
          return schoolName.includes('polytechnic') || schoolName.includes('poly');
        } else if (selectedType === 'College') {
          return schoolName.includes('college') || schoolName.includes('col.');
        }
        return true;
      });
    }

    setFilteredHostels(filtered);
  };

  const handleSchoolSelect = (school: string) => {
    setSelectedSchool(school);
    setShowSchoolDropdown(false);
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setShowStateDropdown(false);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setShowTypeDropdown(false);
  };

  const handleHostelClick = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setShowModal(true);
  };

  const formatPrice = (price: string) => {
    if (!price) return 'Price not available';
    return price.includes('K') || price.includes('N') ? price : `₦${price}`;
  };

  const handleWhatsAppClick = (phone: string) => {
    const message = `Hello, I'm interested in your hostel listing.`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading hostels...</p>
      </div>
    );
  }

  return (
    <div className="index-container">
      {/* Header */}
      <header className="index-header">
        <div className="header-content">
          <div className="logo-with-text" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <img
              src={icon}
              alt="HostleFinder"
              className="logo-image"
            />
            <span className="logo-text">HostleFinder</span>
          </div>

          <nav className="nav-links">
            <button className="nav-btn">
              <i className="fas fa-user"></i>
              Profile
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Find Your Perfect Hostel</h2>
          <p>Search through available hostels near your institution</p>
          
          <div className="search-grid">
            {/* Search Input */}
            <div className="search-input-group">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search hostels by name, location, or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* School Select Dropdown */}
            <div className="custom-select">
              <div 
                className="select-trigger"
                onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
              >
                <i className="fas fa-university select-icon"></i>
                <span className="select-value">
                  {selectedSchool || 'All Institutions'}
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${showSchoolDropdown ? 'rotate' : ''}`}></i>
              </div>
              {showSchoolDropdown && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item"
                    onClick={() => handleSchoolSelect('')}
                  >
                    All Institutions
                  </div>
                  {nigerianInstitutions.map((institution, index) => (
                    <div 
                      key={index}
                      className={`dropdown-item ${selectedSchool === institution ? 'selected' : ''}`}
                      onClick={() => handleSchoolSelect(institution)}
                    >
                      {institution}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* State Select Dropdown */}
            <div className="custom-select">
              <div 
                className="select-trigger"
                onClick={() => setShowStateDropdown(!showStateDropdown)}
              >
                <i className="fas fa-map-marker-alt select-icon"></i>
                <span className="select-value">
                  {selectedState || 'All States'}
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${showStateDropdown ? 'rotate' : ''}`}></i>
              </div>
              {showStateDropdown && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item"
                    onClick={() => handleStateSelect('')}
                  >
                    All States
                  </div>
                  {nigerianStates.map((state, index) => (
                    <div 
                      key={index}
                      className={`dropdown-item ${selectedState === state ? 'selected' : ''}`}
                      onClick={() => handleStateSelect(state)}
                    >
                      {state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* School Type Dropdown */}
            <div className="custom-select">
              <div 
                className="select-trigger"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <i className="fas fa-graduation-cap select-icon"></i>
                <span className="select-value">
                  {selectedType || 'All Types'}
                </span>
                <i className={`fas fa-chevron-down dropdown-arrow ${showTypeDropdown ? 'rotate' : ''}`}></i>
              </div>
              {showTypeDropdown && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item"
                    onClick={() => handleTypeSelect('')}
                  >
                    All Types
                  </div>
                  {schoolTypes.map((type, index) => (
                    <div 
                      key={index}
                      className={`dropdown-item ${selectedType === type ? 'selected' : ''}`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Info */}
      <section className="results-info">
        <div className="container">
          <p className="results-count">
            Found {filteredHostels.length} hostel{filteredHostels.length !== 1 ? 's' : ''}
            {selectedSchool && ` near ${selectedSchool}`}
            {selectedState && ` in ${selectedState}`}
            {selectedType && ` (${selectedType})`}
          </p>
        </div>
      </section>

      {/* Hostels Grid */}
      <section className="hostels-section">
        <div className="container">
          {filteredHostels.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-home no-results-icon"></i>
              <h3>No hostels found</h3>
              <p>Try adjusting your search criteria or check back later for new listings.</p>
            </div>
          ) : (
            <div className="hostels-grid">
              {filteredHostels.map((hostel) => (
                <div
                  key={hostel._id}
                  className="hostel-card"
                  onClick={() => handleHostelClick(hostel)}
                >
                  <div className="hostel-image">
                    {hostel.images && hostel.images.length > 0 ? (
                      <img
                        src={hostel.images[0]}
                        alt={hostel.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-home"></i>
                      </div>
                    )}
                    <div className="price-badge">
                      {formatPrice(hostel.price)}
                    </div>
                  </div>
                  
                  <div className="hostel-content">
                    <h3 className="hostel-name">{hostel.name}</h3>
                    <p className="hostel-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {hostel.location}
                    </p>
                    <p className="hostel-school">
                      <i className="fas fa-university"></i>
                      {hostel.school}
                    </p>
                    
                    <div className="hostel-features">
                      {hostel.amenities && hostel.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="feature-tag">
                          {amenity}
                        </span>
                      ))}
                      {hostel.amenities && hostel.amenities.length > 3 && (
                        <span className="feature-tag">
                          +{hostel.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="hostel-contact-preview">
                      <button
                        className="contact-btn whatsapp-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppClick(hostel.contact.whatsapp || hostel.contact.phone);
                        }}
                      >
                        <i className="fab fa-whatsapp"></i>
                        WhatsApp
                      </button>
                      <button
                        className="contact-btn call-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallClick(hostel.contact.phone);
                        }}
                      >
                        <i className="fas fa-phone"></i>
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="index-footer">
        <div className="container">
          <p>&copy; 2025 Hostel Finder. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && selectedHostel && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-header">
              <h2>{selectedHostel.name}</h2>
              <p className="modal-price">{formatPrice(selectedHostel.price)}</p>
            </div>

            <div className="modal-images">
              {selectedHostel.images && selectedHostel.images.length > 0 ? (
                <img src={selectedHostel.images[0]} alt={selectedHostel.name} className="main-image" />
              ) : (
                <div className="image-placeholder large">
                  <i className="fas fa-home"></i>
                </div>
              )}
            </div>

            <div className="modal-details">
              <div className="detail-section">
                <h3><i className="fas fa-info-circle"></i>Details</h3>
                <p>{selectedHostel.description}</p>
                <div className="detail-grid">
                  <div className="detail-item">
                    <i className="fas fa-university"></i>
                    <span>Institution: {selectedHostel.school}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Location: {selectedHostel.location}</span>
                  </div>
                </div>
              </div>

              {selectedHostel.amenities && selectedHostel.amenities.length > 0 && (
                <div className="detail-section">
                  <h3><i className="fas fa-star"></i>Amenities</h3>
                  <div className="amenities-grid">
                    {selectedHostel.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        <i className="fas fa-check"></i>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3><i className="fas fa-address-book"></i>Contact Information</h3>
                <div className="contact-grid">
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <span>{selectedHostel.contact.phone}</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>{selectedHostel.contact.email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{selectedHostel.contact.address}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><i className="fas fa-user-tie"></i>Agent Details</h3>
                <div className="agent-info">
                  <p><strong>Name:</strong> {selectedHostel.agent.name}</p>
                  <p><strong>Phone:</strong> {selectedHostel.agent.phone}</p>
                  <p><strong>Email:</strong> {selectedHostel.agent.email}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn whatsapp-btn" onClick={() => handleWhatsAppClick(selectedHostel.contact.whatsapp || selectedHostel.contact.phone)}>
                <i className="fab fa-whatsapp"></i>
                Contact on WhatsApp
              </button>
              <button className="action-btn call-btn" onClick={() => handleCallClick(selectedHostel.contact.phone)}>
                <i className="fas fa-phone"></i>
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;