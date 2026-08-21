require("dotenv").config();

const mongoose = require("mongoose");
const Destination = require("../server/models/Destination.js");

const dbUrl =
    process.env.ATLAS_DB_URL ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/wanderlust";

const curatedDestinations = [
    {
        name: "Kalimpong",
        slug: "kalimpong",
        state: "West Bengal",
        country: "India",
        shortTagline:
            "Misty Himalayan ridges, colonial hill retreats, and quiet orchid valleys.",
        longDescription:
            "Perched high along the lush crests of West Bengal, Kalimpong is an idyllic sanctuary where slow mountain living unfolds against breathtaking vistas of Mount Kangchenjunga. Known for its heritage colonial villas, terraced orchid nurseries, and peaceful monastic quiet, the town offers a restorative contrast to bustling city life. Wander through pine-lined forest tracks, sip freshly plucked Darjeeling teas on breezy balconies, and discover boutique stays rooted in local warmth and craft. Kalimpong invites travelers who crave unhurried stillness, crisp Himalayan air, and heartfelt mountain hospitality.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-kalimpong-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-kalimpong-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-kalimpong-gallery-2",
            },
        ],
        bestFor: [
            "Couples",
            "Solo Travelers",
            "Nature Lovers",
            "Slow Travelers",
        ],
        identityTags: [
            "Himalayan",
            "Hill Station",
            "Romantic",
            "Nature",
            "Heritage",
        ],
        coordinates: {
            lat: 27.0667,
            lng: 88.4667,
        },
        isActive: true,
    },
    {
        name: "Ladakh",
        slug: "ladakh",
        state: "Ladakh",
        country: "India",
        shortTagline:
            "High-altitude desert kingdoms, azure glacial lakes, and ancient cliffside monasteries.",
        longDescription:
            "Cradled between the soaring Karakoram and Himalayan ranges, Ladakh is a surreal kingdom of stark beauty, dramatic high passes, and cosmic starscapes. From the windswept crystal shores of Pangong Tso to the serene whitewashed stupas of Thiksey and Hemis, every valley echoes with timeless Tibetan Buddhist culture. Travelers can traverse high-altitude passes, experience luxury glamping beneath indigo night skies, and stay in eco-architectural earthen lodges built with ancient solar techniques. Ladakh is an unmissable pilgrimage for adventurous souls, landscape photographers, and those seeking awe-inspiring wilderness.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-ladakh-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-ladakh-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-ladakh-gallery-2",
            },
        ],
        bestFor: [
            "Solo Travelers",
            "Adventure Travelers",
            "Couples",
            "Photographers",
        ],
        identityTags: [
            "High Altitude",
            "Mountains",
            "Adventure",
            "Culture",
            "Extreme Landscapes",
        ],
        coordinates: {
            lat: 34.1526,
            lng: 77.5771,
        },
        isActive: true,
    },
    {
        name: "Goa",
        slug: "goa",
        state: "Goa",
        country: "India",
        shortTagline:
            "Sun-kissed Arabian shores, heritage Portuguese estates, and effortless coastal bohemian luxury.",
        longDescription:
            "Where golden shores meet whispering coconut palms, Goa embodies the art of carefree tropical living. Beyond its vibrant beach culture and spirited sunset music, the coastline hides tranquil backwater coves, restored centuries-old Portuguese villas, and private cliffside infinity pools. Savor world-class coastal gastronomy, cycle past quiet pastel-hued village churches, and retreat into design-forward private villas crafted for pure relaxation. Whether seeking vibrant coastal energy or secluded beachside stillness, Goa remains India's preeminent getaway for relaxed indulgence.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-goa-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-goa-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-goa-gallery-2",
            },
        ],
        bestFor: ["Couples", "Groups", "Young Travelers", "Leisure Travelers"],
        identityTags: ["Beach", "Coastal", "Nightlife", "Luxury", "Bohemian"],
        coordinates: {
            lat: 15.2993,
            lng: 74.124,
        },
        isActive: true,
    },
    {
        name: "Udaipur",
        slug: "udaipur",
        state: "Rajasthan",
        country: "India",
        shortTagline:
            "Shimmering lake palaces, royal Mewari courtyards, and timeless romantic heritage.",
        longDescription:
            "Known as the City of Lakes, Udaipur is one of the world's most romantic destinations, set amidst the ancient Aravalli Hills and tranquil lake waters. Ornate marble palaces, hand-carved stone jharokhas, and candlelit boat rides across Lake Pichola create an atmosphere of regal elegance. Stay in exquisitely restored havelis with rooftop views of illuminated royal pavilions and artisan courtyards. Immerse yourself in Mewari art, curated dining by the water, and palatial architecture that celebrates Rajasthan's legendary craftsmanship.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-udaipur-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-udaipur-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-udaipur-gallery-2",
            },
        ],
        bestFor: ["Couples", "Luxury Travelers", "Culture Lovers"],
        identityTags: ["Heritage", "Royal", "Lakes", "Palace", "Romantic"],
        coordinates: {
            lat: 24.5854,
            lng: 73.7125,
        },
        isActive: true,
    },
    {
        name: "Kasol",
        slug: "kasol",
        state: "Himachal Pradesh",
        country: "India",
        shortTagline:
            "Coniferous Parvati riverbanks, vibrant alpine cafes, and rugged Himalayan trekking trails.",
        longDescription:
            "Tucked away along the churning emerald waters of the Parvati River, Kasol is an enchanting mountain haven favored by intrepid explorers and free spirits. Surrounded by towering pine forests and dramatic snowline panoramas, it serves as the vibrant gateway to legendary high-altitude treks like Kheerganga, Tosh, and the ancient village of Malana. Cozy up in wooden chalets with wood-fired stoves, explore bohemian riverside cafes, and listen to the crisp mountain breeze through the deodars. Kasol captures the youthful essence of rugged Himalayan escapism.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-kasol-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-kasol-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-kasol-gallery-2",
            },
        ],
        bestFor: [
            "Solo Travelers",
            "Backpackers",
            "Young Travelers",
            "Adventure Travelers",
        ],
        identityTags: [
            "Backpacking",
            "Mountains",
            "Trekking",
            "Cafes",
            "Nature",
        ],
        coordinates: {
            lat: 32.01,
            lng: 77.3152,
        },
        isActive: true,
    },
    {
        name: "Munnar",
        slug: "munnar",
        state: "Kerala",
        country: "India",
        shortTagline:
            "Rolling emerald tea plantations, misty mountain heights, and secluded rainforest sanctuaries.",
        longDescription:
            "Nestled in the mist-veiled Western Ghats, Munnar is a picturesque tapestry of undulating green tea estates, cascading mountain waterfalls, and cool highland breezes. Wake to cloud cover rolling over the peaks of Anamudi, take guided plantation walks through aromatic spice gardens, and unwind in private eco-villas perched above the forest canopy. The region offers world-class tea estate retreats, ayurvedic wellness, and secluded nature cottages designed for total rejuvenation. Munnar is Kerala's crowned mountain jewel for couples, families, and nature enthusiasts.",
        heroImage: {
            url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1600&q=80",
            filename: "placeholder-munnar-hero",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-munnar-gallery-1",
            },
            {
                url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
                filename: "placeholder-munnar-gallery-2",
            },
        ],
        bestFor: ["Couples", "Families", "Nature Lovers", "Luxury Travelers"],
        identityTags: [
            "Tea Estates",
            "Western Ghats",
            "Misty Mountains",
            "Romantic",
            "Eco Luxury",
        ],
        coordinates: {
            lat: 10.0889,
            lng: 77.0595,
        },
        isActive: true,
    },
];

async function seedDestinations() {
    try {
        console.log("[Seed] Connecting to MongoDB...");
        await mongoose.connect(dbUrl);
        console.log("[Seed] Successfully connected to MongoDB.");

        let insertedCount = 0;
        let updatedCount = 0;

        for (const destData of curatedDestinations) {
            const existing = await Destination.findOne({ slug: destData.slug });

            if (existing) {
                await Destination.findOneAndUpdate(
                    { slug: destData.slug },
                    { $set: destData },
                    { new: true, runValidators: true }
                );
                console.log(`[Seed] 🔄 Updated destination: ${destData.name} (${destData.slug})`);
                updatedCount++;
            } else {
                await Destination.create(destData);
                console.log(`[Seed] ➕ Inserted destination: ${destData.name} (${destData.slug})`);
                insertedCount++;
            }
        }

        const totalInDb = await Destination.countDocuments({ isActive: true });
        console.log(`\n========================================`);
        console.log(`[Seed] Summary: ${insertedCount} inserted, ${updatedCount} updated.`);
        console.log(`[Seed] Total active destinations in DB: ${totalInDb}`);
        console.log(`========================================\n`);
    } catch (err) {
        console.error("[Seed] ❌ Seeding failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("[Seed] MongoDB connection closed.");
    }
}

// Execute if run directly from CLI
if (require.main === module) {
    seedDestinations();
}

module.exports = seedDestinations;
