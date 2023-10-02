# Noon Web Scraper

## Description

This repository contains a Node.js script that scrapes product data from Noon.com, specifically for iPhone 11 products. It fetches the product title, currency, and amount, and saves this data to a CSV file.

## Features

- Fetch product titles, currency, and amount
- Handles pagination
- Save data to a CSV file

## Installation

1. **Clone the Repository**

    ```
    git clone https://github.com/smhz101/noonScraper.git
    ```

2. **Navigate to the Directory**

    ```
    cd noonScraper
    ```

3. **Install Dependencies**

    ```
    npm install
    ```

## Usage

To run the scraper, execute the following command:

```
node scrap.js
```

OR 

If you want to extract the contents of only 1 page

```
node scrap.js --page=1
```

This will start the scraping process, and the data will be saved in a file named `scraped_data.csv`.

## Screenshot

![Screenshot](https://www.tutorialsbucket.com/wp-content/uploads/2023/10/Screenshot-at-Oct-02-16-11-48.png)

## Dependencies

- [axios](https://github.com/axios/axios) for HTTP requests
- [puppeteer](https://www.npmjs.com/package/puppeteer) for page Browsing
- [csv-writer](https://github.com/ryu1kn/csv-writer) for writing to CSV files

## Disclaimer

Please ensure you read and understand Noon.com's terms of service before using this scraper. This project is intended for educational purposes only.

## License

MIT License

