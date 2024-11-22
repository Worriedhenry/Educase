const express = require('express');
const app = express();
const db = require('./connection');
const cors = require('cors');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

require('dotenv').config();


app.get('/', (req, res) => {
    res.send("Api active")
});


// Add School API
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).send({ error: 'All fields are required' });
    }

    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).send({ error: 'Latitude and longitude must be numbers' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Failed to add school' });
        }
        res.status(201).send({ message: 'School added successfully' });
    });
});


app.get('/listSchools', (req, res) => {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    // Validate input
    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).send({ error: 'Parameters latitude and longitude are required and must be provided as numbers' });
    }

    // Fetch and sort schools by distance
    const query = 'SELECT id, name, address, latitude, longitude FROM schools';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Failed to retrieve schools' });
        }

        const schools = results.map((school) => {
            const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
            return { ...school, distance };
        });

        schools.sort((a, b) => a.distance - b.distance);

        res.send(schools);
    });
});


// Delete School API
app.delete('/deleteSchool/:id', (req, res) => {
    const schoolId = parseInt(req.params.id);

    // Validate input
    if (isNaN(schoolId)) {
        return res.status(400).send({ error: 'Invalid school ID' });
    }

    const query = 'DELETE FROM schools WHERE id = ?';
    db.query(query, [schoolId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Failed to delete school' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'School not found' });
        }

        res.send({ message: 'School deleted successfully' });
    });
});


function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


