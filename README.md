# CV Genie - Professional CV Generator

**Live Demo:** [https://cv-generator-nu-eight.vercel.app/](https://cv-generator-nu-eight.vercel.app/)

## 📖 Project Summary

**CV Genie** is an internal system built originally as a technical solution; Preparing staff CVs manually for software development tenders is time-consuming and repetitive. This tool solves that by providing a structured, centralized platform where staff and management can explicitly store professional profiles, manage project experiences, define skill sets, and automatically generate beautifully formatted, proposal-ready CVs.

The system natively supports multiple dynamic CSS templates (such as modern timelines, solid header columns, ATS-friendly layouts, etc.) perfectly suited to any professional tender submission requirement.

---

## 📸 Interface Preview

you can find some screen shots in the assets folder

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** database (Local or Supabase)
- **Cloudinary** account (for profile photo uploads, optional but recommended)

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory by looking at `.env.example` (or configure as follows):
   ```env
   PORT=5000
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Initialize the database schema (Using the provided SQL in `/backend/migrations/` in your SQL IDE/Supabase).
5. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```

---

## 🛠 Technology Stack & Key Design Decisions

### Technology Stack
- **Frontend:** ReactJS (JavaScript) with modular CSS handling.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (hosted on Supabase) accessed via standard Postgres SQL connections.

### Key Design Decisions

1. **Relational Database Choice (PostgreSQL):**
   Postgres ensures strict transactional safety and handles relational hierarchies seamlessly leveraging cascading deletes and standard `FOREIGN KEY` references linking `users` -> `profiles` -> `projects`/`skills`.

2. **Custom Authentication & Authorization:**
   opted for a custom `bcrypt` + `jsonwebtoken` (JWT) authentication flow over third-party authenticators to maintain complete administrative control over staff logins, passwords, and token expiration strategies directly inside our own schema.

3. **Frontend-Driven CV Templates:**
   Instead of generating complex PDFs heavily on the server using headless browsers (which introduces massive latency and hosting costs), **all CV templates are React Components** rendered on the frontend.
   - Using CSS-based `@media print` rules and `react-to-print`, the browser captures an exact, pixel-perfect vector representation of the template into a PDF.
   - **Advantage:** Users see a 100% accurate, real-time live preview as they change colors, fonts, or data, completely bypassing server latency.

4. **Image Handling with Cloudinary:**
   To prevent base64 bloat in the database, profile photos are uploaded via `multer` to Cloudinary, and only a lightweight SECURE URL string is retained in the `profiles` table.

---

## 🏗 Assumptions Made

To prioritize a clean, well-structured layout while meeting the technical assignment constraints, the following assumptions were made:

1. **Private Localized Project Experiences:** 
   It was assumed that for CV generation, a user tracking their exact role in a project is uniquely tied to their personal terminology and contributions. Therefore, the `projects` table is treated as a private experience log `REFERENCES profiles(id)` (like a standard CV experience history) rather than a global list shared identically by all staff, simplifying edits and giving users full control over their contribution descriptions.
2. **Current Work Handling:**
   assumed an ongoing/present position simply means the `end_date` is `NULL`. The backend validates that `start_date` must precede `end_date` explicitly *only* if an end date is strictly provided.
3. **Skill Proficiency Logic:** Proficiency levels (1-100) are assumed to represent a user's self-assessment and are visualized differently (bars vs tag lists) based on the specific template selected.
4. **Unique Email Verification:** It is assumed that only one account can be created per email address, enforced at the database level for system integrity.
5. **Single Profile Constraint:** Each user is assumed to have exactly one professional profile, fulfilling the scope of a standard organizational CV management tool.
6. **Cloudinary for Performance:** assumed external image hosting via Cloudinary provides better performance and scalability than storing raw binary data in the relational database.
7. **Print-Ready Formatting:** All templates are assumed to target standard A4 paper dimensions (210mm x 297mm) as the primary output format for technical proposal submissions.
8. **Consistent Typography:** assumed standard font families (Inter, Roboto, etc.) are available or globally imported to ensure visual consistency across different devices.


---

## ✨ Future Improvements

While this MVP covers the entire spectrum of the core requirements robustly, the architecture paves the way for several significant improvements:

1. **Skill Suggestion & Management:**
   Allow users to "suggest/request" new skills if they do not exist in the dropdown, creating an admin-approval queue for the global skills dictionary.
2. **Inline CV Editing:**
   Enable "WYSIWYG" (What You See Is What You Get) live editing right from the CV preview screen itself, avoiding the need to bounce back to the profile modals.
3. **Mobile Responsiveness for the Builder:**
   The current CV builder panel prioritizes desktop viewing (due to strict A4 sizing limits). Enhancing mobile-responsiveness for smaller viewports so the PDF viewer gracefully scales down visually while keeping the A4 aspect ratio.
4. **Global Project Master-List Linking:**
   In the future, transitioning the schema to a many-to-many relationship (`staff_projects`) where a global "Project Database" holds client/location data, and staff only append their specific "Role/Contributions" to it.
5. **AI-Driven Profile Summary Writer:**
   Integrating LLMs to dynamically generate a well-structured "Professional Summary" by passively analyzing the user's projects and skills.
