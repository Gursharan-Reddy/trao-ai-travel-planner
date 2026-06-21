# 🌍 Trao AI Travel Planner

Trao AI Travel Planner is a modern, high-performance, full-stack application built to design hyper-personalized travel itineraries instantly. By leveraging the **Google Gemini 2.5 Flash** model with strict JSON schema outputs, the system creates highly structured day-by-day plans and accommodation options tailored perfectly to your destination, budget tier, and custom focus interests, saving them securely to a cloud-managed database vault.

---

## 🚀 Key Features

* **Generative Itinerary Engine**: Real-time content creation using the official `@google/genai` SDK powered by `gemini-2.5-flash`.
* **Deterministic JSON Parsing**: Strict backend output validation to prevent application UI runtime breaks or parsing anomalies.
* **Relational Storage Vault**: Seamless Postgres implementation using **Supabase DB** with transactional data persistence for user accounts and saved trips.
* **Modular Architecture**: Clean decoupled architecture separating an optimized **Next.js** frontend from a secure **Express.js API** engine.
* **Polished SaaS Interface**: Custom dark-mode utility-focused raw CSS layout built entirely without modern utility bloated frameworks, featuring high scannability, sticky navigation frames, and automatic vertical responsive aspect controls.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14+ (App Router), React, Standard CSS3
* **Backend**: Node.js, Express.js, Cors, Dotenv
* **Database**: Supabase PostgreSQL Engine (`pg` connection pool matrix)
* **Artificial Intelligence**: Google Gen AI SDK (`@google/genai` running `gemini-2.5-flash`)
* **Authentication**: Secure JSON Web Tokens (JWT) & `bcryptjs` password hashing

---

## 📂 Project Structure

```text
ai-travel-planner/
├── backend/
│   ├── config/          # Database runtime handshakes (db.js)
│   ├── middleware/      # JWT route protection middleware (auth.js)
│   ├── routes/          # API endpoint logic pools (authRoutes.js, tripRoutes.js)
│   ├── .env             # Server credential vaults (Ignored by Git)
│   ├── server.js        # Main API engine entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js page layout matrix (login, register, dashboard)
│   │   ├── context/     # Auth Context global security hooks
│   │   └── utils/       # Modular authenticated fetch wrappers
│   ├── .env             # Frontend path configs
│   └── package.json
│
└── .gitignore           # Global security rules filtering system credential leaks

💻 Installation & Local Environment Setup
1. Clone & Set Up .gitignore
Ensure you have created a .gitignore file in your root folder containing rules for node_modules/, .env, and .next/ to keep your credentials safe.

2. Configure the Backend Vault
Navigate to your backend workspace:

cd backend
npm install
Create a .env file inside the backend/ directory with the following variables:

Code snippet
PORT=5000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_custom_secure_jwt_string
GEMINI_API_KEY=your_live_google_gemini_api_key

3. Configure the Frontend Portal
Navigate to your frontend workspace:

cd ../frontend
npm install
Running the Application
To fire up the full stack ecosystem, open two separate terminal panels in your development editor:

Terminal A: Boot Up the Backend API
cd backend
npm run dev
Expected log: Security Data Vault Running on Port 5000
Supabase PostgreSQL Instance Authenticated and Connected Safely.

Terminal B: Launch the Next.js Client

cd frontend
npm run dev
Expected log:
▲ Next.js 14.2.3
- Local: http://localhost:3000

Open your browser and navigate to http://localhost:3000 to register your profile and compile your live AI travel plans!