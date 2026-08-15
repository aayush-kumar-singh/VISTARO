const puppeteer = require("puppeteer-core");

async function checkConsoleAndMap() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", err => errors.push("Page Error: " + err.message));
    page.on("console", msg => {
        if (msg.type() === "error") errors.push("Console Error: " + msg.text());
    });

    // 1. Listings page
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    // 2. Listing show page (find first listing link)
    const firstListingHref = await page.evaluate(() => {
        const link = document.querySelector(".listing-card a, a.card-link");
        return link ? link.href : null;
    });

    let mapRendered = false;
    if (firstListingHref) {
        await page.goto(firstListingHref, { waitUntil: "networkidle0" });
        mapRendered = await page.evaluate(() => {
            const map = document.getElementById("map");
            return !!map && map.offsetWidth > 0 && map.offsetHeight > 0;
        });
    }

    console.log("SHOW_PAGE_TEST:", {
        url: firstListingHref,
        mapRendered,
        errors
    });

    await browser.close();
}

checkConsoleAndMap().catch(err => console.error(err));
