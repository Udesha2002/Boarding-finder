# Boarding Finder – Online Boarding Accommodation Management System

> A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application engineered to connect university students and outstation tenants with verified private boarding accommodations and landlords.

---

## 📌 Overview

Finding safe, affordable, and conveniently located boarding accommodations is one of the most critical challenges facing university students and outstation tenants. **Boarding Finder** replaces informal notice boards and word-of-mouth searches with a modern, transparent web portal featuring role-based access control (RBAC), multi-criteria search filtering, live room availability management, and an automated booking inquiry workflow.

---

## ✨ Key Features

### 🎓 For Students / Tenants
- **Public Accommodation Browsing**: Explore verified boarding listings with photos, detailed descriptions, rental prices, and location data.
- **Dynamic Multi-Parameter Search & Filtering**:
  - Keyword and location search (regex-based).
  - Price range slider / budget filtering (minimum and maximum price).
  - Gender preference filtering (`Male`, `Female`, `Any`).
  - Amenities checklist filter (WiFi, attached bathroom, parking, meals, air conditioning, study desk, laundry).
- **Direct Contact Information**: View property owner contact numbers directly on listing detail pages.
- **Automated Booking Requests**: Send booking inquiries directly to landlords with real-time status tracking (`pending`, `approved`, `rejected`).
- **Personal Booking Dashboard**: View all submitted bookings and their approval statuses at `/user/bookings`.

### 🏡 For Property Owners
- **Owner Dashboard**: Centralized hub to manage listings and incoming student booking requests.
- **Listing CRUD**: Create, edit, and delete accommodation listings with image upload and amenities selection.
- **Availability Toggle**: Switch accommodation status (`Available` / `Occupied`) with instant UI synchronization.
- **Booking Request Management**: Review, approve, or reject student booking inquiries with automated listing availability updates upon approval.

### 🛡️ Security & Architecture
- **Role-Based Access Control (RBAC)**: Distinguishes between `user` (tenant) and `owner` (landlord) roles.
- **JWT Authentication**: Secure token-based session handling with client-side Axios request interceptors.
- **Password Hashing**: Salted password encryption via `bcryptjs`.
- **Protected Routes**: Frontend navigation guards preventing unauthorized role access.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 8 | Reactive component-based single-page application |
| **Routing** | React Router v7 | Declarative client-side routing with route guards |
| **Styling** | Vanilla CSS Design System | Responsive modern UI with glassmorphism and clean typography |
| **HTTP Client** | Axios | Request & response interceptors with automatic Bearer token injection |
| **Backend** | Node.js, Express.js 5 | RESTful API architecture with centralized error handling |
| **Database** | MongoDB Atlas, Mongoose 9 | Cloud NoSQL document database with compound indexing |
| **Security** | JSON Web Tokens (JWT), bcryptjs | Stateless authorization and cryptographic password hashing |

---

## 📁 Repository Structure

```
Boarding Finder/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler with DNS fallbacks
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   ├── accommodationController.js # CRUD & search filtering logic
│   │   └── bookingController.js  # Booking request lifecycle & approvals
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── roleMiddleware.js     # Role-based authorization middleware
│   ├── models/
│   │   ├── Accommodation.js      # Accommodation schema and indexes
│   │   ├── Booking.js            # Booking schema and indexes
│   │   └── User.js               # User schema with bcrypt hashing
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── accommodationRoutes.js# Accommodation endpoints
│   │   └── bookingRoutes.js      # Booking endpoints
│   ├── .env.example              # Environment variables template
│   ├── complete_verification.js  # End-to-end integration test suite
│   ├── test_availability_and_booking.js # Availability & booking tests
│   ├── package.json
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/                   # Static assets (favicons, SVGs)
│   ├── src/
│   │   ├── assets/               # Application images & icons
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AccommodationCard.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── BookingConfirmModal.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication state
│   │   ├── pages/                # Application views / pages
│   │   │   ├── AccommodationDetails.jsx
│   │   │   ├── AddAccommodation.jsx
│   │   │   ├── EditAccommodation.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── Register.jsx
│   │   │   └── UserHome.jsx
│   │   ├── services/             # Axios API client services
│   │   │   ├── accommodationService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── bookingService.js
│   │   ├── App.jsx               # Application root routes
│   │   ├── index.css             # Design system & responsive styles
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite build configuration
└── .gitignore                    # Excludes secrets, dependencies, and build outputs
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas free cloud cluster)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create your environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure `.env` with your settings:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/boarding-finder
   JWT_SECRET=your_jwt_secret_key_here
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new student (`user`) or property `owner` |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile |

### Accommodations (`/api/accommodations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/accommodations` | Public | List accommodations with search, location, price, gender filters |
| `GET` | `/api/accommodations/:id` | Public | Retrieve full accommodation details |
| `GET` | `/api/accommodations/my` | Owner | List all accommodations created by authenticated owner |
| `POST` | `/api/accommodations` | Owner | Create a new accommodation listing |
| `PUT` | `/api/accommodations/:id` | Owner | Update an accommodation listing |
| `PATCH` | `/api/accommodations/:id/availability` | Owner | Toggle accommodation availability status |
| `DELETE` | `/api/accommodations/:id` | Owner | Delete an accommodation listing |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | User | Submit a booking request for an available accommodation |
| `GET` | `/api/bookings/my` | User | Get all booking requests submitted by the logged-in student |
| `GET` | `/api/bookings/owner` | Owner | Get all booking inquiries for accommodations owned by the user |
| `PUT` | `/api/bookings/:id/approve` | Owner | Approve booking and mark accommodation occupied |
| `PUT` | `/api/bookings/:id/reject` | Owner | Reject a booking request |

---

## 🧪 Testing & Verification

The project includes automated integration verification suites:

```bash
# Run availability and booking lifecycle tests
node backend/test_availability_and_booking.js

# Run full end-to-end restoration verification
node backend/complete_verification.js

# Run frontend production build test
cd frontend && npm run build
```

---

## 📝 License
This project was developed for academic mini-project coursework.
