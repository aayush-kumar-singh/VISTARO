# VISTARO Architecture Migration — Phase 1 Comprehensive Repository Audit Report

> **Document Version:** 1.0.0  
> **Phase:** 1 (File-by-File Repository Audit & Baseline Verification)  
> **Status:** Completed  
> **Code Changes in this Phase:** 0 (Audit-Only)

---

## 1. Executive Summary & Baseline Verification

This document provides an exhaustive, file-by-file architectural audit of the entire Vistaro codebase across backend (`server/`), frontend (`client/`), database seed scripts (`init/`), and root deployment configurations.

### 1.1 Baseline Build & Test Status
- **Client Production Bundle (`npm run build --prefix client`):** ✅ **0 errors** (built in 775ms).
- **Backend API & End-to-End Test Suite (`grand_master_production_regression.js`):** ✅ **73 / 73 tests passed (100%)**.
- **Monorepo Architecture:** Single Git repository containing `client/` and `server/` subfolders managed with root orchestration scripts.

---

## 2. Backend Architecture Audit (`server/`)

### 2.1 Entry Points & Core Configuration

| File Path | Description / Responsibility |
| :--- | :--- |
| `server/server.js` | Main Express HTTP server & Socket.io server. Handles CORS, reverse proxy trust, request sanitization (`express-mongo-sanitize`), encrypted session store (`connect-mongo`), Passport.js local and Google OAuth strategies, REST API router mounting (`/api/*`), production static asset serving (`client/dist`), health checks, and global error handling. |
| `server/config/db.js` | Mongoose connection initialization to MongoDB Atlas (`ATLAS_DB_URL`) or local instance (`MONGO_URI`). |
| `server/config/cloudinary.js` | Cloudinary v2 SDK configuration and `multer-storage-cloudinary` storage engine setup (`wanderlust_DEV` folder, image format filtering). |

---

### 2.2 Route Files & Endpoint Mappings (`server/routes/`)

| Route File | Base Path in `server.js` | Endpoints Defined | Middleware Stack | Controller Handler Mapped |
| :--- | :--- | :--- | :--- | :--- |
| `server/routes/adminRoutes.js` | `/api/admin` | `GET /stats`<br>`GET /users`<br>`PATCH /users/:id/role`<br>`PATCH /users/:id/host-request`<br>`DELETE /users/:id`<br>`PATCH /listings/:id`<br>`DELETE /listings/:id`<br>`POST /destinations`<br>`PATCH /destinations/:id`<br>`DELETE /destinations/:id`<br>`GET /tour-packages`<br>`POST /tour-packages`<br>`PATCH /tour-packages/:id`<br>`DELETE /tour-packages/:id`<br>`GET /experiences`<br>`POST /experiences`<br>`PATCH /experiences/:id`<br>`GET /transfers`<br>`POST /transfers`<br>`PATCH /transfers/:id`<br>`DELETE /transfers/:id` | `isLoggedIn`, `isAdmin`, `validateObjectId`, `handleImageUpload` | `adminController.getStats`<br>`adminController.getAllUsers`<br>`adminController.updateUserRole`<br>`adminController.handleHostRequest`<br>`adminController.deleteUserAdmin`<br>`adminController.updateListingAdmin`<br>`adminController.deleteListingAdmin`<br>`adminController.createDestinationAdmin`<br>`adminController.updateDestinationAdmin`<br>`adminController.deactivateDestinationAdmin`<br>`adminController.getAllTourPackagesAdmin`<br>`adminController.createTourPackageAdmin`<br>`adminController.updateTourPackageAdmin`<br>`adminController.deactivateTourPackageAdmin`<br>`adminController.getAllExperiencesAdmin`<br>`adminController.createExperienceAdmin`<br>`adminController.updateExperienceAdmin`<br>`adminController.getAllTransfersAdmin`<br>`adminController.createTransferAdmin`<br>`adminController.updateTransferAdmin`<br>`adminController.deactivateTransferAdmin` |
| `server/routes/authRoutes.js` | `/api/auth` & `/auth` | `POST /signup`<br>`POST /login`<br>`POST /logout`<br>`GET /logout`<br>`GET /current-user`<br>`GET /profile`<br>`PUT /profile`<br>`PUT /change-password`<br>`POST /request-host`<br>`GET /google`<br>`GET /google/callback` | `signupLimiter`, `loginLimiter`, `passport.authenticate("local")`, `isLoggedIn`, `passport.authenticate("google")` | `authController.signUpUser`<br>`authController.login`<br>`authController.logout`<br>`authController.getCurrentUser`<br>`authController.getProfile`<br>`authController.updateProfile`<br>`authController.changePassword`<br>`authController.requestHostAccess`<br>OAuth redirect callback |
| `server/routes/bookingRoutes.js` | `/api/listings/:id/bookings`, `/api/bookings`, `/api/my-bookings` | `GET /my-bookings`<br>`GET /`<br>`GET /:bookingId`<br>`POST /`<br>`DELETE /:bookingId`<br>`POST /:bookingId/cancel` | `isLoggedIn`, `validateObjectId`, `validateBooking`, `bookingLimiter` | `bookingController.getMyBookings`<br>`bookingController.getBookingById`<br>`bookingController.createBooking`<br>`bookingController.cancelBooking` |
| `server/routes/dashboardRoutes.js` | `/api/dashboard` | `GET /` | `isLoggedIn` | `dashboardController.getDashboard` |
| `server/routes/destinationRoutes.js` | `/api/destinations` | `GET /`<br>`GET /:slug` | None (Public Read) | `destinationController.index`<br>`destinationController.getDestinationBySlug` |
| `server/routes/experienceRoutes.js` | `/api/experiences` | `GET /`<br>`GET /:slug`<br>`POST /:id/bookings`<br>`POST /:id/reviews`<br>`DELETE /:id/reviews/:reviewId`<br>`POST /:id/reviews/:reviewId/reply`<br>`DELETE /:id/reviews/:reviewId/reply` | `isLoggedIn`, `validateObjectId`, `bookingLimiter`, `validateReview`, `reviewLimiter`, `validateReviewReply`, `replyLimiter` | `experienceController.index`<br>`experienceController.getExperienceBySlug`<br>`bookingController.createExperienceBooking`<br>`reviewController.createExperienceReview`<br>`reviewController.deleteExperienceReview`<br>`reviewController.addExperienceReviewReply`<br>`reviewController.deleteExperienceReviewReply` |
| `server/routes/inboxRoutes.js` | `/api/inbox` | `GET /`<br>`POST /start/:listingId`<br>`GET /:conversationId`<br>`POST /:conversationId/messages` | `isLoggedIn`, `validateObjectId` | `inboxController.listConversations`<br>`inboxController.startConversation`<br>`inboxController.showConversation`<br>`inboxController.sendMessage` |
| `server/routes/listingRoutes.js` | `/api/listings` | `GET /`<br>`POST /`<br>`GET /:id`<br>`PUT /:id`<br>`DELETE /:id` | `createListingLimiter`, `isLoggedIn`, `isHostOrAdmin`, `handleImageUpload`, `validateListing`, `validateObjectId`, `isOwner` | `listingController.index`<br>`listingController.createListing`<br>`listingController.getListingById`<br>`listingController.updateListing`<br>`listingController.destroyListing` |
| `server/routes/reviewRoutes.js` | `/api/listings/:id/reviews` | `POST /`<br>`DELETE /:reviewId`<br>`POST /:reviewId/reply`<br>`DELETE /:reviewId/reply` | `validateObjectId`, `reviewLimiter`, `isLoggedIn`, `validateReview`, `isReviewAuthor`, `replyLimiter`, `isOwner`, `validateReviewReply` | `reviewController.createReview`<br>`reviewController.deleteReview`<br>`reviewController.addReviewReply`<br>`reviewController.deleteReviewReply` |
| `server/routes/searchRoutes.js` | `/api/search` | `GET /` | None (Public Read) | `searchController.searchListings` |
| `server/routes/supportRoutes.js` | `/api/support` | `POST /contact` | `contactLimiter` | `supportController.submitContactForm` |
| `server/routes/tourPackageRoutes.js` | `/api/tour-packages` | `GET /`<br>`GET /:slug`<br>`POST /:id/bookings`<br>`POST /:id/reviews`<br>`DELETE /:id/reviews/:reviewId`<br>`POST /:id/reviews/:reviewId/reply`<br>`DELETE /:id/reviews/:reviewId/reply` | `isLoggedIn`, `validateObjectId`, `bookingLimiter`, `validateReview`, `reviewLimiter`, `validateReviewReply`, `replyLimiter` | `tourPackageController.index`<br>`tourPackageController.getTourPackageBySlug`<br>`bookingController.createPackageBooking`<br>`reviewController.createPackageReview`<br>`reviewController.deletePackageReview`<br>`reviewController.addPackageReviewReply`<br>`reviewController.deletePackageReviewReply` |
| `server/routes/transferRoutes.js` | `/api/transfers` | `GET /`<br>`GET /:id` | None (Public Read) | `transferController.index`<br>`transferController.getTransferById` |
| `server/routes/travelPlanRoutes.js` | `/api/travel-plans` | `POST /`<br>`GET /`<br>`GET /:id`<br>`PATCH /:id`<br>`DELETE /:id`<br>`POST /:id/items`<br>`DELETE /:id/items/:itemSubDocId` | `isLoggedIn`, `validateObjectId` | `travelPlanController.createPlan`<br>`travelPlanController.getUserPlans`<br>`travelPlanController.getPlanById`<br>`travelPlanController.updatePlan`<br>`travelPlanController.deletePlan`<br>`travelPlanController.addItemToPlan`<br>`travelPlanController.removeItemFromPlan` |
| `server/routes/wishlistRoutes.js` | `/api/wishlist` | `GET /`<br>`POST /:id/toggle` | `isLoggedIn`, `validateObjectId` | `wishlistController.getWishlist`<br>`wishlistController.toggleWishlist` |

---

### 2.3 Controllers & Handlers (`server/controllers/`)

| Controller File | Associated Routes | Summary of Responsibilities |
| :--- | :--- | :--- |
| `server/controllers/adminController.js` | `adminRoutes.js` | Provides platform statistics, user management (role assignment, host requests approval/rejection, user deletion), listing moderation, destination CRUD, tour package CRUD, experience CRUD, and transfer service CRUD. |
| `server/controllers/authController.js` | `authRoutes.js` | Handles user registration with `passport-local-mongoose`, credential authentication, logout, session verification (`/current-user`), profile updates, password modification, and host application requests. |
| `server/controllers/bookingController.js` | `bookingRoutes.js`, `tourPackageRoutes.js`, `experienceRoutes.js` | Manages unified reservation creation for stays, tour packages, and experiences with conflict checking, price calculations, automated confirmation emails, and multi-tier cancellation refunds. |
| `server/controllers/dashboardController.js` | `dashboardRoutes.js` | Computes host and owner metrics: active listing counts, total bookings, estimated gross earnings, and average occupancy rate. |
| `server/controllers/destinationController.js` | `destinationRoutes.js` | Public querying of active destinations with aggregated related stays, tour packages, experiences, and transfer services. |
| `server/controllers/experienceController.js` | `experienceRoutes.js` | Public directory browsing and detailed slug lookups for curated activities, outdoor adventures, and workshops. |
| `server/controllers/inboxController.js` | `inboxRoutes.js` | Direct real-time chat between travelers and hosts, conversation retrieval, unread tracking, and Socket.io message broadcasting. |
| `server/controllers/listingController.js` | `listingRoutes.js` | CRUD for stay listings, Geoapify geocoding integration, multi-image upload handling, and destination linking. |
| `server/controllers/reviewController.js` | `reviewRoutes.js`, `tourPackageRoutes.js`, `experienceRoutes.js` | Handles 1-review-per-verified-booking submission, review deletion, and host owner reply management across stays, packages, and experiences. |
| `server/controllers/searchController.js` | `searchRoutes.js` | Multi-criteria search for listings (text regex matching across title/location/country, category filtering, min/max price filtering). |
| `server/controllers/supportController.js` | `supportRoutes.js` | Ingestion, validation, and database storage for customer support inquiries with automated email notifications. |
| `server/controllers/tourPackageController.js` | `tourPackageRoutes.js` | Public directory browsing and detailed slug lookups for multi-day tour packages with day-by-day itineraries. |
| `server/controllers/transferController.js` | `transferRoutes.js` | Public directory lookups for private airport pickups, drops, intercity cabs, and scenic drives. |
| `server/controllers/travelPlanController.js` | `travelPlanRoutes.js` | Multi-item itinerary builder supporting polymorphic references (`listing`, `tourPackage`, `experience`, `transfer`) with strict ownership security. |
| `server/controllers/wishlistController.js` | `wishlistRoutes.js` | Guest/user wishlist querying and atomic toggle (`$addToSet` / `$pull`) on user profiles. |

---

### 2.4 Mongoose Models & Schemas (`server/models/`)

| Model File | Key Schema Fields | Model Relationships & References |
| :--- | :--- | :--- |
| `server/models/User.js` | `email`, `username`, `bio`, `role` (`user`/`host`/`admin`), `hostRequestStatus`, `hostRequestReason`, `googleId` | `wishlist`: `[ObjectId -> Listing]`, `recentlyViewed`: `[ObjectId -> Listing]`. Uses `passport-local-mongoose`. |
| `server/models/Listing.js` | `title`, `description`, `images` (`[{url, filename}]`), `price`, `maxGuests`, `amenities`, `cancellationPolicy`, `location`, `country`, `geometry` (`Point`), `category`, `isFeatured`, `isTrending` | `owner`: `ObjectId -> User`, `destination`: `ObjectId -> Destination`, `reviews`: `[ObjectId -> Review]`. Cascade delete hook for reviews. |
| `server/models/Review.js` | `comment`, `rating` (1-5), `targetType` (`stay`/`package`/`experience`), `ownerReply` (`{comment, createdAt}`) | `author`: `ObjectId -> User`, `listing`: `ObjectId -> Listing`, `tourPackage`: `ObjectId -> TourPackage`, `experience`: `ObjectId -> Experience`, `booking`: `ObjectId -> Booking`. |
| `server/models/Booking.js` | `bookingType` (`stay`/`package`/`experience`), `checkIn`, `checkOut`, `nights`, `guests`, `totalPrice`, `status`, `policySnapshot`, `cancellation` (`{reason, cancelledAt, refundAmount, refundPercentage}`) | `user`: `ObjectId -> User`, `listing`: `ObjectId -> Listing`, `tourPackage`: `ObjectId -> TourPackage`, `experience`: `ObjectId -> Experience`, `cancellation.cancelledBy`: `ObjectId -> User`. |
| `server/models/Destination.js` | `name`, `slug`, `state`, `country`, `shortTagline`, `longDescription`, `heroImage`, `galleryImages`, `bestFor`, `identityTags`, `coordinates`, `isActive`, `isFeatured`, `isTrending` | Target referenced by `Listing.destination`, `TourPackage.destination`, `Experience.destination`, `Transfer.destination`, `TravelPlan.destination`. |
| `server/models/TourPackage.js` | `title`, `slug`, `shortDescription`, `longDescription`, `coverImage`, `galleryImages`, `duration` (`{days, nights}`), `price`, `maxGroupSize`, `inclusions`, `exclusions`, `difficultyLevel`, `itinerary` (`[{day, title, description, activities}]`), `isActive`, `isFeatured`, `isTrending` | `destination`: `ObjectId -> Destination`. |
| `server/models/Experience.js` | `title`, `slug`, `category`, `shortDescription`, `longDescription`, `coverImage`, `galleryImages`, `durationHours`, `price`, `maxGroupSize`, `whatsIncluded`, `meetingPoint`, `difficultyLevel`, `isActive`, `isFeatured`, `isTrending` | `destination`: `ObjectId -> Destination`. |
| `server/models/Transfer.js` | `title`, `slug`, `transferType`, `vehicleType`, `capacity`, `price`, `priceUnit`, `description`, `pickupLocation`, `dropLocation`, `estimatedDuration`, `includedFeatures`, `coverImage`, `cancellationPolicy`, `isActive` | `destination`: `ObjectId -> Destination`. |
| `server/models/TravelPlan.js` | `title`, `startDate`, `endDate`, `items` (`[{itemType, itemId, notes, addedAt}]`), `isArchived` | `owner`: `ObjectId -> User`, `destination`: `ObjectId -> Destination`, `items.itemId`: Polymorphic `refPath` pointing to dynamic `itemType` (`listing`, `tourPackage`, `experience`, `transfer`). |
| `server/models/Conversation.js` | `timestamps` | `listing`: `ObjectId -> Listing`, `participants`: `[ObjectId -> User]`, `lastMessage`: `ObjectId -> Message`. |
| `server/models/Message.js` | `body`, `read`, `createdAt` | `conversation`: `ObjectId -> Conversation`, `sender`: `ObjectId -> User`, `recipient`: `ObjectId -> User`. |
| `server/models/ContactSubmission.js` | `name`, `email`, `subject`, `category`, `message`, `status` (`New`/`In Progress`/`Resolved`) | `user`: `ObjectId -> User` (optional reference when logged in). |

---

### 2.5 Middleware & Utility Files (`server/middleware/`, `server/utils/`)

| File Path | Functional Purpose |
| :--- | :--- |
| `server/middleware/auth.js` | Authorization & identity guards: `isLoggedIn` (401), `isAdmin` (403), `isHostOrAdmin` (403), `isOwner` (403 listing guard), `isReviewAuthor` (403 review guard), `validateObjectId` (400 MongoDB hex validation). |
| `server/middleware/rateLimiter.js` | Brute-force & DoS mitigation via `express-rate-limit`: `loginLimiter`, `signupLimiter`, `createListingLimiter`, `reviewLimiter`, `replyLimiter`, `bookingLimiter`, `contactLimiter`. Automatically bypassed during test suite runs. |
| `server/middleware/upload.js` | Multer middleware handling single/multiple file image uploads (5MB max per image, JPEG/PNG/WebP validation, max 5 images). |
| `server/middleware/validate.js` | Joi input validation with custom HTML sanitizer extension (`sanitize-html`) preventing XSS on listings, reviews, replies, and reservations. |
| `server/utils/ExpressError.js` | Custom `Error` class containing HTTP `statusCode` and error message payloads. |
| `server/utils/wrapAsync.js` | Higher-order async handler catching rejected promises and routing them to Express `next(err)`. |
| `server/utils/currency.js` | Currency configuration matrix (INR, USD, EUR, GBP, AED) and currency formatting helper `formatPrice`. |
| `server/utils/sendEmail.js` | Nodemailer email templates and SMTP dispatcher for booking receipts, cancellation notices, and support inquiries with Ethereal fallback. |

---

### 2.6 Socket.io, Auth & Integrations

1. **Socket.io Messenger:** Initialized in `server/server.js:117-139`. Manages room joins (`join_conversation`), message broadcasts (`new_message`), and disconnections.
2. **Passport.js & Session Persistence:** Configured with `passport-local` and `passport-google-oauth20` strategies. Sessions stored in MongoDB via `connect-mongo` with 7-day TTL.
3. **Geoapify Geocoding:** Implemented in `server/controllers/listingController.js` and `init/index.js`. Converts human addresses into GeoJSON coordinates.

---

## 3. Frontend Architecture Audit (`client/`)

### 3.1 Directory Structure

```
client/src/
├── api/                  # 16 Axios-based API client modules
│   ├── adminApi.js
│   ├── authApi.js
│   ├── bookingsApi.js
│   ├── client.js         # Base axios instance with credentials & interceptors
│   ├── dashboardApi.js
│   ├── destinationsApi.js
│   ├── experiencesApi.js
│   ├── inboxApi.js
│   ├── listingsApi.js
│   ├── reviewsApi.js
│   ├── searchApi.js
│   ├── supportApi.js
│   ├── tourPackagesApi.js
│   ├── transfersApi.js
│   ├── travelPlansApi.js
│   └── wishlistApi.js
├── assets/               # Static images and SVGs
│   ├── hero.png
│   ├── typescript.svg
│   └── vite.svg
├── components/           # 26 Subdivided UI and feature components
│   ├── auth/             # Route guards (AdminRoute, GuestRoute, ProtectedRoute, HostAccessGate)
│   ├── booking/          # BookingWidget
│   ├── common/           # LoadingSpinner, StarRating, ToastContainer
│   ├── destinations/     # DestinationCard
│   ├── experiences/      # ExperienceCard
│   ├── home/             # HeroSection, LandingFeatured*, LandingClosingCTA
│   ├── layout/           # Navbar, Footer, MobileBottomNav, Layout
│   ├── listings/         # ListingCard, CategoryBar, FilterModal, ImageGallery, Lightbox, MapView, HeroBanner
│   ├── packages/         # TourPackageCard
│   ├── reviews/          # ReviewCard, ReviewForm
│   ├── transfers/        # TransferCard
│   └── travel-plans/     # TravelPlanCard, AddToPlanModal, CreatePlanModal
├── context/              # 5 React Context providers
│   ├── AuthContext.jsx
│   ├── CurrencyContext.jsx
│   ├── SocketContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── hooks/                # Custom React hooks
│   └── useScrollReveal.js
├── pages/                # 30 Page views mapped to React Router
├── App.jsx               # Application router, layout wrapper, code-splitting
├── index.css             # Tailwind v4 theme, font tokens, animations
└── main.jsx              # React DOM entry point
```

---

### 3.2 React Router Routes & Page Components

| Page Component | File Path | Route Path(s) | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| `LandingPage` | `client/src/pages/LandingPage.jsx` | `/` | Public | Minimalist hero landing view with featured destinations, stays, tour packages, experiences, and closing CTA. |
| `HomePage` | `client/src/pages/HomePage.jsx` | `/explore`, `/listings` | Public | Full stays catalog with search bar, category pills, filter modal, map view toggle, and pagination. |
| `ListingDetailPage` | `client/src/pages/ListingDetailPage.jsx` | `/listings/:id` | Public | Detailed stay presentation: gallery lightbox, amenities, host info, booking widget, Leaflet map, reviews, and similar stays. |
| `SearchResultsPage` | `client/src/pages/SearchResultsPage.jsx` | `/search` | Public | Filtered listing grid by location keywords, price range, and category. |
| `CategoryPage` | `client/src/pages/CategoryPage.jsx` | `/category/:category` | Public | Category-filtered listings catalog. |
| `DestinationsPage` | `client/src/pages/DestinationsPage.jsx` | `/destinations` | Public | Curated destinations gateway with destination cards and search. |
| `DestinationDetailPage`| `client/src/pages/DestinationDetailPage.jsx` | `/destinations/:slug` | Public | In-depth destination showcase with associated stays, tour packages, experiences, and transfers. |
| `TourPackagesPage` | `client/src/pages/TourPackagesPage.jsx` | `/tours` | Public | Directory of multi-day tour packages with difficulty/duration filtering. |
| `TourPackageDetailPage`| `client/src/pages/TourPackageDetailPage.jsx` | `/tours/:slug` | Public | Itinerary showcase with day-by-day activities, booking modal, and reviews. |
| `ExperiencesListPage` | `client/src/pages/ExperiencesListPage.jsx` | `/experiences` | Public | Filterable catalog of adventures, workshops, and wellness activities. |
| `ExperienceDetailPage` | `client/src/pages/ExperienceDetailPage.jsx` | `/experiences/:slug` | Public | Activity detail page with duration, group size, meeting point, booking, and reviews. |
| `PrivacyPage` | `client/src/pages/PrivacyPage.jsx` | `/privacy` | Public | Legal privacy disclosures, third-party data processing policies. |
| `TermsPage` | `client/src/pages/TermsPage.jsx` | `/terms` | Public | Terms of Service, liability, guest/host conduct rules. |
| `CancellationPolicyPage`| `client/src/pages/CancellationPolicyPage.jsx` | `/cancellation-policy`, `/policies/cancellation` | Public | Visual breakdown of Flexible, Moderate, and Strict refund tiers. |
| `CompanyDetailsPage` | `client/src/pages/CompanyDetailsPage.jsx` | `/company`, `/about` | Public | Brand narrative, company background, and leadership details. |
| `ContactPage` | `client/src/pages/ContactPage.jsx` | `/contact`, `/support` | Public | Interactive customer support inquiry form and concierge info. |
| `LoginPage` | `client/src/pages/LoginPage.jsx` | `/login` | Guest Only | Local username/password sign-in and Google OAuth button. |
| `SignupPage` | `client/src/pages/SignupPage.jsx` | `/signup` | Guest Only | User registration form with validation and instant session initialization. |
| `MyBookingsPage` | `client/src/pages/MyBookingsPage.jsx` | `/my-bookings`, `/bookings` | Authenticated | Unified traveler hub displaying upcoming and past stays, packages, and experiences. |
| `BookingDetailPage` | `client/src/pages/BookingDetailPage.jsx` | `/my-bookings/:id` | Authenticated | Itemized booking receipt, policy breakdown, and automated cancellation modal. |
| `ProfilePage` | `client/src/pages/ProfilePage.jsx` | `/profile` | Authenticated | User profile management, password change, bio edit, host application status. |
| `WishlistPage` | `client/src/pages/WishlistPage.jsx` | `/wishlist` | Authenticated | Saved favorite stays with instant remove/view actions. |
| `TravelPlansPage` | `client/src/pages/TravelPlansPage.jsx` | `/travel-plans` | Authenticated | Traveler itinerary dashboard with plan creation modal. |
| `TravelPlanDetailPage` | `client/src/pages/TravelPlanDetailPage.jsx` | `/travel-plans/:id` | Authenticated | Comprehensive itinerary view showing grouped stays, tours, experiences, and transfers. |
| `InboxPage` | `client/src/pages/InboxPage.jsx` | `/inbox`, `/inbox/:id` | Authenticated | Real-time chat messaging interface between guests and hosts. |
| `HostDashboardPage` | `client/src/pages/HostDashboardPage.jsx` | `/dashboard`, `/host/dashboard` | Host / Admin | Host management portal with listings table, earnings analytics, and metrics. |
| `CreateListingPage` | `client/src/pages/CreateListingPage.jsx` | `/listings/new` | Host / Admin | Multi-step stay creation form with multi-image upload and Geoapify geocoding. |
| `EditListingPage` | `client/src/pages/EditListingPage.jsx` | `/listings/:id/edit` | Host / Admin | Stay editor for modifying descriptions, pricing, amenities, and photos. |
| `AdminDashboardPage` | `client/src/pages/AdminDashboardPage.jsx` | `/admin`, `/admin/dashboard` | Admin Only | Full platform administration suite with tabs for stats, users, listings curation, destinations, tour packages, experiences, and transfers. |
| `NotFoundPage` | `client/src/pages/NotFoundPage.jsx` | `*` (Catch-all) | Public | 404 error page with navigation redirect buttons. |

---

### 3.3 Reusable UI Components (`client/src/components/`)

| Component | File Path | Functional Summary |
| :--- | :--- | :--- |
| `AdminRoute` | `client/src/components/auth/AdminRoute.jsx` | Guard checking authenticated admin role. |
| `ProtectedRoute` | `client/src/components/auth/ProtectedRoute.jsx` | Guard redirecting unauthenticated users to `/login`. |
| `GuestRoute` | `client/src/components/auth/GuestRoute.jsx` | Guard redirecting authenticated users away from auth pages to `/`. |
| `HostAccessGate` | `client/src/components/auth/HostAccessGate.jsx` | Informational application gate for non-hosts accessing host tools. |
| `BookingWidget` | `client/src/components/booking/BookingWidget.jsx` | Sticky stay booking calculator with nights, guests, dates, and GST breakdown. |
| `LoadingSpinner` | `client/src/components/common/LoadingSpinner.jsx` | Animated spinner indicator. |
| `StarRating` | `client/src/components/common/StarRating.jsx` | Star rating display and interactive rating input selector. |
| `ToastContainer` | `client/src/components/common/ToastContainer.jsx` | Fixed container rendering toast notification cards. |
| `DestinationCard` | `client/src/components/destinations/DestinationCard.jsx` | Visual card for travel destinations with hero, tagline, and link. |
| `ExperienceCard` | `client/src/components/experiences/ExperienceCard.jsx` | Visual card for activities with category badge, duration, price, and add-to-plan trigger. |
| `HeroSection` | `client/src/components/home/HeroSection.jsx` | Landing page hero banner with search bar. |
| `LandingClosingCTA` | `client/src/components/home/LandingClosingCTA.jsx` | Call-to-action banner driving signups and exploration. |
| `LandingFeaturedDestinations` | `client/src/components/home/LandingFeaturedDestinations.jsx` | Curated row of top destinations on the landing page. |
| `LandingFeaturedExperiences` | `client/src/components/home/LandingFeaturedExperiences.jsx` | Curated row of top activities on the landing page. |
| `LandingFeaturedStays` | `client/src/components/home/LandingFeaturedStays.jsx` | Curated row of luxury stays on the landing page. |
| `LandingFeaturedTours` | `client/src/components/home/LandingFeaturedTours.jsx` | Curated row of multi-day tour packages on the landing page. |
| `Layout` | `client/src/components/layout/Layout.jsx` | Root layout shell wrapping `Navbar`, `Outlet`, `Footer`, `MobileBottomNav`, and `ToastContainer`. |
| `Navbar` | `client/src/components/layout/Navbar.jsx` | Header with brand logo, search modal, currency switcher, theme toggle, and user menu. |
| `Footer` | `client/src/components/layout/Footer.jsx` | Multi-column footer with brand emblem, links, support cards, social icons, and author attribution. |
| `MobileBottomNav` | `client/src/components/layout/MobileBottomNav.jsx` | Fixed mobile bar for quick navigation (Explore, Wishlists, Trips, Messages, Profile). |
| `CategoryBar` | `client/src/components/listings/CategoryBar.jsx` | Horizontal category filters (Beach, Farm, OMG, Arctic, etc.). |
| `FilterModal` | `client/src/components/listings/FilterModal.jsx` | Dialog for price range, amenities, and cancellation policy filtering. |
| `HeroBanner` | `client/src/components/listings/HeroBanner.jsx` | Promotional banner card on explore view. |
| `ImageGallery` | `client/src/components/listings/ImageGallery.jsx` | Multi-photo mosaic grid on stay detail page. |
| `Lightbox` | `client/src/components/listings/Lightbox.jsx` | Fullscreen photo viewer with next/previous controls. |
| `ListingCard` | `client/src/components/listings/ListingCard.jsx` | Stay card with photo carousel, price in selected currency, rating, and wishlist heart. |
| `MapView` | `client/src/components/listings/MapView.jsx` | Interactive OpenStreetMap/Leaflet map rendering listing markers. |
| `TourPackageCard` | `client/src/components/packages/TourPackageCard.jsx` | Tour card showing duration, group size, difficulty, price, and add-to-plan trigger. |
| `ReviewCard` | `client/src/components/reviews/ReviewCard.jsx` | Review card with user avatar, star rating, comment, date, delete button, and host replies. |
| `ReviewForm` | `client/src/components/reviews/ReviewForm.jsx` | Review submission form with star rating selector and comment input. |
| `TransferCard` | `client/src/components/transfers/TransferCard.jsx` | Transfer card showing vehicle type, passenger capacity, price unit, and features. |
| `AddToPlanModal` | `client/src/components/travel-plans/AddToPlanModal.jsx` | Modal allowing users to attach any stay, tour, experience, or transfer to existing travel plans. |
| `CreatePlanModal` | `client/src/components/travel-plans/CreatePlanModal.jsx` | Modal dialog for creating a new named travel plan with optional date ranges. |
| `TravelPlanCard` | `client/src/components/travel-plans/TravelPlanCard.jsx` | Card displaying travel plan summary, item count, date range, and view details link. |

---

### 3.4 State Management & Context Providers (`client/src/context/`)

1. **`AuthContext.jsx`**: Global authentication state (`user`, `loading`, `error`, `unreadCount`). Methods: `login()`, `signup()`, `logout()`, `fetchCurrentUser()`, `refreshProfile()`, `requestHostAccess()`.
2. **`CurrencyContext.jsx`**: Currency switching state (`currency`, `rates`). Methods: `setCurrency()`, `formatPrice()`, `convertPrice()`. Supports INR, USD, EUR, GBP, AED.
3. **`SocketContext.jsx`**: Socket.io connection state (`socket`, `connected`). Provides real-time messaging pipeline.
4. **`ThemeContext.jsx`**: Dark/Light mode state (`isDark`, `theme`). Persists in `localStorage` and controls `dark` class on `<html>`.
5. **`ToastContext.jsx`**: Toast notifications system (`toasts`). Methods: `addToast()`, `removeToast()`, `success()`, `error()`, `info()`, `warning()`.

---

## 4. Initialization & Seed Scripts (`init/`)

| File Path | Description & Relationship to Seed Pipeline |
| :--- | :--- |
| `init/data.js` | Raw static listings dataset containing 12 sample stay listings. |
| `init/index.js` | Main seed runner. Connects to MongoDB, bootstraps admin account, geocodes locations via Geoapify API, and populates `Listing` collection. |
| `init/seedDestinations.js` | Seeds curated Destination records (Goa, Manali, Kerala, Rajasthan, Ladakh, Varanasi). |
| `init/seedTourPackages.js` | Seeds multi-day tour packages with day-by-day itineraries linked to Destination IDs. |
| `init/seedExperiences.js` | Seeds activity/experience records linked to Destinations. |
| `init/seedDestinationStays.js` | Seeds boutique stays and villas explicitly assigned to Destination foreign keys. |
| `init/backfillListingDestinations.js` | Utility migration script that matches unlinked legacy listings to destinations by location name strings. |

---

## 5. Deployment & Monorepo Tooling Analysis

1. **Monorepo Structure:**
   - Single repository with `client/` and `server/` subfolders without lerna/turborepo.
   - Root `package.json` coordinates running `npm:server` and `npm:client` via `concurrently`.
2. **Production Deployment Flow:**
   - Entry bridge: `app.js` executes `require("./server/server.js")` for PaaS platforms with `node app.js` defaults (Heroku/Render).
   - Static asset serving: In production, `server.js` serves static assets from `client/dist` and routes non-API requests to `index.html`.

---

## 6. Files Flagged for Reference-Checking in Future Phases

*(Flagged for later review; no deletions or modifications performed in this phase)*

1. `app.js` — 2-line bridge to `server/server.js`. Required for legacy PaaS start commands unless start command is explicitly configured as `npm start` or `node server/server.js`.
2. `client/src/assets/typescript.svg` — Template SVG asset from initial scaffold; appears unused in current React JSX components.
3. `client/src/assets/vite.svg` — Default starter icon; replaced by `BrandLogo.png`.
4. `init/backfillListingDestinations.js` — One-time migration backfill script for attaching legacy listings to destinations.

---

## 7. Phase 1 Sign-Off

- **Total Audited Files:** 95 files across backend, frontend, init, and root configs.
- **Code Changes Made:** 0 (pure reporting audit).
- **Baseline Build & Test Status:** 100% operational (Vite build 0 errors, 73/73 tests passing).
