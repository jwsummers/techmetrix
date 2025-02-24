# TechMetrix

TechMetrix is an efficiency tracking tool designed for automotive technicians. It allows users to log work hours, track performance trends, and optimize workflow using a full-stack web application built with **Next.js, Prisma, PostgreSQL, and NextAuth for authentication**.

---

## 🚀 Features

- **User & Admin Roles**: Users can track their own repair orders, while Admins can manage teams and view overall efficiency metrics.
- **Repair Order Tracking**: Users can add, edit, and delete repair orders, which are stored in a PostgreSQL database.
- **Efficiency Dashboard**: Admins can view team performance through interactive charts.
- **User & Team Management**: Admins can create teams, add/remove members, and track their performance.
- **Demo Logins**: Visitors can log in as a demo user or demo admin to explore the app.

---

## 📦 Tech Stack

### **Frontend**

- **Next.js** (App Router)
- **React & Tailwind CSS** (UI/Styling)

### **Backend**

- **Next.js API Routes** (Server Functions)
- **Prisma ORM** (Database Management)
- **PostgreSQL** (Relational Database)

### **Authentication & Security**

- **NextAuth.js** (Auth Management)
- **Environment Variables (.env)** for secret credentials

---

## Demo Logins

The application provides two demo accounts to explore its functionality without signing up.

| Role       | Username    | Password        |
| ---------- | ----------- | --------------- |
| Demo Admin | `demoadmin` | `adminpassword` |
| Demo User  | `demouser`  | `userpassword`  |

### **How to Use Demo Logins**

1. **On the homepage**, click either **Demo User** or **Demo Admin**.
2. You'll be automatically logged in with preset credentials.
3. Explore the dashboards:
   - **Demo User:** Can track repair orders.
   - **Demo Admin:** Can manage teams and view efficiency metrics.
4. **Demo Admin has limited permissions** (cannot edit users outside the demo scope).

---

## 🚀 Getting Started

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/your-repo/techmetrix.git
cd techmetrix
```

### **2️⃣ Install Dependencies**

```sh
npm install
```

### **3️⃣ Set Up Environment Variables**

Create a `.env.local` file and add the following variables:

```sh
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
DEMO_ADMIN_PASSWORD=adminpassword
DEMO_USER_PASSWORD=userpassword
```

🔹 **Use a PostgreSQL database from Neon, Supabase, or Railway.**

### **4️⃣ Set Up Database & Prisma**

```sh
npx prisma migrate dev --name init
npx prisma db seed  # Seeds demo users & teams
```

### **5️⃣ Run the Development Server**

```sh
npm run dev
```

📌 Open `http://localhost:3000` in your browser.

---

## 🚀 Deployment (Vercel)

### **1️⃣ Install Vercel CLI**

```sh
npm install -g vercel
```

### **2️⃣ Deploy**

```sh
vercel
vercel --prod
```

🔹 **After deployment, add the same `.env` variables in Vercel.**

### **3️⃣ Apply Database Migrations in Production**

```sh
npx prisma migrate deploy
```

---

## 🛠️ API Routes

| Endpoint                    | Method | Description                  |
| --------------------------- | ------ | ---------------------------- |
| `/api/auth/demo`            | POST   | Logs in as a demo user/admin |
| `/api/teams`                | GET    | Fetches all teams            |
| `/api/teams`                | POST   | Creates a new team           |
| `/api/teams/:id`            | DELETE | Deletes a team               |
| `/api/teams/:id/addUser`    | POST   | Adds a user to a team        |
| `/api/teams/:id/removeUser` | POST   | Removes a user from a team   |
| `/api/orders`               | GET    | Fetches all repair orders    |
| `/api/orders`               | POST   | Adds a new repair order      |
| `/api/orders/:id`           | DELETE | Deletes a repair order       |

---

## 💡 Future Enhancements

- ✅ **Real-time updates** using WebSockets
- ✅ **Role-based permissions for Admins**
- ✅ **More advanced analytics & filtering**

---

## 👨‍💻 Author

**TechMetrix** is built by **Jason Summers** and is actively maintained as an open-source project.

📌 **GitHub**: [github.com/your-repo](https://github.com/your-repo)  
📌 **Website**: [techmetrix.com](https://techmetrix.com)

---

### **📜 License**

This project is licensed under the **MIT License**.
