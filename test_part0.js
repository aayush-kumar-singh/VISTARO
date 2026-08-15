const puppeteer = require("puppeteer-core");

async function verifyPart0() {
    const browser = await puppeteer.launch({
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    const consoleLogs = [];
    page.on("console", msg => consoleLogs.push(msg.text()));
    page.on("pageerror", err => consoleLogs.push("Page Error: " + err.message));

    await page.goto("http://localhost:3003/listings", { waitUntil: "networkidle0" });

    const cssTokens = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        const tokens = [
            "--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-7", "--space-8",
            "--bp-sm", "--bp-md", "--bp-lg", "--bp-xl", "--bp-2xl",
            "--text-xs", "--text-sm", "--text-base", "--text-lg", "--text-xl", "--text-2xl", "--text-3xl",
            "--radius-sm", "--radius-md", "--radius-full",
            "--color-primary", "--color-primary-hover", "--color-ink", "--color-ink-muted", "--color-border", "--color-surface", "--color-surface-hover",
            "--shadow-sm", "--shadow-md", "--shadow-lg"
        ];
        const res = {};
        for (const t of tokens) {
            res[t] = styles.getPropertyValue(t).trim();
        }
        return res;
    });

    console.log("RESOLVED_TOKENS:", JSON.stringify(cssTokens, null, 2));
    console.log("CONSOLE_LOGS:", JSON.stringify(consoleLogs));
    await browser.close();
}

verifyPart0().catch(err => {
    console.error("ERROR:", err);
    process.exit(1);
});
