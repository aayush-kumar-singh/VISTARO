const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const screenshotDir = "C:\\Users\\Aayush Kumar Singh\\.gemini\\antigravity-ide\\brain\\ce66e304-2998-4d43-b726-78a9a9d3f497\\screenshots\\part2_part3_cards";
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function verifyPart2And3() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 1. Mobile 375px - Test Long Title & Star Rating
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    // Take screenshot of cards at 375px
    await page.screenshot({ path: path.join(screenshotDir, "part2_cards_375px.png"), fullPage: false });

    const mobileEvaluation = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll(".listing-card"));
        const grid = document.querySelector(".listings-grid");
        const gridStyle = getComputedStyle(grid);

        const cardDetails = cards.slice(0, 5).map(card => {
            const cardRect = card.getBoundingClientRect();
            const titleEl = card.querySelector(".listing-card-title");
            const ratingEl = card.querySelector(".listing-card-rating");
            const rowEl = card.querySelector(".listing-card-title-row");
            const imgEl = card.querySelector("img.card-img-top");

            const titleStyle = titleEl ? getComputedStyle(titleEl) : null;
            const ratingStyle = ratingEl ? getComputedStyle(ratingEl) : null;
            const rowStyle = rowEl ? getComputedStyle(rowEl) : null;
            const imgStyle = imgEl ? getComputedStyle(imgEl) : null;

            const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;
            const ratingRect = ratingEl ? ratingEl.getBoundingClientRect() : null;
            const rowRect = rowEl ? rowEl.getBoundingClientRect() : null;
            const imgRect = imgEl ? imgEl.getBoundingClientRect() : null;

            return {
                titleText: titleEl ? titleEl.innerText.trim() : "",
                cardWidth: cardRect.width,
                imgAspectRatio: imgStyle ? imgStyle.aspectRatio : null,
                imgWidth: imgRect ? imgRect.width : null,
                imgHeight: imgRect ? imgRect.height : null,
                title: {
                    computedTextOverflow: titleStyle ? titleStyle.textOverflow : null,
                    computedOverflow: titleStyle ? titleStyle.overflow : null,
                    computedWhiteSpace: titleStyle ? titleStyle.whiteSpace : null,
                    computedMinWidth: titleStyle ? titleStyle.minWidth : null,
                    computedFlex: titleStyle ? titleStyle.flex : null,
                    scrollWidth: titleEl ? titleEl.scrollWidth : null,
                    clientWidth: titleEl ? titleEl.clientWidth : null,
                    isTruncated: titleEl ? titleEl.scrollWidth > titleEl.clientWidth : false
                },
                rating: ratingEl ? {
                    ratingText: ratingEl.innerText.trim(),
                    computedDisplay: ratingStyle.display,
                    computedFlexShrink: ratingStyle.flexShrink,
                    computedGap: ratingStyle.gap,
                    starFontSize: getComputedStyle(ratingEl.querySelector("i") || ratingEl).fontSize,
                    ratingLeft: ratingRect.left,
                    ratingRight: ratingRect.right,
                    cardRight: cardRect.right,
                    isInsideCard: ratingRect.right <= (cardRect.right + 1)
                } : null,
                row: rowEl ? {
                    computedDisplay: rowStyle.display,
                    computedJustifyContent: rowStyle.justifyContent,
                    computedAlignItems: rowStyle.alignItems,
                    computedGap: rowStyle.gap
                } : null
            };
        });

        return {
            gridColumns: gridStyle.gridTemplateColumns,
            gridGap: gridStyle.gap,
            cardDetails
        };
    });

    // 2. Tablet 768px
    await page.setViewport({ width: 768, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "part3_grid_768px.png") });
    const tabletEval = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
        return {
            gridColumnsCSS: getComputedStyle(grid).gridTemplateColumns,
            columnCount: cols,
            gridGap: getComputedStyle(grid).gap
        };
    });

    // 3. Desktop 1024px
    await page.setViewport({ width: 1024, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "part3_grid_1024px.png") });
    const desktopEval = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
        return {
            gridColumnsCSS: getComputedStyle(grid).gridTemplateColumns,
            columnCount: cols,
            gridGap: getComputedStyle(grid).gap
        };
    });

    // 4. Large Desktop 1600px
    await page.setViewport({ width: 1600, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "part3_grid_1600px.png") });
    const largeDesktopEval = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
        return {
            gridColumnsCSS: getComputedStyle(grid).gridTemplateColumns,
            columnCount: cols,
            gridGap: getComputedStyle(grid).gap
        };
    });

    console.log("MOBILE_375PX_RESULTS:", JSON.stringify(mobileEvaluation, null, 2));
    console.log("TABLET_768PX_GRID:", JSON.stringify(tabletEval, null, 2));
    console.log("DESKTOP_1024PX_GRID:", JSON.stringify(desktopEval, null, 2));
    console.log("LARGE_DESKTOP_1600PX_GRID:", JSON.stringify(largeDesktopEval, null, 2));

    await browser.close();
}

verifyPart2And3().catch(err => {
    console.error(err);
    process.exit(1);
});
