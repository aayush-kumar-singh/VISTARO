const puppeteer = require("puppeteer-core");

async function checkDOM() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    const info = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const cards = document.querySelectorAll(".listing-card");
        const allGrids = Array.from(document.querySelectorAll("[class*='grid'], [class*='row']")).map(el => el.className);
        return {
            hasListingsGrid: !!grid,
            cardCount: cards.length,
            gridsFound: allGrids,
            title: document.title
        };
    });

    console.log("DOM_INFO:", JSON.stringify(info, null, 2));
    await browser.close();
}

checkDOM().catch(err => console.error(err));
