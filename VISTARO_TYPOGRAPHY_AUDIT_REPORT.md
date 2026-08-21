# VISTARO FRONTEND TYPOGRAPHY AUDIT REPORT
**Phase 1 — Comprehensive Inventory & Architectural Analysis**  
**Date:** August 21, 2026  
**Scope:** `client/` (All components, pages, root templates, styles, and configurations)

---

## 1. Executive Summary

This audit delivers an exhaustive inventory of the typography architecture across the Vistaro client application. It catalogues every font family, weight, size, line-height, letter-spacing rule, and role-based application across **45 files** (3 configuration/root files, 4 layout components, 4 common components, 11 feature components, and 23 page views).

### Key Findings at a Glance:
- **Primary Typeface:** **Plus Jakarta Sans** (Google Fonts) is the universal geometric sans-serif typeface across all branding, UI controls, navigation, headings, and body content.
- **Secondary Monospace Stack:** Tailwind's default monospace stack (`font-mono`) is utilized in 4 administrative views for technical data (booking IDs, URL slugs, and itinerary line inputs).
- **Weight Distribution:** 7 discrete font weights are in active use (`font-light` [300] to `font-black` [900]), with `font-bold` (700, 451 occurrences) and `font-semibold` (600, 165 occurrences) dominating the UI.
- **Size Scale:** 10 standard Tailwind sizes (`text-xs` through `text-6xl`) alongside **129 occurrences of arbitrary one-off micro sizes** (`text-[10px]`: 81, `text-[11px]`: 46, `text-[9px]`: 2).
- **Inconsistencies Identified:** 7 notable discrepancies were catalogued, including missing font weight definitions in Google Fonts link tags, mismatched heading weights between Stays vs Tour Packages/Experiences, and fragmented arbitrary font-size usage for labels and badges.

---

## 2. Font Families Inventory

| Font Family | Declared Stack | Source / Loading Mechanism | Total Occurrences | Active Files / Locations |
|---|---|---|---|---|
| **Plus Jakarta Sans** | `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` | Google Fonts `<link>` in `client/index.html`<br>Tailwind `theme.extend.fontFamily.sans`<br>`client/src/index.css` `body` rule | Universal (`body` default) + 1 inline raw CSS string in `MapView.jsx` | All 45 components and pages |
| **System Monospace** | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | Tailwind CSS default `font-mono` stack | 7 explicit class declarations | `AdminDashboardPage.jsx` (slug displays, booking ID chips, inclusions/exclusions textareas) |

### Font Loading Configuration Details:
1. **Google Fonts Link Tag (`client/index.html` lines 14–15):**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
   ```
   *Note: Weights 300, 400, 500, 600, 700, and 800 are imported. Weight 900 is NOT imported.*

2. **Tailwind Config (`client/tailwind.config.js` lines 43–45):**
   ```javascript
   fontFamily: {
     sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
   }
   ```

3. **Global Base CSS (`client/src/index.css` lines 5–7):**
   ```css
   body {
     font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
     font-size: 16px;
   }
   ```

4. **Inline Leaflet CSS String (`client/src/components/listings/MapView.jsx` line 67):**
   ```javascript
   marker.bindPopup(`
     <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; color: ${primaryTextColor};">
   `);
   ```

---

## 3. Font Weights Inventory

| Tailwind Class | Numeric Weight | Occurrences | Primary Application Roles | Key Files |
|---|---|---|---|---|
| `font-bold` | **700** | **451** | H2/H3 headings, primary buttons, price values, form labels, card metrics, table headers | `ListingCard.jsx`, `BookingWidget.jsx`, `AdminDashboardPage.jsx`, `TourPackageDetailPage.jsx` |
| `font-semibold` | **600** | **165** | Card titles, navigation links, metadata badges, subheaders, review authors, input helper labels | `Navbar.jsx`, `CategoryBar.jsx`, `ReviewCard.jsx`, `ListingCard.jsx` |
| `font-extrabold` | **800** | **76** | H1 page hero titles, brand logo wordmark "VISTARO", large KPI metrics, featured price displays | `Navbar.jsx`, `HeroBanner.jsx`, `HostDashboardPage.jsx`, `TourPackageDetailPage.jsx` |
| `font-medium` | **500** | **52** | Body accents, inactive category pill items, duration labels, toasts, loading spinner | `CategoryBar.jsx`, `LoadingSpinner.jsx`, `ToastContainer.jsx`, `ExperienceDetailPage.jsx` |
| `font-normal` | **400** | **9** | Explicit font weight resets, price unit text (`/ night`), default descriptive copy | `ListingCard.jsx`, `CategoryBar.jsx`, `DestinationDetailPage.jsx` |
| `font-black` | **900** | **2** | Hero main title on destination overview | `DestinationDetailPage.jsx` (line 203) *(Anomaly: Weight 900 unimported in Google Fonts)* |
| `font-light` | **300** | **1** | Destination hero description subtitle | `DestinationDetailPage.jsx` (line 207) |

---

## 4. Font Sizes Inventory

### 4.1 Standard Tailwind Scale Usage
| Tailwind Class | Computed Size (px / rem) | Occurrences | Primary UI Roles |
|---|---|---|---|
| `text-xs` | 12px / 0.75rem | **472** | Subtitles, location tags, metadata, form labels, action buttons, table cell content |
| `text-sm` | 14px / 0.875rem | **215** | Standard body copy, form inputs, primary CTA text, card headings |
| `text-2xl` | 24px / 1.5rem | **46** | Page subheaders, modal titles, KPI counters, detail page pricing |
| `text-base` | 16px / 1rem | **45** | Card titles, lead body paragraphs, modal subtitles |
| `text-lg` | 18px / 1.125rem | **37** | Section titles, modal headers, card package titles |
| `text-xl` | 20px / 1.25rem | **33** | Brand wordmark, section headers, error headings |
| `text-3xl` | 30px / 1.875rem | **24** | Page main titles, dashboard hero headers |
| `text-4xl` | 36px / 2.25rem | **8** | Detail page hero titles, 404 illustration text |
| `text-5xl` | 48px / 3rem | **1** | HeroBanner responsive H1 on md screens |
| `text-6xl` | 60px / 3.75rem | **1** | DestinationDetailPage H1 on sm screens |

### 4.2 Arbitrary / One-Off Micro Sizes (129 Total)
| Arbitrary Class | Computed Size | Occurrences | Typical Roles | Example Locations |
|---|---|---|---|---|
| `text-[10px]` | 10px / 0.625rem | **81** | Table headers, status pills, specs badges, timestamps, mobile nav labels | `AdminDashboardPage.jsx`, `HostDashboardPage.jsx`, `MobileBottomNav.jsx`, `ExperienceDetailPage.jsx` |
| `text-[11px]` | 11px / 0.6875rem | **46** | Form labels, metric subheaders, divider badges, footer legal text | `ListingDetailPage.jsx`, `TourPackageDetailPage.jsx`, `Footer.jsx`, `ExperiencesListPage.jsx` |
| `text-[9px]` | 9px / 0.5625rem | **2** | Photo preview "Cover" / "New" badges | `CreateListingPage.jsx` (line 350), `EditListingPage.jsx` (line 415) |

---

## 5. Line-Height & Letter-Spacing Inventory

### 5.1 Line-Height (`leading-*`)
| Tailwind Class | Multiplier | Occurrences | Primary Application Roles |
|---|---|---|---|
| `leading-relaxed` | 1.625 | **32** | Editorial narratives, long descriptions, privacy and terms policy paragraphs |
| `leading-tight` | 1.25 | **4** | Large hero headlines, banner titles, hero display copy |
| `leading-snug` | 1.375 | **2** | Listing card truncated title row, footer description |
| `leading-normal` | 1.50 | **1** | Destination detail description copy |

### 5.2 Letter-Spacing (`tracking-*`)
| Tailwind Class | Tracking Value | Occurrences | Primary Application Roles |
|---|---|---|---|
| `tracking-wider` | +0.05em | **123** | Uppercase badge tags, form labels, metric labels, table column headers |
| `tracking-tight` | -0.025em | **25** | Brand wordmark "VISTARO", H1/H2 headlines, mobile nav button labels |

---

## 6. Structured Role Mapping

| UI Role | Current Font Family | Current Weight(s) | Current Size(s) | Line-Height / Tracking | Primary Files |
|---|---|---|---|---|---|
| **Navbar Logo / Wordmark** | Plus Jakarta Sans | `font-extrabold` (800) | `text-xl` (20px) | `tracking-tight` (-0.025em) | `Navbar.jsx`, `Footer.jsx` |
| **Hero Headline (H1)** | Plus Jakarta Sans | `font-extrabold` (800)<br>*(Exception: `font-black` [900] in DestinationDetail)* | `text-2xl` to `text-6xl` (24px–60px responsive) | `tracking-tight`<br>`leading-tight` | `HeroBanner.jsx`, `DestinationsPage.jsx`, `ListingDetailPage.jsx`, `AdminDashboardPage.jsx` |
| **Section Headings (H2)** | Plus Jakarta Sans | `font-extrabold` (800)<br>`font-bold` (700) | `text-lg` to `text-3xl` (18px–30px) | `tracking-tight` | `ListingDetailPage.jsx`, `TourPackageDetailPage.jsx`, `DestinationDetailPage.jsx` |
| **Card / Listing Titles (H3/H4)** | Plus Jakarta Sans | `font-semibold` (600 on stays)<br>`font-bold` (700 on tours/exp) | `text-sm` to `text-lg` (14px–18px) | `leading-snug` | `ListingCard.jsx`, `TourPackageCard.jsx`, `ExperienceCard.jsx`, `ReviewCard.jsx` |
| **Body Copy / Descriptions** | Plus Jakarta Sans | `font-normal` (400) / inherited | `text-sm` (14px)<br>`text-xs` (12px) | `leading-relaxed` | `ListingDetailPage.jsx`, `TourPackageDetailPage.jsx`, `PrivacyPage.jsx`, `TermsPage.jsx` |
| **Secondary / Muted Text** | Plus Jakarta Sans | `font-normal` (400)<br>`font-medium` (500) | `text-xs` (12px)<br>`text-[10px]` (10px) | Normal | All cards, dashboard tables, metadata strips |
| **Navigation Links** | Plus Jakarta Sans | `font-semibold` (600)<br>`font-bold` (700 on active) | `text-xs` to `text-sm` (12px–14px)<br>`text-[10px]` (mobile) | `tracking-tight` (mobile) | `Navbar.jsx`, `MobileBottomNav.jsx`, `CategoryBar.jsx` |
| **Primary CTA / Action Buttons** | Plus Jakarta Sans | `font-bold` (700) | `text-sm` (14px)<br>`text-xs` (12px) | Normal | `BookingWidget.jsx`, `LoginPage.jsx`, `SignupPage.jsx`, `CreateListingPage.jsx` |
| **Secondary CTA Buttons** | Plus Jakarta Sans | `font-bold` (700)<br>`font-semibold` (600) | `text-xs` to `text-sm` (12px–14px) | Normal | Dashboard action buttons, cancel triggers, filter triggers |
| **Price & Numeric Displays** | Plus Jakarta Sans | `font-semibold` (600 on stays)<br>`font-bold` (700 in widgets)<br>`font-extrabold` (800 on tours/exp) | `text-sm` to `text-3xl` (14px–30px) | Normal | `ListingCard.jsx`, `TourPackageCard.jsx`, `BookingWidget.jsx`, `HostDashboardPage.jsx` |
| **Rating Numbers** | Plus Jakarta Sans | `font-semibold` (600)<br>`font-bold` (700)<br>`font-extrabold` (800) | `text-xs` (12px)<br>`text-sm` (14px)<br>`text-base` (16px) | Normal | `ListingCard.jsx`, `TourPackageCard.jsx`, `StarRating.jsx`, `ReviewCard.jsx` |
| **Form Labels** | Plus Jakarta Sans | `font-bold` (700) | `text-xs` (12px)<br>`text-[11px]` (11px) | `tracking-wider` (+0.05em)<br>`uppercase` | `CreateListingPage.jsx`, `EditListingPage.jsx`, `LoginPage.jsx`, `FilterModal.jsx` |
| **Form Input Text** | Plus Jakarta Sans<br>`font-mono` (slugs/code) | `font-normal` (400)<br>`font-medium` (500) | `text-sm` (14px)<br>`text-xs` (12px) | Normal | `CreateListingPage.jsx`, `LoginPage.jsx`, `FilterModal.jsx`, `AdminDashboardPage.jsx` |
| **Captions / Badges / Tags** | Plus Jakarta Sans | `font-bold` (700)<br>`font-extrabold` (800) | `text-[10px]` (10px)<br>`text-[11px]` (11px)<br>`text-xs` (12px) | `tracking-wider`<br>`uppercase` | `CategoryBar.jsx`, `ListingCard.jsx`, `TourPackageCard.jsx`, `AdminDashboardPage.jsx` |
| **Footer Text** | Plus Jakarta Sans | `font-semibold` (headers)<br>`font-medium` (links) | `text-xs` (12px)<br>`text-[11px]` (11px) | `tracking-wider` (headers) | `Footer.jsx` |

---

## 7. Inconsistencies & Anomalies

### 7.1 Font Weight Loading Inconsistency (`font-black`)
- **Issue:** [`client/src/pages/DestinationDetailPage.jsx`](file:///d:/VISTARO/client/src/pages/DestinationDetailPage.jsx) (line 203) specifies `font-black` (900) on its main H1 title.
- **Root Cause:** The Google Fonts link in [`client/index.html`](file:///d:/VISTARO/client/index.html) only requests weights `wght@300;400;500;600;700;800`.
- **Consequence:** The browser is forced to synthesize faux bold or clamp the rendering to 800, leading to cross-browser rendering discrepancies.

### 7.2 Card Title Weight Fragmentation
- **Issue:** Card headings across the three primary discovery entities use mismatched weights and sizes:
  - `ListingCard.jsx` (Stays): `font-semibold text-sm sm:text-base` (600, 14px/16px)
  - `TourPackageCard.jsx` (Tours): `font-bold text-base sm:text-lg` (700, 16px/18px)
  - `ExperienceCard.jsx` (Experiences): `font-bold text-sm sm:text-base` (700, 14px/16px)
- **Impact:** Stays feel lighter and visually subordinate when browsed alongside Tour Packages and Experiences.

### 7.3 Card Price Hierarchy Mismatch
- **Issue:** Price typography differs between cards:
  - `ListingCard.jsx`: `font-semibold text-sm sm:text-base` (600)
  - `TourPackageCard.jsx`: `font-extrabold text-base sm:text-lg` (800)
  - `ExperienceCard.jsx`: `font-extrabold text-base sm:text-lg` (800)
- **Impact:** Inconsistent visual emphasis across card grid representations.

### 7.4 Arbitrary Micro-Sizes Proliferation (`text-[10px]`, `text-[11px]`, `text-[9px]`)
- **Issue:** 129 arbitrary font size instances are scattered across 22 components and pages:
  - `text-[10px]`: 81 occurrences
  - `text-[11px]`: 46 occurrences
  - `text-[9px]`: 2 occurrences
- **Impact:** Bypasses Tailwind's type scale design system. Can be standardized into semantic utility tokens (e.g. `text-2xs` for 10px, or unified to `text-xs`).

### 7.5 Form Label Styling Fragmentation
- **Issue:** Form labels alternate between standard `text-xs` (12px) and arbitrary `text-[11px]` (11px):
  - `CreateListingPage.jsx` & `EditListingPage.jsx`: `text-xs font-bold uppercase tracking-wider`
  - `TourPackageDetailPage.jsx` & `ListingDetailPage.jsx` (Modals): `text-[11px] font-bold uppercase tracking-wider`
- **Impact:** Form inputs and modal forms lack strict typographic unity.

### 7.6 Section Heading (H2) Weight Variance
- **Issue:** Detail pages alternate between `font-bold` and `font-extrabold`:
  - `ListingDetailPage.jsx`: `text-xl font-bold text-vistaro-primary`
  - `TourPackageDetailPage.jsx` & `ExperienceDetailPage.jsx`: `text-xl sm:text-2xl font-extrabold text-vistaro-primary`
- **Impact:** Inconsistent section header visual weight across detail views.

### 7.7 Hardcoded Inline Font-Family Declaration
- **Issue:** `MapView.jsx` contains raw string `style="font-family: 'Plus Jakarta Sans', sans-serif;"`.
- **Impact:** Hardcoded string bypasses Tailwind utility classes.

---

## 8. Files Requiring Standardization (45 Total)

### Group 1: Configuration & Root Assets (3 files)
1. [`client/index.html`](file:///d:/VISTARO/client/index.html) — Add `wght@900` or unify H1s to `800`.
2. [`client/tailwind.config.js`](file:///d:/VISTARO/client/tailwind.config.js) — Define semantic typography tokens (`fontSize.2xs` for 10px badge scaling).
3. [`client/src/index.css`](file:///d:/VISTARO/client/src/index.css) — Set standardized heading baseline line-heights and font smoothing.

### Group 2: Global Layout Components (4 files)
4. [`client/src/components/layout/Navbar.jsx`](file:///d:/VISTARO/client/src/components/layout/Navbar.jsx) — Logo typography, navigation links, popover typography.
5. [`client/src/components/layout/Footer.jsx`](file:///d:/VISTARO/client/src/components/layout/Footer.jsx) — Footer columns, header tracking, legal copy size standardization (`text-[11px]` -> `text-xs`).
6. [`client/src/components/layout/MobileBottomNav.jsx`](file:///d:/VISTARO/client/src/components/layout/MobileBottomNav.jsx) — Mobile tab label size standardization (`text-[10px]` -> token).
7. [`client/src/components/layout/Layout.jsx`](file:///d:/VISTARO/client/src/components/layout/Layout.jsx) — Base layout typography wrapper.

### Group 3: Shared Common Components (4 files)
8. [`client/src/components/common/StarRating.jsx`](file:///d:/VISTARO/client/src/components/common/StarRating.jsx) — Star label sizing.
9. [`client/src/components/common/LoadingSpinner.jsx`](file:///d:/VISTARO/client/src/components/common/LoadingSpinner.jsx) — Loading text weight.
10. [`client/src/components/common/ToastContainer.jsx`](file:///d:/VISTARO/client/src/components/common/ToastContainer.jsx) — Toast notification typography.
11. [`client/src/components/booking/BookingWidget.jsx`](file:///d:/VISTARO/client/src/components/booking/BookingWidget.jsx) — Sticky reservation widget price scale, breakdown labels.

### Group 4: Feature Components (11 files)
12. [`client/src/components/listings/CategoryBar.jsx`](file:///d:/VISTARO/client/src/components/listings/CategoryBar.jsx) — Category pill typography (`font-semibold` / `font-medium`).
13. [`client/src/components/listings/FilterModal.jsx`](file:///d:/VISTARO/client/src/components/listings/FilterModal.jsx) — Modal section titles (`text-sm font-bold`).
14. [`client/src/components/listings/HeroBanner.jsx`](file:///d:/VISTARO/client/src/components/listings/HeroBanner.jsx) — Hero H1 responsive clamp (`text-3xl sm:text-5xl md:text-6xl font-extrabold`).
15. [`client/src/components/listings/ListingCard.jsx`](file:///d:/VISTARO/client/src/components/listings/ListingCard.jsx) — Unify stay title and price weights to match Tour/Experience cards.
16. [`client/src/components/listings/ImageGallery.jsx`](file:///d:/VISTARO/client/src/components/listings/ImageGallery.jsx) — Gallery counter badge typography.
17. [`client/src/components/listings/Lightbox.jsx`](file:///d:/VISTARO/client/src/components/listings/Lightbox.jsx) — Lightbox photo caption typography.
18. [`client/src/components/listings/MapView.jsx`](file:///d:/VISTARO/client/src/components/listings/MapView.jsx) — Replace inline font family string with design token.
19. [`client/src/components/packages/TourPackageCard.jsx`](file:///d:/VISTARO/client/src/components/packages/TourPackageCard.jsx) — Package card title, specs badges, price display typography.
20. [`client/src/components/experiences/ExperienceCard.jsx`](file:///d:/VISTARO/client/src/components/experiences/ExperienceCard.jsx) — Experience card title, category badge, price display typography.
21. [`client/src/components/reviews/ReviewCard.jsx`](file:///d:/VISTARO/client/src/components/reviews/ReviewCard.jsx) — Author name, date caption, review text typography.
22. [`client/src/components/reviews/ReviewForm.jsx`](file:///d:/VISTARO/client/src/components/reviews/ReviewForm.jsx) — Rating selector labels, textarea typography.

### Group 5: Page Views (23 files)
23. [`client/src/pages/HomePage.jsx`](file:///d:/VISTARO/client/src/pages/HomePage.jsx) — Section headers.
24. [`client/src/pages/ListingDetailPage.jsx`](file:///d:/VISTARO/client/src/pages/ListingDetailPage.jsx) — H1 stay title, H2 sections, specs bar, host bio, modal form labels.
25. [`client/src/pages/DestinationsPage.jsx`](file:///d:/VISTARO/client/src/pages/DestinationsPage.jsx) — Hero H1, region cards.
26. [`client/src/pages/DestinationDetailPage.jsx`](file:///d:/VISTARO/client/src/pages/DestinationDetailPage.jsx) — Replace `font-black` with standard `font-extrabold`, guide narrative typography.
27. [`client/src/pages/TourPackagesPage.jsx`](file:///d:/VISTARO/client/src/pages/TourPackagesPage.jsx) — Hero banner, filter pill typography.
28. [`client/src/pages/TourPackageDetailPage.jsx`](file:///d:/VISTARO/client/src/pages/TourPackageDetailPage.jsx) — H1 package title, H2 itinerary headers, booking modal labels.
29. [`client/src/pages/ExperiencesListPage.jsx`](file:///d:/VISTARO/client/src/pages/ExperiencesListPage.jsx) — Filter pill bar, category labels.
30. [`client/src/pages/ExperienceDetailPage.jsx`](file:///d:/VISTARO/client/src/pages/ExperienceDetailPage.jsx) — H1 experience title, H2 activity overview, meeting point notes.
31. [`client/src/pages/WishlistPage.jsx`](file:///d:/VISTARO/client/src/pages/WishlistPage.jsx) — Wishlist title, empty state text.
32. [`client/src/pages/SearchResultsPage.jsx`](file:///d:/VISTARO/client/src/pages/SearchResultsPage.jsx) — Results counter, sort dropdown text.
33. [`client/src/pages/CategoryPage.jsx`](file:///d:/VISTARO/client/src/pages/CategoryPage.jsx) — Category page header.
34. [`client/src/pages/AdminDashboardPage.jsx`](file:///d:/VISTARO/client/src/pages/AdminDashboardPage.jsx) — Metrics typography, table column headers (`text-[10px] uppercase tracking-wider`), mono code chips.
35. [`client/src/pages/HostDashboardPage.jsx`](file:///d:/VISTARO/client/src/pages/HostDashboardPage.jsx) — KPI numbers, table typography.
36. [`client/src/pages/InboxPage.jsx`](file:///d:/VISTARO/client/src/pages/InboxPage.jsx) — Message list preview typography, chat bubble text.
37. [`client/src/pages/ProfilePage.jsx`](file:///d:/VISTARO/client/src/pages/ProfilePage.jsx) — Profile header, trip cards, settings form labels.
38. [`client/src/pages/LoginPage.jsx`](file:///d:/VISTARO/client/src/pages/LoginPage.jsx) — Auth title, form labels, divider text (`text-[11px]`).
39. [`client/src/pages/SignupPage.jsx`](file:///d:/VISTARO/client/src/pages/SignupPage.jsx) — Registration title, form labels, divider text (`text-[11px]`).
40. [`client/src/pages/CreateListingPage.jsx`](file:///d:/VISTARO/client/src/pages/CreateListingPage.jsx) — Form title, input labels, dropzone text, amenity labels.
41. [`client/src/pages/EditListingPage.jsx`](file:///d:/VISTARO/client/src/pages/EditListingPage.jsx) — Edit form title, photo badge typography (`text-[9px]`).
42. [`client/src/pages/CompanyDetailsPage.jsx`](file:///d:/VISTARO/client/src/pages/CompanyDetailsPage.jsx) — Disclosure header, metric numbers, entity metadata.
43. [`client/src/pages/PrivacyPage.jsx`](file:///d:/VISTARO/client/src/pages/PrivacyPage.jsx) — Legal headings, numbered section titles, policy body copy.
44. [`client/src/pages/TermsPage.jsx`](file:///d:/VISTARO/client/src/pages/TermsPage.jsx) — Terms headers, cancellation tier cards.
45. [`client/src/pages/NotFoundPage.jsx`](file:///d:/VISTARO/client/src/pages/NotFoundPage.jsx) — 404 display number (`text-4xl font-extrabold`), subtitle copy.
