# Premium URL Shortener - Implementation Plan

## 1. Tech Stack Details
A modern, high-performance stack designed for scale and premium aesthetics.

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS + Shadcn UI
- **Backend/Database:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Animations:** Framer Motion + Pure CSS (Tailwind transitions)
- **Charts:** Recharts (for Analytics)
- **Icons:** Lucide React
- **Validation:** Zod + React Hook Form

## 2. UI/UX Design System (Cinematic & Premium)
Following the `FRONTEND_GUIDE.md` standards for a "2026 Aesthetic".

- **Theme:** Cinematic Dark Mode (Primary: `#000000`, Secondary: `#0B0C10`, Accents: Electric Blue `#00E5FF` / Cyber Purple `#8A2BE2`).
- **Layout:** Bento Grid Dashboard for statistics and link management.
- **Glassmorphism:** Use `backdrop-blur-md` and `bg-white/5` with thin borders (`border-white/10`) for all cards.
- **Glowing Accents:** Interactive elements will feature `box-shadow-glow` effects and neon border-beams.
- **Typography:** Sleek sans-serif (Inter or Orbitron for headers) with high letter-spacing.
- **Micro-interactions:** 
  - Subtle scaling on hover (`hover:scale-[1.02]`).
  - Smooth spring transitions for modal popups.
  - Pulsing animation for active "Shortening" state.

## 3. Database Schema (Supabase)

### Table: `urls`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `created_at` | timestamptz | Default: now() |
| `original_url` | text | Source URL |
| `short_url` | text | Generated unique short code |
| `user_id` | uuid | Foreign Key -> `auth.users` |
| `title` | text | Meta title or user-defined title |
| `custom_alias` | text | Unique user-defined alias |
| `qr_code` | text | Base64 or URL to QR code |

### Table: `analytics` (Click Tracking)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | bigint | Primary Key |
| `created_at` | timestamptz | Default: now() |
| `url_id` | uuid | Foreign Key -> `urls.id` |
| `city` | text | Derived from IP |
| `country` | text | Derived from IP |
| `device` | text | Desktop/Mobile/Tablet |
| `browser` | text | Chrome/Safari/Firefox |

## 4. Implementation Phases

### Phase 1: Setup & Initialization
- Initialize Vite project with React and TypeScript.
- Install Tailwind CSS and Shadcn UI components.
- Configure Global CSS with cinematic color palette and glassmorphism utilities.

### Phase 2: Authentication & Database
- Connect Supabase client.
- Implement Auth screens (Login/Register) with premium "Aurora" background effects.
- Set up PostgreSQL tables and Row Level Security (RLS) policies.

### Phase 3: Core URL Logic
- Develop URL shortening service (generating unique nanoids).
- Implement "Shorten" component with glowing input field and instant copy-to-clipboard.
- Set up Supabase Edge Functions for URL redirection and analytics logging.

### Phase 4: Bento Dashboard
- Create the main dashboard layout using a responsive Bento Grid.
- Implement link management cards (Edit, Delete, Copy, QR Toggle).
- Add "Empty State" animations for new users.

### Phase 5: Analytics & Visuals
- Integrate Recharts for click-over-time graphs and device breakdown pie charts.
- Implement "Live View" tracking for real-time click notifications.

### Phase 6: Deployment & Polish
- Deploy to Vercel/Netlify.
- Final UI sweep: Add Framer Motion scroll-reveal effects and optimize LCP (Largest Contentful Paint).

## 5. Required NPM Packages

```bash
# Core
npm install @supabase/supabase-js lucide-react framer-motion recharts nanoid

# UI Components (Shadcn + Utilities)
npm install clsx tailwind-merge tailwindcss-animate qrcode.react

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Development
npm install -D prettier-plugin-tailwindcss
```
