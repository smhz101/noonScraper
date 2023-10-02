const axios = require("axios");
const cheerio = require("cheerio");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const querystring = require("querystring");

// Extract search query from URL
const url =
  "https://www.noon.com/apple/?limit=50&originalQuery=iphone%2011&page=1&q=iphone%2011&searchDebug=false&sort%5Bby%5D=price&sort%5Bdir%5D=asc";
const originalQuery = querystring
  .parse(url.split("?")[1])
  .originalQuery.replace(/%20/g, "-");

// Create a filename based on the current date and search query
const date = new Date().toISOString().split("T")[0];
const fileName = `${date}_${originalQuery}.csv`;

// Initialize CSV file with headers
if (!fs.existsSync(fileName)) {
  fs.writeFileSync(fileName, "Title,Currency,Amount\n");
}

const csvWriter = createCsvWriter({
  path: fileName,
  header: [
    { id: "title", title: "Title" },
    { id: "currency", title: "Currency" },
    { id: "amount", title: "Amount" },
  ],
  append: true,
});

// Check for --page argument
const pageArg = process.argv.find((arg) => arg.startsWith("--page="));
const specificPage = pageArg ? parseInt(pageArg.split("=")[1], 10) : null;

async function scrapeData(pageNumber) {
  const pageUrl = `${url.split("&page=")[0]}&page=${pageNumber}${url
    .split("&page=")[1]
    .split("&")
    .slice(1)
    .join("&")}`;
  const records = [];

  try {
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);

    $(".wrapper.productContainer").each((index, element) => {
      let title = $(element).find("[data-qa='product-name']").attr("title");
      let currency = $(element).find(".currency").text();
      let amount = $(element).find(".amount").text();

      title = title.trim().replace(/[^a-zA-Z0-9 ]|"/g, "");
      currency = currency.trim();
      amount = parseFloat(amount.trim().replace(/[^0-9.]/g, ""));

      records.push({
        title,
        currency,
        amount,
      });
    });

    console.log("Number of Records:", records.length);

    // Append records to CSV
    await csvWriter.writeRecords(records);
    console.log(`Page ${pageNumber} is scraped`);

    // Handle pagination
    const nextBtn = $(".next a.arrowLink");
    if (nextBtn.attr("aria-disabled") !== "true" && !specificPage) {
      scrapeData(pageNumber + 1);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

// Start scraping from specified page or page 1
scrapeData(specificPage || 1);
