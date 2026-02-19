# Student Management System

A comprehensive web-based Student Management System built with the **MERN Stack** (MongoDB, Express, React, Node.js). This application streamlines school administration, including student enrollment, attendance tracking, fee management, and academic reporting.

## 🚀 Features

### 👨‍💼 Admin Portal
-   **Student Management**: Add, update, and manage student profiles.
-   **Course & Batch Management**: Create and organize courses and batches.
-   **Attendance Tracking**: Mark and view daily attendance for batches.
-   **Fee Management**:
    -   **Student Payment Profile**: Dedicated view for individual financial history.
    -   **Razorpay Integration**: Accept online payments securely.
    -   **Receipt Generation**: Print PDF receipts for transactions.
-   **Advanced Theming**: Dynamic system to switch between multiple brand colors (Red, Blue, Green, Purple, etc.).
-   **Dark Mode**: Fully supported across the application.

### 👨‍🎓 Student Portal
-   **Dashboard**: Real-time overview of attendance and fees.
-   **ID Card**: View and **download** a digital ID card (image format).
-   **My Attendance**: Check personal attendance stats.
-   **Fee Status**: View total due and payment history.

## 🛠️ Tech Stack
-   **Frontend**: React (Vite), Tailwind CSS v4, React Router, Axios, Recharts.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB (Mongoose).
-   **Authentication**: JWT (JSON Web Tokens).
-   **Payments**: Razorpay Payment Gateway.
-   **Tools**: html-to-image (ID Card download), React Icons.

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js installed
-   MongoDB (Local or Atlas)
-   Razorpay Account (for payments)

### 1. Clone the Repository
```bash
git clone https://github.com/DiwakerPandey21/Student-management-system-.git
cd Student-management-system-
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the development server:
```bash
npm run dev
```

## 📸 Screenshots
*(Add screenshots of Dashboard, Payment Profile, and ID Card here)*

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License.
