const puppeteer = require("puppeteer-core");
const path = require("path");

const screenshotDir = "C:\\Users\\Aayush Kumar Singh\\.gemini\\antigravity-ide\\brain\\ce66e304-2998-4d43-b726-78a9a9d3f497\\screenshots\\part2_part3_cards";

async function testGridLongTitle() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    // Inject an ultra-long title on the first card in .listings-grid
    const result = await page.evaluate(() => {
        const gridCard = document.querySelector(".listings-grid .listing-card");
        const titleEl = gridCard.querySelector(".listing-card-title");
        titleEl.innerText = "Ultra Luxurious Grand Seaside Villa With Infinity Pool, Private Beach Access & Panoramic Ocean Views in Costa Rica";

        const cardRect = gridCard.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();
        const ratingEl = gridCard.querySelector(".listing-card-rating");
        const ratingRect = ratingEl.getBoundingClientRect();

        return {
            cardWidth: cardRect.width,
            cardLeft: cardRect.left,
            cardRight: cardRect.right,
            titleText: titleEl.innerText,
            titleWidth: titleRect.width,
            titleScrollWidth: titleEl.scrollWidth,
            titleClientWidth: titleEl.clientWidth,
            isTitleTruncated: titleEl.scrollWidth > titleEl.clientWidth,
            ratingText: ratingEl.innerText.trim(),
            ratingWidth: ratingRect.width,
            ratingLeft: ratingRect.left,
            ratingRight: ratingRect.right,
            isRatingInsideCard: ratingRect.right <= (cardRect.right + 0.5),
            distanceRatingFromCardRight: cardRect.right - ratingRect.right,
            gapBetweenTitleAndRating: ratingRect.left - titleRect.right
        };
    });

    await page.screenshot({ path: path.join(screenshotDir, "part2_long_title_375px_verified.png"), fullPage: false });

    console.log("GRID_LONG_TITLE_EVALUATION:", JSON.stringify(result, null, 2));
    await browser.close();
}

testGridLongTitle().catch(err => console.error(err));
