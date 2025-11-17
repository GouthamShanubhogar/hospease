# PostgreSQL Syntax Conversion Guide

## Controllers That Need Conversion

The following controllers were created with MySQL syntax and need to be converted to PostgreSQL:

1. bedController.js
2. admissionController.js
3. paymentController.js
4. prescriptionController.js
5. labReportController.js

## Conversion Steps

### 1. Replace Array Destructuring
**MySQL:**
```javascript
const [result] = await pool.query(query, params);
const [beds] = await pool.query(query, params);
```

**PostgreSQL:**
```javascript
const result = await pool.query(query, params);
const beds = await pool.query(query, params);
```

### 2. Replace Placeholder Syntax
**MySQL:**
```javascript
const query = 'UPDATE beds SET patient_id = ?, status = ? WHERE id = ?';
await pool.query(query, [patient_id, 'occupied', id]);
```

**PostgreSQL:**
```javascript
const query = 'UPDATE beds SET patient_id = $1, status = $2 WHERE id = $3';
await pool.query(query, [patient_id, 'occupied', id]);
```

### 3. Replace Result Properties
**MySQL:**
```javascript
if (result.affectedRows === 0) {
  return res.status(404).json({ message: 'Not found' });
}
res.json({ id: result.insertId });
```

**PostgreSQL:**
```javascript
if (result.rows.length === 0) {
  return res.status(404).json({ message: 'Not found' });
}
// For INSERT/UPDATE/DELETE, add RETURNING *
res.json({ id: result.rows[0].id });
```

### 4. Add RETURNING Clause
**MySQL:**
```javascript
const query = 'INSERT INTO beds (bed_number, status) VALUES (?, ?)';
const [result] = await pool.query(query, [bed_number, 'available']);
```

**PostgreSQL:**
```javascript
const query = 'INSERT INTO beds (bed_number, status) VALUES ($1, $2) RETURNING *';
const result = await pool.query(query, [bed_number, 'available']);
const newBed = result.rows[0];
```

### 5. Response Data Access
**MySQL:**
```javascript
res.json({ success: true, data: beds });
```

**PostgreSQL:**
```javascript
res.json({ success: true, data: result.rows });
```

## Specific Changes Needed

### bedController.js
Lines to modify:
- Line 36: Change `const [beds] = await pool.query(query, params);` to `const result = await pool.query(query, params);`
- Line 37: Change `res.json({ success: true, data: beds });` to `res.json({ success: true, data: result.rows });`
- Line 49: Change `const [stats] = await pool.query(query);` to `const result = await pool.query(query);`
- Line 50: Change `res.json({ success: true, data: stats });` to `res.json({ success: true, data: result.rows });`
- Line 64: Change `const [result] = await pool.query(query, [patient_id, id]);` to `const result = await pool.query(query, [patient_id, id]);`
- Line 66: Change `if (result.affectedRows === 0)` to `if (result.rows.length === 0)`
- Lines 59-62: Already use `$1, $2` syntax ✓
- Continue this pattern for all functions

### admissionController.js
Similar changes throughout:
- Remove array destructuring from all `pool.query()` calls
- Add `RETURNING *` to all INSERT/UPDATE/DELETE queries
- Change `result.affectedRows` to `result.rows.length`
- Change `result.insertId` to `result.rows[0].id`
- Access data via `result.rows` instead of direct array

### paymentController.js
Same conversion pattern as above.

### prescriptionController.js
Same conversion pattern as above.

### labReportController.js
Same conversion pattern as above.

## Testing After Conversion

1. Start the backend server:
   ```bash
   cd backend
   PORT=5001 node server.js
   ```

2. Test each endpoint with curl or Postman:
   ```bash
   # Get all beds
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/beds
   
   # Create a bed
   curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"bed_number":"101","hospital_id":1,"department_id":1,"ward_type":"general"}' \
        http://localhost:5001/api/beds
   ```

3. Check for errors in server console
4. Verify database records are created/updated correctly

## Quick Find & Replace (Use with Caution)

These regex patterns can help, but manual review is recommended:

1. Find: `const \[([a-zA-Z]+)\] = await pool\.query`
   Replace: `const $1 = await pool.query`

2. Find: `VALUES \((.*?)\)`
   Look for: Any VALUES clause without RETURNING *
   Add: `RETURNING *` after closing parenthesis

3. Find: `result\.affectedRows`
   Replace: `result.rows.length` or `result.rowCount`

4. Find: `result\.insertId`
   Replace: `result.rows[0].id`

## Important Notes

- PostgreSQL uses `$1, $2, $3` for parameterized queries (NOT `?`)
- PostgreSQL returns `result.rows` as an array
- PostgreSQL needs `RETURNING *` to get inserted/updated data
- PostgreSQL doesn't have `affectedRows` or `insertId` properties
- Use `result.rowCount` for number of affected rows
- Use `result.rows[0]` to get the first returned row
