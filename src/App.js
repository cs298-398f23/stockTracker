import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';
import SearchBar from './SearchBar';

function App() {
  const SERVER = 'http://localhost:3001'

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
    // Add a state to keep track of the interval ID
    const [intervalID, setIntervalID] = useState(null);

  useEffect(() => {
    // Clear the existing interval
    clearInterval(intervalID);
  
    // Set up a new interval with the updated activeTab value
    const newIntervalID = setInterval(() => {
      fetchGraphInfo(activeTab);
    }, 5000);
  
    // Save the new interval ID
    setIntervalID(newIntervalID);
  
    // Clear the interval when the component unmounts or when activeTab changes
    return () => clearInterval(newIntervalID);
  }, [activeTab]);
  

  

  useEffect(() => {

    console.log("Spotlighted Stock: ", spotlightedStock);
    fetchSpotlightedStock(spotlightedStock);
  }, [spotlightedStock]);

  useEffect(() => {
    const newIntervalID = setInterval(() => {

      fetchFavoriteStocks(username);
    }, 3000);

    return () => clearInterval(newIntervalID);
  }, [username]);


  useEffect(() => {
    if (username === "Guest") {
      updateFavoriteStocks(username, [{
        "name": "Alphabet Inc Class A",
        "ticker": "GOOGL",
      }]);
    }
    else {
      updateFavoriteStocks(username, favoriteStocks);
    }
  }, [favoriteStocks]);


  function checkLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    axios.get(`${SERVER}/api/validateUser`, { params: { username, password } }).then((response) => {
      console.log("True or false:")
      console.log(response.data)
      if (response.data) {
        setUsername(username);
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      }
      else {
        alert("Invalid Login");
      }
    });
  }

  function addUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    axios.get(`${SERVER}/api/addUser`, { params: { username, password } }).then((response) => {
      console.log(response.data)
      if (response.data) {
        setUsername(username);
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      }
      else {
        alert("Invalid Login");
      }
    });
  }


  function logout() {
    setUsername("Guest");
    setSpotlightedStock({
      "name": "Alphabet Inc Class A",
      "ticker": "GOOGL",
      "price": "",
      "changePercent": "",
      "changePrice": "",
    })
    setFavoriteStocks([{
      "name": "Alphabet Inc Class A",
      "ticker": "GOOGL",
    }]);
    setRequestedTicker("GOOGL");
  }

  function updateFavoriteStocks(username, favorites) {
    try {
      axios.get(`${SERVER}/api/updateFavoriteStocks`, { params: { username, favorites } }).then(() => { fetchFavoriteStocks(username); });
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  async function fetchGraphInfo(pageName) {
    try {
      const response = await axios.get(`${SERVER}/api/stocks`, { params: { pageName } });
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  async function fetchSpotlightedStock(stock) {
    try {
      const response = await axios.get(`${SERVER}/api/getSpotlightedStock`, { params: { stock } });

      console.log("Response: ", response.data.ticker, "Request:", requestedTicker);
      if (response.data.ticker === requestedTicker) {
        setSpotlightedStock((prevSpotlightedStock) => {
          // Use the previous state to avoid any race conditions
          if (prevSpotlightedStock.ticker === requestedTicker) {
            ;
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


  async function editFavorites(editOption, stock) {
    let stocks = [...favoriteStocks]
    const condensedStock = { "name": stock.name, "ticker": stock.ticker };
    console.log("Stocks: ", stocks);
    if (editOption && !favoriteStocks.some(favStock => favStock.ticker === stock.ticker)) {

      stocks.push(condensedStock);
    } else if (!editOption) {

      const indexToRemove = stocks.findIndex(favStock => favStock.ticker === stock.ticker);
      if (indexToRemove !== -1) {
        stocks.splice(indexToRemove, 1);
      }

      if (stocks.length === 0) {
        stocks.push({
          "name": "Alphabet Inc Class A",
          "ticker": "GOOGL",
        });
      }
    }


    setFavoriteStocks(stocks);

  }

  async function fetchFavoriteStocks(username) {
    try {
      const response = await axios.get(`${SERVER}/api/getFavoriteStocks`, { params: { username } });

      if (response.data.length === 0) {
        setFavoriteStocks([{
          "name": "Alphabet Inc Class A",
          "ticker": "GOOGL",
        }]);
      }
      else {
        setFavoriteStocks(response.data);
      }

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


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', height: '100vh' }}>
      {/* Left side (Stock Info) */}
      <div style={{ gridRow: '1', gridColumn: '1', flex: '1', overflow: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{username}</h1>
          <button
            id="logout"
            onClick={() => logout()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Logout
          </button>

        </div>

        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }}>

          <input
            id="username"
            type="text"
            placeholder="Username"
            style={{ padding: '8px', fontSize: '16px', margin: '10px 0', marginRight: '10px' }}
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            style={{ padding: '8px', fontSize: '16px', margin: '10px 0', marginRight: '10px' }}
          />

          <button
            id="login"
            onClick={() => checkLogin()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Login
          </button>


          <button
            id="addUser"
            onClick={() => addUser()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Register
          </button>


        </div>
        {/* SearchBar component goes here */}
        {spotlightedStock.changePercent !== "" ? <SearchBar setSpotlightedStock={setSpotlightedStock} setRequestedTicker={setRequestedTicker} fetchSpotlightedStock={fetchSpotlightedStock} /> : <div></div>}



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
              <h4 style={{ margin: '0', color: '#333', fontSize: '30px' }}>{spotlightedStock.name}</h4>
              <h3 style={{ margin: '5px 0', color: '#555', fontSize: '24px' }}>{spotlightedStock.ticker}</h3>
              <p style={{ margin: '15px 0', fontSize: '30px', fontWeight: 'bold', color: spotlightedStock.changePrice !== undefined ? (spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71') : '' }}>
                {spotlightedStock.price}
              </p>
              {spotlightedStock.changePercent && (
                <p style={{ margin: '5px 0', color: spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71', fontSize: '24px' }}>
                  {spotlightedStock.changePrice.includes('-') ? `-${spotlightedStock.changePercent}` : `+${spotlightedStock.changePercent}`}
                </p>
              )}
              {spotlightedStock.changePrice && (
                <p style={{ margin: '5px 0', color: spotlightedStock.changePrice.includes('-') ? '#e74c3c' : '#2ecc71', fontSize: '24px' }}>
                  {spotlightedStock.changePrice.includes('-') ? `-$${spotlightedStock.changePrice.split('-')[1]}` : `+$${spotlightedStock.changePrice.split('+')[1]}`}
                </p>
              )}
            </>
          )}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <div>
            <label htmlFor="dropdown" style={{ marginRight: '10px', fontSize: '20px' }}>Select Favorite Stock To View:</label>
            {favoriteStocks.length > 0 && favoriteStocks.map((stock, index) => (
              <button
                key={index}
                style={{
                  margin: '0 5px',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: spotlightedStock.ticker === stock.ticker ? '#eee' : '#fff',
                  border: '1px solid #ccc',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (stock && stock.ticker !== spotlightedStock.ticker) {
                    console.log("hits")
                    setSpotlightedStock(stock);
                    setRequestedTicker(stock.ticker); // Update requestedTicker if needed
                  }
                }}
              >
                {stock.name}: {stock.ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side (Graph, Buttons, Search Bar, and Table) */}
      <div style={{ gridRow: '1', gridColumn: '2', display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: 'auto auto auto', gap: '20px', padding: '20px' }}>
        {/* Graph */}
        <canvas id="myBarChart" style={{ gridRow: '1', gridColumn: '1', width: '100%', height: '100%', maxHeight: '50vh' }}></canvas>

        {/* Buttons */}
        <div style={{ gridRow: '2', gridColumn: '1', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>

          <button
            id="gainers"
            onClick={() => handleTabClick('gainers')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'Green',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              marginRight: '10px',
            }}
          >
            Gainers
          </button>
          <button
            id="losers"
            onClick={() => handleTabClick('losers')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'Red',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              marginRight: '10px',
            }}
          >
            Losers
          </button>
          <button
            id="active"
            onClick={() => handleTabClick('most-active')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: 'Orange',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Most Active
          </button>


        </div>

        {/* Table */}
        <div style={{ gridRow: '3', gridColumn: '1', textAlign: 'center' }}>
          <table style={{ margin: '10px auto', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#333', width: '100%' }}>
            <thead style={{ background: '#f2f2f2' }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>Ticker</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>Stock Name</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>Stock Price</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>% Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>{stock.ticker}</td>
                  <td style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>{stock.name}</td>
                  <td style={{ padding: '10px', textAlign: 'left', fontSize: '16px' }}>{stock.price}</td>
                  <td style={{ padding: '10px', textAlign: 'left', fontSize: '16px', color: stock.change.includes('-') ? 'red' : 'green' }}>
                    {stock.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );

}

export default App;
