const fs = require('fs');
const csv = require('csvtojson');
const redis = require('redis');

const client = redis.createClient();
client.connect()

// Read CSV file
const csvFilePath = 'nasdaq-listed-symbols_csv.csv';

csv()
  .fromFile(csvFilePath)
  .then((jsonArray) => {
    // Import data into Redis
    jsonArray.forEach((data) => {
      
      const companyInfo = {
        name: data['Company Name'],
        ticker: data['Symbol'],
        // Add other fields as needed
      };

      // Serialize the object to a JSON string
      const serializedCompanyInfo = JSON.stringify(companyInfo);

      // Set data in Redis with a prefixed key
      const prefixedKey = `NASDAQ:${companyInfo.ticker}`;
      client.set(prefixedKey, serializedCompanyInfo, (err) => {
        if (err) {
          console.error(`Error setting data for ${prefixedKey}:`, err.message);
        } else {
          console.log(`Data set for ${prefixedKey}: ${serializedCompanyInfo}`);
        }
      });
    });
  })
  .finally(() => {
    // Close the Redis client when done
    client.quit();
  });
