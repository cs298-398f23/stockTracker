import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import SearchBar from './SearchBar';

function App() {
  const [activeTab, setActiveTab] = useState('gainers');
  const [requestedTicker, setRequestedTicker] = useState('GOOGL')
  const [spotlightedStock, setSpotlightedStock] = useState({
    "name": "Alphabet Inc Class A",
    "ticker": "GOOGL",
    "price": "",
    "changePercent": "",
    "changePrice": "",
  });
  // const [spotlightedStockInfo, setSpotlightedStockInfo] = useState({});
  const [stocks, setStocks] = useState([]);
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [username, setUsername] = useState("Guest");

  useEffect(() => {
    const newIntervalID = setInterval(() => {
      fetchGraphInfo(activeTab);
    }, 5000);

    return () => clearInterval(newIntervalID);
  }, [activeTab]);

  useEffect(() => {
    
      fetchSpotlightedStock(spotlightedStock);
  }, [spotlightedStock]);

  useEffect(() => {
    const newIntervalID = setInterval(() => {
      
    fetchFavoriteStocks(username);
    }, 3000);

    return () => clearInterval(newIntervalID);
  }, [username]);
  

  

  useEffect(() => {
    if(username === "Guest"){
    updateFavoriteStocks(username, [{"name": "Alphabet Inc Class A",
    "ticker": "GOOGL",}]);
    }
  }, []);

  // useEffect(() => {
  //   fetchFavoriteStocks(username);
  //   // fetchSpotlightedStock({"ticker": "GOOGL"})
  // } , [username]);


  function updateFavoriteStocks(username, favorites) {
    try {
      console.log(favorites)
      axios.get('http://localhost:3001/api/updateFavoriteStocks', { params: { username, favorites } }).then(() => {fetchFavoriteStocks(username);});
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  async function fetchGraphInfo(pageName) {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks', { params: { pageName } });
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  async function fetchSpotlightedStock(stock) {
    try {
      const response = await axios.get('http://localhost:3001/api/getSpotlightedStock', { params: { stock } });
  
      console.log("Response: ", response.data.ticker, "Request:", requestedTicker);
      if (response.data.ticker === requestedTicker) {
        setSpotlightedStock((prevSpotlightedStock) => {
          // Use the previous state to avoid any race conditions
          if (prevSpotlightedStock.ticker === requestedTicker) {
            return response.data;
          } else {
            // If the requestedTicker has changed in the meantime, do not update the state
            return prevSpotlightedStock;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }
  

  async function editFavorites (editOption, stock) {
    let stocks = [...favoriteStocks]
    const condensedStock = {"name": stock.name, "ticker": stock.ticker};
    if(editOption && !Object.keys(favoriteStocks[0]).includes(stock.ticker)){
      
      stocks.push(condensedStock);
    }
    else{
      //figure this out
      const index = favoriteStocks.indexOf(condensedStock.ticker);
      stocks.pop(index);
      if(stocks.length === 0){
        stocks.push({ "name": "Alphabet Inc Class A",
        "ticker": "GOOGL",})

      }
    }
    
    updateFavoriteStocks(username, stocks);

  }

  async function fetchFavoriteStocks (username) {
    try {
      const response = await axios.get('http://localhost:3001/api/getFavoriteStocks', { params: { username } });

      console.log(response.data);
      setFavoriteStocks(response.data);
      
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  // Extract stock change values for the bar chart
  const stockChangeValues = stocks.map(stock => parseFloat(stock.change.replace('%', '')));

  // Create a bar chart when stockChangeValues change
  useEffect(() => {
     // Get the canvas element
    const ctx = document.getElementById('myBarChart').getContext('2d');

    // Create a bar chart
    const myBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stocks.map((stock) => `${stock.ticker}`),
        datasets: [{
          label: 'Top 10 Stock Change %)',
          data: stockChangeValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

  // Cleanup function to destroy the chart when the component unmounts
  return () => myBarChart.destroy();
}, [stockChangeValues]);

const handleTabClick = (tab) => {
  setActiveTab(tab);
};
const handleSelectChange = (e) => {
  const selectedTicker = e.target.value;
  console.log(selectedTicker);
  const selectedStock = favoriteStocks.find((stock) => {
    console.log(stock, stock.ticker)
    return stock.ticker === selectedTicker});
  console.log(selectedStock);

  // Check if the selected stock is different from the current spotlightedStock
  if (selectedStock && selectedStock.ticker !== spotlightedStock.ticker) {
    setSpotlightedStock(selectedStock);
    setRequestedTicker(selectedStock.ticker); // Update requestedTicker if needed
  }
};


return (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', height: '100vh' }}>
    {/* Left side (Stock Info) */}
    <div style={{ gridRow: '1', gridColumn: '1', flex: '1', overflow: 'auto', padding: '20px' }}>
      {/* Your existing stock info code */}
      <div style={{ gridRow: '4', gridColumn: '1', textAlign: 'center', display: 'flex', alignItems: 'center' }}>
  {spotlightedStock.changePercent !== "" ? <SearchBar setSpotlightedStock={setSpotlightedStock} setRequestedTicker={setRequestedTicker} fetchSpotlightedStock={fetchSpotlightedStock}/> : <div></div>}
  
  {/* Add some space */}
  <div style={{ marginLeft: 'auto' }}>
    <label htmlFor="dropdown" style={{ marginRight: '10px' }}>Select Favorite Stock To View:</label>
    <select id="dropdown" style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '14px' }}
    onChange={(e) => handleSelectChange(e)}
    value={spotlightedStock.ticker}>
      {console.log(favoriteStocks)}
      {favoriteStocks.length > 0 && favoriteStocks.map((stock, index) =>(
      <option value={stock.ticker} selected={spotlightedStock.ticker === stock.ticker}>{stock.name}: {stock.ticker}</option>))}
      {/* Add more options as needed */}
    </select>
  </div>
</div>

<div style={{ textAlign: 'center', marginTop: '10px' }}>
  <button
    onClick={() => editFavorites(true, spotlightedStock)}
    style={{
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      backgroundColor: '#2ecc71',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    }}
  >
    Add to Favorites +
  </button>
  <button
    onClick={() => editFavorites(false, spotlightedStock)}
    style={{
      padding: '10px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
       marginLeft: '10px', 
       backgroundColor: '#e74c3c' 
    }}
  >
    Remove from Favorites -
  </button>
</div>

      <div style={{
  textAlign: 'center',
  border: '1px solid #eaeaea',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#f9f9f9',
  maxWidth: '300px',
  margin: 'auto',
}}>
  {spotlightedStock.name && (
    <>
      <h3 style={{ margin: '0', color: '#333', fontSize: '24px' }}>{spotlightedStock.name}</h3>
      <h4 style={{ margin: '5px 0', color: '#555', fontSize: '18px' }}>{spotlightedStock.ticker}</h4>
      <p style={{ margin: '15px 0', fontSize: '22px', fontWeight: 'bold', color: spotlightedStock.changePrice !== undefined ? (spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71') : '' }}>
        {spotlightedStock.price}
      </p>
      {spotlightedStock.changePercent && (
        <p style={{ margin: '5px 0', color: spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71', fontSize: '16px' }}>
          {spotlightedStock.changePercent}
        </p>
      )}
      {spotlightedStock.changePrice && (
        <p style={{ margin: '5px 0', color: spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71', fontSize: '16px' }}>
          {spotlightedStock.changePrice}
        </p>
      )}
    </>
  )}
</div>


    </div>
    

      {/* Right side (Graph, Buttons, Search Bar, and Table) */}
      <div style={{ gridRow: '1', gridColumn: '2', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'auto auto auto', gap: '20px', padding: '20px' }}>
        {/* Graph */}
        <canvas id="myBarChart" style={{ gridRow: '1', gridColumn: '1', width: '100%', height: '100%', maxHeight: '50vh' }}></canvas>

        {/* Buttons */}
        <div style={{ gridRow: '2', gridColumn: '1', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button id="gainers" onClick={() => handleTabClick('gainers')} className={activeTab === 'gainers' ? 'active' : ''}>Gainers</button>
          <button id="losers" onClick={() => handleTabClick('losers')} className={activeTab === 'losers' ? 'active' : ''}>Losers</button>
          <button id="active" onClick={() => handleTabClick('most-active')} className={activeTab === 'most-active' ? 'active' : ''}>Most Active</button>
        </div>

        {/* Table */}
        <div style={{ gridRow: '3', gridColumn: '1', textAlign: 'center' }}>
          <table style={{ margin: '10px auto', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#333', width: '100%' }}>
            <thead style={{ background: '#f2f2f2' }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left' }}>Ticker</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Stock Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Stock Price</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>% Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', textAlign: 'left' }}>{stock.ticker}</td>
                  <td style={{ padding: '10px', textAlign: 'left' }}>{stock.name}</td>
                  <td style={{ padding: '10px', textAlign: 'left' }}>{stock.price}</td>
                  <td style={{ padding: '10px', textAlign: 'left', color: stock.change.includes('-') ? 'red' : 'green' }}>
                    {stock.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
