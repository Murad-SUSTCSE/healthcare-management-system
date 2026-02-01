# Sylhet Health Hub Backend

This is the Express.js backend for the Sylhet Health Hub application.

## Setup Instructions

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    (Already done, but if needed)
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    - Rename or check `.env` file.
    - **IMPORTANT**: Update `DATABASE_URL` in the `.env` file with your actual MySQL credentials.
    ```
    DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/sylhet_health_hub"
    ```
    Replace `USER`, `PASSWORD`, and `sylhet_health_hub` (database name) with your configuration.

4.  **Database Migration:**
    Run this command to create the database tables:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Seed Database:**
    Populate the database with initial hospitals, medicines, and admin user:
    ```bash
    npx prisma db seed
    ```

6.  **Start Server:**
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

## API Endpoints

-   **Auth**: `/api/auth/register`, `/api/auth/login`
-   **Hospitals**: `/api/hospitals`
-   **Appointments**: `/api/appointments`
-   **Medicines**: `/api/medicines`, `/api/orders`
-   **Ambulance**: `/api/ambulance`
