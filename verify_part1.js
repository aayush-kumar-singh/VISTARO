const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const screenshotDir = "C:\\Users\\Aayush Kumar Singh\\.gemini\\antigravity-ide\\brain\\ce66e304-2998-4d43-b726-78a9a9d3f497\\screenshots\\part1_navbar";
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function verifyNavbar() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // 1. Viewport 1440px
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(screenshotDir, "navbar_1440.png") });

    const metrics1440 = await page.evaluate(() => {
        const navbar = document.querySelector(".navbar.custom-navbar");
        const navRect = navbar.getBoundingClientRect();

        const left = document.querySelector(".navbar-left");
        const leftRect = left.getBoundingClientRect();

        const search = document.querySelector(".navbar-search");
        const searchStyle = getComputedStyle(search);
        const searchRect = search.getBoundingClientRect();

        const right = document.querySelector(".navbar-right");
        const rightRect = right.getBoundingClientRect();
        const rightStyle = getComputedStyle(right);

        // Children of navbar-right
        const rightChildren = Array.from(right.children);
        const rightItems = rightChildren.map(el => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return {
                tag: el.tagName,
                text: el.innerText ? el.innerText.trim().replace(/\n/g, " ") : el.className,
                rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height },
                computedMarginRight: s.marginRight,
                computedMarginLeft: s.marginLeft
            };
        });

        // Gaps between adjacent right items
        const gapsBetweenRightItems = [];
        for (let i = 0; i < rightChildren.length - 1; i++) {
            const r1 = rightChildren[i].getBoundingClientRect();
            const r2 = rightChildren[i + 1].getBoundingClientRect();
            gapsBetweenRightItems.push(r2.left - r1.right);
        }

        // Vertical center line offsets relative to navbar top
        const navCenterY = navRect.top + (navRect.height / 2);
        const leftCenterY = leftRect.top + (leftRect.height / 2);
        const searchCenterY = searchRect.top + (searchRect.height / 2);
        const rightCenterY = rightRect.top + (rightRect.height / 2);

        return {
            viewportWidth: window.innerWidth,
            navbar: {
                width: navRect.width,
                height: navRect.height,
                paddingLeft: getComputedStyle(navbar).paddingLeft,
                paddingRight: getComputedStyle(navbar).paddingRight,
                gap: getComputedStyle(navbar).gap
            },
            navbarSearch: {
                computedMarginLeft: searchStyle.marginLeft,
                computedMarginRight: searchStyle.marginRight,
                width: searchRect.width,
                height: searchRect.height,
                leftEdge: searchRect.left,
                rightEdge: searchRect.right,
                distanceFromLeftGroup: searchRect.left - leftRect.right,
                distanceFromRightGroup: rightRect.left - searchRect.right,
                distanceFromNavLeftEdge: searchRect.left - navRect.left,
                distanceFromNavRightEdge: navRect.right - searchRect.right
            },
            navbarRight: {
                computedGap: rightStyle.gap,
                gapsBetweenAdjacentItems: gapsBetweenRightItems,
                items: rightItems
            },
            verticalCentering: {
                navbarCenterY: navCenterY,
                leftCenterY: leftCenterY,
                searchCenterY: searchCenterY,
                rightCenterY: rightCenterY,
                leftOffsetFromNavCenter: leftCenterY - navCenterY,
                searchOffsetFromNavCenter: searchCenterY - navCenterY,
                rightOffsetFromNavCenter: rightCenterY - navCenterY
            }
        };
    });

    // 2. Viewport 1024px
    await page.setViewport({ width: 1024, height: 800 });
    await page.screenshot({ path: path.join(screenshotDir, "navbar_1024.png") });
    const metrics1024 = await page.evaluate(() => {
        const search = document.querySelector(".navbar-search");
        const right = document.querySelector(".navbar-right");
        const nav = document.querySelector(".navbar.custom-navbar");
        return {
            viewportWidth: window.innerWidth,
            searchWidth: search.getBoundingClientRect().width,
            searchMarginLeft: getComputedStyle(search).marginLeft,
            searchMarginRight: getComputedStyle(search).marginRight,
            rightWidth: right.getBoundingClientRect().width,
            navWidth: nav.getBoundingClientRect().width
        };
    });

    // 3. Viewport 768px
    await page.setViewport({ width: 768, height: 800 });
    await page.screenshot({ path: path.join(screenshotDir, "navbar_768.png") });
    const metrics768 = await page.evaluate(() => {
        const search = document.querySelector(".navbar-search");
        const right = document.querySelector(".navbar-right");
        const nav = document.querySelector(".navbar.custom-navbar");
        return {
            viewportWidth: window.innerWidth,
            searchWidth: search.getBoundingClientRect().width,
            searchMarginLeft: getComputedStyle(search).marginLeft,
            searchMarginRight: getComputedStyle(search).marginRight,
            rightWidth: right.getBoundingClientRect().width,
            navWidth: nav.getBoundingClientRect().width
        };
    });

    console.log("METRICS_1440:", JSON.stringify(metrics1440, null, 2));
    console.log("METRICS_1024:", JSON.stringify(metrics1024, null, 2));
    console.log("METRICS_768:", JSON.stringify(metrics768, null, 2));

    await browser.close();
}

verifyNavbar().catch(err => {
    console.error(err);
    process.exit(1);
});
