# AtlasPulse AI — Civic Escalation Platform

> Report. Analyze. Escalate.

AtlasPulse AI is an AI-powered civic issue reporting and automated escalation platform that transforms how citizens report and resolve community infrastructure problems in Chennai, India.

![AtlasPulse AI](https://atlaspulse-ai-381730672452.asia-southeast1.run.app)

## 🌐 Live Demo
**[https://atlaspulse-ai-381730672452.asia-southeast1.run.app](https://atlaspulse-ai-381730672452.asia-southeast1.run.app)**

---

## 🚨 The Problem
Communities frequently face issues such as potholes, water leakages, damaged streetlights, and waste management concerns. Reporting these issues is fragmented, difficult to track, and lacks transparency. Citizens have no way to escalate issues formally or hold municipal departments accountable.

## ✅ The Solution
AtlasPulse AI creates a complete accountability loop:

```
Citizen uploads photo
        ↓
Gemini Vision analyzes issue
        ↓
Priority Engine scores 0-100
        ↓
AI routes to correct department
        ↓
Gemini generates formal complaint letter
        ↓
Citizen downloads PDF
        ↓
Issue tracked on city-wide map
        ↓
Analytics dashboard updated
```

---

## ✨ Key Features

### 🔍 AI-Powered Image Analysis
Gemini 3.5 Flash Vision analyzes uploaded photos and returns:
- Issue category (Pothole, Water Leakage, Garbage Dump, etc.)
- Severity level (1-10)
- Confidence score
- Detailed AI summary

### 📊 Intelligent Priority Engine
Scores every issue 0-100 based on:
- Severity level
- Location and population impact
- Proximity to schools and hospitals
- Urgency tier: Routine / Important / Urgent / Emergency

### 🏛️ AI Department Routing
Automatically identifies the correct municipal department:
- Greater Chennai Corporation Roads Department
- Chennai Metropolitan Water Supply and Sewerage Board
- GCC Solid Waste Management
- Chennai Smart City Limited Electrical Division
- GCC Drainage Division

### 📄 Municipal Action Request Generator
Gemini drafts a complete formal complaint letter including:
- Official tracking ID (AP-2026-XXXX)
- GPS coordinates
- Issue description and urgency justification
- Action deadline
- Citizen signature block
- PDF download ready

### 🗺️ Live Grid — Chennai Map Dashboard
- Real-time Leaflet Map with custom CartoDB Dark Matter dark tiles and severity-colored pins
- Red = Emergency, Orange = Urgent, Yellow = Important, Green = Routine
- Filter by category and severity
- Click pins for issue details

### 📈 Analytics Dashboard
- Gemini AI Executive Brief with critical alerts and trends
- Issue status breakdown (Total Reported, Resolved, In Progress, Pending)
- Real-time stats: Verification count & dynamic analytics

### 👥 Community Verification
- Citizens verify reported issues to ensure authenticity
- Verification count shown on each issue card
- Prevents duplicate reports and increases credibility

### 🎯 Issue Tracking
- Unique tracking ID for every report
- Real-time status updates (Reported, Verified, In Progress, Resolved)
- "My Reports" page for personal tracking

---

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- TailwindCSS v4 (dark theme)
- Motion (animations)
- Lucide React (icons)
- Leaflet Map (maps integration)

### Backend & Database
- Firebase Authentication
- Cloud Firestore (real-time database)
- Firebase Storage (image storage)
- Express Node server for deployment handling

### AI & API
- Gemini 3.5 Flash (4 separate AI calls)
- @google/genai SDK

### Deployment
- Google Cloud Run
- Google AI Studio

---

## 🤖 Gemini AI Integration

AtlasPulse AI makes 4 separate Gemini API calls using `gemini-3.5-flash`:

| Call | Purpose | Input | Output |
|------|---------|-------|--------|
| Call 1 | Vision Inspector | Image & prompt | Category, Severity, Confidence, Summary |
| Call 2 | Priority Engine | Issue details & context | Priority score, Department, Routing reasoning |
| Call 3 | Letter Generator | Issue details | Formal complaint letter |
| Call 4 | Analytics Brief | Issue statistics | Executive intelligence summary |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Tawfeeqshaik/AtlasPulse-AI.git

# Navigate to project
cd AtlasPulse-AI

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your keys to .env
# Then start development server
npm run dev
```

### Environment Variables

Ensure your `.env` contains:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_FIRESTORE_DATABASE_ID=your_firestore_database_id
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📁 Project Structure

```
atlaspulse-ai/
├── src/
│   ├── components/
│   │   ├── AnalyticsCards.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GeminiStatus.tsx
│   │   ├── IssueCard.tsx
│   │   ├── LetterPreview.tsx
│   │   └── SeverityBadge.tsx
│   ├── hooks/
│   │   ├── useFirestore.ts
│   │   ├── useGemini.ts
│   │   ├── useGeolocation.ts
│   │   └── useUserProfile.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── gemini.ts
│   │   ├── mapStyles.ts
│   │   ├── seedData.ts
│   │   └── selfTest.ts
│   ├── pages/
│   │   ├── AIAnalysis.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── MapDashboard.tsx
│   │   ├── MunicipalActionRequest.tsx
│   │   ├── MyReports.tsx
│   │   ├── Profile.tsx
│   │   ├── ReportIssue.tsx
│   │   └── Signup.tsx
│   ├── types/
│   │   ├── GeminiAnalysis.ts
│   │   ├── Issue.ts
│   │   └── User.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── public/
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🗺️ Application Views

The app manages navigation dynamically using React state routing:

| Page State | View Page Component | Access |
|-------|------|--------|
| landing | `Landing.tsx` | Public |
| login | `Login.tsx` | Public |
| signup | `Signup.tsx` | Public |
| report | `ReportIssue.tsx` | Protected |
| ai-analysis | `AIAnalysis.tsx` | Protected |
| action-letter | `MunicipalActionRequest.tsx` | Protected |
| map | `MapDashboard.tsx` | Protected |
| analytics | `AnalyticsDashboard.tsx` | Protected |
| my-reports | `MyReports.tsx` | Protected |
| profile | `Profile.tsx` | Protected |

---

## 🎯 Hackathon Submission

- **Hackathon:** BlockseBlock National AI Hackathon 2026
- **Track:** Community Hero — Hyperlocal Problem Solver
- **Deployed:** Google Cloud Run
- **Development Platform:** Google AI Studio

---

## 📸 Screenshots

### Landing Page
![Landing](screenshots/landing.png)

### AI Analysis
![Analysis](screenshots/analysis.png)

### Municipal Action Request
![Letter](screenshots/letter.png)

### Live Grid Map
![Map](screenshots/map.png)

### Analytics Command
![Analytics](screenshots/analytics.png)

---

## 👨‍💻 Developer

**Tawfeeq Shaik**
- B.Tech CSE AI/ML — Chennai Institute of Technology
- GitHub: [@Tawfeeqsh](https://github.com/Tawfeeqsh)

---

## 📄 License

MIT License — feel free to use and modify.

---

*Built with Gemini 3.5 Flash, Leaflet Map, Firebase, and React*
*Deployed on Google Cloud Run*
*Chennai, India 🇮🇳*
