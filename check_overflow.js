const puppeteer = require("puppeteer-core");

async function checkOverflowElements() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    const report = await page.evaluate(() => {
        const docWidth = document.documentElement.offsetWidth;
        const bodyWidth = document.body.offsetWidth;
        const viewportWidth = window.innerWidth;

        const overflowing = [];
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 2) {
                overflowing.push({
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    width: rect.width,
                    right: rect.right
                });
            }
        }

        return {
            viewportWidth,
            docWidth,
            bodyWidth,
            overflowingCount: overflowing.length,
            sampleOverflowing: overflowing.slice(0, 10)
        };
    });

    console.log("PAGE_OVERFLOW_REPORT:", JSON.stringify(report, null, 2));
    await browser.close();
}

checkOverflowElements().catch(err => console.error(err));
