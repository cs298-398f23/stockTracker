# stockTracker
Web application that creates an immersive user experience to track trending stocks within the NASDAQ. The the front-end uses React.js, back-end is hosted using Node.js, which accesses a Redis database.

Authors:
Jacob Smith, Vito Leone, Colin Conway, David Olsakowski

## Setup

### Install Dependencies

In order to install the necceary dependencies run the following command:

`npm install express axios cheerio react react-dom chart.js cors redis csvtojson puppeteer jest@29.5`

### Import Redis Data

First install Redis and start the Redis server by executing `redis-server`. To ensure the server has been started correctly, type `redis-cli` to access the database directly. After the redis server has started, run the command below in order to populate your 
redis DB with Nasdaq ticker symbols and names:

`node importNasaq.js`

## Running the App: Development

You will need two terminal windows:

### Window 1: 'node server.js'
In the project directory, run the following command to start the server:

`node server.js`

### Window 2: 'npm start
In the project directory, run the following command to load the Stock Tracker Web Page:

`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Running the App: Production

### Step 1: 'npm run build'
In the project directory, run the follwoing command to prepare Stock Tracker app for production:

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Step 2: 'node server.js'
In the project directory, run the following command to start the server in a production environment:

`node server.js`

Starts the server for which the Stock Tracker app runs on
Open [http://localhost:3001](http://localhost:3001) to view it in your browser when in production.

When editing the 'server.js' file, server needs to be restarted in order to reflect any changes

### AWS Configuration
