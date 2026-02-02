# Sylhet Health Hub - Healthcare Web Application

A comprehensive healthcare web application built with Next.js and Express.js that allows patients to book appointments, order medicines, request ambulance services, and more.

## 🚀 Features

- **User Dashboard** - View appointments, order history, and manage profile
- **Doctor Dashboard** - Manage appointments, set availability, update profile
- **Admin Panel** - Manage doctors, users, appointments, orders, and ambulance services
- **Appointment Booking** - Book appointments with available doctors
- **Medicine Orders** - Browse and order medicines with cart functionality
- **Ambulance Services** - Request emergency ambulance services
- **Hospital Directory** - View nearby hospitals with details

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **pnpm** package manager
- **Git** - [Download](https://git-scm.com/)

---

## 🛠️ Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/healthcare-web-app.git
cd healthcare-web-app
```

### Step 2: Install Frontend Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Set Up MySQL Database

1. Open MySQL command line or MySQL Workbench
2. Create a new database:

```sql
CREATE DATABASE sylhet_health_hub;
```

### Step 5: Configure Environment Variables

#### Backend Environment (.env)

Create a `.env` file in the `backend` folder:

```bash
cd backend
touch .env
```

Add the following content to `backend/.env`:

```env
# Database Configuration
DATABASE_URL="mysql://YOUR_MYSQL_USERNAME:YOUR_MYSQL_PASSWORD@localhost:3306/sylhet_health_hub"

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=5000
```

**Replace:**
- `YOUR_MYSQL_USERNAME` with your MySQL username (usually `root`)
- `YOUR_MYSQL_PASSWORD` with your MySQL password

**Example:**
```env
DATABASE_URL="mysql://root:mypassword123@localhost:3306/sylhet_health_hub"
JWT_SECRET="healthcare-app-secret-key-2026"
PORT=5000
```

#### Frontend Environment (.env.local)

Create a `.env.local` file in the root folder:

```bash
# In the root folder (healthcare-web-app)
touch .env.local
```

Add the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 6: Run Database Migrations

This creates all the required tables in your database:

```bash
cd backend
npx prisma migrate dev
```

If prompted for a migration name, enter: `init`

### Step 7: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 8: Seed the Database (Optional but Recommended)

This populates the database with sample hospitals, medicines, and creates an admin account:

```bash
cd backend
npx prisma db seed
```

---

## 👤 Creating an Admin Account

### Option A: Using the Seed Script (Recommended)

If you ran the seed command in Step 8, an admin account is already created:

| Field    | Value                    |
|----------|--------------------------|
| Email    | `murad@sylhethealth.com` |
| Password | `Chunu753951`            |

### Option B: Create a Custom Admin Account

Run the following command from the `backend` folder:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('YOUR_PASSWORD', 10);
  await prisma.user.create({
    data: {
      name: 'YOUR_NAME',
      email: 'YOUR_EMAIL@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin created successfully!');
  await prisma.\$disconnect();
}
createAdmin().catch(console.error);
"
```

**Replace:**
- `YOUR_PASSWORD` - Your desired password
- `YOUR_NAME` - Admin name
- `YOUR_EMAIL@example.com` - Admin email

### Option C: Promote Existing User to Admin

If you already have a user account and want to make it an admin:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  await prisma.user.update({
    where: { email: 'existing-user@example.com' },
    data: { role: 'ADMIN' }
  });
  console.log('User promoted to admin!');
  await prisma.\$disconnect();
}
makeAdmin().catch(console.error);
"
```

---

## ▶️ Running the Application

### Terminal 1: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on: `http://localhost:5000`

### Terminal 2: Start the Frontend

```bash
# In the root folder
npm run dev
```

The frontend will run on: `http://localhost:3000`

### Access the Application

Open your browser and navigate to:
- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (login with admin credentials)

---

## 📁 Project Structure

```
healthcare-web-app/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (user)/            # User pages (dashboard, appointments, etc.)
│   ├── admin/             # Admin panel pages
│   └── doctor-dashboard/  # Doctor dashboard
├── backend/               # Express.js backend
│   ├── prisma/           # Prisma schema and migrations
│   │   ├── schema.prisma # Database schema
│   │   ├── seed.js       # Database seed script
│   │   └── migrations/   # Database migrations
│   └── src/
│       ├── controllers/  # Route controllers
│       ├── middlewares/  # Auth middlewares
│       ├── routes/       # API routes
│       └── server.js     # Server entry point
├── components/            # React components
├── contexts/             # React contexts (Auth)
├── services/             # API service
└── types/                # TypeScript types
```

---

## 🔧 Useful Commands

### Database Commands

```bash
# View database in browser (Prisma Studio)
cd backend && npx prisma studio

# Reset database (delete all data and re-migrate)
cd backend && npx prisma migrate reset

# Create new migration after schema changes
cd backend && npx prisma migrate dev --name your_migration_name

# Regenerate Prisma Client
cd backend && npx prisma generate
```

### Development Commands

```bash
# Frontend development
npm run dev

# Frontend build
npm run build

# Backend development
cd backend && npm run dev
```

---

## 🔐 User Roles

| Role   | Access                                          |
|--------|------------------------------------------------|
| USER   | Dashboard, Appointments, Medicine, Ambulance   |
| DOCTOR | Doctor Dashboard, Manage Appointments          |
| ADMIN  | Admin Panel, Manage Doctors/Users/Orders       |

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
- Ensure MySQL is running
- Verify DATABASE_URL in `.env` is correct
- Check if the database exists

**2. Port Already in Use**
- Backend: Change PORT in `backend/.env`
- Frontend: Run `npm run dev -- -p 3001`

**3. Prisma Client Not Generated**
```bash
cd backend && npx prisma generate
```

**4. Migration Issues**
```bash
cd backend && npx prisma migrate reset
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID

### Appointments
- `GET /api/appointments/my` - Get user appointments
- `POST /api/appointments` - Create appointment

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines/orders` - Create order

### Admin
- `GET /api/auth/admin/users` - Get all users
- `DELETE /api/auth/admin/users/:id` - Delete user
- `POST /api/doctor/admin/create` - Create doctor account

---

## 📄 License

This project is for educational purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
