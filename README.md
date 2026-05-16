<div align="center">
  <img src="./public/logo.png" alt="ChanakyaOS Logo" width="200" />
  <h1>ChanakyaOS</h1>
  <p><strong>The AI-Powered Career & Learning Operating System</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Supabase-Database-blue?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
  </p>
</div>

---

## 📖 Table of Contents
- [About The Project](#about-the-project)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License & Credits](#license--credits)

---

## ✨ About The Project

> **"Confusion is Expensive. Wisdom Over Luck. The Wise Move First."**

ChanakyaOS is an AI-powered career operating system designed to help students and young professionals build the right profile, roadmap, and proof of readiness required to secure internships, jobs, and long-term career success.

Named after **Chanakya** — India's ancient master of strategy — the platform embodies the principle that the smartest, most prepared person wins the career game. It analyzes your current position, identifies every gap in your profile, generates multiple realistic career pathways tailored to your background, and guides you step-by-step through becoming genuinely employable.

---

## 🚀 Core Features

### 🧠 LMS Workspace & Pathways
*   **Dynamic Stage Tracking**: Break your career journey into clearly defined stages (Foundation, Projects, Market Ready).
*   **Career Readiness Score**: A live 0-100 gauge reflecting your market competitiveness.
*   **AI-Generated Pathways**: Personalized strategic plans based on your background, budget, and ambitions.

### 📄 Identity & Resume Engine
*   **Dual-Pane LaTeX Builder**: Edit your resume in a visual editor and see a live LaTeX-rendered PDF preview.
*   **AI ATS Optimization**: Get line-by-line improvement suggestions and keyword density analysis to beat the bots.
*   **Targeted Variants**: Generate role-specific resume versions with one click.

### 💼 LinkedIn Strategic Optimizer
*   **PDF Profile Analysis**: Upload your LinkedIn export for a comprehensive audit of your professional brand.
*   **Contextual AI Grading**: Recruiter-level feedback on your headline, summary, and experience.
*   **Post Idea Generator**: Never run out of content ideas with strategic post suggestions tailored to your niche.

### 🤖 AI Career Assistant ("Your Chanakya")
*   **Hyper-Personalized Guidance**: An assistant that knows your profile, active pathway, and current skill gaps.
*   **Real-Time Market Intelligence**: Proactive advice based on shifting industry trends and salary benchmarks.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | [Zustand](https://docs.pmnd.rs/zustand/) |
| **Database & Auth** | [Supabase](https://supabase.com/) |
| **AI Models** | [Groq (Llama 3.3)](https://groq.com/), [Google Gemini](https://ai.google.dev/) |
| **Parsing & PDF** | [pdf-parse](https://www.npmjs.com/package/pdf-parse), [pdf-lib](https://pdf-lib.js.org/), [react-latex-next](https://www.npmjs.com/package/react-latex-next) |
| **Charts** | [Recharts](https://recharts.org/) |

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   Git
*   Supabase Account
*   Groq API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/ChanakyaOS.git
    cd ChanakyaOS
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env.local` file in the root and add the following:

    | Key | Description |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
    | `SUPABASE_SERVICE_ROLE_KEY` | (Server-side only) Your Supabase service role key |
    | `GROQ_API_KEY` | Your Groq Cloud API key |
    | `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google AI Studio API key |

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 📁 Project Architecture

```text
src/
├── app/               # Next.js App Router (Auth, Dashboard, Marketing, API)
│   ├── (auth)/        # Login and Signup flows
│   ├── (dashboard)/   # Main app features (LMS, Resume, LinkedIn, etc.)
│   └── api/           # Serverless functions & AI routes
├── components/        # Reusable UI components & Layouts
├── config/            # Static configuration & Constants
├── hooks/             # Custom React hooks
├── store/             # Zustand state management (useUserStore.ts)
├── utils/             # Helper functions & Supabase clients
└── types/             # TypeScript interfaces & definitions
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 Credits

Built with ❤️ by [Devansh Srivastava](https://www.linkedin.com/in/connectwithdevansh/)

---
<div align="center">
  <sub>Built with the wisdom of Chanakya, powered by Modern AI.</sub>
</div>
