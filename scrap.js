const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'scraped_data.csv',
  header: [
    { id: 'title', title: 'TITLE' },
    { id: 'currency', title: 'CURRENCY' },
    { id: 'amount', title: 'AMOUNT' },
  ],
});

async function scrapeData(pageNumber) {
  const url = `https://www.noon.com/apple/?limit=50&originalQuery=iphone%2011&page=${pageNumber}&q=iphone%2011&searchDebug=false&sort%5Bby%5D=price&sort%5Bdir%5D=asc`;
  const records = [];

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    $('.sc-ff3f80d5-0.iBVDAS.wrapper.productContainer').each((index, element) => {
      const title = $(element).find('.sc-2dbd6bba-20.kNuLhD').attr('title');
      const currency = $(element).find('.currency').text();
      const amount = $(element).find('.amount').text();

      records.push({
        title,
        currency,
        amount,
      });
    });

    // Write records to CSV
    await csvWriter.writeRecords(records);

    // Handle pagination
    const nextBtn = $('.next a.arrowLink');
    if (nextBtn.attr('aria-disabled') !== 'true') {
      scrapeData(pageNumber + 1);
    }

  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

// Start scraping from page 1
scrapeData(1);

