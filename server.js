const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3001;




app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/stocks', async (req, res) => {
  try {
    // Google finance page you want to fetch data from
    const pageName = req.query.pageName;
    const url = `https://www.google.com/finance/markets/${pageName}`;
    const response = await axios.get(url);

    
    // Use cheerio to parse HTML response
    const $ = cheerio.load(response.data);

    // Extract the data you need using cheerio selectors
    const stocks = [];
    $('.Sy70mc li').each((index, element) => {
      
      if (index < 10)  // Limit to 10 results (top 10 stocks
      {
        const name = $(element).find('.ZvmM7').text().trim();
        const ticker = $(element).find('.COaKTb').text().trim();
        
        const price = $(element).find('.P2Luy').text()
        const sign = price.split('$')[0]
        const change = sign + $(element).find('.JwB6zf').text().trim() ;
        
        
        stocks.push({ pageName, name, ticker, price, change });
      } else {
          return false;
      }

    });
    
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/getFavorites', async (req, res) => {
  
  const favorites = {};

  const client = redis.createClient();

  try {
    await client.connect();

    const tickers = [];

  // Get all keys
  await client.keys('*').then((keys) => {
      tickers.push(...keys);

    })

    // Create an array of promises for each ticker
    const promises = tickers.map(async (ticker) => {
      const company = await client.get(ticker);
      favorites[ticker] = company;
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json(favorites);
  } 
  catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } 
  finally {
    // Close the Redis client
    client.quit();
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
