# stockTracker
Web application that creates an immersive user experience to track trending stocks within the NASDAQ. The back-end is hosted using Python and the Flask library and accesses a MongoDB database.

## Install Dependencies

In order to install the necceary dependencies run the following command:

npm install express axios cheerio react react-dom chart.js cors redis csvtojson puppeteer

## Import Redis Data

With the redis server started, run the command in order to populate your 
redis DB with Nasdaq ticker symbols and names:

node importNasaq.js


## Running the App: Development

You will need two terminal windows:

### Window 1: 'node server.js'
In the project directory, run the following command to start the server:

node server.js

### Window 2: 'npm start
In the project directory, run the following command to load the Stock Tracker Web Page:

npm start

## Running the App: Production

### Step 1: 'npm run build'
In the project directory, run the follwoing command to prepare Stock Tracker app for production:

npm run build

### Step 2: 'node server.js'
In the project directory, run the following command to start the server in a production environment:

node server.js


#### 'node server.js'

Starts the server for which the Stock Tracker app runs on
Open [http://localhost:3001](http://localhost:3001) to view it in your browser when in production.

When editing the 'server.js' file, server needs to be restarted in order to reflect any changes

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.




Authors:
Jacob Smith, Vito Leone, Colin Conway, David Olsakowski

## Setup
Clone the repo from github using `git clone https://github.com/cs298-398f23/stockTracker.git`

Traverse into the cloned repo `cd stockTracker` and create a virtual environment using Python3 `python3 -m venv .venv`

From there, activate your virtual envrionment `source .venv/bin/activate` and download the necessary Python libraries from the requirements.txt file in the repo `pip install -r requirements.txt`

Your system is now configured correctly and you can start the application

## Development Server
In order to run the server in a development environment simply execute `python server.py` and a local server will be hosted on `localhost:8000`

This is purely a development environment only hosted using the Flask framework. DO NOT use this server in a production environment as it is unstable and only used for development and testing.

### Redis
To locally run the redis database first install redis `brew install redis`. To start the redis server run `redis-server`. To establish a connection to the database type `redis-cli` from the command line. 

To add data from ticker.redis first start the redis server. Then on the command line run `redis-cli -h localhost -p 6379 < ticker.redis`. To access data from the command line run HGET key field exp `HGET AAPL name`.

## Production Server
To host this server in a production setting, gunicorn is used to provide a stable environment for the server to operate in. Execute `gunicorn -w4 "server:launch()"` which will serve the server on `localhost:8000` again but in a more secure fashion.

### AWS Configuration
To configure this system securely, you must first create a VPC through AWS. Create the CIDR block of 10.0.0.0/24. Then make sure there is only 1 availability zone, 1 public subnet, and 1 private subnet. Lastly, select the option that ensures there is 1 NAT gateway per availability zone.

After configuring the VPC, create the Amazon EC2 instance for the web server. Scroll down to the network settings section and click the 'Edit' button at the top. Change the VPC setting and select the VPC that you created above. Next, ensure that you place this machine within the public subnet of the VPC. Change the Auto-assign public IP to enable as well. Now configure the inbound traffic rules so that both port 22 (ssh) and port 80 (HTTP) is allowed from 0.0.0.0 (anywhere). Click the 'Advanced Details' dropdown menu and scroll all the way down to the bottom until you see the 'User Data' section. Here you can upload the `web-server.sh` file in this repo. Create the instance by clicking the orange 'Launch Instance' button on the right. 
