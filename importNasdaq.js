const fs = require('fs');
const csv = require('csvtojson');
const redis = require('redis');

const client = redis.createClient();
client.connect();

// Read CSV file
const csvFilePath = 'nasdaq-listed-symbols_csv.csv';

csv()
  .fromFile(csvFilePath)
  .then((jsonArray) => {
    // Import data into Redis
    jsonArray.forEach((data) => {
      const ticker = data.Symbol;
      const companyName = data['Company Name'];

      // Set data in Redis
      client.set(ticker, companyName, (err) => {
        if (err) {
          console.error(`Error setting data for ${ticker}:`, err.message);
        } else {
          console.log(`Data set for ${ticker}: ${companyName}`);
        }
      });
    });
  })
  .finally(() => {
    // Close the Redis client when done
    client.quit();
  });
