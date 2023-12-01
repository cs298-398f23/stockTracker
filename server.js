const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const redis = require('redis');
const puppeteer = require('puppeteer');

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

app.get('/api/getAllNasdaq', async (req, res) => {
  
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

app.get('/api/getSpotlightedStock', async (req, res) => {
  try {
    let requestStock = req.query.stock;
    let requestTicker = requestStock.ticker;

    console.log("----------------------");
    console.log("99 - Request Stock: " +  requestTicker);
    console.log(requestStock);
    console.log("----------------------");
    
    if (requestTicker === '') {
      requestTicker = 'GOOGL';
    }
    
    console.log("103 - Stock Ticker: " + requestTicker);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `https://www.google.com/finance/quote/${requestTicker}:NASDAQ`;
    await page.goto(url);
    console.log(url)
    // Use Puppeteer to wait for the element with class 'JwB6zf'
    await page.waitForSelector('.enJeMd');

    // Extract data from the page
    let stockInfo = {};
    stockInfo.name = await page.$eval('.zzDege', element => element.textContent.trim());

    let ticker = await page.$eval('.PdOqHc', element => element.textContent.trim());
    stockInfo.ticker = ticker.split('Home')[1].split('•')[0].trim();
    stockInfo.price = await page.$eval('.YMlKec.fxKbKc', element => element.textContent.trim());

    const changeElement = await page.$('.enJeMd');
    stockInfo.changePrice = await changeElement.$eval('.P2Luy', element => element.textContent.trim());
    stockInfo.changePercent = await changeElement.$eval('.JwB6zf', element => element.textContent.trim());

  

    console.log("11111 - Response: ");
    console.log(stockInfo);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~ ");

    if (requestStock.ticker !== stockInfo.ticker || requestStock.price !== stockInfo.price) {
      console.log("New Stock:");
      console.log(stockInfo);
      res.json(stockInfo);
    } else {
      console.log("OLD STOCK");
      res.json({ "newStock": "false" });
    }

    console.log("~~~~~~~~~~~~~~~~~~~~~~~~ ");
    await browser.close();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
