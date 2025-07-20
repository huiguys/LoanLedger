# LoanLedgerOf course. Here is a professional and well-structured `README.md` file for your LoanLedger project. You can copy and paste this directly into a new file named `README.md` in the root of your project folder.

-----

# LoanLedger 💸

LoanLedger is a modern, full-stack web application designed to help you effortlessly track loans and payments. Built with a powerful backend and a responsive user interface, it provides a secure and intuitive way to manage personal and small-scale lending.

-----

## ✨ Key Features

  * **Secure User Authentication**: Complete registration and login system with mobile number and OTP verification.
  * **Comprehensive Loan Tracking**: Add, view, and manage loans you've given or taken.
  * **Detailed Payment Management**: Record principal and interest payments for each loan with multiple payment methods.
  * **Person-Centric View**: See a complete financial summary and loan history for each person you transact with.
  * **Settlement Feature**: Mark loans as fully paid and "closed" once the balance is cleared.
  * **Clean & Responsive UI**: A modern user interface built with React and Tailwind CSS that works on any device.

-----

## 🛠️ Tech Stack

This project is built with a modern and robust technology stack:

| **Area** | **Technology** |
| ----------- | ---------------------- |
| **Frontend**| React, Vite, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database**| Better-sqlite3         |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Tooling** | Git, Nodemon, Postman  |

-----

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### **Prerequisites**

  * [Node.js](https://nodejs.org/en/) (v16 or later recommended)
  * [Git](https://git-scm.com/)

### **Installation & Setup**

1.  **Clone the repository** to your local machine:

    ```sh
    git clone https://github.com/huiguys/LoanLedger.git
    cd LoanLedger
    ```

2.  **Set up the Backend Server**:

    ```sh
    cd server
    npm install
    ```

    Create a `.env` file in the `server` directory and add your JWT secret:

    ```
    JWT_SECRET=your-super-secret-key-that-is-long-and-random
    ```

3.  **Set up the Frontend Application**:
    Navigate back to the root directory and then install the frontend dependencies.

    ```sh
    cd ..
    npm install
    ```

### **Running the Application**

You need to have **two terminals** open to run both the frontend and backend servers simultaneously.

1.  **Start the Backend Server**:
    In your first terminal, from the `server` directory:

    ```sh
    npm run dev
    ```

    The server will start on `http://localhost:3001`.

2.  **Start the Frontend Application**:
    In your second terminal, from the project's root directory:

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

-----

## 📖 How to Use

1.  **Open the application** in your browser at `http://localhost:5173`.
2.  **Register a new account**:
      * Click "Create New Account".
      * Enter your 10-digit mobile number and click "Send OTP".
      * Check your backend server's terminal for the 6-digit OTP.
      * Enter the OTP and set a secure password to complete registration.
3.  **Login** with your newly created credentials.
4.  Start adding people and tracking your loans\!

-----

## 🖼️ Screenshots

*(You can add screenshots of your application here to give a visual overview.)*

| Dashboard                               | Person Profile                          |
| --------------------------------------- | --------------------------------------- |
| |   |

-----

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.