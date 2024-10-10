const express = require("express")
const router = express.Router()
const db = require('../database')

router.get('/logs', (req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate).toISOString() : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate).toISOString() : null;

    let query = 'SELECT * FROM logs WHERE 1=1';
    const queryParams = [];

    // Add time filtering if dates are provided
    if (startDate) {
        query += ' AND timestamp >= ?';
        queryParams.push(startDate);
    }
    if (endDate) {
        query += ' AND timestamp <= ?';
        queryParams.push(endDate);
    }

    // Pagination
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
})

router.get('/logs/:id', (req, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate).toISOString() : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate).toISOString() : null;

    let query = 'SELECT * FROM logs WHERE user_id = ?';
    const queryParams = [userId];

    // Add time filtering if dates are provided
    if (startDate) {
        query += ' AND timestamp >= ?';
        queryParams.push(startDate);
    }
    if (endDate) {
        query += ' AND timestamp <= ?';
        queryParams.push(endDate);
    }

    // Pagination
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, (page - 1) * limit);

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router