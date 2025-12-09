// components/SectorDropdown.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Configuration (Adjust API_URL as necessary) ---
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'; // Assuming a typical Node/Express API port

/**
 * Fetches all unique sectors from the backend.
 * This calls the newly defined GET /sectors endpoint.
 */
const fetchAllSectors = async () => {
  // NOTE: Assuming your token is stored in localStorage or handled by an interceptor,
  // as the backend route requires requireAuth.
  const token = localStorage.getItem('token'); 
  const response = await axios.get(`${API_URL}/sectors`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // The backend returns an array of strings (sector names)
  return response.data; 
};


const SectorDropdown = ({ onSelectSector }) => {
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('All');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const data = await fetchAllSectors();
        setSectors(data);
      } catch (err) {
        console.error("Failed to load sectors:", err.response?.data || err.message);
        setError("Failed to load sectors.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSectors();
  }, []);

  const handleSelection = (sector) => {
    setSelectedSector(sector);
    onSelectSector(sector); // Notifies the parent component (e.g., PathwaysPage)
    setIsOpen(false);
  };

  // The list includes the static 'All' option, followed by the fetched sectors.
  const allOptions = ['All', ...sectors];

  if (isLoading) {
    return <div className="sector-dropdown-container">Loading Sectors...</div>;
  }

  if (error) {
    return <div className="sector-dropdown-container error">Error loading filter.</div>;
  }
  
  return (
    <div className="sector-dropdown-container">
      <h3>Sector</h3>
      
      {/* Current selection display */}
      <div 
        className="dropdown-display" 
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        {selectedSector}
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}>
            {/* Simple Unicode arrow for visual cue */}
            {isOpen ? '▲' : '▼'} 
        </span>
      </div>

      {/* Dropdown list that mimics your screenshot's style */}
      {isOpen && (
        <div className="dropdown-list">
          {allOptions.map((sector) => (
            <div
              key={sector}
              className={`dropdown-item ${sector === selectedSector ? 'selected' : ''}`}
              onClick={() => handleSelection(sector)}
            >
              {sector === selectedSector && <span className="check-mark">✓</span>}
              {sector}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectorDropdown;