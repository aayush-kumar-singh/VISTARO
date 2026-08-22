require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../server/models/Listing.js");
const Destination = require("../server/models/Destination.js");
const User = require("../server/models/User.js");

const dbUrl =
    process.env.ATLAS_DB_URL ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/wanderlust";

const destinationStays = [
    {
        title: "Azure Sunset Beachfront Villa",
        description:
            "A private Portuguese heritage villa nestled right on the Anjuna coastline. Features an infinity plunge pool, open-air cabanas, and panoramic Arabian Sea sunsets.",
        location: "Anjuna, Goa",
        country: "India",
        category: "Beach",
        price: 8500,
        maxGuests: 6,
        destinationSlug: "goa",
        amenities: ["Wifi", "Pool", "Free Parking", "Air Conditioning", "Kitchen", "Dedicated Workspace"],
        geometry: { type: "Point", coordinates: [73.7431, 15.584] },
        image: {
            url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-goa-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-goa-1",
            },
            {
                url: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-goa-2",
            },
        ],
    },
    {
        title: "Nubra Valley Eco-Stupa Lodge",
        description:
            "Architecturally designed earthen solar lodge offering sweeping vistas of the Karakoram mountains and high-altitude desert dunes. Experience traditional Ladakhi dining and starry nights.",
        location: "Diskit, Nubra Valley, Ladakh",
        country: "India",
        category: "Trending",
        price: 6200,
        maxGuests: 4,
        destinationSlug: "ladakh",
        amenities: ["Wifi", "Free Parking", "Dedicated Workspace", "Breakfast Included"],
        geometry: { type: "Point", coordinates: [77.5619, 34.5428] },
        image: {
            url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-ladakh-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-ladakh-1",
            },
        ],
    },
    {
        title: "Royal Mewar Lakefront Haveli",
        description:
            "Restored 19th-century royal haveli facing Lake Pichola with hand-carved stone balconies, marble courtyards, and sunset boat access.",
        location: "Lake Pichola, Udaipur",
        country: "India",
        category: "Trending",
        price: 11500,
        maxGuests: 5,
        destinationSlug: "udaipur",
        amenities: ["Wifi", "Air Conditioning", "Free Parking", "Kitchen", "TV", "Dedicated Workspace"],
        geometry: { type: "Point", coordinates: [73.6833, 24.5764] },
        image: {
            url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-udaipur-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-udaipur-1",
            },
        ],
    },
    {
        title: "Parvati Riverside Pine Chalet",
        description:
            "A warm deodar-wood alpine chalet right by the tumbling Parvati River with a wood-fired fireplace, valley hiking trail access, and panoramic Himalayan views.",
        location: "Kasol, Parvati Valley",
        country: "India",
        category: "OMG",
        price: 4200,
        maxGuests: 4,
        destinationSlug: "kasol",
        amenities: ["Wifi", "Free Parking", "BBQ Grill", "Dedicated Workspace"],
        geometry: { type: "Point", coordinates: [77.3152, 32.01] },
        image: {
            url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-kasol-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-kasol-1",
            },
        ],
    },
    {
        title: "Emerald Mist Plantation Bungalow",
        description:
            "Secluded colonial tea estate bungalow amidst undulating rainforest canopies and aromatic cardamom trails in the high Western Ghats.",
        location: "Munnar Highlands, Kerala",
        country: "India",
        category: "Farm",
        price: 7800,
        maxGuests: 6,
        destinationSlug: "munnar",
        amenities: ["Wifi", "Free Parking", "Kitchen", "BBQ Grill", "Dedicated Workspace"],
        geometry: { type: "Point", coordinates: [77.0595, 10.0889] },
        image: {
            url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-munnar-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-munnar-1",
            },
        ],
    },
    {
        title: "Kangchenjunga Crest Boutique Retreat",
        description:
            "Peaceful colonial-style mountain sanctuary overlooking the snowcapped Kangchenjunga range, surrounded by organic flower nurseries and pine forests.",
        location: "Deolo Hill, Kalimpong",
        country: "India",
        category: "Bed & Breakfast",
        price: 5400,
        maxGuests: 4,
        destinationSlug: "kalimpong",
        amenities: ["Wifi", "Free Parking", "Kitchen", "Dedicated Workspace"],
        geometry: { type: "Point", coordinates: [88.4667, 27.0667] },
        image: {
            url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            filename: "stay-kalimpong-1",
        },
        images: [
            {
                url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                filename: "stay-kalimpong-1",
            },
        ],
    },
];

async function seedDestinationStays() {
    try {
        console.log("[SeedStays] Connecting to MongoDB...");
        await mongoose.connect(dbUrl);
        console.log("[SeedStays] Connected.");

        let demoUser = await User.findOne({ role: "admin" });
        if (!demoUser) {
            demoUser = await User.findOne();
        }

        for (const stay of destinationStays) {
            const dest = await Destination.findOne({ slug: stay.destinationSlug });
            if (!dest) {
                console.warn(`Destination not found for slug: ${stay.destinationSlug}`);
                continue;
            }

            const existing = await Listing.findOne({ title: stay.title });
            if (existing) {
                existing.destination = dest._id;
                existing.location = stay.location;
                existing.country = stay.country;
                existing.price = stay.price;
                existing.category = stay.category;
                existing.geometry = stay.geometry;
                existing.image = stay.image;
                existing.images = stay.images;
                await existing.save();
                console.log(`[SeedStays] 🔄 Updated stay: "${stay.title}" -> Destination: ${dest.name}`);
            } else {
                const newListing = new Listing({
                    ...stay,
                    destination: dest._id,
                    owner: demoUser ? demoUser._id : null,
                });
                await newListing.save();
                console.log(`[SeedStays] ➕ Created stay: "${stay.title}" -> Destination: ${dest.name}`);
            }
        }

        console.log("[SeedStays] Successfully seeded destination-linked stays.");
    } catch (err) {
        console.error("[SeedStays] Failed:", err);
    } finally {
        await mongoose.connection.close();
    }
}

if (require.main === module) {
    seedDestinationStays();
}

module.exports = seedDestinationStays;
