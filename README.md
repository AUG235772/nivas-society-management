# 🏙️ NIVAS – Society Management System

<div align="center">



<h1>🏙️ NIVAS</h1>

<b>The Modern, Secure & Intelligent Society Management System<br>🌐 Live Demo<br>https://nivas-society-management.vercel.app</b>

<br>

<img src="https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Frontend-Vite%20%2B%20Tailwind-violet?style=for-the-badge&logo=vite" />
<img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs" />
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" />
<a href="https://nivas-society-management.vercel.app">
  <img src="https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel" />
</a>


<br>

<a href="#-key-features">Key Features</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-installation">Installation</a> •
<a href="#-environment-setup">Environment Setup</a> •
<a href="#-author">Author</a>

</div>

---

## 📖 Overview

**NIVAS** is a full-stack web application designed to digitize and automate housing society operations.

It bridges the gap between **residents and administration** using a secure, transparent, and automated platform.

From **automated monthly billing with PDF receipts** to **real-time visitor tracking**, NIVAS delivers a complete society management solution with **role-based access control (RBAC)** for Admins and Residents.

---

## 📸 Screenshots

### 🧭 Professional Dashboard
<img width="1894" height="888" alt="Screenshot 2026-02-08 225148" src="https://github.com/user-attachments/assets/69a06a72-e32c-4dab-a86d-2010039a8b0a" />


### 💳 Secure Payments
<img width="1904" height="956" alt="image" src="https://github.com/user-attachments/assets/09e85280-5a6d-4f26-a69e-13baeb15a7e7" />


### 🚗 Visitor Management
<img width="1623" height="823" alt="image" src="https://github.com/user-attachments/assets/6cb1c4e5-444b-4b3d-91f7-0b0029688e69" />


### 🛠️ Complaint System
<img width="1891" height="728" alt="image" src="https://github.com/user-attachments/assets/9eed97f4-1f69-4b63-9d79-a5297110387b" />


---

## 🌟 Key Features

### 🔐 Authentication & Security
- Role-Based Access (Admin & Resident)
- JWT authentication with encrypted passwords
- Secure protected routes
- Strong input validation

### 💳 Smart Billing & Payments
- Automated monthly billing via cron jobs
- Razorpay payment gateway integration
- Instant **PDF receipts** generation
- Excel export for financial reports

### 🛡️ Visitor & Vehicle Management
- Digital gate pass system
- Real-time entry & exit tracking
- Vehicle directory with parking slots
- Guest pre-approval by residents

### 📢 Communication & Operations
- Notice broadcasting via email
- Complaint system with image uploads
- Expense tracker with charts
- Automated monthly reports

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Lucide Icons
- Rive Animations

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT & Bcrypt
- PDFKit

### Tools & DevOps
- Vercel (Frontend Hosting)
- Render (Backend Hosting)
- Razorpay
- Nodemailer
- Git & GitHub
- Postman

---

## 🚀 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/devparmar02/nivas-society-management.git
cd nivas-project
```
### 2️⃣ Backend Setup
```bash
cd server
npm install
npm run dev
```
### 3️⃣ Frontend Setup
```bash
cd client-vite
npm install
npm run dev
```
### 🔑 Environment Setup
##### Server (/server/.env)
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

CLIENT_URL=http://localhost:5173
```
##### Client (/client-vite/.env)
```bash
VITE_API_URL=http://localhost:5000/api
```
---
### 👤 Author

#### -DEV PARMAR

**Role:** Project Lead & Full Stack Developer
- 💡 **Conceptualization:** Conceived the core idea and architecture of the Nivas system.
- ⚙️ **Backend Engineering:** Built the complete Node.js & Express server architecture.
- 🗄️ **Database Design:** Designed complex MongoDB schemas for Users, Bills, Visitors, and Complaints.
- 🎨 **UI Implementation:** Developed core UI layouts and integrated backend logic with frontend views.


#### -ADITYA GUPTA

**Role:** Frontend Developer & Security Engineer
- 🖥️ **Frontend Development:** Enhanced React components and optimized client-side performance.
- 🔐 **Security Implementation:** Implemented JWT Authentication, Route Protection, and secure data handling.
- 🛡️ **System Hardening:** Worked on input validation and secure API communication.

<br>
