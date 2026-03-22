# StudySwap

StudySwap is a full-stack e-commerce marketplace platform built for college students to easily buy and sell digital and physical study materials locally.

## Features

- **Role-Based Authentication**: Secure login flow utilizing JWT.
- **Local-First Methodology**: Physical items are restricted to local transactions, bypassing complex logistics.
- **Digital Content Delivery**: Secure digital checkout flow.
- **Modern Responsive UI**: Built with React, Tailwind CSS v4, and Lucide React.
- **Admin & Seller Dashboards**.

## Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas URI)

## Setup Guide

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish your environment variables. Ensure `.env` contains:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/studyswap
   JWT_SECRET=super_secret_jwt_key_demo
   ```
4. Start the server:
   ```bash
   npm start
   # or node server.js
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will be accessible at `http://localhost:5173`. 

---

### Tech Stack
* **Frontend**: React.js, Tailwind CSS (v4), Vite
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
"# notes" 
