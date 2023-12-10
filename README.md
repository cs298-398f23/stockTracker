# stockTracker
Web application that creates an immersive user experience to track trending stocks within the NASDAQ. The the front-end uses React.js, back-end is hosted using Node.js, which accesses a Redis database.

Authors:
Jacob Smith, Vito Leone, Colin Conway, David Olsakowski

## Setup

### Install Dependencies

In order to install the necceary dependencies run the following command:

`npm install express axios cheerio react react-dom chart.js cors redis csvtojson puppeteer jasmine supertest`

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

## Testing

Initialize Jasmine in your project
`npx jasmine init`

The previous command will create a spec directory. The test file will be in the spec directory. filepath spec/server.spec.js

Set jasmine as your test script in your package.json
`"scripts": { "test": "jasmine" }`

To run tests `npm test` or `npx jasmine`

## AWS EC2 Instance Setup

Launch a new EC2 instance that uses Amazon Linux 2023 as the operating system. Ensure that port 3001 is accessible from anywhere using a custom TCP protocol. 

After creating the EC2 instance, ssh to the server.

Execute `sudo dnf install -y git` to install git.

Now install Redis by using `sudo dnf install -y redis6`.

In order to install Node.js on the system, first you must install nvm (Node Version Manager) by executing `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`.

Then download the latest version of Node using `nvm install node`.

Lastly, follow the steps from above to get the web server and Redis database working on the EC2 instance.