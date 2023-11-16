# stockTracker
Web application that creates an immersive user experience to track trending stocks within the NASDAQ. The back-end is hosted using Python and the Flask library and accesses a MongoDB database.

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

## Production Server
To host this server in a production setting, gunicorn is used to provide a stable environment for the server to operate in. Execute `gunicorn -w4 "server:launch()"` which will serve the server on `localhost:8000` again but in a more secure fashion.

### AWS Configuration
To configure this system securely, you must first create a VPC through AWS. Create the CIDR block of 10.0.0.0/24. Then make sure there is only 1 availability zone, 1 public subnet, and 1 private subnet. Lastly, select the option that ensures there is 1 NAT gateway per availability zone.

After configuring the VPC, create the Amazon EC2 instance for the web server. Scroll down to the network settings section and click the 'Edit' button at the top. Change the VPC setting and select the VPC that you created above. Next, ensure that you place this machine within the public subnet of the VPC. Change the Auto-assign public IP to enable as well. Now configure the inbound traffic rules so that both port 22 (ssh) and port 80 (HTTP) is allowed from 0.0.0.0 (anywhere). Click the 'Advanced Details' dropdown menu and scroll all the way down to the bottom until you see the 'User Data' section. Here you can upload the `web-server.sh` file in this repo. Create the instance by clicking the orange 'Launch Instance' button on the right. 
