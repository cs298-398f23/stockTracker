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

## Production Server
To host this server in a production setting, gunicorn is used to provide a stable environment for the server to operate in. Execute `gunicorn -w4 "server:launch()"` which will serve the server on `localhost:8000` again but in a more secure fashion.
