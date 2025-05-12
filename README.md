# Face Recognition Attendance System - Monorepo

This is the **monorepo** for the Face Recognition Attendance System, which consists of a **Next.js frontend** and a **Flask backend**. The system enables user registration, attendance tracking via face recognition, and viewing attendance records.

## Monorepo Structure

```plaintext
face-recognition-monorepo/
│── frontend/          # Next.js frontend
│── backend/           # Flask backend
│── .gitignore         # Global Git ignore for both projects
│── package.json       # Root package.json (optional if using workspaces)
│── README.md          # This documentation
```

## Features

- **User Registration**: Admins can register users with their name, email, and unique user ID.
- **Face Recognition**: Users upload or take a photo for face recognition.
- **Attendance Tracking**: Attendance is recorded once per day via face recognition.
- **Attendance Sheets**: Admins can view and download attendance sheets as Excel files.
- **Attendance Performance**: Users can view their attendance records.
- **User Dashboard**: Displays the list of present users for the selected day.

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Flask, OpenCV, face-recognition
- **Database**: SQLite/PostgreSQL (configurable)
- **API Communication**: Fetch (frontend) & Flask REST API (backend)
- **Authentication**: JWT & cookie-based authentication

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) or npm
- [Python](https://www.python.org/) (3.x)
- [pip](https://pip.pypa.io/en/stable/)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/wyasyn/research-project-2025.git
   cd face-recognition-monorepo
   ```

2. **Set up the backend**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Set environment variables
   python app.py  # Start the backend
   ```

   The backend will be available at `http://localhost:5000`.

3. **Set up the frontend**

   ```bash
   cd ../frontend
   yarn install  # or npm install
   cp .env.local.example .env.local  # Set frontend environment variables
   yarn dev  # or npm run dev
   ```

   The frontend will be available at `http://localhost:3000`.

## Environment Variables

### **Frontend (`.env.local` in `frontend/`)**

```plaintext
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FACE_RECOGNITION_API=http://localhost:5000/recognize
```

### **Backend (`.env` in `backend/`)**

```plaintext
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///attendance.db
```

## Pages and API Endpoints

### **Frontend Pages (`frontend/pages/`)**

- `/` – Home/Login page
- `/register` – Admin user registration
- `/attendance` – View attendance sheets
- `/dashboard` – User attendance performance
- `/face-recognition` – Upload/take a photo for recognition

### **Backend API Endpoints (`backend/app.py`)**

- `POST /api/register` – Register a new user
- `POST /api/recognize-face` – Face recognition for attendance
- `GET /api/attendance/{date}` – Get attendance for a date
- `GET /api/attendance-sheets` – List all attendance sheets
- `GET /api/attendance-sheets/{date}/download` – Download attendance sheet

## Authentication

- **Frontend**: Sends authentication token in `Authorization` headers.
- **Backend**: Uses JWT for secure API calls.

## Troubleshooting

- **Cannot connect to the backend**: Ensure Flask is running at `http://localhost:5000`.
- **Face recognition not working**: Verify image format and ensure dependencies like OpenCV are installed.

## Contributing

Fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Production run

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```
