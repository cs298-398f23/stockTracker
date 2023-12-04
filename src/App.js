import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import SearchBar from './SearchBar';

function App() {
  const [activeTab, setActiveTab] = useState('gainers');
  const [spotlightedStock, setSpotlightedStock] = useState({
    "name": "Alphabet Inc Class A",
    "ticker": "GOOGL",
    "price": "",
    "changePercent": "",
    "changePrice": "",
  });
  // const [spotlightedStockInfo, setSpotlightedStockInfo] = useState({});
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const newIntervalID = setInterval(() => {
      fetchGraphInfo(activeTab);
    }, 5000);

    return () => clearInterval(newIntervalID);
  }, [activeTab]);

  useEffect(() => {
    fetchSpotlightedStock(spotlightedStock);
  }, [spotlightedStock]);

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
      if (response.data.newStock === undefined) {
        setSpotlightedStock(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', height: '100vh' }}>
      {/* Left side (Stock Info) */}
      <div style={{ gridRow: '1', gridColumn: '1', flex: '1', overflow: 'auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          {spotlightedStock ? (
            <>
              <h3 style={{ margin: '0' }}>{spotlightedStock.name}</h3>
              <h4 style={{ margin: '5px 0' }}>{spotlightedStock.ticker}</h4>

              <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: spotlightedStock.changePrice !== undefined ? (spotlightedStock.changePrice.includes('-') ? 'red' : 'green') : '' }}>
                {spotlightedStock.price}
              </p>
              <p style={{ margin: '5px 0', color: spotlightedStock.changePrice.includes('-') ? 'red' : 'green' }}>
                {spotlightedStock.changePercent}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px', color: spotlightedStock.changePrice.includes('-') ? 'red' : 'green' }}>
                {spotlightedStock.changePrice}
              </p>
            </>
          ) : (
            <h3>Loading...</h3>
          )}
        </div>
        {spotlightedStock.changePercent !== "" ? <SearchBar setSpotlightedStock={setSpotlightedStock} /> : <div></div>}
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


export default App;
