const puppeteer = require("puppeteer-core");
const path = require("path");

const screenshotDir = "C:\\Users\\Aayush Kumar Singh\\.gemini\\antigravity-ide\\brain\\ce66e304-2998-4d43-b726-78a9a9d3f497\\screenshots\\part2_part3_cards";

async function testUltraLongTitle() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    // Inject an ultra-long title on the first card
    const result = await page.evaluate(() => {
        const firstCard = document.querySelector(".listing-card");
        const titleEl = firstCard.querySelector(".listing-card-title");
        titleEl.innerText = "Ultra Luxurious Grand Seaside Villa With Infinity Pool, Private Beach Access & Panoramic Ocean Views in Costa Rica";

        const cardRect = firstCard.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();
        const ratingEl = firstCard.querySelector(".listing-card-rating");
        const ratingRect = ratingEl.getBoundingClientRect();

        return {
            cardWidth: cardRect.width,
            cardRight: cardRect.right,
            titleText: titleEl.innerText,
            titleWidth: titleRect.width,
            titleScrollWidth: titleEl.scrollWidth,
            titleClientWidth: titleEl.clientWidth,
            isTitleTruncated: titleEl.scrollWidth > titleEl.clientWidth,
            ratingWidth: ratingRect.width,
            ratingLeft: ratingRect.left,
            ratingRight: ratingRect.right,
            isRatingInsideCard: ratingRect.right <= cardRect.right + 0.5,
            gapBetweenTitleAndRating: ratingRect.left - titleRect.right
        };
    });

    // Capture screenshot of the ultra-long title card at 375px
    await page.screenshot({ path: path.join(screenshotDir, "long_title_375px_truncated.png") });

    console.log("ULTRA_LONG_TITLE_TEST_RESULTS:", JSON.stringify(result, null, 2));
    await browser.close();
}

testUltraLongTitle().catch(err => console.error(err));
