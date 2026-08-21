require('dotenv').config();

const mongoose = require('mongoose');
const Experience = require('../server/models/Experience.js');
const Destination = require('../server/models/Destination.js');
const User = require('../server/models/User.js');

const dbUrl =
    process.env.ATLAS_DB_URL ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/wanderlust';

const curatedExperiences = [
    // 1. LADAKH
    {
        title: 'Pangong High Altitude Astrophotography & Stargazing',
        slug: 'pangong-astrophotography-stargazing',
        destinationSlug: 'ladakh',
        category: 'Photography',
        shortDescription: 'Capture the Milky Way core above Pangong Tso with a professional astrophotographer.',
        longDescription:
            'Join an exclusive nocturnal masterclass beside the pristine, crystal waters of Pangong Lake at 14,270 ft. Under class-1 Bortle dark skies, learn deep-sky long exposure techniques, light painting, and constellation navigation through motorized tracking scopes.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-ladakh-astro',
        },
        durationHours: 4,
        price: { basePrice: 3500, currency: 'INR' },
        maxGroupSize: 8,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Pro Star-tracker mounts & red headlamps',
            'Hot butter tea & Kashmiri Kahwa',
            'Post-processing RAW workflow guide',
            'High altitude thermal blankets',
        ],
        meetingPoint: 'Spangmik Lakefront Camp, Pangong',
        isActive: true,
    },
    {
        title: 'Hemis Monastery Sunrise Chanting & Butter Lamp Ritual',
        slug: 'hemis-monastery-sunrise-chanting',
        destinationSlug: 'ladakh',
        category: 'Cultural',
        shortDescription: 'Witness dawn prayers, deep-throat chanting, and lamp offerings inside Ladakh’s largest monastery.',
        longDescription:
            'Experience the serene spiritual awakening of Hemis Gompa before public hours. Accompanied by a resident Drukpa scholar, participate in the sacred morning butter lamp lighting and listen to ancient Tibetan Buddhist scripture chanting.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-ladakh-hemis',
        },
        durationHours: 3,
        price: { basePrice: 1800, currency: 'INR' },
        maxGroupSize: 10,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Private temple entry permit',
            'Monk guide & translator',
            'Traditional tsampa & salted butter tea',
            'Blessed Khata scarf',
        ],
        meetingPoint: 'Hemis Monastery Main Courtyard, Leh',
        isActive: true,
    },

    // 2. GOA
    {
        title: 'Sunset Kayaking Through Chorao Mangrove Channels',
        slug: 'sunset-kayaking-chorao-mangroves',
        destinationSlug: 'goa',
        category: 'Adventure',
        shortDescription: 'Paddle through serene backwater channels and spot kingfishers, otters, and fruit bats at dusk.',
        longDescription:
            'Glide silently along the dense mangrove labyrinth of the Mandovi estuary near Salim Ali Bird Sanctuary. As the Goan golden hour illuminates the canopy, observe vibrant birdlife, flying foxes, and bioluminescent reflections under the guidance of marine naturalists.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-goa-kayak',
        },
        durationHours: 2.5,
        price: { basePrice: 1600, currency: 'INR' },
        maxGroupSize: 12,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Perception sit-on-top sea kayaks & paddles',
            'USCG approved life jackets & dry bags',
            'Certified Wilderness First Responder guide',
            'Fresh tender coconut water & Goan poi snacks',
        ],
        meetingPoint: 'Ribandar Ferry Jetty, Panaji',
        isActive: true,
    },
    {
        title: 'Artisanal Feni Distillation Trail & Heritage Spice Pairing',
        slug: 'artisanal-feni-distillation-spice-trail',
        destinationSlug: 'goa',
        category: 'Food & Drink',
        shortDescription: 'Tour a 200-year-old cashew estate, witness pot distillation, and taste infused feni cocktails.',
        longDescription:
            'Step into the lush hinterlands of Valpoi to explore Goa’s first GI-tagged heritage spirit. Walk among organic cashew groves, press fresh apples in stone basins, learn traditional copper pot distillation, and enjoy a curated tasting pairing local botanical feni with fiery Goan tapas.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-goa-feni',
        },
        durationHours: 3,
        price: { basePrice: 2200, currency: 'INR' },
        maxGroupSize: 10,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Guided distillery walk with 5th-gen master distiller',
            'Tasting flight of 4 artisanal pot-distilled fenis',
            'Goan tapas platter (prawn rissóis, mushroom xacuti poi)',
            'Handcrafted botanical souvenir bottle',
        ],
        meetingPoint: 'Heritage Estate Gate, Valpoi, North Goa',
        isActive: true,
    },

    // 3. UDAIPUR
    {
        title: 'Mewar Miniature Painting Masterclass with Master Artisan',
        slug: 'mewar-miniature-painting-masterclass',
        destinationSlug: 'udaipur',
        category: 'Workshop',
        shortDescription: 'Learn delicate Mewari gold-leaf and stone-pigment miniature painting techniques using squirrel-hair brushes.',
        longDescription:
            'Spend an intimate morning in a heritage haveli studio near Gangaur Ghat. Guided by an award-winning master miniature artist, grind mineral pigments from lapis lazuli and malachite, sketch intricate Mewar motifs, and complete your own framed Rajasthani artwork on handmade silk paper.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-udaipur-paint',
        },
        durationHours: 3,
        price: { basePrice: 1900, currency: 'INR' },
        maxGroupSize: 8,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'All painting tools, stone pigments, and real gold leaf',
            'Handmade antique silk parchment',
            'Traditional wooden frame for your completed piece',
            'Saffron masala chai & Mewari kachoris',
        ],
        meetingPoint: 'Artist Haveli Studio, Gangaur Ghat Marg, Udaipur',
        isActive: true,
    },
    {
        title: 'Lake Pichola Secret Rooftop Twilight & Royal Ghazal Soiree',
        slug: 'lake-pichola-rooftop-twilight-ghazal',
        destinationSlug: 'udaipur',
        category: 'Cultural',
        shortDescription: 'Enjoy front-row palace views, private candlelit dinner, and live santoor & ghazal performances.',
        longDescription:
            'Ascend to an exclusive 18th-century royal terrace commanding uninterrupted panoramic views of City Palace and Jag Mandir illuminated across Lake Pichola. Savor royal Mewari delicacies while classical musicians perform meditative ragas and soul-stirring ghazals.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-udaipur-ghazal',
        },
        durationHours: 2.5,
        price: { basePrice: 2800, currency: 'INR' },
        maxGroupSize: 12,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Reserved private rooftop seat',
            '4-course royal Rajasthani thali dining',
            'Live santoor and vocal performance',
            'Welcome rose sherbet & mukhwas',
        ],
        meetingPoint: 'Ambrai Ghat Riverside Steps, Udaipur',
        isActive: true,
    },

    // 4. MUNNAR
    {
        title: 'Shola Rainforest Night Safari & Endemic Amphibian Spotting',
        slug: 'shola-rainforest-night-safari',
        destinationSlug: 'munnar',
        category: 'Nature',
        shortDescription: 'Venture into the Western Ghats biodiversity hotspot with wildlife biologists using UV torches.',
        longDescription:
            'Explore the nocturnal wonders of Munnar’s pristine montane shola forest. Equipped with specialized torches, search for the critically endangered Resplendent Bush Frog, flying squirrels, Nilgiri pit vipers, and luminescent fungi under the guidance of conservationists.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-munnar-night',
        },
        durationHours: 3.5,
        price: { basePrice: 2000, currency: 'INR' },
        maxGroupSize: 8,
        difficultyLevel: 'Moderate',
        whatsIncluded: [
            'Specialized 395nm UV & high-lumen headlamps',
            'Certified herpetologist & naturalist guide',
            'Leech socks & rain ponchos',
            'Steaming cardamom tea & Kerala banana chips',
        ],
        meetingPoint: 'Eravikulam Forest Checkpoint, Munnar',
        isActive: true,
    },
    {
        title: 'Single-Estate Specialty Tea Cupping & Sommelier Masterclass',
        slug: 'single-estate-tea-cupping-masterclass',
        destinationSlug: 'munnar',
        category: 'Food & Drink',
        shortDescription: 'Sample rare silver needle, orthodox black, and green flushes with an estate tea taster.',
        longDescription:
            'Walk the mist-draped terraced slopes of Munnar’s oldest colonial plantation. Hand-pluck fresh two-leaves-and-a-bud flushes, observe factory artisanal rolling and oxidation, then participate in a formal sensory cupping session comparing 6 micro-lot teas.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-munnar-tea',
        },
        durationHours: 2.5,
        price: { basePrice: 1500, currency: 'INR' },
        maxGroupSize: 10,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Private factory & estate access',
            'Cupping session with 6 single-origin teas',
            'Freshly baked British tea scones & local honey',
            '100g tin of imperial white tea to take home',
        ],
        meetingPoint: 'Lockhart Tea Factory Main Foyer, Munnar',
        isActive: true,
    },

    // 5. KASOL
    {
        title: 'Parvati River Tibetan Sound Healing & Herbal Tea Circle',
        slug: 'parvati-river-sound-healing-circle',
        destinationSlug: 'kasol',
        category: 'Wellness',
        shortDescription: 'Meditate beside glacial river cascades with full-moon singing bowls and wild mountain teas.',
        longDescription:
            'Unwind in a tranquil pine glade where the crystal waters of the Parvati River meet whispering deodars. Guided by a certified sound therapist, experience deep acoustic resonance using hand-hammered 7-metal Tibetan bowls, followed by a grounding wild chamomile & rhododendron tea ceremony.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-kasol-sound',
        },
        durationHours: 2.5,
        price: { basePrice: 1400, currency: 'INR' },
        maxGroupSize: 10,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Full acoustic sound bath with Tibetan singing bowls',
            'Eco-friendly meditation mats & woollen shawls',
            'Wild-foraged Parvati herbal tea blending',
            'Personal engraved wooden souvenir',
        ],
        meetingPoint: 'Chalal Suspension Bridge Riverside Glade, Kasol',
        isActive: true,
    },
    {
        title: 'Grahan Village Alpine Trail & Himachali Folklore Walk',
        slug: 'grahan-village-alpine-trail-folklore',
        destinationSlug: 'kasol',
        category: 'Adventure',
        shortDescription: 'Hike through dense pine forests to a heritage Himachali wooden hamlet with local storytellers.',
        longDescription:
            'Trek alongside gushing mountain streams into the secluded traditional village of Grahan. Marvel at ancient Kath-Kuni timber architecture, meet village elders, hear forgotten Himalayan folk legends, and enjoy an authentic home-cooked thali in a traditional family kitchen.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-kasol-grahan',
        },
        durationHours: 5,
        price: { basePrice: 2400, currency: 'INR' },
        maxGroupSize: 8,
        difficultyLevel: 'Moderate',
        whatsIncluded: [
            'Certified mountain guide & folklore storyteller',
            'Traditional Himachali home-cooked lunch (Siddu, Rajma, Ghee)',
            'Carbon-fiber trekking poles for the hike',
            'First aid kit & trail snacks',
        ],
        meetingPoint: 'Kasol Main Bridge Trailhead, Kasol',
        isActive: true,
    },

    // 6. KALIMPONG
    {
        title: 'Organic Dairy Cheese Making & Himalayan Orchid Nursery Walk',
        slug: 'organic-cheese-making-orchid-walk',
        destinationSlug: 'kalimpong',
        category: 'Food & Drink',
        shortDescription: 'Craft gouda cheese with a Swiss-trained farm master and explore rare Himalayan orchid nurseries.',
        longDescription:
            'Discover Kalimpong’s rich legacy of European artisanal cheese making. Visit a heritage hillside dairy, learn curd cutting, pressing, and cave aging of Kalimpong Gouda, then wander through an international award-winning collection of rare epiphytic orchids.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-kalimpong-cheese',
        },
        durationHours: 3,
        price: { basePrice: 1800, currency: 'INR' },
        maxGroupSize: 8,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Hands-on cheesemaking workshop and cellar tour',
            'Platter of 4 aged Kalimpong cheeses with local fig preserves',
            'Botanical orchid nursery walk with horticulturist',
            'Sample wheel of artisan cheese to take home',
        ],
        meetingPoint: 'Heritage Hillside Dairy Farm, 8th Mile, Kalimpong',
        isActive: true,
    },
    {
        title: 'Deolo Hill Ridge-Line Golden Hour Landscape Photography',
        slug: 'deolo-hill-ridge-line-photography',
        destinationSlug: 'kalimpong',
        category: 'Photography',
        shortDescription: 'Capture panoramic vistas of Kangchenjunga and Teesta river valley with an award-winning mentor.',
        longDescription:
            'Ascend to the highest vantage point in Kalimpong for an inspiring golden hour photo expedition. Master composition, gradient ND filtration, and panoramic HDR techniques while capturing Kangchenjunga’s snow-clad crest glowing in twilight above the serpentine Teesta Valley.',
        coverImage: {
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
            filename: 'exp-kalimpong-photo',
        },
        durationHours: 3.5,
        price: { basePrice: 2200, currency: 'INR' },
        maxGroupSize: 6,
        difficultyLevel: 'Easy',
        whatsIncluded: [
            'Professional landscape photographer mentoring',
            'ND filter kit & sturdy tripod loaners',
            'Mountain lookout tea & local bakery treats',
            'Digital critique & photo editing preset pack',
        ],
        meetingPoint: 'Deolo Tourist Complex Main Gate, Kalimpong',
        isActive: true,
    },
];

async function seedExperiences() {
    try {
        console.log('[Seed Experiences] Connecting to MongoDB...');
        await mongoose.connect(dbUrl);
        console.log('[Seed Experiences] Successfully connected.');

        // Get admin user
        const adminUser = (await User.findOne({ role: 'admin' })) || (await User.findOne());
        const adminId = adminUser ? adminUser._id : null;

        // Get all destinations
        const destinations = await Destination.find();
        console.log(`[Seed Experiences] Loaded ${destinations.length} destinations.`);

        const destBySlug = {};
        destinations.forEach((d) => {
            destBySlug[d.slug] = d;
        });

        let seededCount = 0;
        let updatedCount = 0;

        for (const expData of curatedExperiences) {
            const destDoc = destBySlug[expData.destinationSlug];
            if (!destDoc) {
                console.warn(`[Seed Experiences] Warning: Destination slug '${expData.destinationSlug}' not found.`);
                continue;
            }

            const expPayload = {
                title: expData.title,
                slug: expData.slug,
                destination: destDoc._id,
                category: expData.category,
                shortDescription: expData.shortDescription,
                longDescription: expData.longDescription,
                coverImage: expData.coverImage,
                durationHours: expData.durationHours,
                price: expData.price,
                maxGroupSize: expData.maxGroupSize,
                difficultyLevel: expData.difficultyLevel,
                whatsIncluded: expData.whatsIncluded,
                meetingPoint: expData.meetingPoint,
                isActive: expData.isActive !== false,
                createdBy: adminId,
            };

            const existing = await Experience.findOne({ slug: expData.slug });
            if (existing) {
                await Experience.findByIdAndUpdate(existing._id, expPayload);
                updatedCount++;
                console.log(`  ↻ Updated: ${expData.title} (${destDoc.name})`);
            } else {
                await Experience.create(expPayload);
                seededCount++;
                console.log(`  + Created: ${expData.title} (${destDoc.name})`);
            }
        }

        console.log(`\n[Seed Experiences] Done! Seeded: ${seededCount}, Updated: ${updatedCount}.`);
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('[Seed Experiences] Fatal error:', err);
        process.exit(1);
    }
}

seedExperiences();
