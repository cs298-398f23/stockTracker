#!/bin/bash
set -x
sudo yum install -y git
git clone https://github.com/cs298-398f23/stockTracker.git
cd stockTracker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
sudo cp flask.service /etc/systemd/system
sudo systemctl enable flask
sudo systemctl start flask
