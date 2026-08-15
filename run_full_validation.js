const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const screenshotDir = "C:\\Users\\Aayush Kumar Singh\\.gemini\\antigravity-ide\\brain\\ce66e304-2998-4d43-b726-78a9a9d3f497\\screenshots\\final_verification";
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runFinalValidation() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("pageerror", err => consoleErrors.push("Page Error: " + err.message));
    page.on("console", msg => {
        if (msg.type() === "error") consoleErrors.push("Console Error: " + msg.text());
    });

    // ==========================================
    // 1. MOBILE 375px - Part 2 Star Overflow & Title Truncation
    // ==========================================
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    // Test real listing with long title
    const mobileCardMetrics = await page.evaluate(() => {
        const firstCard = document.querySelector(".listings-grid .listing-card");
        const titleEl = firstCard.querySelector(".listing-card-title");
        const ratingEl = firstCard.querySelector(".listing-card-rating");
        const starIcon = ratingEl ? ratingEl.querySelector("i") : null;
        const rowEl = firstCard.querySelector(".listing-card-title-row");
        const heartBtn = firstCard.parentElement.querySelector(".listing-wishlist-btn");
        const imgEl = firstCard.querySelector("img.card-img-top");

        const cardRect = firstCard.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();
        const ratingRect = ratingEl ? ratingEl.getBoundingClientRect() : null;
        const heartRect = heartBtn ? heartBtn.getBoundingClientRect() : null;
        const imgRect = imgEl ? imgEl.getBoundingClientRect() : null;

        const titleStyle = getComputedStyle(titleEl);
        const ratingStyle = ratingEl ? getComputedStyle(ratingEl) : null;
        const starStyle = starIcon ? getComputedStyle(starIcon) : null;
        const rowStyle = getComputedStyle(rowEl);
        const imgStyle = getComputedStyle(imgEl);

        return {
            card: { width: cardRect.width, left: cardRect.left, right: cardRect.right },
            title: {
                text: titleEl.innerText.trim(),
                width: titleRect.width,
                computedTextOverflow: titleStyle.textOverflow,
                computedOverflow: titleStyle.overflow,
                computedWhiteSpace: titleStyle.whiteSpace,
                computedMinWidth: titleStyle.minWidth,
                computedFlex: titleStyle.flex,
                scrollWidth: titleEl.scrollWidth,
                clientWidth: titleEl.clientWidth
            },
            rating: ratingEl ? {
                text: ratingEl.innerText.trim(),
                width: ratingRect.width,
                left: ratingRect.left,
                right: ratingRect.right,
                computedDisplay: ratingStyle.display,
                computedFlexShrink: ratingStyle.flexShrink,
                computedGap: ratingStyle.gap,
                starFontSize: starStyle ? starStyle.fontSize : null,
                isInsideCard: ratingRect.right <= cardRect.right + 0.5,
                distanceFromCardRight: cardRect.right - ratingRect.right
            } : null,
            row: {
                computedDisplay: rowStyle.display,
                computedJustifyContent: rowStyle.justifyContent,
                computedAlignItems: rowStyle.alignItems,
                computedGap: rowStyle.gap
            },
            heartButton: heartBtn ? {
                width: heartRect.width,
                height: heartRect.height,
                isMin40x40: heartRect.width >= 40 && heartRect.height >= 40
            } : null,
            image: {
                aspectRatio: imgStyle.aspectRatio,
                width: imgRect.width,
                height: imgRect.height
            }
        };
    });

    await page.screenshot({ path: path.join(screenshotDir, "mobile_375px_star_and_card.png") });

    // ==========================================
    // 2. GRID BREAKPOINTS (Part 3)
    // ==========================================
    // Tablet 768px
    await page.setViewport({ width: 768, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "tablet_768px_2cols.png") });
    const tabletGrid = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const style = getComputedStyle(grid);
        return {
            columnsCSS: style.gridTemplateColumns,
            columnCount: style.gridTemplateColumns.split(" ").length,
            gap: style.gap
        };
    });

    // Desktop 1024px
    await page.setViewport({ width: 1024, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "desktop_1024px_4cols.png") });
    const desktopGrid = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const style = getComputedStyle(grid);
        return {
            columnsCSS: style.gridTemplateColumns,
            columnCount: style.gridTemplateColumns.split(" ").length,
            gap: style.gap
        };
    });

    // Large Desktop 1600px
    await page.setViewport({ width: 1600, height: 900 });
    await page.screenshot({ path: path.join(screenshotDir, "large_desktop_1600px_5cols.png") });
    const largeDesktopGrid = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const style = getComputedStyle(grid);
        return {
            columnsCSS: style.gridTemplateColumns,
            columnCount: style.gridTemplateColumns.split(" ").length,
            gap: style.gap
        };
    });

    console.log("FINAL_MOBILE_375PX_METRICS:", JSON.stringify(mobileCardMetrics, null, 2));
    console.log("FINAL_TABLET_768PX_GRID:", JSON.stringify(tabletGrid, null, 2));
    console.log("FINAL_DESKTOP_1024PX_GRID:", JSON.stringify(desktopGrid, null, 2));
    console.log("FINAL_LARGE_DESKTOP_1600PX_GRID:", JSON.stringify(largeDesktopGrid, null, 2));
    console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));

    await browser.close();
}

runFinalValidation().catch(err => {
    console.error(err);
    process.exit(1);
});
