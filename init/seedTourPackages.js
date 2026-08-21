require("dotenv").config();

const mongoose = require("mongoose");
const TourPackage = require("../server/models/TourPackage.js");
const Destination = require("../server/models/Destination.js");
const User = require("../server/models/User.js");

const dbUrl =
    process.env.ATLAS_DB_URL ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/wanderlust";

const curatedPackages = [
    {
        title: "Ladakh High Altitude Motorbike Expedition",
        slug: "ladakh-high-altitude-motorbike-expedition",
        destinationSlug: "ladakh",
        shortDescription: "Ride across Khardung La, Pangong Tso, and the dramatic sand dunes of Nubra Valley.",
        longDescription:
            "An adrenaline-fueled 7-day motorbike odyssey across the highest motorable passes on earth. Navigate barren Himalayan moonscapes, camp in luxury dome tents beside turquoise alpine lakes, and discover centuries-old Buddhist monasteries perched atop stark granite cliffs.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-ladakh-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-ladakh-1",
            },
            {
                url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-ladakh-2",
            },
        ],
        duration: { days: 7, nights: 6 },
        price: { basePrice: 28500, currency: "INR" },
        maxGroupSize: 12,
        difficultyLevel: "Challenging",
        inclusions: [
            "Royal Enfield 500cc Bike + Fuel",
            "Mechanic & Backup Support Vehicle",
            "High Altitude Tents & Premium Hotels",
            "Breakfast & Dinner Daily",
            "Inner Line Permits & Oxygen Kits",
        ],
        exclusions: [
            "Airfare to/from Leh",
            "Personal Riding Gear & Helmet",
            "Travel Insurance",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Arrival in Leh & Acclimatization",
                description: "Touch down at Kushok Bakula Rimpochee Airport. Rest during the afternoon to acclimatize to the 3,500m elevation. Evening stroll to the Leh market and Shanti Stupa.",
                activities: ["Airport transfer", "Leh Market walk", "Shanti Stupa sunset briefing"],
            },
            {
                dayNumber: 2,
                title: "Sham Valley & Magnetic Hill Warmup Ride",
                description: "Test ride your Royal Enfield towards Sham Valley. Visit the confluence of Indus and Zanskar rivers (Sangam), Magnetic Hill, and Gurudwara Pathar Sahib.",
                activities: ["Bike allocation & check", "Sangam river confluence", "Magnetic Hill test ride"],
            },
            {
                dayNumber: 3,
                title: "Leh to Nubra Valley via Khardung La (5,359m)",
                description: "Conquer the legendary Khardung La pass. Descend into the dramatic Nubra Valley, visit Diskit Monastery, and ride double-humped Bactrian camels on Hunder sand dunes.",
                activities: ["Khardung La summit photo stop", "Diskit Monastery giant Buddha", "Hunder sand dune sunset"],
            },
            {
                dayNumber: 4,
                title: "Nubra Valley to Turtuk (Balti Border Village)",
                description: "Ride along the Shyok river to Turtuk, the last Indian outpost before the Line of Control. Experience distinct Balti culture, apricot orchards, and stone houses.",
                activities: ["Shyok river ride", "Turtuk heritage walk", "Organic apricot tasting"],
            },
            {
                dayNumber: 5,
                title: "Nubra Valley to Pangong Tso Lake",
                description: "Ride off-road via Agham and Shyok to reach the breathtaking turquoise waters of Pangong Tso (4,250m). Camp under clear starry skies in insulated dome tents.",
                activities: ["Shyok off-road route", "Pangong Lake arrival", "Stargazing and bonfire dinner"],
            },
            {
                dayNumber: 6,
                title: "Pangong Tso to Leh via Chang La (5,360m)",
                description: "Witness golden morning reflections over Pangong Lake. Cross the snowy Chang La pass and visit Thiksey Monastery before returning to Leh.",
                activities: ["Sunrise lake photography", "Chang La pass crossing", "Thiksey Monastery evening prayer"],
            },
            {
                dayNumber: 7,
                title: "Departure from Leh",
                description: "Enjoy breakfast overlooking the snowcapped Stok Kangri range. Private transfer to Leh airport for your onward flight.",
                activities: ["Farewell breakfast", "Airport drop-off"],
            },
        ],
        isActive: true,
    },
    {
        title: "Goa Heritage, Spice Farms & Coastal Kayak Escape",
        slug: "goa-heritage-spice-farms-coastal-kayak-escape",
        destinationSlug: "goa",
        shortDescription: "Experience Latin Quarter heritage, backwater kayaking, private spice plantations, and sunset sailings.",
        longDescription:
            "Step beyond conventional beaches and immerse yourself in the soulful heritage of Portuguese Goa. Paddle through tranquil mangrove estuaries, dine on authentic Saraswat and Goan delicacies, explore Fontainhas' colorful villas, and unwind on secluded golden sands.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-goa-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-goa-1",
            },
        ],
        duration: { days: 4, nights: 3 },
        price: { basePrice: 14500, currency: "INR" },
        maxGroupSize: 10,
        difficultyLevel: "Easy",
        inclusions: [
            "Boutique Heritage Villa Stay",
            "Guided Mangrove Kayaking Session",
            "Organic Spice Plantation Lunch",
            "Fontainhas Walking Tour with Local Historian",
            "Airport Pickup & Drop",
        ],
        exclusions: [
            "Flight tickets to Goa",
            "Alcoholic Beverages",
            "Personal Souvenirs",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Welcome to Panjim & Fontainhas Heritage Walk",
                description: "Check into your restored Indo-Portuguese villa. In the evening, join a local historian for a guided walk through the pastel lanes of Fontainhas Latin Quarter.",
                activities: ["Villa check-in", "Fontainhas heritage walk", "Fado music & traditional Goan dinner"],
            },
            {
                dayNumber: 2,
                title: "Mangrove Backwater Kayaking & Divar Island",
                description: "Paddle through tranquil backwater tributaries teeming with kingfishers and otters. Take a ferry to tranquil Divar Island for a village cycling trail.",
                activities: ["Sunrise mangrove kayaking", "Divar Island ferry & cycling", "Traditional Goan bakery visit"],
            },
            {
                dayNumber: 3,
                title: "Sahakari Spice Plantation & Secluded South Coast",
                description: "Visit a lush organic spice farm in Ponda for a guided botanical tour and buffet lunch served on banana leaves. Sunset relaxation at Cola Beach.",
                activities: ["Spice plantation sensory trail", "Banana leaf lunch feast", "Cola Beach lagoon swim"],
            },
            {
                dayNumber: 4,
                title: "Morning Coastal Yoga & Departure",
                description: "Start the day with a seaside yoga session followed by fresh tropical fruits. Private transfer to Goa Dabolim / Mopa airport.",
                activities: ["Seaside yoga & meditation", "Artisan souvenir shopping", "Airport drop-off"],
            },
        ],
        isActive: true,
    },
    {
        title: "Royal Mewar Palace & Lake Heritage Journey",
        slug: "royal-mewar-palace-lake-heritage-journey",
        destinationSlug: "udaipur",
        shortDescription: "Indulge in palace heritage, private sunset boat cruises on Lake Pichola, and artisan workshops.",
        longDescription:
            "Immerse yourself in Rajasthan's City of Lakes. Wander through mirror-encrusted palace corridors, witness royal puppet arts and miniature painting studios, dine under the stars overlooking illuminated marble ghats, and take private boat rides across Lake Pichola.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-udaipur-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-udaipur-1",
            },
        ],
        duration: { days: 4, nights: 3 },
        price: { basePrice: 18000, currency: "INR" },
        maxGroupSize: 8,
        difficultyLevel: "Easy",
        inclusions: [
            "Heritage Haveli Accommodation",
            "Private Pichola Sunset Boat Cruise",
            "City Palace VIP Guided Tour",
            "Traditional Rajasthani Royal Thali Dinner",
            "Chauffeur-Driven AC Transfers",
        ],
        exclusions: [
            "Monument Camera Fees",
            "Personal Shopping",
            "Airfare",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Royal Arrival & Lake Pichola Sunset Cruise",
                description: "Arrive in Udaipur and check into a lakeside heritage haveli. In the late afternoon, embark on a private boat charter around Jag Mandir as the sun sets over the Aravalli hills.",
                activities: ["Haveli check-in", "Private boat charter", "Rooftop candlelight dinner"],
            },
            {
                dayNumber: 2,
                title: "City Palace Exploration & Miniature Art Studio",
                description: "Take a VIP guided walkthrough of the monumental City Palace complex. In the afternoon, visit master miniature painters and learn traditional Mewari fresco techniques.",
                activities: ["City Palace guided tour", "Crystal Gallery visit", "Artisan miniature painting workshop"],
            },
            {
                dayNumber: 3,
                title: "Monsoon Palace & Bagore Ki Haveli Folk Show",
                description: "Drive up to the hilltop Sajjangarh (Monsoon Palace) for panoramic valley views. Attend an exclusive evening Dharohar folk and puppet dance show at Bagore Ki Haveli.",
                activities: ["Sajjangarh hilltop viewpoint", "Saheliyon Ki Bari garden walk", "Bagore Ki Haveli folk dance show"],
            },
            {
                dayNumber: 4,
                title: "Heritage Bazaars & Departure",
                description: "Wander through the silver and leather markets of Bada Bazaar for authentic artisan keepsakes. Private chauffeur transfer to Udaipur Airport or railway station.",
                activities: ["Bada Bazaar shopping walk", "Airport transfer"],
            },
        ],
        isActive: true,
    },
    {
        title: "Parvati Valley Alpine & Kheerganga Hot Springs Trek",
        slug: "parvati-valley-alpine-kheerganga-hot-springs-trek",
        destinationSlug: "kasol",
        shortDescription: "Hike through ancient deodar forests, alpine villages, and rejuvenate in natural thermal springs.",
        longDescription:
            "A serene 5-day mountain escape through Himachal's mystical Parvati Valley. Trek along crystalline glacial torrents, camp under starry Himalayan skies at Kheerganga, soak in sulfur hot springs, and explore traditional Himachali culture in remote wooden hamlets.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-kasol-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-kasol-1",
            },
        ],
        duration: { days: 5, nights: 4 },
        price: { basePrice: 11500, currency: "INR" },
        maxGroupSize: 14,
        difficultyLevel: "Moderate",
        inclusions: [
            "Alpine Chalet & Mountain Camps",
            "Certified Mountain Trek Leaders",
            "All Veg Meals during Trek",
            "Trekking Permits & First Aid Kits",
            "Bonfire & Acoustic Night Sessions",
        ],
        exclusions: [
            "Personal Trekking Gear (Boots/Poles)",
            "Porters for personal luggage",
            "Travel to Kasol",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Arrival in Kasol & Parvati River Trail",
                description: "Reach Kasol and check into a riverfront pine chalet. Afternoon nature walk along the rushing Parvati River to the artistic hamlet of Chalal.",
                activities: ["Kasol arrival", "Chalal river suspension bridge walk", "Israeli-Himachali fusion café dinner"],
            },
            {
                dayNumber: 2,
                title: "Trek from Barshaini to Nakthan & Kheerganga (2,960m)",
                description: "Drive to Barshaini and commence the scenic 12km hike through oak and deodar groves, passing cascading waterfalls at Rudranag. Arrive at the Kheerganga alpine meadow.",
                activities: ["Barshaini trailhead start", "Rudranag waterfall stop", "Alpine meadow camp setup"],
            },
            {
                dayNumber: 3,
                title: "Kheerganga Thermal Springs & Mountain Summit Walk",
                description: "Wake up to panoramic views of snow-dusted peaks. Soak in the ancient natural sulfur hot springs and take an excursion to higher glacial viewpoints.",
                activities: ["Thermal sulfur spring bath", "High ridge panoramic hike", "Campfire stargazing"],
            },
            {
                dayNumber: 4,
                title: "Kheerganga Descent & Kalga Heritage Village",
                description: "Trek back down through apple orchards to the picturesque wooden village of Kalga. Stay in a traditional cedar homestay and enjoy local pahadi herbal teas.",
                activities: ["Scenic downhill trek", "Kalga apple orchard stroll", "Traditional Himachali dinner"],
            },
            {
                dayNumber: 5,
                title: "Manikaran Sahib Gurudwara & Departure",
                description: "Visit the revered hot springs and Gurudwara at Manikaran Sahib. Farewell lunch and transfer to Bhuntar airport or Kasol bus station.",
                activities: ["Manikaran Sahib visit", "Langar meal experience", "Departure transfer"],
            },
        ],
        isActive: true,
    },
    {
        title: "Western Ghats Rainforest & Tea Plantation Trail",
        slug: "western-ghats-rainforest-tea-plantation-trail",
        destinationSlug: "munnar",
        shortDescription: "Trek through cloud forests, organic tea gardens, spice estates, and misty mountain lookouts.",
        longDescription:
            "Discover the emerald grandeur of Kerala's high Western Ghats. Walk through manicured tea valleys, experience artisan tea tasting sessions, trek into the biosphere habitats of the endangered Nilgiri Tahr, and awaken to birdsong in eco-luxurious treehouse suites.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-munnar-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-munnar-1",
            },
        ],
        duration: { days: 4, nights: 3 },
        price: { basePrice: 13500, currency: "INR" },
        maxGroupSize: 10,
        difficultyLevel: "Moderate",
        inclusions: [
            "Colonial Plantation Bungalow / Treehouse Stay",
            "Tea Factory & Tasting Masterclass",
            "Eravikulam Wildlife Sanctuary Guided Trail",
            "South Indian Organic Meals",
            "Cochin Airport / Railway Station Transfers",
        ],
        exclusions: [
            "Flight / Train tickets to Cochin",
            "Personal Ayurvedic Spa Sessions",
            "Tips & Gratuities",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Arrival in Munnar & Cheeyappara Waterfall Trail",
                description: "Drive up the mist-shrouded Western Ghats from Cochin. Stop at Cheeyappara and Valara waterfalls before settling into a colonial tea estate bungalow.",
                activities: ["Scenic mountain drive", "Waterfall photo stops", "Plantation bungalow welcome high-tea"],
            },
            {
                dayNumber: 2,
                title: "Eravikulam National Park & Anamudi Lookout",
                description: "Early morning safari into Eravikulam National Park to spot the Nilgiri Tahr against the backdrop of South India's highest peak, Anamudi (2,695m).",
                activities: ["Wildlife sanctuary safari", "Nilgiri Tahr spotting", "Tea Museum & factory tour"],
            },
            {
                dayNumber: 3,
                title: "Kolukkumalai High-Altitude Tea Safari by 4x4 Jeep",
                description: "Jeep expedition to Kolukkumalai, the highest tea estate in the world (2,160m). Watch the cloud blanket roll beneath you while sampling orthodox black tea.",
                activities: ["4x4 jeep mountain trail", "Orthodox tea tasting session", "Top Station sunset viewpoint"],
            },
            {
                dayNumber: 4,
                title: "Mattupetty Dam, Spice Garden & Departure",
                description: "Explore the serene Mattupetty Dam reservoir and a family-run cardamom and pepper garden before taking your private transfer back to Cochin.",
                activities: ["Mattupetty speedboating", "Organic spice garden tour", "Cochin transfer"],
            },
        ],
        isActive: true,
    },
    {
        title: "Kangchenjunga Crest Monastery & Orchid Trail",
        slug: "kangchenjunga-crest-monastery-orchid-trail",
        destinationSlug: "kalimpong",
        shortDescription: "Panoramic views of Kangchenjunga, ancient Tibetan gompas, botanical nurseries, and artisan cheese trails.",
        longDescription:
            "Experience the peaceful serenity of the Eastern Himalayas in Kalimpong. Discover rare Himalayan orchids, visit the sacred Durpin Monastery, taste handcrafted Gouda cheese from local Swiss-origin dairies, and enjoy sunrise tea over snowcapped 8,000-meter peaks.",
        coverImage: {
            url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
            filename: "pkg-kalimpong-cover",
        },
        galleryImages: [
            {
                url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
                filename: "pkg-kalimpong-1",
            },
        ],
        duration: { days: 4, nights: 3 },
        price: { basePrice: 12800, currency: "INR" },
        maxGroupSize: 10,
        difficultyLevel: "Easy",
        inclusions: [
            "Boutique Mountain Homestay Stay",
            "Deolo Hill Sunrise Excursion",
            "Monastery & Cultural Walking Tour",
            "Artisanal Cheese Tasting & Farm Visit",
            "Bagdogra Airport Transfers",
        ],
        exclusions: [
            "Flights to Bagdogra",
            "Personal Expenses",
            "Travel Insurance",
        ],
        itinerary: [
            {
                dayNumber: 1,
                title: "Arrival via Teesta Valley & Mountain Homestay Check-in",
                description: "Drive along the emerald Teesta River up to Kalimpong ridge. Check into a heritage homestay surrounded by terraced organic farms and pine forests.",
                activities: ["Teesta river scenic drive", "Mountain homestay welcome", "Evening fireplace storytelling"],
            },
            {
                dayNumber: 2,
                title: "Deolo Hill Sunrise & Durpin Monastery Prayers",
                description: "Watch the morning alpine glow illuminate Mount Kangchenjunga from Deolo Hill. Visit Zang Dhok Palri Phodang (Durpin Monastery) to observe Tibetan chanting.",
                activities: ["Kangchenjunga sunrise panorama", "Durpin Monastery guided visit", "Handmade paper factory tour"],
            },
            {
                dayNumber: 3,
                title: "Pine View Cactus Nursery & Kalimpong Artisan Dairy",
                description: "Explore the largest exotic cactus nursery in Asia. Visit a heritage Swiss-origin artisan dairy for a workshop and tasting of local Kalimpong smoked Gouda cheese.",
                activities: ["Cactus botanical nursery", "Artisan cheese tasting tour", "Local haat bazaar walk"],
            },
            {
                dayNumber: 4,
                title: "Morning Orchid Garden Trail & Departure",
                description: "Stroll through a private orchid conservatory before a scenic descent back to Bagdogra Airport or NJP Railway Station.",
                activities: ["Orchid conservatory visit", "Transfer to Bagdogra / NJP"],
            },
        ],
        isActive: true,
    },
];

async function seedTourPackages() {
    try {
        console.log("[SeedPackages] Connecting to MongoDB...");
        await mongoose.connect(dbUrl);
        console.log("[SeedPackages] Connected.");

        let demoAdmin = await User.findOne({ role: "admin" });
        if (!demoAdmin) demoAdmin = await User.findOne();

        for (const pkg of curatedPackages) {
            const dest = await Destination.findOne({ slug: pkg.destinationSlug });
            if (!dest) {
                console.warn(`Destination not found for slug: ${pkg.destinationSlug}`);
                continue;
            }

            const existing = await TourPackage.findOne({ slug: pkg.slug });
            if (existing) {
                existing.title = pkg.title;
                existing.destination = dest._id;
                existing.shortDescription = pkg.shortDescription;
                existing.longDescription = pkg.longDescription;
                existing.coverImage = pkg.coverImage;
                existing.galleryImages = pkg.galleryImages;
                existing.duration = pkg.duration;
                existing.price = pkg.price;
                existing.maxGroupSize = pkg.maxGroupSize;
                existing.difficultyLevel = pkg.difficultyLevel;
                existing.inclusions = pkg.inclusions;
                existing.exclusions = pkg.exclusions;
                existing.itinerary = pkg.itinerary;
                existing.isActive = true;
                existing.createdBy = demoAdmin ? demoAdmin._id : null;
                await existing.save();
                console.log(`[SeedPackages] 🔄 Updated package with itinerary: "${pkg.title}" (${pkg.slug})`);
            } else {
                const newPkg = new TourPackage({
                    ...pkg,
                    destination: dest._id,
                    createdBy: demoAdmin ? demoAdmin._id : null,
                });
                await newPkg.save();
                console.log(`[SeedPackages] ➕ Created package with itinerary: "${pkg.title}" (${pkg.slug})`);
            }
        }

        console.log("[SeedPackages] Successfully seeded all 6 curated tour packages with day-by-day itineraries.");
    } catch (err) {
        console.error("[SeedPackages] Failed:", err);
    } finally {
        await mongoose.connection.close();
    }
}

if (require.main === module) {
    seedTourPackages();
}

module.exports = seedTourPackages;
