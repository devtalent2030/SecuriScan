# 🚀 SecuriScan Frontend (Next.js + TypeScript)

## 📌 Setup

### 1️⃣ Install dependencies
```bash
npm install

2️⃣ Run the Development Server
bash
Copy
Edit
npm run dev
3️⃣ Tech Stack
Next.js + TypeScript (React framework)
Axios + React Query (API data fetching & caching)
TailwindCSS (Styling)


4️⃣ Folder Structure
frontend/
├── src/
│   ├── app/        # ✅ Next.js App Router (instead of pages/)
│   │   ├── layout.tsx      # Main layout
│   │   ├── page.tsx        # Home page (index.tsx equivalent)
│   │   ├── api/            # API routes (serverless functions, if needed)
│   │   ├── dashboard/      # Example route → /dashboard
│   │   ├── loading.tsx     # Built-in loading UI
│   ├── components/         # ✅ Reusable UI components
│   ├── styles/             # ✅ Global & modular styles
├── public/                 # ✅ Static assets (images, favicons, etc.)
├── package.json            # ✅ npm dependencies
├── tsconfig.json           # ✅ TypeScript config
├── next.config.js          # ✅ Next.js config (if needed)
├── .gitignore              # ✅ Ignore unnecessary files
└── README.md               # ✅ Project documentation

Run Next.js Dev Server


npm run dev
✅ Open http://localhost:3000 to check if it's running.