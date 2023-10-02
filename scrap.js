const axios = require("axios");
const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const querystring = require("querystring");

// Extract search query from URL
const url =
  "https://www.noon.com/apple/?limit=50&originalQuery=iphone%2011&q=iphone%2011&page=1&searchDebug=false&sort%5Bby%5D=price&sort%5Bdir%5D=asc&gclid=CjwKCAjwsKqoBhBPEiwALrrqiGWQbOrD-u2wduTRRxhIsdYxPb8b0-9WlfBr92WaXMukIlPvaDB-LRoCz2wQAvD_BwE&utm_campaign=C1000035425N_ae_en_web_on_go_s_ex_cb_nbr_c1000088l_&utm_medium=cpc&utm_source=c1000088L";

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

const scrapeData = async (page, pageNumber) => {
  try {
    const pageUrl = `${url.split("&page=")[0]}&page=${pageNumber}${url
      .split("&page=")[1]
      .split("&")
      .slice(1)
      .join("&")}`;

    console.log("Page: ", pageUrl);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537"
    );
    await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 0 });

    // Check if "We couldn’t find what you were looking for" exists
    const isEndOfData = await page.$(
      '[alt="We couldn’t find what you were looking for"]'
    );
    if (isEndOfData) {
      console.log("No more data to scrape, stopping.");
      return;
    }

    const records = await page.evaluate(() => {
      const records = [];
      document
        .querySelectorAll(".wrapper.productContainer")
        .forEach((element) => {
          const title = element
            .querySelector('[data-qa="product-name"]')
            .getAttribute("title");
          const currency = element.querySelector(".currency").innerText;
          const amount = element.querySelector(".amount").innerText;

          records.push({
            title: title.replace(/[^a-zA-Z0-9 ]|"/g, "").trim(),
            currency: currency.trim(),
            amount: parseFloat(amount.replace(/[^0-9.]/g, "").trim()),
          });
        });
      return records;
    });

    console.log(`Page ${pageNumber} is scraped`);

    // Append records to CSV
    await csvWriter.writeRecords(records);

    // Go to the next page
    await scrapeData(page, pageNumber + 1);
  } catch (error) {
    console.error(`Error in scrapeData: ${error}`);
  }
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await scrapeData(page, 1);

  await browser.close();
})();
