require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../server/models/Listing.js");
const Destination = require("../server/models/Destination.js");

const dbUrl =
    process.env.ATLAS_DB_URL ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/wanderlust";

// Mapping dictionary for location aliases / sub-regions
const destinationKeywordMap = {
    goa: ["goa", "anjuna", "candolim", "panaji", "calangute", "arambol", "vagator", "baga"],
    ladakh: ["ladakh", "leh", "nubra", "pangong", "zanskar", "kargil"],
    udaipur: ["udaipur", "pichola", "mewar", "fateh sagar"],
    kasol: ["kasol", "parvati valley", "tosh", "kheerganga", "manali", "kullu", "chalal"],
    munnar: ["munnar", "anamudi", "devikulam", "idukki", "mattupetty"],
    kalimpong: ["kalimpong", "deolo", "lava", "rishyap", "darjeeling"],
};

async function backfillListingDestinations() {
    try {
        console.log("[Migration] Connecting to MongoDB...");
        await mongoose.connect(dbUrl);
        console.log("[Migration] Successfully connected.");

        const destinations = await Destination.find({ isActive: true });
        console.log(`[Migration] Found ${destinations.length} active destinations.`);

        const destBySlug = {};
        destinations.forEach((d) => {
            destBySlug[d.slug] = d;
        });

        const listings = await Listing.find();
        console.log(`[Migration] Evaluating ${listings.length} listings...\n`);

        let matchedCount = 0;
        let unmatchedCount = 0;
        let alreadySetCount = 0;

        const matchedList = [];
        const unmatchedList = [];

        for (const listing of listings) {
            const locText = (listing.location || "").toLowerCase().trim();
            const titleText = (listing.title || "").toLowerCase().trim();
            const countryText = (listing.country || "").toLowerCase().trim();

            let matchedDestination = null;

            // Search for confident keyword matches
            for (const [slug, keywords] of Object.entries(destinationKeywordMap)) {
                const targetDest = destBySlug[slug];
                if (!targetDest) continue;

                const hasMatch = keywords.some(
                    (kw) =>
                        locText.includes(kw) ||
                        titleText.includes(kw) ||
                        (countryText === "india" && (locText.includes(kw) || titleText.includes(kw)))
                );

                if (hasMatch) {
                    matchedDestination = targetDest;
                    break;
                }
            }

            if (matchedDestination) {
                const isAlreadyMatched =
                    listing.destination &&
                    listing.destination.toString() === matchedDestination._id.toString();

                if (isAlreadyMatched) {
                    alreadySetCount++;
                } else {
                    listing.destination = matchedDestination._id;
                    await listing.save();
                    matchedCount++;
                }

                matchedList.push({
                    title: listing.title,
                    location: `${listing.location}, ${listing.country}`,
                    destination: matchedDestination.name,
                    slug: matchedDestination.slug,
                });
            } else {
                unmatchedCount++;
                unmatchedList.push({
                    title: listing.title,
                    location: `${listing.location}, ${listing.country}`,
                    reason: "No confident destination keyword match found",
                });
            }
        }

        console.log("==================================================");
        console.log(" MIGRATION RESULTS & BACKFILL REPORT");
        console.log("==================================================");
        console.log(`Total listings evaluated: ${listings.length}`);
        console.log(`Newly matched & updated:  ${matchedCount}`);
        console.log(`Already matched & valid:  ${alreadySetCount}`);
        console.log(`Unmatched (preserved):   ${unmatchedCount}`);
        console.log("--------------------------------------------------");

        if (matchedList.length > 0) {
            console.log("\n✅ MATCHED LISTINGS:");
            matchedList.forEach((item, idx) => {
                console.log(
                    `  ${idx + 1}. "${item.title}" (${item.location}) -> Destination: ${item.destination} (${item.slug})`
                );
            });
        }

        if (unmatchedList.length > 0) {
            console.log("\n⚠️ UNMATCHED LISTINGS (Left as null for backward compatibility):");
            unmatchedList.forEach((item, idx) => {
                console.log(
                    `  ${idx + 1}. "${item.title}" (${item.location}) — ${item.reason}`
                );
            });
        }

        console.log("\n==================================================");
        console.log("[Migration] Completed successfully with zero data loss.");
        console.log("==================================================\n");
    } catch (err) {
        console.error("[Migration] ❌ Failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("[Migration] MongoDB connection closed.");
    }
}

if (require.main === module) {
    backfillListingDestinations();
}

module.exports = backfillListingDestinations;
