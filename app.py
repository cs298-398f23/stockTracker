from bs4 import BeautifulSoup
import requests

response = requests.get('https://www.google.com/finance/markets/gainers')
soup = BeautifulSoup(response.text, 'html.parser')

stocks = soup.find('div', class_="Sy70mc").find_all('div', class_='JwB6zf')

for stock in stocks:
    print(stock.text)
