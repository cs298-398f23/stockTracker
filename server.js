const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3001;

const client = redis.createClient();


app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/stocks', async (req, res) => {
  try {
    // Replace the URL with the actual URL you want to fetch data from
    const url = `https://www.google.com/finance/markets/${req.query.pageName}`;
    const response = await axios.get(url);

    
    // Use cheerio to parse HTML response
    const $ = cheerio.load(response.data);

    // Extract the data you need using cheerio selectors
    const stocks = [];
    $('.Sy70mc li').each((index, element) => {
      
      if (index < 10)  // Limit to 10 results (top 10 stocks
      {
        const name = $(element).find('.COaKTb').text().trim();
        const change = $(element).find('.JwB6zf').text().trim();
        stocks.push({ name, change });
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

app.get('/api/getFavorites', (req, res) => {
  // Assuming ticker.redis is in the same format as your example
  const tickers = ['AAPL', 'ADBE', 'AMZN', 'CZR', 'DLTR', 'DNKN', 'DTV', 'EBAY', 'FB', 'MSFT'];
  const favorites = {};

  // Retrieve data from Redis for each ticker
  tickers.forEach(ticker => {
    client.hgetall(ticker, (err, data) => {
      if (err) {
        console.error(`Error fetching data for ${ticker} from Redis:`, err.message);
      } else {
        favorites[ticker] = data;
      }

      // Check if all tickers have been processed
      if (Object.keys(favorites).length === tickers.length) {
        res.json(favorites);
      }
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
