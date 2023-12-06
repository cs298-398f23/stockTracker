import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SearchBar = ({ setSpotlightedStock, setRequestedTicker }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allOptions, setAllOptions] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (input.length === 0) {
      setCurrentOptions([]);
      return;
    }

    // Filter options based on the input
    const filtered = Object.keys(allOptions).filter((option) =>
      option.toLowerCase().includes(input.toLowerCase()) ||
      allOptions[option].toLowerCase().includes(input.toLowerCase())
    );
    setCurrentOptions(filtered);
  };

  async function fetchCompanies() {
    try {
      const response = await axios.get('http://localhost:3001/api/getAllNasdaq');
      setAllOptions(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        style={{
          padding: '8px',
          fontSize: '16px',
          margin: '10px 0',
        }}
      />
      {currentOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            background: '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1,
          }}
        >
          {currentOptions.slice(0, 10).map((option, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => {
                  console.log(option);
                  setSpotlightedStock({
                    ticker: option,
                    name: allOptions[option],
                    price: '',
                    changePrice: '',
                    changePercent: '',
                  });
                  setRequestedTicker(option);
                  setSearchTerm('');
                  setCurrentOptions([]);
                }}
                style={{
                  padding: '5px 10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid #1111',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#007bff',
                }}
              >
                {allOptions[option]}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
