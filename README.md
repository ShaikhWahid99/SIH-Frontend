# SIH Frontend - Smart India Hackathon Project

This repository contains the frontend application of my SIH project, built with modern web technologies to provide an interactive and responsive user experience for learners and trainers.

## ✨ Key Features

- **Role-based Access:** Separate dashboards for Learners and Trainers.
- **Interactive Learning:** Adaptive quizzes, swipe-based quizzes, and flashcards.
- **Visual Roadmaps:** Interactive learning pathways using ReactFlow.
- **Multilingual Support:** Auto-translation capabilities.
- **Responsive Design:** Optimized for mobile and desktop views.

## 🚀 Tech Stack

- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (based on Radix UI)
- **Icons:** Lucide React, React Icons
- **State Management & Data Fetching:** React Query (@tanstack/react-query), Axios
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form, Zod
- **Visualization:** Recharts, ReactFlow, D3.js
- **Animations:** Framer Motion, Lottie React
- **Internationalization:** i18next

## 📂 Project Structure

```
SIH-Frontend/
├── src/
│   ├── components/      # Reusable UI components (Shadcn, shared)
│   ├── context/         # React Context providers (Auth, Language)
│   ├── data/            # Static/Dummy data
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts (Auth, Learner, Trainer)
│   ├── lib/             # Utilities and configurations (API, Auth)
│   ├── pages/           # Application pages (Dashboard, Quizzes, Auth)
│   ├── styles/          # Global styles
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Entry point
└── ...
```

## 🛠️ Installation & Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd SIH-Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or if you use bun
    bun install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    bun run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```