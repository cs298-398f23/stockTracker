const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const redis = require('redis');
const puppeteer = require('puppeteer');
const { request } = require('http');

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
  const stocks = {};
  const client = redis.createClient();

  try {
    await client.connect();

    const tickers = [];

    // Get keys with the NASDAQ prefix
    await client.keys('NASDAQ:*').then((keys) => {
      tickers.push(...keys);
    });

    // Create an array of promises for each ticker
    const promises = tickers.map(async (ticker) => {
      const stock = await client.get(ticker);
      const stockInfo = JSON.parse(stock);
      stocks[stockInfo.ticker] = stockInfo.name;
      
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json(stocks);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the Redis client
    client.quit();
  }
});


app.get('/api/getSpotlightedStock', async (req, res) => {
  try {
    let requestStock = req.query.stock;
    let requestTicker = requestStock.ticker;
    

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const url = `https://www.google.com/finance/quote/${requestTicker}:NASDAQ`;
    await page.goto(url);
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

    
    res.json(stockInfo);


    await browser.close();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/getFavoriteStocks', async (req, res) => {
  
  const client = redis.createClient();

  try {
    await client.connect();

    // Get all keys
    await client.get(`${req.query.username}:favorites`).then((stock) => {
      res.json(JSON.parse(stock));})

    
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


app.get('/api/updateFavoriteStocks', async (req, res) => {
  
  const favorites = req.query.favorites;
  const client = redis.createClient();

  try {
    await client.connect();
    const serializedCompanyInfo = JSON.stringify(favorites);

      // Set data in Redis with a prefixed key
      const prefixedKey = req.query.username + ":favorites";
      client.set(prefixedKey, serializedCompanyInfo, (err) => {
        if (err) {
          console.error(`Error setting data for ${prefixedKey}:`, err.message);
        } else {
          console.log(`Data set for ${prefixedKey}: ${serializedCompanyInfo}`);
        }
      });
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

app.get('/api/addUser', async (req, res) => {
    
    const client = redis.createClient();
  
    try {
      await client.connect();
      
      console.log(req.query.username)
       console.log(req.query.password);
        // Set data in Redis with a prefixed key
        const prefixedKey = req.query.username;
        client.set(prefixedKey, req.query.password, (err) => {
          if (err) {
            console.error(`Error setting data for ${prefixedKey}:`, err.message);
          } else {
            console.log(`Data set for ${prefixedKey}`);
          }
        });
    } 
    catch (error) {
      console.error("Error:", error.message);
      res.status(500).send('Internal Server Error');
    } 
    finally {
      // Close the Redis client
      client.quit();
    }
})

app.get('/api/validateUser', async (req, res) => {
    
    const client = redis.createClient();
  
    try {
      await client.connect();
      
      console.log(req.query.username)
        // Set data in Redis with a prefixed key
        const prefixedKey = req.query.username;

    
        await client.get(prefixedKey).then((reply) => {
          if (reply && reply === req.query.password) {
              res.json(true);
            }
          else{
              res.json(false);
            }
          })
        
    }
    catch (error) {
      console.error("Error:", error.message);
      res.status(500).send('Internal Server Error');
    } 
    finally {
      // Close the Redis client
      client.quit();
    }
  })


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
