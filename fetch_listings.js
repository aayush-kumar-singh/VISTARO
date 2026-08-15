const http = require("http");

http.get("http://localhost:3003/listings", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
        console.log("STATUS:", res.statusCode);
        console.log("BODY_LENGTH:", data.length);
        console.log("HAS_LISTINGS_GRID:", data.includes("listings-grid"));
        console.log("HAS_LISTING_CARD:", data.includes("listing-card"));
        console.log("SNIPPET:", data.substring(data.indexOf("<!-- Listings"), data.indexOf("<!-- Listings") + 600));
    });
}).on("error", err => console.error(err));
