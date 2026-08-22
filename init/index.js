require("dotenv").config();

const mongoose = require("mongoose");
const listing = require("../server/models/Listing.js");
const User = require("../server/models/User.js");
const initData = require("./data.js");

const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Successfully connected to MongoDB");
}

async function getOrCreateDemoUser() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@vistaro.com";
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD;

    let demoUser = await User.findOne({
        $or: [{ email: adminEmail }, { username: adminUsername }, { role: "admin" }],
    });

    if (demoUser) {
        if (demoUser.role !== "admin") {
            demoUser.role = "admin";
            await demoUser.save();
        }
        console.log(`Admin user '${demoUser.username}' already exists.`);
        return demoUser;
    }

    if (!adminPassword) {
        console.warn("No admin password specified in .env. Skipping default admin creation.");
        return null;
    }

    demoUser = new User({
        email: adminEmail,
        username: adminUsername,
        role: "admin",
    });

    await User.register(demoUser, adminPassword);

    console.log(`Admin user '${adminUsername}' created successfully.`);

    return demoUser;
}

async function geocodeLocation(location) {
    const url =
        "https://api.geoapify.com/v1/geocode/search?" +
        new URLSearchParams({
            text: location,
            limit: "1",
            format: "geojson",
            apiKey: process.env.GEOAPIFY_API_KEY,
        });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Geoapify request failed for "${location}" with status ${response.status}`
        );
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
        throw new Error(
            `Could not find coordinates for location: ${location}`
        );
    }

    return data.features[0].geometry;
}

async function initDB() {
    try {
        await main();

        if (!process.env.GEOAPIFY_API_KEY) {
            throw new Error(
                "GEOAPIFY_API_KEY is missing from your .env file"
            );
        }

        const demoUser = await getOrCreateDemoUser();

        console.log("Deleting existing listings...");

        await listing.deleteMany({});

        console.log("Generating coordinates for sample listings...");

        const listingsWithGeometry = [];

        for (const obj of initData.data) {
            console.log(`Geocoding: ${obj.location}`);

            const geometry = await geocodeLocation(
                `${obj.location}, ${obj.country}`
            );

            listingsWithGeometry.push({
                ...obj,
                owner: demoUser._id,
                geometry: geometry,
            });
        }

        await listing.insertMany(listingsWithGeometry);

        console.log(
            `Successfully initialized ${listingsWithGeometry.length} listings`
        );

        console.log("Database initialization completed");
    } catch (err) {
        console.error("Database initialization failed:");
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
}

initDB();