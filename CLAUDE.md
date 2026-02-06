# CLAUDE.md

## Technical Context

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Repathly is an AI-powered road trip planning app. It has a Laravel 12 backend (`/backend`) and a React Native + Expo mobile frontend (`/mobile`). The database is SQLite. Authentication uses Laravel Sanctum (token-based).

## Common Commands

### Backend (run from `/backend`)

```bash
composer install                # Install PHP dependencies
composer run dev                # Start dev server (serves API, queue, logs, Vite concurrently)
php artisan serve               # Start just the API server
php artisan migrate             # Run database migrations
composer run test               # Run PHPUnit tests (uses in-memory SQLite)
./vendor/bin/phpunit --filter=TestName  # Run a single test
./vendor/bin/pint               # Lint/format PHP code
```

### Mobile (run from `/mobile`)

```bash
npm install                     # Install JS dependencies
npm start                       # Start Expo dev server
npm run android                 # Run on Android emulator
npm run ios                     # Run on iOS simulator
npm run web                     # Run in web browser
npm run test                    # Run Jest tests (watch mode)
npm run build:android           # Production Android build
npm run build:ios               # Production iOS build
```

## Architecture

### Backend (`/backend`)

- **Routes**: All API routes in `routes/api.php`, prefixed with `/api`. Public auth routes and protected routes (via Sanctum middleware).
- **Controllers**: `app/Http/Controllers/Api/` — `AuthController` handles registration/login/profile, `ExperienceCardController` handles onboarding card data.
- **Form Requests**: `app/Http/Requests/Auth/` — dedicated validation classes per endpoint with Turkish error messages.
- **ApiResponse Trait**: `app/Traits/ApiResponse.php` — all controllers use `success()`, `error()`, `validationError()` for consistent JSON responses: `{success, message, data?, error?}`.
- **Models**: `User` has many-to-many relationship with `ExperienceCard` via `user_experience_cards` pivot. User model has `hasCompletedOnboarding()` (requires 4+ cards selected).
- **Database**: SQLite file at `database/database.sqlite`. Migrations use Laravel timestamp naming.

### Mobile (`/mobile`)

- **Routing**: Expo Router (file-based) in `app/` with route groups: `(auth)` for login/register, `(onboarding)` for experience card selection, `(app)` for main screens.
- **Auth State**: `app/contexts/AuthContext.tsx` provides global auth via React Context. Access with `useAuthContext()` hook from `hooks/useAuth.ts`.
- **Token Storage**: `app/utils/secureStorage.ts` — uses Expo SecureStore on native, localStorage on web.
- **API Layer**: `services/api/` — `auth.ts` and `experienceCards.ts` with a generic `apiCall()` helper. Has a `USE_MOCK` flag for development without backend.
- **Maps**: React Native Maps with Google Maps API (key in `app.json`).
- **User Location**: Stored globally via `(global as any).userLocation`.

### API Base URL

Backend runs at `http://192.168.100.23:8000/api` (local network IP). The mobile app connects to this address.

## Key Conventions

- **API responses** always follow the format: `{success: bool, message: string, data?: any, error?: string}`
- **Bilingual content**: Models have `_en` and `_tr` suffixed fields (e.g., `name_en`, `name_tr`, `description_en`, `description_tr`)
- **Validation messages** are in Turkish
- **Database columns** use snake_case; JSON API responses use camelCase
- Backend controllers use try-catch with the ApiResponse trait for error handling
- Mobile uses TypeScript throughout

## Product Context & Vision

This document provides **long-term product context, intent, and architectural guardrails** for anyone (human or AI) working on the Repathly codebase.  
It should be treated as a **stable source of truth** for *what Repathly is*, *why it exists*, and *how decisions should be made* — not as an implementation manual.

---

# Repathly — Product Context & Vision

## Product Vision & Purpose

**Repathly** is an experience-driven travel and road-trip planning platform.

Its purpose is not to optimize routes purely for speed or distance, but to design **journeys that match who the traveler is**.  
Repathly turns a user’s taste, preferences, and past behavior into personalized routes that feel intentional rather than generic.

The journey itself is the product — not just the destination.

---

## Core Problem Repathly Solves

Traditional navigation and travel apps:

- Optimize only for time or distance
- Treat all users the same
- Surface places by popularity, not relevance
- Separate discovery, planning, and memory into disconnected tools

Repathly solves this by:

- Building a **taste-based user profile**
- Using that profile as a **hard input into routing**
- Treating routes, reviews, and experiences as connected objects
- Learning continuously from real user behavior

---

## Target User

Repathly is built for travelers who:

- Care about *how* they travel, not just *where*
- Enjoy food, culture, scenery, lifestyle, and discovery
- Want routes tailored to personal taste
- Prefer meaningful detours over pure efficiency

It supports solo travelers, couples, families, and groups — with personalization adapting to context.

---

## Permanent Product Structure (Non-Negotiable)

Repathly is organized around **three permanent pillars**, reflected as fixed bottom navigation tabs:

1. **Profile** — Who the user is  
2. **Search / Discover** — What the user explores  
3. **Route Planning** — What the user does  

All present and future features must live within or directly support one of these pillars.

---

## Pillar 1: Profile (Taste DNA & Identity Layer)

The **Profile** is the most critical system in Repathly.

It is not a cosmetic user page.  
It is the **core data object** that drives personalization, routing, ranking, and discovery.

### Experience Cards (Foundation)

- Users define their travel DNA by selecting **Experience Cards**
- Cards represent interests such as food, scenery, culture, nightlife, lifestyle, etc.
- A minimum selection is required to create a meaningful profile
- Cards act as **weighted preferences**, not binary filters

Experience Cards influence:

- Place ranking
- Route composition
- Discovery results
- Long-term personalization through behavior

### Behavioral Preferences

The profile may also store high-level behavioral preferences such as:

- Travel style (fast ↔ experience-first)
- Detour tolerance
- Time vs enjoyment priority
- Group type (solo, couple, friends, family)

These are **algorithmic inputs**, not cosmetic UI settings.

---

## Pillar 2: Route Planning (Decision & Scoring Engine)

Route planning is the **core engine** of Repathly.

It connects:

- The user’s profile
- Real-world geography
- Places and experiences
- Time and distance constraints
- Experience value

### Route Scenarios (High-Level Logic)

Every route is generated under one of three scenarios:

- **Pass-Through**  
  Time-first, minimal detours, experiences only if extremely close to the path

- **Casual**  
  Balanced route with moderate detours and experience diversity

- **Flexible**  
  Experience-first, destination becomes secondary, time is a soft constraint

These scenarios change **how places are scored and prioritized**, not which data exists.

### Route as a First-Class Object

A route is not just a result screen.

A route stores:

- Profile weights
- Selected scenario
- Constraints and inputs
- Stops and experience composition

This allows routes to be saved, edited, re-run, remixed, and shared in later phases.

---

## Pillar 3: Interaction & Memory (Trust Layer)

Repathly builds trust and long-term personalization through **structured memory**.

### Reviews as Experience Events

Reviews are:

- Linked to a user profile
- Linked to a route
- Linked to a place
- Linked to the experience context that triggered the stop

A review is not just text — it is a **recorded experience**.

### Why This Exists

This pillar:

- Builds credibility through real journeys
- Creates a personal travel history
- Improves personalization over time
- Allows the system to learn what users actually enjoy

---

## Experience Cards Philosophy

Experience Cards are:

- Weighted signals, not static categories
- Shared language between users, places, routes, and reviews
- Central to personalization across the entire product
- Designed to evolve as the system learns from behavior

They are the backbone of Repathly’s intelligence.

---

## What Repathly Is Not (Non-Goals)

Repathly is **not**:

- A turn-by-turn navigation replacement
- A generic map or POI listing app
- A static itinerary generator
- A pure booking platform
- A review-only social network

Efficiency alone is never the primary goal — **relevance is**.

---

## Roadmap Phases (Conceptual, Stable)

### Phase 1 — Core Product

Focus:

- Profile creation with Experience Cards
- Core routing logic
- Pass-Through / Casual / Flexible scenarios
- Saving and re-running routes
- Basic discovery

Goal:  
Build a product that is valuable **even if only one person uses it**.

---

### Phase 2 — Social Layer

Adds:

- Public profiles
- Following users by taste
- Route sharing and remixing
- Community discovery

Goal:  
Organic growth through people following people.

---

### Phase 3 — Business & Creator Layer

Adds:

- Business profiles
- Stake-based visibility
- Sponsored but relevance-safe routes
- Creator monetization
- Marketplace dynamics

Goal:  
Monetization **without breaking trust or personalization quality**.

---

## Decision-Making Guardrails

When making product or technical decisions, always ask:

- Does this strengthen the Profile as the source of truth?
- Does this improve personalized routing?
- Does this respect experience relevance over raw popularity?
- Does this fit within Profile, Search, or Route pillars?
- Does this help the system learn over time?

If not, reconsider.

---

# Existing Repository & Architecture Context

The sections below describe the **current technical setup**.  
They may evolve, but should remain aligned with the product intent above.

---

## Project Overview

Repathly is an AI-powered road trip planning app.

- Backend: Laravel (`/backend`)
- Mobile frontend: React Native + Expo (`/mobile`)
- Authentication: Token-based
- Client-server architecture
- Mobile-first product

---

## Architecture Overview

### Backend (`/backend`)

- API-based backend
- Centralized business logic for:
  - Profiles
  - Experience cards
  - Routing logic
- Database-driven personalization
- Consistent response patterns and validation

### Mobile (`/mobile`)

- Mobile-first UI
- File-based routing
- Global auth and profile state
- Map-based experience visualization
- Secure token storage

---

## Architectural Principles

- Profile is the source of truth
- Routes are first-class objects
- Experience > popularity
- Personalization over generic optimization
- Learning from behavior is core, not optional

---

**Repathly exists to design journeys that feel personal, intentional, and worth remembering.**

