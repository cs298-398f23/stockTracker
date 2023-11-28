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

return (
  <div style={{ display: 'flex' }}>
    {/* Left side */}
    <div style={{ flex: 1 }}>
      
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

    <div div style={{ flex: 1 }}>
        <div>
        <button id="gainers" onClick={() => setPage('gainers')}>Gainers</button>
        <button id="losers" onClick={() => setPage('losers')}>Losers</button>
        <button id="active" onClick={() => setPage('most-active')}>Most Active</button>
        <canvas id="myBarChart"></canvas>
      </div>
        <div style={{ margin: '20px', textAlign: 'center' }}>
        <tbody style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#333' }}>
          <tr style={{ background: '#f2f2f2' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Ticker</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Stock Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Stock Price</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>% Change</th>
          </tr>
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
</div>

     </div>
      
    </div>
  </div>
);

}

export default App;
