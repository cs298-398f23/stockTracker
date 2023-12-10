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

// Function to fetch stock data from Google Finance
async function fetchStockData(req, res) {
  try {
    const pageName = req.query.pageName;
    const url = `https://www.google.com/finance/markets/${pageName}`;
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const stocks = [];

    $('.Sy70mc li').each((index, element) => {
      if (index < 10) {
        const name = $(element).find('.ZvmM7').text().trim();
        const ticker = $(element).find('.COaKTb').text().trim();
        const price = $(element).find('.P2Luy').text();
        const sign = price.split('$')[0];
        const change = sign + $(element).find('.JwB6zf').text().trim();

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
}

// Function to get all NASDAQ stocks from Redis
async function getAllNasdaq(req, res) {
  const stocks = {};
  const client = redis.createClient();

  try {
    await client.connect();
    const tickers = [];

    await client.keys('NASDAQ:*').then((keys) => {
      tickers.push(...keys);
    });

    const promises = tickers.map(async (ticker) => {
      const stock = await client.get(ticker);
      const stockInfo = JSON.parse(stock);
      stocks[stockInfo.ticker] = stockInfo.name;
    });

    await Promise.all(promises);

    res.json(stocks);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    client.quit();
  }
}

// Function to get spotlighted stock data using Puppeteer
async function getSpotlightedStock(req, res) {
  try {
    const requestStock = req.query.stock;
    const requestTicker = requestStock.ticker;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const url = `https://www.google.com/finance/quote/${requestTicker}:NASDAQ`;
    await page.goto(url);
    await page.waitForSelector('.enJeMd');

    const stockInfo = {};
    stockInfo.name = await page.$eval('.zzDege', (element) => element.textContent.trim());
    stockInfo.ticker = (await page.$eval('.PdOqHc', (element) => element.textContent.trim()))
      .split('Home')[1]
      .split('•')[0]
      .trim();
    stockInfo.price = await page.$eval('.YMlKec.fxKbKc', (element) => element.textContent.trim());

    const changeElement = await page.$('.enJeMd');
    stockInfo.changePrice = await changeElement.$eval('.P2Luy', (element) => element.textContent.trim());
    stockInfo.changePercent = await changeElement.$eval('.JwB6zf', (element) => element.textContent.trim());

    res.json(stockInfo);

    await browser.close();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  }
}

// Function to get favorite stocks from Redis
async function getFavoriteStocks(req, res) {
  const client = redis.createClient();

  try {
    await client.connect();

    await client.get(`${req.query.username}:favorites`).then((stock) => {
      res.json(JSON.parse(stock));
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    client.quit();
  }
}

// Function to update favorite stocks in Redis
async function updateFavoriteStocks(req, res) {
  const favorites = req.query.favorites;
  const client = redis.createClient();

  try {
    await client.connect();
    const serializedCompanyInfo = JSON.stringify(favorites);
    const prefixedKey = req.query.username + ":favorites";

    client.set(prefixedKey, serializedCompanyInfo, (err) => {
      if (err) {
        console.error(`Error setting data for ${prefixedKey}:`, err.message);
      } else {
        console.log(`Data set for ${prefixedKey}: ${serializedCompanyInfo}`);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    client.quit();
  }
}

// Function to add a new user to Redis
async function addUser(req, res) {
  const client = redis.createClient();

  try {
    await client.connect();
    const prefixedKey = req.query.username;

    client.set(prefixedKey, req.query.password, (err) => {
      if (err) {
        console.error(`Error setting data for ${prefixedKey}:`, err.message);
      } else {
        console.log(`Data set for ${prefixedKey}`);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    client.quit();
  }
}

// Function to validate a user in Redis
async function validateUser(req, res) {
  const client = redis.createClient();

  try {
    await client.connect();
    const prefixedKey = req.query.username;

    await client.get(prefixedKey).then((reply) => {
      if (reply && reply === req.query.password) {
        res.json(true);
      } else {
        res.json(false);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    client.quit();
  }
}

// Endpoint routes
app.get('/api/stocks', fetchStockData);
app.get('/api/getAllNasdaq', getAllNasdaq);
app.get('/api/getSpotlightedStock', getSpotlightedStock);
app.get('/api/getFavoriteStocks', getFavoriteStocks);
app.get('/api/updateFavoriteStocks', updateFavoriteStocks);
app.get('/api/addUser', addUser);
app.get('/api/validateUser', validateUser);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3001`)});


module.exports = app;
