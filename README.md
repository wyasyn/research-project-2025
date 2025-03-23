# Face Recognition Attendance System - Frontend

This is the frontend of the Face Recognition Attendance System built using **Next.js**. It allows users to register, track, and view their attendance using face recognition integrated with a backend system.

## Features

- **User Registration**: Admins can register users with their name, email, and unique user ID (employee/student ID).
- **Face Recognition**: Users can upload or take a photo for face recognition.
- **Attendance Tracking**: Attendance is automatically recorded once per day via face recognition.
- **Attendance Sheet**: Admins can view and download attendance sheets for each day as Excel files.
- **Attendance Performance**: Logged-in users can view their attendance performance and details for a selected period.
- **User Dashboard**: Displays the list of present users for the selected day.

## Tech Stack

- **Frontend**: Next.js, React
- **Styling**: TailwindCSS
- **API Communication**: Fetch for making requests to the backend
- **Authentication**: JWT and cookie-based authentication

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (optional but recommended)

### Steps to Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/wyasyn/research-project-frontend.git
   cd research-project-frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000 # URL to your backend API
   NEXT_PUBLIC_FACE_RECOGNITION_API=http://localhost:5000/recognize # URL to your face recognition endpoint
   ```

   Replace `http://localhost:5000` with the actual URL of your backend.

4. Run the development server:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

## Pages and Components

### `/pages/index.js`

- The homepage where users can log in or sign up.

### `/pages/register.js`

- A page where admins can register new users.

### `/pages/attendance.js`

- A page that displays the attendance sheet for a selected day and allows users to view their attendance history.

### `/pages/dashboard.js`

- A page where logged-in users can see their attendance performance.

### `/pages/face-recognition.js`

- A page where users can upload or take a photo for face recognition. This will trigger the backend API to process the image and record attendance.

## API Integration

The frontend communicates with the backend using the following endpoints:

- **User Registration**: `POST /api/register`
- **Face Recognition**: `POST /api/recognize-face`
- **Get Attendance**: `GET /api/attendance/{date}`
- **Get All Attendance Sheets**: `GET /api/attendance-sheets`
- **Download Attendance Sheet**: `GET /api/attendance-sheets/{date}/download`

Refer to the backend documentation for more details on each API endpoint.

## Authentication

Ensure that the backend is set up with the proper authentication (JWT, session cookies) to protect routes that require a logged-in user. The frontend sends the authentication token (if applicable) in the `Authorization` header with each request.

## Troubleshooting

- **Cannot connect to the backend**: Ensure your backend is running and accessible at the URL specified in the `.env.local` file.
- **Face recognition not working**: Check if the correct image is being sent to the backend. Ensure that the backend is set up to process the image properly.

## Contributing

Feel free to fork the repository and create a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
