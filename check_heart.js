const puppeteer = require("puppeteer-core");

async function checkHeartBtn() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    const btn = await page.evaluate(() => {
        const el = document.querySelector(".listing-wishlist-btn");
        const r = el.getBoundingClientRect();
        return {
            width: r.width,
            height: r.height,
            isMin40x40: r.width >= 40 && r.height >= 40
        };
    });

    console.log("HEART_BTN_METRICS:", btn);
    await browser.close();
}

checkHeartBtn().catch(err => console.error(err));
