# Database Schema and Usage

## Tables

### Users
- `user_id`: UUID primary key
- `name`: TEXT
- `email`: TEXT (unique)
- `password`: TEXT (hashed)
- `phone`: TEXT
- `role`: ENUM ('patient', 'doctor', 'staff', 'admin')

### Hospitals
- `hospital_id`: UUID primary key
- `name`: TEXT
- `address`: TEXT
- `phone`: TEXT
- `email`: TEXT

### Departments
- `department_id`: UUID primary key
- `name`: TEXT
- `description`: TEXT

### Doctors
- `doctor_id`: UUID primary key
- `user_id`: UUID (references users)
- `hospital_id`: UUID (references hospitals)
- `department_id`: UUID (references departments)
- `license_number`: TEXT
- `specialization`: TEXT
- `consultation_fee`: DECIMAL
- `current_token`: INTEGER

### Appointments
- `appointment_id`: UUID primary key
- `patient_id`: UUID (references users)
- `doctor_id`: UUID (references doctors)
- `hospital_id`: UUID (references hospitals)
- `token_number`: INTEGER
- `appointment_date`: DATE
- `preferred_time`: TIME
- `status`: ENUM ('booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')

### Analytics Tables
- patient_visits: Tracks detailed visit history
- queue_analytics: Daily queue performance metrics
- department_analytics: Department-level statistics
- patient_feedback: Patient ratings and comments

## Usage

### Running Migrations
```bash
# Run migrations
node db/migrate.js
```

### Common Queries

1. Get Today's Appointments for Doctor
```sql
SELECT a.*, u.name as patient_name, u.phone
FROM appointments a
JOIN users u ON a.patient_id = u.user_id
WHERE a.doctor_id = $1 AND a.appointment_date = CURRENT_DATE
ORDER BY a.token_number;
```

2. Get Queue Status
```sql
SELECT a.token_number, d.current_token,
       a.token_number - d.current_token as tokens_remaining
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
WHERE a.appointment_id = $1;
```

3. Get Department Performance
```sql
SELECT 
    d.name as department,
    COUNT(a.*) as total_appointments,
    AVG(EXTRACT(EPOCH FROM (a.actual_start_time - a.created_at)))/60 as avg_wait_minutes
FROM appointments a
JOIN doctors doc ON a.doctor_id = doc.doctor_id
JOIN departments d ON doc.department_id = d.department_id
WHERE a.appointment_date = CURRENT_DATE
GROUP BY d.department_id;
```

### Socket.IO Events

- `token_updated`: When doctor's current token changes
- `appointment_created`: When new appointment is booked
- `queue_status`: Regular updates about queue position

## Security

1. Role-Based Access
```javascript
router.put('/doctors/:id/token', 
  authorize(['staff', 'admin']), 
  updateCurrentToken
);
```

2. Resource Ownership
```javascript
router.get('/appointments/:id',
  verifyToken,
  validateOwnership('id'),
  getAppointment
);
```