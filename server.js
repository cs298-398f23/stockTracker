const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
