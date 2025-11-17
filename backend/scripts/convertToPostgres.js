import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllersToConvert = [
  'bedController.js',
  'admissionController.js',
  'paymentController.js',
  'prescriptionController.js',
  'labReportController.js'
];

function convertMySQLtoPostgreSQL(content) {
  let converted = content;
  
  // Replace const [result] = await pool.query() with const result = await pool.query()
  converted = converted.replace(/const \[([^\]]+)\] = await pool\.query\(/g, 'const $1 = await pool.query(');
  
  // Replace ? placeholders with $1, $2, etc in queries
  // This is more complex as we need to track parameter positions
  const lines = converted.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if line contains a query string with ?
    if (line.includes('?') && (line.includes('query') || line.includes('pool.query') || line.includes('INSERT') || line.includes('UPDATE') || line.includes('SELECT') || line.includes('DELETE'))) {
      let paramCount = 1;
      let inString = false;
      let stringChar = null;
      let newLine = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        // Track if we're inside a string
        if ((char === '"' || char === "'" || char === '`') && (j === 0 || line[j-1] !== '\\')) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = null;
          }
        }
        
        // Replace ? with $n if inside a string
        if (char === '?' && inString) {
          newLine += `$${paramCount}`;
          paramCount++;
        } else {
          newLine += char;
        }
      }
      
      line = newLine;
    }
    
    newLines.push(line);
  }
  
  converted = newLines.join('\n');
  
  // Replace result.affectedRows with result.rowCount
  converted = converted.replace(/result\.affectedRows/g, 'result.rowCount');
  
  // Replace result.insertId with result.rows[0].id (for INSERT with RETURNING)
  converted = converted.replace(/result\.insertId/g, 'result.rows[0].id');
  
  // Replace .length === 0 checks with .rows.length === 0
  converted = converted.replace(/([a-zA-Z_]+)\.length === 0/g, (match, varName) => {
    // Don't replace if it's already .rows
    if (varName !== 'rows') {
      return `${varName}.rows.length === 0`;
    }
    return match;
  });
  
  // Replace array[0] access with result.rows[0]
  converted = converted.replace(/([a-zA-Z_]+)\[0\]/g, (match, varName) => {
    if (varName !== 'rows' && varName !== 'params' && varName !== 'result') {
      return `${varName}.rows[0]`;
    }
    return match;
  });
  
  // Fix VALUES clauses to add RETURNING id
  converted = converted.replace(/VALUES \([^)]+\)(?!\s*RETURNING)/gi, (match) => {
    return `${match}\n      RETURNING id`;
  });
  
  // Replace double quotes in SET statements with single quotes
  converted = converted.replace(/"(available|occupied|active|discharged|completed|pending|paid)"/g, "'$1'");
  
  // Add .rows to query results
  converted = converted.replace(/res\.json\(\{ success: true, data: ([a-zA-Z_]+) \}\)/g, 'res.json({ success: true, data: $1.rows })');
  
  return converted;
}

const controllersDir = path.join(__dirname, '..', 'controllers');

controllersToConvert.forEach(filename => {
  const filePath = path.join(controllersDir, filename);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const converted = convertMySQLtoPostgreSQL(content);
    
    // Create backup
    fs.writeFileSync(filePath + '.backup', content);
    
    // Write converted content
    fs.writeFileSync(filePath, converted);
    
    console.log(`✅ Converted ${filename}`);
  } catch (error) {
    console.error(`❌ Error converting ${filename}:`, error.message);
  }
});

console.log('\n✅ Conversion complete! Backup files created with .backup extension');
