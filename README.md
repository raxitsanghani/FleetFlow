# 🚛 FleetFlow

**Enterprise-Grade SaaS Fleet Management System**

FleetFlow is a comprehensive, scalable solution designed to digitize manual logbooks, optimize fleet lifecycles, and monitor driver performance. Built with a modern tech stack, it provides real-time insights into vehicle status, maintenance needs, fuel consumption, and operational costs.

---

## 🚀 Key Features

- **📊 Intelligent Dashboard**: Real-time analytics and KPI tracking for fleet performance.
- **🚚 Vehicle Management**: Comprehensive tracking of vehicle status (Available, On Trip, In Shop, Retired) and capacity.
- **👨‍✈️ Driver Workforce**: Manage qualified personnel, track safety scores, and monitor license compliance.
- **🗺️ Trip Logging**: Digitized trip management with cargo validation and automated fuel log association.
- **🛠️ Maintenance Scheduler**: Automated service reminders and intelligent vehicle status locking during shop visits.
- **⛽ Fuel Monitoring**: Precise tracking of fuel consumption, costs, and efficiency metrics.
- **🔐 Secure RBAC**: Role-based access control (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [React Query](https://tanstack.com/query/latest) & Context API
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/introduction/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Security**: [JWT](https://jwt.io/), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js/), [Helmet](https://helmetjs.github.io/)
- **Logging**: [Morgan](https://github.com/expressjs/morgan)

---

## 📥 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/raxitsanghani/FleetFlow.git
cd FleetFlow
```

### 2. Backend Configuration
```bash
cd fleet-flow-backend
npm install
```
Create a `.env` file in the `fleet-flow-backend` root:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 3. Frontend Configuration
```bash
cd ../fleet-flow-frontend
npm install
```
Create a `.env` file in the `fleet-flow-frontend` root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application
**Backend:**
```bash
cd fleet-flow-backend
npm run dev
```
**Frontend:**
```bash
cd fleet-flow-frontend
npm run dev
```

---

## 📂 Project Architecture

```text
FleetFlow/
├── fleet-flow-backend/   # Node.js + Express + Mongoose
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Mongoose Schemas
│   │   ├── routes/       # API Endpoints
│   │   └── index.js      # Server entry point
├── fleet-flow-frontend/  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application views
│   │   ├── context/      # Authentication & Global State
│   │   └── api/          # Axios configuration
└── README.md
```

---

## 📄 License
This project is licensed under the ISC License.

---
*Built with ❤️ by the FleetFlow Team*
