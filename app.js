if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const ListingRouter = require("./routes/listing.js");
const categoryRouter = require("./routes/category.js");
const reviewRouter = require("./routes/review.js");
const bookingRouter = require("./routes/booking.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");
const wishlistRouter = require("./routes/wishlist.js");
const dashboardRouter = require("./routes/dashboard.js");
const inboxRouter = require("./routes/inbox.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/user.js");
const Message = require("./models/message.js");
const mongoSanitize = require("express-mongo-sanitize");
const { EXCHANGE_RATES, formatPrice } = require("./utils/currency.js");


// --------------------------------------------------
// Basic Express configuration
// --------------------------------------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Sanitize user inputs to prevent NoSQL query injection
app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));


// --------------------------------------------------
// Database URL & Session configuration (MongoStore)
// --------------------------------------------------

const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";

const MongoStore = require("connect-mongo");
const MongoStoreClass = MongoStore.create ? MongoStore : (MongoStore.MongoStore || MongoStore.default);

const store = MongoStoreClass.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "development-secret-change-later",
    },
    touchAfter: 24 * 3600, // lazy session update once in 24 hours unless data modified
});

store.on("error", (err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

const sessionOption = {
    store,
    secret: process.env.SESSION_SECRET || "development-secret-change-later",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    },
};

app.use(session(sessionOption));


// --------------------------------------------------
// Flash messages
// --------------------------------------------------

app.use(flash());


// --------------------------------------------------
// Passport
// --------------------------------------------------

app.use(passport.initialize());
app.use(passport.session());


// --------------------------------------------------
// Local authentication
// --------------------------------------------------

passport.use(
    new LocalStrategy(User.authenticate())
);


// --------------------------------------------------
// Google authentication
// --------------------------------------------------

if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,

                clientSecret: process.env.GOOGLE_CLIENT_SECRET,

                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },

            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email =
                        profile.emails?.[0]?.value?.toLowerCase();

                    if (!email) {
                        return done(
                            new Error(
                                "Google account did not provide an email address"
                            )
                        );
                    }

                    let user = await User.findOne({
                        googleId: profile.id,
                    });

                    if (!user) {
                        user = await User.findOne({
                            email: email,
                        });
                    }

                    if (!user) {
                        user = new User({
                            googleId: profile.id,
                            email: email,
                            username:
                                profile.displayName ||
                                email.split("@")[0],
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


// --------------------------------------------------
// Passport session serialization
// --------------------------------------------------

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// --------------------------------------------------
// Global response locals
// --------------------------------------------------

app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    const currentCurrency = req.session.currency || "INR";
    res.locals.currCurrency = currentCurrency;
    res.locals.availableCurrencies = EXCHANGE_RATES;
    res.locals.formatPrice = (amount) => formatPrice(amount, currentCurrency);

    if (req.user) {
        try {
            res.locals.unreadCount = await Message.countDocuments({
                recipient: req.user._id,
                read: false,
            });
        } catch (e) {
            res.locals.unreadCount = 0;
        }
    } else {
        res.locals.unreadCount = 0;
    }

    next();
});


// --------------------------------------------------
// Routes
// --------------------------------------------------

// Currency switcher route
app.get("/currency/:code", (req, res) => {
    const code = (req.params.code || "").toUpperCase();
    if (EXCHANGE_RATES[code]) {
        req.session.currency = code;
        req.flash(
            "success",
            `Currency changed to ${EXCHANGE_RATES[code].name} (${EXCHANGE_RATES[code].symbol})`
        );
    }
    const backUrl = req.headers.referer || "/listings";
    res.redirect(backUrl);
});

// Root route -> redirect to /listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", ListingRouter);

app.use("/listings/:id", reviewRouter);

app.use("/listings/:id/bookings", bookingRouter);

app.use("/bookings", bookingRouter);

app.use("/inbox", inboxRouter);

app.use("/", userRouter);

app.use("/", categoryRouter);

app.use("/search", searchRouter);

app.use("/wishlist", wishlistRouter);
app.use("/listings", wishlistRouter);

app.use("/owner/dashboard", dashboardRouter);
app.use("/dashboard", dashboardRouter);


// --------------------------------------------------
// Socket.io Real-Time Event Handlers
// --------------------------------------------------

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
// MongoDB connection
// --------------------------------------------------

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Successfully connected to MongoDB");
}

main().catch((err) => {
    console.error("MongoDB connection failed:");
    console.error(err);
});


// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.all("*", (req, res, next) => {
    next(
        new ExpressError(
            404,
            "Page not Found"
        )
    );
});


// --------------------------------------------------
// Error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong",
    } = err;

    res.status(statusCode).render("error.ejs", {
        message,
    });
});


// --------------------------------------------------
// Start server
// --------------------------------------------------

const port = process.env.PORT || 3003;

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});