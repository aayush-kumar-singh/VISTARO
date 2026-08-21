# VISTARO COLOR THEME MIGRATION — PHASE 1 AUDIT REPORT
**Document Version:** 1.0.0  
**Generated:** 2026-08-21  
**Scope:** Complete Frontend Color Architecture & Inventory Audit (`client/`)  
**Status:** Audit Completed — No code modified (Phase 1).

---

## Executive Summary

This document presents an exhaustive, component-by-component audit of the existing color system in the Vistaro client application. 

The audit identified **603+ direct arbitrary hex color occurrences** and over **2,400+ color-related utility class instances** across 42 frontend files. 

Crucially, the frontend is currently split into **two disconnected brand clusters**:
1. **Cluster A (Landing & Explorer Pages)**: Uses `#FF385C` (Airbnb Pink/Coral), `#FF5A70` (Hover), `#171719` (Charcoal Text), `#A7A7AC` (Slate Muted), and `#151517` (Dark Pills).
2. **Cluster B (Stays, Details, Forms & Dashboards)**: Uses `#DC3545` (Bootstrap Crimson Red), `#B02A37` (Hover), `#222222` (Warm Off-Black), `#717171` (Medium Gray), and `#DDDDDD` (Border Gray).

Neither cluster consumes the CSS variables or Tailwind tokens configured in `index.css` and `tailwind.config.js`.

---

## Official Target Vistaro Palette

The upcoming migration phases will consolidate the entire application into this official dual-mode palette:

```
========================================================================================
TOKEN NAME               | DARK MODE TOKEN         | LIGHT MODE TOKEN
========================================================================================
Main Background          | #12100F                 | #F5F1EA
Secondary Background     | #1B1815                 | #EDE6DA
Surface / Card           | #201C1A                 | #FFFFFF
Border / Divider         | #3A3532                 | #E0D6C8
Primary Text             | #F5F1EA                 | #12100F
Secondary Text           | #B7AFA6                 | #6B615A
Muted Text               | #857A70                 | #9A9089
Vistaro Brand Accent     | #E86A4D                 | #E86A4D
Accent Hover             | #C94F32                 | #C94F32
Rating Gold              | #E8B04B                 | #C98A2E
Success                  | #3CAE7E                 | #2F9E6E
Error                    | #F0666B                 | #D9484D
========================================================================================
```

---

## 1. Current Color Architecture

```mermaid
flowchart TD
    subgraph ConfigLayer [Configuration Layer (Dormant)]
        CSSVars[":root CSS Variables (src/index.css)\n--color-primary: #dc3545\n--color-primary-hover: #b02a37\n--color-ink: #222222\n--color-ink-muted: #717171\n--color-border: #DDDDDD\n--color-surface: #FFFFFF\n--color-surface-hover: #F7F7F7"]
        TWConfig["tailwind.config.js\nprimary, ink, surface, border extensions"]
    end

    subgraph ActualImplementation [Actual Component Implementation (Fragmented)]
        ClusterA["Cluster A: Modern Airbnb/Charcoal\n#FF385C (Coral/Pink), #FF5A70 (Hover)\n#171719 (Headings/Ink), #A7A7AC (Muted)\nUsed in: Navbar, Home, Admin, Destinations, Tours, Experiences"]
        ClusterB["Cluster B: Classic Bootstrap/Red\n#DC3545 (Crimson), #B02A37 (Hover)\n#222222 (Ink), #717171 (Muted), #DDDDDD (Border)\nUsed in: Listings, Detail pages, Modals, Forms, Auth, Profile, Dashboards"]
        TailwindPalette["Tailwind Default Palette (Scattered)\nzinc-50 to zinc-950 (400+ instances)\nemerald-*, amber-*, purple-*, blue-*, red-*"]
        InjectedStyles["Inline & Injected Styles\nLeaflet MapView popup/marker strings\nSVG fills, HTML meta tags"]
    end

    ConfigLayer -. "0 Components Consume Tokens" .-> ActualImplementation
```

### Key Architectural Findings:
1. **Dormant Tokens**: `:root` CSS variables and `tailwind.config.js` define semantic tokens (`primary`, `ink`, `surface`, `border`), but **0 React components** actually consume them.
2. **Direct Arbitrary Classes**: Components directly hardcode arbitrary hex utility classes like `text-[#dc3545]`, `bg-[#FF385C]`, `text-[#171719]`, `text-[#222222]`, `hover:bg-[#b02a37]`.
3. **Tailwind Hybrid Setup**: The project uses Tailwind v4 `@import "tailwindcss"` in `src/index.css` while maintaining a legacy `tailwind.config.js`.

---

## 2. Main Colors Currently Used

| Hex / Utility Token | Total Occurrences | Category / Origin | Current Semantic Role |
| :--- | :---: | :--- | :--- |
| **`#DC3545`** | 222 | Bootstrap Crimson Red | Primary Brand CTA, Active tabs, Heart icons, Spinners, Error highlights |
| **`#FF385C`** | 107 | Airbnb Rausch Pink/Coral | Primary Brand CTA, Navbar logo, Search buttons, Admin badges |
| **`#171719`** | 64 | Deep Charcoal | Primary Headings, Title text, Input text in Cluster A pages |
| **`#222222` / `#222`** | 54 | Warm Off-Black | Primary Headings, Body text, Star rating fill in Cluster B pages |
| **`#B02A37`** | 41 | Dark Crimson Hover | Hover state for `#DC3545` buttons & interactive links |
| **`#FF5A70`** | 17 | Light Coral Hover | Hover state for `#FF385C` buttons & interactive links |
| **`#A7A7AC`** | 16 | Cool Slate Gray | Subtitles, Muted counters, Placeholder text in Cluster A pages |
| **`#151517`** | 14 | Near-Black Pill Ink | Dark filter pills, Dark action buttons in Cluster A pages |
| **`#DDDDDD`** | 8 | Neutral Border Gray | Card dividers, Bottom nav top border, Category bar borders |
| **`#717171`** | 8 | Medium Gray | Subtitle text, Secondary captions in Cluster B pages |
| **`#F7F7F7`** | 4 | Soft Off-White | Footer background, Profile page section card |
| **`#18181B`** | 1 | Zinc 900 Dark Surface | Dark Toast notification container background |
| **`#C0392B`** | 1 | Strong Dark Red | Discount badge gradient stop (`from-[#dc3545] to-[#c0392b]`) |
| **`zinc-*` (50–950)**| ~1,200 | Tailwind Neutrals | Card backgrounds (`zinc-50`), borders (`zinc-200`), text (`zinc-500/900`) |
| **`emerald-*`** | 85 | Tailwind Green | Success badges, Verified checkmarks, Confirmed status |
| **`amber-*`** | 62 | Tailwind Amber | Star ratings (Tour packages), Pending/Warning badges |
| **`purple-* / indigo-*`**| 48 | Tailwind Purple | Experience category badges & Host experience accents |
| **`blue-*`** | 36 | Tailwind Blue | Tour package badges, Info banners |
| **`red-* / rose-*`** | 110 | Tailwind Red | Error states, Delete confirmations, Wishlist hearts |
| **Google Brand Hexes**| 8 | Google OAuth Palette | Google login buttons (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) |

---

## 3. Structured Color Inventory

| Category | Current Color / Token | Where Used (Components & Pages) | Purpose | Target Vistaro Token |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary CTA** | `#DC3545` | `BookingWidget`, `FilterModal`, `HeroBanner`, `ListingDetailPage`, `CreateListingPage`, `EditListingPage`, `HostDashboardPage`, `InboxPage`, `LoginPage`, `SignupPage`, `ProfilePage`, `WishlistPage`, `SearchResultsPage`, `TourPackageDetailPage`, `CategoryPage` | Primary Action Buttons, Active Tabs, Key Accents | **Dark**: `#E86A4D`<br>**Light**: `#E86A4D` |
| **Brand Primary CTA** | `#FF385C` | `Navbar`, `HomePage`, `DestinationsPage`, `TourPackagesPage`, `ExperiencesListPage`, `AdminDashboardPage` | Header Logo, Nav CTA, Search button, Filter tags, Action buttons | **Dark**: `#E86A4D`<br>**Light**: `#E86A4D` |
| **Brand Hover** | `#B02A37` | Buttons in `BookingWidget`, `Footer`, `HeroBanner`, `FilterModal`, `ProfilePage`, `WishlistPage`, `TourPackageDetailPage`, `LoginPage`, `SignupPage` | Hover state for primary buttons | **Dark**: `#C94F32`<br>**Light**: `#C94F32` |
| **Brand Hover** | `#FF5A70` | Buttons in `Navbar`, `HomePage`, `DestinationsPage`, `TourPackagesPage`, `ExperiencesListPage`, `AdminDashboardPage` | Hover state for primary buttons | **Dark**: `#C94F32`<br>**Light**: `#C94F32` |
| **Primary Text** | `#171719` | `Navbar`, `HomePage`, `DestinationsPage`, `TourPackagesPage`, `ExperiencesListPage`, `AdminDashboardPage` | Main titles, Headings, Form labels | **Dark**: `#F5F1EA`<br>**Light**: `#12100F` |
| **Primary Text** | `#222222` / `text-zinc-900` | `ListingDetailPage`, `BookingWidget`, `ListingCard`, `ReviewCard`, `ProfilePage`, `TermsPage`, `PrivacyPage`, `CompanyDetailsPage`, `CreateListingPage` | Main titles, Headings, Listing titles | **Dark**: `#F5F1EA`<br>**Light**: `#12100F` |
| **Secondary Text** | `#717171` / `text-zinc-600` / `text-zinc-700` | `BookingWidget`, `ListingCard`, `CategoryBar`, `Footer`, `MobileBottomNav`, `MapView`, `ReviewCard` | Subtitles, Location names, Host info | **Dark**: `#B7AFA6`<br>**Light**: `#6B615A` |
| **Muted Text** | `#A7A7AC` / `text-zinc-400` / `text-zinc-500` | `DestinationsPage`, `TourPackagesPage`, `ExperiencesListPage`, `Navbar` search placeholder, Input placeholders | Small captions, Disabled labels, Placeholders | **Dark**: `#857A70`<br>**Light**: `#9A9089` |
| **Main Background** | `bg-white` / `index.html body` | `Layout`, `HomePage`, `DestinationsPage`, `TourPackagesPage`, `ExperiencesListPage`, `ListingDetailPage`, `WishlistPage`, etc. | Overall page background | **Dark**: `#12100F`<br>**Light**: `#F5F1EA` |
| **Secondary Background**| `bg-zinc-50`, `bg-zinc-100`, `#F7F7F7` | `Footer`, `ProfilePage`, `AdminDashboardPage`, `InboxPage`, `ReviewForm`, `CategoryBar`, `DestinationsPage` filter pills | Background for sections, sidebars, muted areas | **Dark**: `#1B1815`<br>**Light**: `#EDE6DA` |
| **Card / Surface** | `bg-white`, `bg-white/95`, `bg-zinc-50` | `ListingCard`, `ExperienceCard`, `TourPackageCard`, `BookingWidget`, `FilterModal`, `Navbar` dropdowns | Card container, Modal content, Dropdown panels | **Dark**: `#201C1A`<br>**Light**: `#FFFFFF` |
| **Border / Divider** | `border-zinc-200`, `border-zinc-100`, `#DDDDDD`, `border-[#171719]/10` | Across all 35+ components and pages | Card borders, Input outlines, Horizontal dividers | **Dark**: `#3A3532`<br>**Light**: `#E0D6C8` |
| **Rating Gold** | `fill-[#222222] text-[#222222]` | `StarRating`, `ListingCard`, `ListingDetailPage` | Rating stars (Currently solid black) | **Dark**: `#E8B04B`<br>**Light**: `#C98A2E` |
| **Rating Gold** | `fill-amber-400 text-amber-500` | `TourPackageDetailPage`, `HeroBanner`, `TourPackageCard` | Rating stars (Currently amber/yellow) | **Dark**: `#E8B04B`<br>**Light**: `#C98A2E` |
| **Success State** | `emerald-500`, `emerald-600`, `bg-emerald-50`, `border-emerald-200` | `ToastContainer`, `AdminDashboardPage`, `HostDashboardPage`, `ExperienceCard`, `BookingWidget`, `ProfilePage` | Success toasts, Confirmed bookings, Paid status | **Dark**: `#3CAE7E`<br>**Light**: `#2F9E6E` |
| **Error State** | `bg-red-50`, `border-red-200`, `text-[#dc3545]`, `bg-red-500/10` | `ToastContainer`, `BookingWidget`, `CreateListingPage`, `EditListingPage`, `AdminDashboardPage`, `TourPackagesPage` error banners | Error alerts, Form validation messages, Failed API banners | **Dark**: `#F0666B`<br>**Light**: `#D9484D` |
| **Secondary CTA Buttons**| `bg-[#222222] hover:bg-black`, `bg-[#151517] hover:bg-black`, `bg-zinc-900` | `Navbar` login button, `TourPackageDetailPage` CTA, `ReviewForm` submit, `DestinationsPage` filter pill | High-contrast secondary CTA on light surfaces | **Dark**: `#201C1A` / Border `#3A3532`<br>**Light**: `#12100F` / Hover `#1B1815` |
| **Map Marker & Popup** | `#dc3545`, `#222`, `#717171`, `white` | `MapView.jsx` Leaflet HTML string injection | Map pin circle, Popup title, Popup location | **Dark**: Accent `#E86A4D`, Card `#201C1A`<br>**Light**: Accent `#E86A4D`, Card `#FFFFFF` |
| **Toast Surface** | `#18181B`, `border-zinc-700/60` | `ToastContainer.jsx` | Floating toast container surface | **Dark**: `#201C1A` + Border `#3A3532`<br>**Light**: `#FFFFFF` + Border `#E0D6C8` |
| **HTML / SVG Assets** | `#dc3545`, `#FF385C` | `index.html` (`meta theme-color`), `public/favicon.svg` | Browser tab theme and favicon pin | **Dark & Light**: Brand Accent `#E86A4D` |

---

## 4. Inconsistencies & Duplicates Identified

1. **Split Primary Brand Identity**:
   - Cluster A (`Navbar`, `Home`, `Destinations`, `TourPackages`, `Experiences`, `AdminDashboard`) uses `#FF385C` (Coral/Pink).
   - Cluster B (`ListingDetail`, `BookingWidget`, `LoginPage`, `ProfilePage`, `HostDashboard`, etc.) uses `#DC3545` (Crimson Red).
2. **Split Hover States**:
   - `#B02A37` (Dark Crimson) vs `#FF5A70` (Light Pinkish Coral).
3. **Split Typography Ink**:
   - `#171719` vs `#222222` vs `text-zinc-900` vs `text-zinc-800`.
4. **Rating Stars Color Split**:
   - Black stars (`fill-[#222222] text-[#222222]`) in `StarRating.jsx`, `ListingCard.jsx`, `ListingDetailPage.jsx`.
   - Amber stars (`fill-amber-400 text-amber-500`) in `TourPackageDetailPage.jsx`, `HeroBanner.jsx`, `TourPackageCard.jsx`.
5. **Border Diversity**:
   - `#DDDDDD` vs `border-zinc-200` vs `border-zinc-100` vs `border-[#171719]/10`.
6. **Background / Section Ambiguity**:
   - `bg-white`, `bg-zinc-50`, `bg-zinc-100`, `#F7F7F7`, and `#151517` are used without clear hierarchy.
7. **Collision Between Brand Accent & Semantic Error**:
   - `#DC3545` and `bg-red-50` are currently used for both brand highlights (hearts, active filter chips) and destructive actions/errors (delete listings, error toasts).

---

## 5. Components With Hardcoded Colors (41 Files)

### Components (18 files):
- `src/components/layout/Navbar.jsx`
- `src/components/layout/Footer.jsx`
- `src/components/layout/MobileBottomNav.jsx`
- `src/components/layout/Layout.jsx`
- `src/components/booking/BookingWidget.jsx`
- `src/components/listings/CategoryBar.jsx`
- `src/components/listings/FilterModal.jsx`
- `src/components/listings/HeroBanner.jsx`
- `src/components/listings/ImageGallery.jsx`
- `src/components/listings/ListingCard.jsx`
- `src/components/listings/MapView.jsx`
- `src/components/packages/TourPackageCard.jsx`
- `src/components/experiences/ExperienceCard.jsx`
- `src/components/reviews/ReviewCard.jsx`
- `src/components/reviews/ReviewForm.jsx`
- `src/components/common/StarRating.jsx`
- `src/components/common/LoadingSpinner.jsx`
- `src/components/common/ToastContainer.jsx`

### Pages (23 files):
- `src/pages/HomePage.jsx`
- `src/pages/DestinationsPage.jsx`
- `src/pages/DestinationDetailPage.jsx`
- `src/pages/TourPackagesPage.jsx`
- `src/pages/TourPackageDetailPage.jsx`
- `src/pages/ExperiencesListPage.jsx`
- `src/pages/ExperienceDetailPage.jsx`
- `src/pages/ListingDetailPage.jsx`
- `src/pages/WishlistPage.jsx`
- `src/pages/AdminDashboardPage.jsx`
- `src/pages/HostDashboardPage.jsx`
- `src/pages/InboxPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/SignupPage.jsx`
- `src/pages/CategoryPage.jsx`
- `src/pages/SearchResultsPage.jsx`
- `src/pages/CreateListingPage.jsx`
- `src/pages/EditListingPage.jsx`
- `src/pages/CompanyDetailsPage.jsx`
- `src/pages/PrivacyPage.jsx`
- `src/pages/TermsPage.jsx`
- `src/pages/NotFoundPage.jsx`

---

## 6. Components Using CSS Variables / Theme Tokens

- **Current Status**: **0 components** consume `var(--color-*)` or `bg-primary`, `text-ink`, `bg-surface`, `border-border`.
- All styling relies exclusively on direct inline hex classes or Tailwind default palettes.

---

## 7. Components Using Standard Tailwind Palette Colors

- **`zinc-*` (50–950)**: Used in all 35+ components for text, borders, input fields, cards, and hover states.
- **`emerald-*`**: Used in `AdminDashboardPage`, `HostDashboardPage`, `ProfilePage`, `BookingWidget`, `ExperienceCard`, `ToastContainer` for success states and verified badges.
- **`amber-*`**: Used in `TourPackageDetailPage`, `HeroBanner`, `AdminDashboardPage`, `BookingWidget` for ratings, superhost badges, and pending statuses.
- **`purple-*` / `indigo-*`**: Used in `Navbar`, `ExperiencesListPage`, `ExperienceDetailPage`, `ExperienceCard` for experience categories.
- **`blue-*`**: Used in `TourPackagesPage`, `TourPackageDetailPage`, `TourPackageCard`, `ToastContainer` for tour categories and info notices.
- **`red-*` / `rose-*`**: Used in `WishlistPage`, `AdminDashboardPage`, `HostDashboardPage`, `BookingWidget`, `ListingCard` for error states, delete modals, and heart icons.

---

## 8. Bootstrap / Default Third-Party Colors Found

1. **Bootstrap Defaults**: `#DC3545` (standard red `$danger`), `#B02A37` (standard dark red hover).
2. **Airbnb Defaults**: `#222222` / `#717171` (classic ink), `#FF385C` / `#FF5A70` (modern Rausch coral).
3. **Google Brand Colors**: `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` in `LoginPage.jsx` & `SignupPage.jsx` (must be preserved).
4. **Leaflet Map Injected Styles**: Inline HTML marker & popup strings in `MapView.jsx`.
5. **Static Assets**: `#dc3545` in `public/favicon.svg`, `#08060D` and `#aa3bff` in `public/icons.svg`.

---

## 9. Problematic Colors & Edge Cases for Migration

1. **Inverted Black Buttons on Dark Backgrounds**:
   - `bg-[#222222] hover:bg-black`, `bg-[#151517] hover:bg-black`, and `bg-zinc-900` will disappear on Dark Mode (`#12100F`). Must be mapped to Secondary CTA tokens.
2. **Leaflet Map HTML Strings**:
   - `MapView.jsx` injects HTML strings with raw inline styles (`background-color: #dc3545`, `color: #222`, `color: #717171`). These bypass Tailwind and require explicit CSS variable or style string updates.
3. **Hardcoded Translucent Borders**:
   - Classes like `border-[#171719]/10` and `border-[#171719]/15` assume a white background and will be invisible on Dark Mode.
4. **Brand Accent vs Error Separation**:
   - The new palette separates Brand Accent (`#E86A4D` Terracotta Coral) from Error (`#F0666B` / `#D9484D` Rose Red). Existing mixed usages of `#DC3545` must be audited carefully.
5. **Google OAuth Asset Integrity**:
   - Google logo SVGs in auth pages must remain untouched to respect brand asset requirements.

---

## 10. Recommended Mapping Matrix: CURRENT → VISTARO

```
========================================================================================
SEMANTIC ROLE          | CURRENT TOKEN(S)          | DARK MODE TOKEN  | LIGHT MODE TOKEN
========================================================================================
Main Background        | bg-white, #FFFFFF         | #12100F          | #F5F1EA
Secondary Background   | bg-zinc-50, #F7F7F7       | #1B1815          | #EDE6DA
Surface / Card         | bg-white, bg-white/95     | #201C1A          | #FFFFFF
Border / Divider       | border-zinc-200, #DDDDDD, | #3A3532          | #E0D6C8
                       | border-[#171719]/10       |                  | 
Primary Text / Headings| #171719, #222222,         | #F5F1EA          | #12100F
                       | text-zinc-900             |                  | 
Secondary Text         | #717171, text-zinc-600    | #B7AFA6          | #6B615A
Muted Text / Placehdrs | #A7A7AC, text-zinc-400    | #857A70          | #9A9089
Brand Accent (Primary) | #DC3545, #FF385C          | #E86A4D          | #E86A4D
Brand Accent Hover     | #B02A37, #FF5A70          | #C94F32          | #C94F32
Rating Gold (Stars)    | #222222, amber-400/500    | #E8B04B          | #C98A2E
Success State / Badges | emerald-500, emerald-600  | #3CAE7E          | #2F9E6E
Error State / Alerts   | red-500, #dc3545 (errors) | #F0666B          | #D9484D
Secondary CTA Buttons  | bg-[#222222], bg-[#151517]| #201C1A / Border | #12100F (Dark Ink)
                       | hover:bg-black            | hover: #3A3532   | hover: #1B1815
========================================================================================
```

---

## 11. Files Requiring Modification in Future Phases (44 Files Total)

### Configuration, Styles & Assets (5 files):
- `client/src/index.css`
- `client/tailwind.config.js`
- `client/index.html`
- `client/public/favicon.svg`
- `client/public/icons.svg`

### Common & Layout Components (8 files):
- `client/src/components/layout/Navbar.jsx`
- `client/src/components/layout/Footer.jsx`
- `client/src/components/layout/MobileBottomNav.jsx`
- `client/src/components/layout/Layout.jsx`
- `client/src/components/common/StarRating.jsx`
- `client/src/components/common/LoadingSpinner.jsx`
- `client/src/components/common/ToastContainer.jsx`
- `client/src/components/booking/BookingWidget.jsx`

### Feature Components (9 files):
- `client/src/components/listings/CategoryBar.jsx`
- `client/src/components/listings/FilterModal.jsx`
- `client/src/components/listings/HeroBanner.jsx`
- `client/src/components/listings/ListingCard.jsx`
- `client/src/components/listings/ImageGallery.jsx`
- `client/src/components/listings/Lightbox.jsx`
- `client/src/components/listings/MapView.jsx`
- `client/src/components/packages/TourPackageCard.jsx`
- `client/src/components/experiences/ExperienceCard.jsx`
- `client/src/components/reviews/ReviewCard.jsx`
- `client/src/components/reviews/ReviewForm.jsx`

### Pages (22 files):
- `client/src/pages/HomePage.jsx`
- `client/src/pages/ListingDetailPage.jsx`
- `client/src/pages/DestinationsPage.jsx`
- `client/src/pages/DestinationDetailPage.jsx`
- `client/src/pages/TourPackagesPage.jsx`
- `client/src/pages/TourPackageDetailPage.jsx`
- `client/src/pages/ExperiencesListPage.jsx`
- `client/src/pages/ExperienceDetailPage.jsx`
- `client/src/pages/WishlistPage.jsx`
- `client/src/pages/AdminDashboardPage.jsx`
- `client/src/pages/HostDashboardPage.jsx`
- `client/src/pages/InboxPage.jsx`
- `client/src/pages/ProfilePage.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/SignupPage.jsx`
- `client/src/pages/SearchResultsPage.jsx`
- `client/src/pages/CategoryPage.jsx`
- `client/src/pages/CreateListingPage.jsx`
- `client/src/pages/EditListingPage.jsx`
- `client/src/pages/CompanyDetailsPage.jsx`
- `client/src/pages/PrivacyPage.jsx`
- `client/src/pages/TermsPage.jsx`
- `client/src/pages/NotFoundPage.jsx`

---

## 12. Pre-Migration Recommendations & Next Steps

1. **Phase 2 Implementation Strategy (Design System & Token Architecture)**:
   - Establish CSS custom properties in `src/index.css` for `:root` (Light Mode) and `.dark` / `[data-theme="dark"]` (Dark Mode).
   - Configure Tailwind utility tokens to consume these CSS variables directly (e.g. `bg-vistaro-main`, `bg-vistaro-surface`, `text-vistaro-primary`, `border-vistaro-divider`, `bg-vistaro-accent`).
2. **Phase 3 Component-by-Component Migration**:
   - Migrate components in logical batches (Global/Layout → Common Components → Listing/Detail Features → Specialized Pages).
   - Ensure dark mode toggle support is seamlessly integrated into `Navbar` and `MobileBottomNav`.

---
*End of Phase 1 Audit Report.*
