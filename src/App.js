import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';


function App() {
  const [page, setPage] = useState('gainers');
  const [stocks, setStocks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  // const [intervalID, setIntervalID] = useState(setInterval(fetchData(page)))


  useEffect(() => {

    const newIntervalID = setInterval(() => {
      fetchData(page);
    }, 5000);

    // Clear the interval when the component unmounts or when the page changes
    return () => clearInterval(newIntervalID);
    
    
  }, [page]);

  useEffect(() => {
    fetchFavorites();
  }, []);


    


  async function fetchData (pageName) {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks', { params: { pageName } });
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };


  async function fetchFavorites () {
    try {
      const response = await axios.get('http://localhost:3001/api/getFavorites');
      setFavorites(response.data);
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
      labels: stocks.map((stock) => `${stock.name}`),
      datasets: [{
        label: 'Stock Change (%)',
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

return (
  <div style={{ display: 'flex' }}>
    {/* Left side */}
    <div style={{ flex: 1 }}>
      <h1>Stocks</h1>
      <button id="gainers" onClick={() => setPage('gainers')}>Gainers</button>
      <button id="losers" onClick={() => setPage('losers')}>Losers</button>
      <button id="active" onClick={() => setPage('most-active')}>Most Active</button>
      <tbody>
        <tr>
          <th>Stock Name</th>
          <th>Change</th>
        </tr>
        {stocks.map((stock, index) => (
          <tr key={index}>
            <td>{stock.name}</td>
            <td>{stock.change}</td>
          </tr>
        ))}
      </tbody>
      <button id="favorites" onClick={() => setShowFavorites(!showFavorites)}>
        Show Favorites
      </button>

      {showFavorites && (
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Favorite Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(favorites).map((ticker) => (
              <tr key={ticker}>
                <td>{ticker}</td>
                <td>{favorites[ticker]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* Right side */}
    <div style={{ flex: 1 }}>
      <canvas id="myBarChart"></canvas>
    </div>
  </div>
);

}

export default App;
