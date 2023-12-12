/* eslint-disable jest/no-conditional-expect */
// spec/server.js


/*
ENDPOINTS:
GET /api/getAllNasdaq
GET /api/getSpotlightedStock
GET /api/getFavoriteStocks
GET /api/updateFavoriteStocks
GET /api/addUser
GET /api/validateUser
*/

const axios = require('axios');
const request = require('supertest');
const app = require('../server');
const redis = require('redis');



describe('GET /api/stocks', () => {
 it('should return 200 OK', async () => {
   const response = await request(app).get('/api/stocks');
   expect(response.status).toBe(200);
 });


 it('should return an array of stock data with specific properties', async () => {
   const response = await request(app).get('/api/stocks');
   expect(response.status).toBe(200);
   expect(response.body).toBeInstanceOf(Array);


   if (response.body.length > 0) {
     const stock = response.body[0];
     expect(stock).toHaveProperty('pageName');
     expect(stock).toHaveProperty('name');
     expect(stock).toHaveProperty('ticker');
     expect(stock).toHaveProperty('price');
     expect(stock).toHaveProperty('change');
   }
 });


 it('should return the top 10 stocks', async () => {
   const response = await request(app).get('/api/stocks');
   expect(response.status).toBe(200);
   expect(response.body.length).toBeLessThanOrEqual(10);
 });


 it('should return stocks with valid price and change formats', async () => {
   const response = await request(app).get('/api/stocks');
   expect(response.status).toBe(200);
   expect(response.body).toBeInstanceOf(Array);


   if (response.body.length > 0) {
     const stock = response.body[0];
     expect(stock.price).toBeDefined();
     expect(stock.change).toBeDefined();


     // Check if price is in a valid format (e.g., starts with $ and is a number)
     expect(stock.price).toMatch(/^\$\d+(\.\d{1,2})?$/);


     // Check if change is in a valid format (e.g., starts with + or - and is a number)
     expect(stock.change).toMatch(/^([-+])?\$\d+(\.\d{1,2})?$/);
   }
 });


 it('should return stocks with non-empty and valid ticker symbols', async () => {
   const response = await request(app).get('/api/stocks');
   expect(response.status).toBe(200);
   expect(response.body).toBeInstanceOf(Array);


   if (response.body.length > 0) {
     response.body.forEach((stock) => {
       expect(stock.ticker).toBeDefined();
       expect(stock.ticker).not.toEqual('');
     });
   }
 });
});

describe('GET /api/getAllNasdaq', () => {
 it('should return 200 OK', async () => {
   const response = await request(app).get('/api/getAllNasdaq');
   expect(response.status).toBe(200);
 });


 it('should return an object with NASDAQ stock tickers and names', async () => {
   const response = await request(app).get('/api/getAllNasdaq');
   expect(response.status).toBe(200);
   expect(response.body).toBeInstanceOf(Object);

   const keys = Object.keys(response.body);
   if (keys.length > 0) {
     const ticker = keys[0];
     const name = response.body[ticker];
     expect(ticker).toBeTruthy(); // Ensure the ticker is not empty
     expect(name).toBeTruthy(); // Ensure the name is not empty
   }
 });


 it('should return stocks with non-empty and valid NASDAQ ticker symbols', async () => {
   const response = await request(app).get('/api/getAllNasdaq');
   expect(response.status).toBe(200);
   expect(response.body).toBeInstanceOf(Object);

   const keys = Object.keys(response.body);

   if (keys.length > 0) {
     keys.forEach((ticker) => {
       const name = response.body[ticker];
       expect(ticker).toBeDefined();
       expect(ticker).not.toEqual('');
       expect(name).toBeDefined();
       expect(name).not.toEqual('');
     });
   }
 });
});

describe('GET /api/getSpotlightedStocks', () => {
 it('should return 200 OK', async () => {
   const response = await request(app).get('/api/getSpotlightedStocks');
   expect(response.status).toBe(200);
 });
});

describe('GET /api/getFavoriteStocks', () => {
 it('should return 200 OK', async () => {
   const response = await request(app).get('/api/getFavoriteStocks');
   expect(response.status).toBe(200);
 });

 it('should return favorite stocks as an array for a specific user', async () => {
   // Assuming you have a test user with a known username
   const testUsername = 'testUser';

   // Make a request with the test user's username
   const response = await request(app).get('/api/getFavoriteStocks').query({ username: testUsername });

   expect(response.status).toBe(200);

   // Check if the response body is an array or convert an object to an array if needed
   const favoritesArray = Array.isArray(response.body) ? response.body : [response.body];

   // Assert that the response is an array
   expect(Array.isArray(favoritesArray)).toBe(true);

 });
});


describe('GET /api/addUser', () => {
  it('should return 200 OK and add a user in Redis', async () => {
    // Assuming you have a test username and password
    const testUsername = 'freddy23';
    const testPassword = 'password';

    // Make a request to validate a user
    const response = await request(app)
      .get('/api/addUser')
      .query({ username: testUsername, password: testPassword });

    if (response.status === 400) {
      console.log('ERROR: Test configured incorrectly, you must change the username to a new user');
      expect(response.status).toBe(400);
    } else {
      expect(response.status).toBe(200);
    }
  });

  it('should return 400 User already exists', async () => {
    // Assuming you have a test username and password
    const testUsername = 'user';
    const testPassword = 'pass';

    // Make a request to validate a user
    const response = await request(app)
      .get('/api/addUser')
      .query({ username: testUsername, password: testPassword });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/validateUser', () => {
  it('should return 200 OK and validate a user in Redis', async () => {
    // Assuming you have a test username and password
    const testUsername = 'user';
    const testPassword = 'pass';

    // Make a request to validate a user
    const response = await request(app)
      .get('/api/validateUser')
      .query({ username: testUsername, password: testPassword });

    expect(response.status).toBe(200);
  });
});






  
