import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/agent.css';

interface HostelAd {
  _id?: string;
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
  createdAt?: string;
}

const Agent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'profile'>('create');
  const [ads, setAds] = useState<HostelAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAd, setEditingAd] = useState<HostelAd | null>(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<HostelAd>({
    name: '',
    school: '',
    location: '',
    price: '',
    description: '',
    contact: {
      phone: '',
      whatsapp: '',
      email: '',
      address: ''
    },
    agent: {
      name: '',
      phone: '',
      email: ''
    },
    images: [],
    amenities: []
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [amenityInput, setAmenityInput] = useState('');

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
    'Federal College of Education (Technical), Akoka'
  ];

  useEffect(() => {
    fetchAgentAds();
    // Get agent info from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      agent: {
        name: user.fullName || '',
        phone: user.phone || '',
        email: user.email || ''
      }
    }));
  }, []);

  const fetchAgentAds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agent/ads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + imageFiles.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }

    const newFiles = files.slice(0, 5 - imageFiles.length);
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create preview URLs
    const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImageUrls]
    }));
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      // Append form data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('school', formData.school);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('contact', JSON.stringify(formData.contact));
      formDataToSend.append('agent', JSON.stringify(formData.agent));
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));

      // Append images
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const url = editingAd 
        ? `http://localhost:5000/api/agent/ads/${editingAd._id}`
        : 'http://localhost:5000/api/agent/ads';

      const response = await fetch(url, {
        method: editingAd ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        // const result = await response.json();
        showAlert(editingAd ? 'Ad updated successfully!' : 'Ad created successfully!');
        
        // Reset form
        setFormData({
          name: '',
          school: '',
          location: '',
          price: '',
          description: '',
          contact: {
            phone: '',
            whatsapp: '',
            email: '',
            address: ''
          },
          agent: {
            name: formData.agent.name,
            phone: formData.agent.phone,
            email: formData.agent.email
          },
          images: [],
          amenities: []
        });
        setImageFiles([]);
        setEditingAd(null);
        
        // Refresh ads list
        fetchAgentAds();
        setActiveTab('profile');
      } else {
        throw new Error('Failed to save ad');
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      showAlert('Error saving ad. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad: HostelAd) => {
    setEditingAd(ad);
    setFormData(ad);
    setImageFiles([]); // Clear image files since we're using existing images
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (adId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agent/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showAlert('Ad deleted successfully!');
        fetchAgentAds();
      } else {
        throw new Error('Failed to delete ad');
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      showAlert('Error deleting ad. Please try again.', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingAd(null);
    setFormData({
      name: '',
      school: '',
      location: '',
      price: '',
      description: '',
      contact: {
        phone: '',
        whatsapp: '',
        email: '',
        address: ''
      },
      agent: {
        name: formData.agent.name,
        phone: formData.agent.phone,
        email: formData.agent.email
      },
      images: [],
      amenities: []
    });
    setImageFiles([]);
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.style.position = 'fixed';
    alertBox.style.top = '20px';
    alertBox.style.right = '20px';
    alertBox.style.padding = '15px 20px';
    alertBox.style.fontFamily = 'Poppins, sans-serif';
    alertBox.style.fontSize = '14px';
    alertBox.style.fontWeight = '500';
    alertBox.style.color = '#333';
    alertBox.style.background = '#fff';
    alertBox.style.borderLeft = `5px solid ${type === 'error' ? '#f44336' : '#4CAF50'}`;
    alertBox.style.borderRadius = '8px';
    alertBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    alertBox.style.zIndex = '9999';
    alertBox.style.opacity = '0';
    alertBox.style.transform = 'translateX(100%)';
    alertBox.style.transition = 'all 0.4s ease';

    document.body.appendChild(alertBox);

    requestAnimationFrame(() => {
      alertBox.style.opacity = '1';
      alertBox.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      alertBox.style.opacity = '0';
      alertBox.style.transform = 'translateX(100%)';
      setTimeout(() => alertBox.remove(), 400);
    }, 3000);
  };

  return (
    <div className="agent-container">
      {/* Header */}
      <header className="agent-header">
        <div className="header-content">
          <h1 className="agent-logo">
            <i className="fas fa-user-tie"></i>
            Agent Dashboard
          </h1>
          <nav className="agent-nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/home')}
            >
              <i className="fas fa-home"></i>
              Home
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

      {/* Main Content */}
      <main className="agent-main">
        <div className="container">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <i className="fas fa-plus"></i>
              {editingAd ? 'Edit Ad' : 'Create New Ad'}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-th-list"></i>
              My Ads ({ads.length})
            </button>
          </div>

          {/* Create/Edit Ad Form */}
          {activeTab === 'create' && (
            <div className="form-section">
              <h2>{editingAd ? 'Edit Hostel Ad' : 'Create New Hostel Ad'}</h2>
              
              <form onSubmit={handleSubmit} className="ad-form">
                {/* Basic Information */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hostel Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter hostel name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Institution *</label>
                    <select
                      value={formData.school}
                      onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                      required
                    >
                      <option value="">Select Institution</option>
                      {nigerianInstitutions.map((institution, index) => (
                        <option key={index} value={institution}>{institution}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter full address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., 500K, ₦200,000"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the hostel, facilities, rules, etc."
                    rows={4}
                    required
                  />
                </div>

                {/* Contact Information */}
                <div className="form-section-title">
                  <i className="fas fa-address-book"></i>
                  Contact Information
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      placeholder="Your phone number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.contact.whatsapp}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, whatsapp: e.target.value }
                      }))}
                      placeholder="WhatsApp number (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      placeholder="Your email address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Address *</label>
                    <input
                      type="text"
                      value={formData.contact.address}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, address: e.target.value }
                      }))}
                      placeholder="Complete address for visitors"
                      required
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="form-section-title">
                  <i className="fas fa-star"></i>
                  Amenities
                </div>
                <div className="amenities-section">
                  <div className="amenity-input-group">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      placeholder="Add amenity (e.g., WiFi, Parking, AC)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    />
                    <button type="button" onClick={addAmenity} className="add-amenity-btn">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="amenities-list">
                    {formData.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        {amenity}
                        <button type="button" onClick={() => removeAmenity(index)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-section-title">
                  <i className="fas fa-images"></i>
                  Hostel Images (Max 5)
                </div>
                <div className="image-upload-section">
                  <div className="image-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-input"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="upload-label">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>Click to upload images</span>
                      <small>Maximum 5 images allowed</small>
                    </label>
                  </div>
                  
                  <div className="image-preview-grid">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          className="remove-image-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <div className="image-number">{index + 1}</div>
                      </div>
                    ))}
                  </div>
                  <div className="image-count">
                    {formData.images.length} / 5 images selected
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  {editingAd && (
                    <button type="button" onClick={cancelEdit} className="cancel-btn">
                      <i className="fas fa-times"></i>
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {editingAd ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        {editingAd ? 'Update Ad' : 'Create Ad'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Profile/My Ads Section */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>My Hostel Ads</h2>
              
              {ads.length === 0 ? (
                <div className="no-ads">
                  <i className="fas fa-home no-ads-icon"></i>
                  <h3>No Ads Created Yet</h3>
                  <p>Start by creating your first hostel advertisement to reach students.</p>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="create-first-ad-btn"
                  >
                    <i className="fas fa-plus"></i>
                    Create Your First Ad
                  </button>
                </div>
              ) : (
                <div className="ads-grid">
                  {ads.map((ad) => (
                    <div key={ad._id} className="ad-card">
                      <div className="ad-image">
                        {ad.images && ad.images.length > 0 ? (
                          <img src={ad.images[0]} alt={ad.name} />
                        ) : (
                          <div className="image-placeholder">
                            <i className="fas fa-home"></i>
                          </div>
                        )}
                        <div className="ad-price">{ad.price}</div>
                      </div>
                      
                      <div className="ad-content">
                        <h3 className="ad-name">{ad.name}</h3>
                        <p className="ad-location">
                          <i className="fas fa-map-marker-alt"></i>
                          {ad.location}
                        </p>
                        <p className="ad-school">
                          <i className="fas fa-university"></i>
                          {ad.school}
                        </p>
                        
                        <div className="ad-amenities">
                          {ad.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="amenity-tag small">
                              {amenity}
                            </span>
                          ))}
                          {ad.amenities.length > 3 && (
                            <span className="amenity-tag small">
                              +{ad.amenities.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="ad-actions">
                          <button 
                            onClick={() => handleEdit(ad)}
                            className="edit-btn"
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(ad._id!)}
                            className="delete-btn"
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </div>

                        <div className="ad-status">
                          <span className="status-badge">
                            <i className="fas fa-circle"></i>
                            Active
                          </span>
                          <span className="ad-date">
                            Created: {new Date(ad.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Agent;