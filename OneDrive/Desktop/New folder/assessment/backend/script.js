require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const PORT = process.env.PORT || 8000;

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER ,
    host: process.env.DB_HOST ,
    database: process.env.DB_NAME ,
    password: process.env.DB_PASSWORD ,
    port: process.env.DB_PORT ,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Error connecting to database:", err.stack);
    } else {
        console.log("✅ Database connected successfully");
        release();
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes

// GET all employees
app.get("/api/employee", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, 
                first_name AS "firstName", 
                last_name AS "lastName", 
                email, 
                contact_number AS "contactNumber", 
                salary, 
                address, 
                to_char(dob, 'YYYY-MM-DD') AS dob,
                age, 
                image_url AS "imageUrl",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM employees 
             ORDER BY id`
        );
        console.log(`✅ Fetched ${result.rows.length} employees`);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching employees:", error);
        res.status(500).json({ error: "Error fetching employees" });
    }
});

// GET single employee by ID
app.get("/api/employee/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT 
                id, 
                first_name AS "firstName", 
                last_name AS "lastName", 
                email, 
                contact_number AS "contactNumber", 
                salary, 
                address, 
                to_char(dob, 'YYYY-MM-DD') AS dob,
                age, 
                image_url AS "imageUrl",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM employees 
             WHERE id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        console.log(`✅ Fetched employee ID: ${id}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching employee:", error);
        res.status(500).json({ error: "Error fetching employee" });
    }
});

// POST - Create new employee
app.post("/api/employee", async (req, res) => {
    try {
        const { firstName, lastName, email, contactNumber, salary, address, dob, age, imageUrl } = req.body;
        
        console.log("Creating employee:", { firstName, lastName, email });
        
        const result = await pool.query(
            `INSERT INTO employees 
                (first_name, last_name, email, contact_number, salary, address, dob, age, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING 
                id, 
                first_name AS "firstName", 
                last_name AS "lastName", 
                email, 
                contact_number AS "contactNumber", 
                salary, 
                address, 
                to_char(dob, 'YYYY-MM-DD') AS dob,
                age, 
                image_url AS "imageUrl"`,
            [firstName, lastName, email, contactNumber, salary, address, dob, age, imageUrl || null]
        );
        
        console.log(` Created employee ID: ${result.rows[0].id}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating employee:", error);
        if (error.code === '23505') { // Unique violation (duplicate email)
            res.status(400).json({ error: "Email already exists" });
        } else if (error.code === '23502') { // Not null violation
            res.status(400).json({ error: "Missing required fields" });
        } else {
            res.status(500).json({ error: "Error creating employee" });
        }
    }
});

// PATCH - Update employee

app.patch("/api/employee/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, contactNumber, salary, address, dob, age, imageUrl } = req.body;
        
        console.log(`📝 Updating employee ID: ${id}`);
        
        // Check if employee exists
        const checkResult = await pool.query("SELECT id FROM employees WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        const result = await pool.query(
            `UPDATE employees 
             SET 
                first_name = $1, 
                last_name = $2, 
                email = $3, 
                contact_number = $4, 
                salary = $5, 
                address = $6, 
                dob = $7, 
                age = $8, 
                image_url = $9,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 
             RETURNING 
                id, 
                first_name AS "firstName", 
                last_name AS "lastName", 
                email, 
                contact_number AS "contactNumber", 
                salary, 
                address, 
                to_char(dob, 'YYYY-MM-DD') AS dob,
                age, 
                image_url AS "imageUrl"`,
            [firstName, lastName, email, contactNumber, salary, address, dob, age, imageUrl, id]
        );
        
        console.log(`Updated employee ID: ${id}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating employee:", error);
        if (error.code === '23505') {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Error updating employee" });
        }
    }
});

// DELETE - Delete employee
app.delete("/api/employee/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️  Deleting employee ID: ${id}`);
        
        const result = await pool.query(
            `DELETE FROM employees 
             WHERE id = $1 
             RETURNING 
                id, 
                first_name AS "firstName", 
                last_name AS "lastName"`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        console.log(`✅ Deleted employee ID: ${id}`);
        res.json({
            message: "Employee deleted successfully",
            deleted: result.rows[0]
        });
    } catch (error) {
        console.error("❌ Error deleting employee:", error);
        res.status(500).json({ error: "Error deleting employee" });
    }
});

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "healthy", database: "connected" });
    } catch (error) {
        res.status(503).json({ status: "unhealthy", database: "disconnected" });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
    console.log(`Database: ${pool.options.database}@${pool.options.host}:${pool.options.port}`);
});