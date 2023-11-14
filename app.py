from bs4 import BeautifulSoup
import requests


# Need to add code to determine whether or not stock is up or down based on its arrow
# If path d = "M4 ........" then stock is up
# If path d = "M20 ........" then stock is down

response = requests.get('https://www.google.com/finance/markets/gainers')
soup = BeautifulSoup(response.text, 'html.parser')

stocks = soup.find('div', class_="Sy70mc").find_all('li')

counter = 0
for stock in stocks:
    name = stock.find('div', class_='COaKTb').text
    change = stock.find('div', class_='JwB6zf').text
    print(name, change)
    counter += 1
    if counter == 10:
        break

print("---------------------------    Losers     ---------------------------")

response = requests.get('https://www.google.com/finance/markets/losers')
soup = BeautifulSoup(response.text, 'html.parser')

stocks = soup.find('div', class_="Sy70mc").find_all('li')

counter = 0
for stock in stocks:
    name = stock.find('div', class_='COaKTb').text
    change = stock.find('div', class_='JwB6zf').text
    print(name,change)
    counter += 1
    if counter == 10:
        break


print("---------------------------    Most Active     ---------------------------")


response = requests.get('https://www.google.com/finance/markets/most-active')
soup = BeautifulSoup(response.text, 'html.parser')

stocks = soup.find('div', class_="Sy70mc").find_all('li')

counter = 0
for stock in stocks:
    name = stock.find('div', class_='COaKTb').text
    change = stock.find('div', class_='JwB6zf').text
    print(name, change)
    counter += 1
    if counter == 10:
        break

print("---------------------------    Crypto Currencies     ---------------------------")

response = requests.get('https://www.google.com/finance/markets/cryptocurrencies')
soup = BeautifulSoup(response.text, 'html.parser')

stocks = soup.find('div', class_="Sy70mc").find_all('li')

counter = 0
for stock in stocks:
    name = stock.find('div', class_='COaKTb').text
    change = stock.find('div', class_='JwB6zf').text
    print(name,change)
    counter += 1
    if counter == 10:
        break