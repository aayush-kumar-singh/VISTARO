if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db.js");
const User = require("./models/User.js");
const ExpressError = require("./utils/ExpressError.js");
const { EXCHANGE_RATES } = require("./utils/currency.js");

// Import API Routers
const authRouter = require("./routes/authRoutes.js");
const listingRouter = require("./routes/listingRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");
const bookingRouter = require("./routes/bookingRoutes.js");
const searchRouter = require("./routes/searchRoutes.js");
const wishlistRouter = require("./routes/wishlistRoutes.js");
const dashboardRouter = require("./routes/dashboardRoutes.js");
const inboxRouter = require("./routes/inboxRoutes.js");

const app = express();
const server = http.createServer(app);

// Enable reverse proxy trust (Render / Heroku / AWS ELB)
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:3003",
    process.env.CLIENT_URL,
    process.env.APP_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }
            return callback(new Error("CORS not allowed for this origin"));
        },
        credentials: true,
    })
);

// --------------------------------------------------
// Socket.io Real-Time Messenger
// --------------------------------------------------
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.set("io", io);

io.on("connection", (socket) => {
    socket.on("join_conversation", (conversationId) => {
        if (conversationId) {
            socket.join(conversationId.toString());
        }
    });

    socket.on("send_message", (data) => {
        if (data && data.conversationId) {
            io.to(data.conversationId.toString()).emit("new_message", data);
        }
    });
});

// --------------------------------------------------
// Request Parsers & Sanitization
// --------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sanitize inputs to prevent NoSQL query injection
app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);

// --------------------------------------------------
// Session & MongoStore Configuration
// --------------------------------------------------
const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
const sessionSecret = process.env.SESSION_SECRET || "development-secret-change-later";

const MongoStoreClass = MongoStore.create ? MongoStore : (MongoStore.MongoStore || MongoStore.default);
const store = MongoStoreClass.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: sessionSecret,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("[Session Store Error]:", err);
});

const isProduction = process.env.NODE_ENV === "production";

app.use(
    session({
        store,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        },
    })
);

// --------------------------------------------------
// Passport Authentication
// --------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, "")}/api/auth/google/callback` : "http://localhost:3003/api/auth/google/callback");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: googleCallbackUrl,
                proxy: true,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value?.toLowerCase();
                    if (!email) {
                        return done(new Error("Google account did not provide an email address"));
                    }

                    let user = await User.findOne({ googleId: profile.id });
                    if (!user) {
                        user = await User.findOne({ email });
                    }

                    if (!user) {
                        user = new User({
                            googleId: profile.id,
                            email,
                            username: profile.displayName || email.split("@")[0],
                        });
                        await user.save();
                    } else if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --------------------------------------------------
// API Routes Mounting
// --------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/listings/:id/bookings", bookingRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/search", searchRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/inbox", inboxRouter);

// Currency info endpoint
app.get("/api/currencies", (req, res) => {
    res.json({
        success: true,
        currencies: EXCHANGE_RATES,
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

// --------------------------------------------------
// Production Static Build Serving
// --------------------------------------------------
if (isProduction) {
    const clientDist = path.join(__dirname, "../client/dist");
    app.use(express.static(clientDist));

    app.get("*", (req, res) => {
        if (!req.path.startsWith("/api")) {
            res.sendFile(path.join(clientDist, "index.html"));
        }
    });
}

// --------------------------------------------------
// 404 Handler for API Routes
// --------------------------------------------------
app.all("/api/*", (req, res, next) => {
    next(new ExpressError(404, "API endpoint not found"));
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    console.error(`[Error ${statusCode}]:`, message);

    res.status(statusCode).json({
        success: false,
        error: message,
    });
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------
const port = process.env.PORT || 3003;

server.listen(port, () => {
    console.log(`[Vistaro Express Server] Running on port ${port}`);
});

module.exports = { app, server };
