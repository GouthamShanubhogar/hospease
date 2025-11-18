# HospEase - Smart Hospital Queue Management System

A comprehensive hospital management system with patient registration, appointment booking, and queue management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd hospease
   npm run setup
   ```

2. **Database setup:**
   - Create PostgreSQL database named `hospease_db`
   - Update `.env` in backend directory with your database credentials

3. **Start the application:**
   ```bash
   # Start both backend and frontend
   npm start

   # Or start individually:
   npm run backend    # Backend only
   npm run frontend   # Frontend only
   ```

## 🛠️ Server Management

### Quick Commands

```bash
# Start backend server
./start-backend.sh start     # Linux/Mac
start-backend.bat           # Windows

# Check server status
./start-backend.sh status

# View logs
./start-backend.sh logs

# Stop server
./start-backend.sh stop

# Restart server
./start-backend.sh restart
```

### NPM Scripts

```bash
npm run backend           # Start backend
npm run frontend         # Start frontend  
npm run backend:status   # Check backend status
npm run backend:stop     # Stop backend
npm run backend:restart  # Restart backend
npm run health          # Check both servers
```

## 🏥 Features

- **Patient Management**: Registration, profiles, medical history
- **Appointment System**: Booking, scheduling, queue management
- **Doctor Dashboard**: Appointment management, patient records
- **Real-time Updates**: Socket.io for live notifications
- **Authentication**: JWT-based secure login system
- **Database**: PostgreSQL with patient profiles and medical records

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health
- **API Status**: http://localhost:5001/api/status

## 🔧 Troubleshooting

### Backend Connection Issues

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Start backend if not running:**
   ```bash
   ./start-backend.sh start
   ```

3. **Check logs for errors:**
   ```bash
   ./start-backend.sh logs
   ```

4. **Common issues:**
   - Port 5001 already in use: `./start-backend.sh restart`
   - Database connection failed: Check PostgreSQL service and credentials
   - Module not found: Run `cd backend && npm install`

### Frontend Issues

1. **Frontend not loading:**
   ```bash
   cd frontend && npm start
   ```

2. **Build issues:**
   ```bash
   cd frontend && npm install && npm start
   ```

## 📁 Project Structure

```
hospease/
├── backend/           # Node.js Express server
│   ├── controllers/   # API controllers
│   ├── routes/       # API routes
│   ├── db/           # Database migrations & schema
│   ├── middleware/   # Authentication middleware
│   └── server.js     # Main server file
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   └── services/   # API services
└── docs/            # Documentation
```

## 🔑 Environment Variables

Create `.env` in backend directory:

```env
PORT=5001
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=hospease_db
PG_PORT=5432
JWT_SECRET=your_jwt_secret
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Connection Retry**: Automatic retry for failed API requests
- **User-friendly Messages**: Clear error messages for users
- **Health Monitoring**: Built-in health checks and monitoring
- **Graceful Fallbacks**: Fallback UI for connection issues

## 📈 Development

### Running in Development Mode

```bash
npm run dev
```

This starts both frontend and backend with hot reload enabled.

### Database Migrations

```bash
cd backend
node db/migrate.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
