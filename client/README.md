# Acey — AI Study Assistant 

Acey is an AI-powered study assistant designed to help students turn their study materials into useful learning resources. Upload documents and use AI-generated notes, flashcards, quizzes, and mind maps to make studying more organized and effective.

##  Features

- **Document Upload** — Upload study materials for processing.
- **AI Notes** — Generate concise notes from your materials.
- **Flashcards** — Review key concepts using question-and-answer cards.
- **Quizzes** — Test your understanding with generated questions.
- **Mind Maps** — Explore relationships between important concepts visually.
- **Progress Tracking** — Review learning activity and results.
- **User Authentication** — Register and log in to your account.
- **Persistent Storage** — Store document information and generated resources in the database.
- **AI and Fallback Generation** — Generate learning content using Gemini, with fallback content generation when needed.

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- HTML and CSS
- React Router

### Backend
- Java
- Spring Boot
- Maven
- REST APIs

### Database and AI
- MySQL
- Google Gemini API

## 📁 Project Structure

```text
C:\StudyMind AI
├── backend/
│   ├── src/main/java/
│   │   └── com/acely/
│   │       ├── auth/
│   │       ├── document/
│   │       ├── security/
│   │       └── user/
│   ├── src/main/resources/
│   └── pom.xml
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

##  Prerequisites

Install the following before running the project:

- Java JDK compatible with the backend configuration
- Maven, if it is not included through a wrapper
- Node.js and npm
- MySQL
- A Google Gemini API key, if using Gemini-powered generation

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Vedanti04/Acely.git
cd "StudyMind AI"
```

### 2. Configure the backend

Configure your database connection and AI API key in your local backend configuration.

Update `backend/src/main/resources/application.properties` or use environment variables supported by your application.

**Do not commit database passwords, API keys, or other secrets to GitHub.**

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

### 4. Start the frontend

Open another terminal:

```bash
cd "C:\StudyMind AI\client"
npm install
npm run dev
```

Open the local URL printed by the frontend development server in your terminal.

## 🔌 API Overview

The backend provides document and learning-resource endpoints. The exact routes and request formats depend on the current implementation.

| Endpoint | Purpose |
|---|---|
| `/api/documents` | Access document resources |
| `/api/documents/{id}/generate` | Generate learning resources for a document |
| `/api/documents/{id}/notes` | Access generated notes |
| `/api/documents/{id}/flashcards` | Access generated flashcards |
| `/api/documents/{id}/quiz` | Access generated quizzes |
| `/api/documents/{id}/mindmap` | Access generated mind maps |

Resource generation may also support resource-specific endpoints.

## 🔒 Security

- Keep API keys and database credentials private.
- Use environment variables for sensitive configuration where supported.
- Do not commit local environment files or build artifacts.
- Configure authentication and database access securely before deployment.

## 🗺️ Future Improvements

- Improve the quality and variety of AI-generated questions.
- Add more document formats and study tools.
- Enhance progress analytics and personalized recommendations.
- Improve responsive design and accessibility.
- Deploy the frontend and backend for public access.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome. Fork the repository, create a feature branch, and submit a pull request.

## 📄 License

A license has not yet been specified. Add a license file before distributing the project under specific reuse terms.

---

**Acey — Learn smarter, not harder.**