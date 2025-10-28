# Dynamic FAQ Builder - Complete Project

**Project ID:** P31  
**Course:** UE23CS341A  
**Team:** Tesseract

## 🎯 Project Overview

A sophisticated FAQ management system with AI-powered responses using Google Gemini API, Firebase backend, and React frontend. Features include admin CRUD operations, intelligent search with keyword ranking, and real-time AI-enhanced answers.

## 🏗️ Architecture

- **Frontend:** React 18 + Vite + TailwindCSS + Material-UI
- **Backend:** Firebase (Firestore, Authentication, Cloud Functions)
- **AI Integration:** Google Gemini API for intelligent responses
- **Search:** Full-text search with TF-IDF ranking algorithm
- **State Management:** React Context API + Custom Hooks

## 📁 Project Structure

```
dynamic-faq-builder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── FAQForm.jsx
│   │   │   │   └── FAQList.jsx
│   │   │   ├── User/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FAQDisplay.jsx
│   │   │   │   └── AIResponseModal.jsx
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   └── Auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── FAQContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFAQ.js
│   │   │   └── useSearch.js
│   │   ├── services/
│   │   │   ├── firebase.js
│   │   │   ├── faqService.js
│   │   │   ├── geminiService.js
│   │   │   └── searchService.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── backend/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── faqHandlers.js
│   │   │   ├── geminiHandlers.js
│   │   │   └── searchHandlers.js
│   │   ├── package.json
│   │   └── .env.example
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── firebase.json
├── docs/
│   ├── SETUP.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
└── README.md
```

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud Account (for Gemini API)
- Firebase Project

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/pestechnology/PESU_RR_AIML_A_P31_Dynamic_FAQ_Builder_Tesseract.git
cd dynamic-faq-builder
```

### Step 2: Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Enter project name: `dynamic-faq-builder`
   - Enable Google Analytics (optional)

2. **Enable Services:**
   - **Authentication:** Enable Email/Password
   - **Firestore:** Create database in production mode
   - **Cloud Functions:** Upgrade to Blaze plan (pay-as-you-go)

3. **Get Configuration:**
   - Go to Project Settings > General
   - Scroll to "Your apps" > Add web app
   - Copy the Firebase configuration

### Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Firebase config and Gemini API key
nano .env
```

Add to `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Backend Setup

```bash
cd ../backend

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Functions (JavaScript)
# - Hosting (optional)

cd functions

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add Gemini API key
nano .env
```

Add to `backend/functions/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
```

### Step 6: Deploy Firestore Rules

```bash
cd ..
firebase deploy --only firestore:rules
```

### Step 7: Run Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Access at: http://localhost:5173

**Terminal 2 - Backend (optional for local testing):**
```bash
cd backend/functions
npm run serve
```

### Step 8: Deploy to Production

```bash
# Build frontend
cd frontend
npm run build

# Deploy everything
cd ../backend
firebase deploy
```

## 🎨 Features

### Admin Features
- ✅ Create, Read, Update, Delete FAQ entries
- ✅ Rich text editor for answers
- ✅ Category management
- ✅ Tag system for better organization
- ✅ Analytics dashboard

### User Features
- ✅ Advanced search with keyword ranking
- ✅ AI-powered answer enhancement via Gemini
- ✅ Real-time search suggestions
- ✅ Category filtering
- ✅ Responsive design

### Technical Features
- ✅ TF-IDF based search ranking
- ✅ Firebase real-time updates
- ✅ Secure authentication
- ✅ Rate limiting for API calls
- ✅ Error handling and validation

## 🔧 Configuration

### Firebase Security Rules

The project includes comprehensive security rules:
- Admin-only write access to FAQs
- Public read access
- User authentication required for AI queries

### Environment Variables

**Frontend (.env):**
- Firebase configuration (6 variables)
- Gemini API key

**Backend (.env):**
- Gemini API key

## 📱 Usage

### Admin Access
1. Register an account
2. Manually set admin role in Firestore:
   ```
   users/{userId}
   {
     "email": "admin@example.com",
     "role": "admin",
     "createdAt": timestamp
   }
   ```

### Creating FAQs
1. Login as admin
2. Navigate to Admin Dashboard
3. Click "Add New FAQ"
4. Fill in question, answer, category, and tags
5. Save

### User Search
1. Type question in search bar
2. View ranked results based on keyword relevance
3. Click "Get AI Response" for enhanced answers
4. AI uses Gemini to provide detailed, context-aware responses

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Default Admin Account

After first deployment, create an admin user:

```bash
# In Firebase Console > Firestore
# Create document in 'users' collection:
{
  "email": "admin@tesseract.com",
  "role": "admin",
  "createdAt": new Date(),
  "displayName": "Admin User"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not initialized:**
   - Check .env file configuration
   - Verify Firebase project settings

2. **Gemini API errors:**
   - Verify API key is correct
   - Check quota limits in Google Cloud Console

3. **CORS errors:**
   - Deploy Firebase functions
   - Update Firebase hosting configuration

4. **Build errors:**
   - Clear node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall: `npm install`

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [API Documentation](docs/API.md) - API endpoints and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [User Guide](docs/USER_GUIDE.md) - End-user documentation

## 👥 Team Tesseract

- **Scrum Master:** [@tarun0648](https://github.com/tarun0648)
- **Developers:** 
  - [@adithyaKRATOS](https://github.com/adithyaKRATOS)
  - [@ak5hay19](https://github.com/ak5hay19)
  - [@Overkillx](https://github.com/Overkillx)

## 📄 License

Educational project for UE23CS341A - PES University

## 🙏 Acknowledgments

- **Teaching Assistants:** [@jash00007](https://github.com/jash00007), [@nh2seven](https://github.com/nh2seven)
- **Faculty Supervisor:** [@prakasheeralli](https://github.com/prakasheeralli)
- PES University, RR Campus

---

**Happy Coding! 🚀**
