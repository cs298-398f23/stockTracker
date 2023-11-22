import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';


function App() {
  const [page, setPage] = useState('gainers');
  const [stocks, setStocks] = useState([]);
  // const [intervalID, setIntervalID] = useState(setInterval(fetchData(page)))


  useEffect(() => {

    const newIntervalID = setInterval(() => {
      fetchData(page);
    }, 5000);

    // Clear the interval when the component unmounts or when the page changes
    return () => clearInterval(newIntervalID);
    
    
  }, [page]);


  async function fetchData (pageName) {
    try {
      const response = await axios.get('http://localhost:3001/api/stocks', { params: { pageName } });
      setStocks(response.data);
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
    <div>
      <h1>Stocks</h1>
      <button id="gainers" onClick={() => {
        setPage('gainers')
        }}>Gainers</button>
      <button id="losers" onClick={() => {
        setPage('losers')
        }}>Losers</button>
      <button id="active" onClick={() => {
        setPage('most-active')
        }}>Most Active</button>
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
      <canvas id="myBarChart"></canvas>
    </div>
  );
}

export default App;
