from bs4 import BeautifulSoup
import requests

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