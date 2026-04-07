# Quiz Portal Backend (NestJS + PostgreSQL)

Backend API for a full-stack Quiz Portal built using NestJS and PostgreSQL. This application handles user authentication, quiz management, and real-time scoring.

---

## Features

- JWT-based user authentication
- Quiz creation and management
- Attempt quizzes and track scores
- Real-time scoring system
- RESTful APIs
- Secure and scalable architecture

---

## Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication

---

## Project Structure

```text
src/
 ├── auth/
 ├── users/
 ├── quiz/
 ├── migrations/
```

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Mustafaa1998/quiz-portal-backend.git
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=quiz_portal_db
JWT_SECRET=your_secret_key
```

### 4. Run the application
```bash
npm run start:dev
```

---

## API Endpoints (Sample)
- POST /auth/register — Register user
- POST /auth/login — Login user
- GET /quiz — Get all quizzes
- POST /quiz — Create quiz
- POST /quiz/start — Start attempt
- POST /quiz/submit — Submit answers

## Author
**Muhammad Mustafa**  
📧 mustafasaleem1998@gmail.com  
🔗 linkedin.com/in/muhammad-mustafa-169282188
