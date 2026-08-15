const puppeteer = require("puppeteer-core");

async function checkCardClasses() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 });
    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    const info = await page.evaluate(() => {
        const grid = document.querySelector(".listings-grid");
        const gridRect = grid.getBoundingClientRect();
        const gridCards = Array.from(grid.querySelectorAll(".listing-card"));
        return {
            gridWidth: gridRect.width,
            gridLeft: gridRect.left,
            gridRight: gridRect.right,
            gridCardWidths: gridCards.slice(0, 3).map(c => c.getBoundingClientRect().width),
            gridCardRight: gridCards.slice(0, 3).map(c => c.getBoundingClientRect().right)
        };
    });

    console.log("GRID_CARDS_INFO:", JSON.stringify(info, null, 2));
    await browser.close();
}

checkCardClasses().catch(err => console.error(err));
