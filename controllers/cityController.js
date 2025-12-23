import City from '../models/City.js';

// Get all cities
export const getAllCities = async (req, res) => {
    try {
        const cities = await City.find().sort({ name: 1 });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cities by state
export const getCitiesByState = async (req, res) => {
    try {
        const { state } = req.params;
        const cities = await City.find({ state: state }).sort({ name: 1 });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new city
export const createCity = async (req, res) => {
    try {
        const { name, state } = req.body;

        // Check if city already exists in this state
        const existingCity = await City.findOne({ name, state });
        if (existingCity) {
            return res.status(400).json({ message: 'City already exists in this state' });
        }

        const city = new City({ name, state });
        const savedCity = await city.save();
        res.status(201).json(savedCity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk create cities from CSV
export const createCitiesBulk = async (req, res) => {
    try {
        const cities = req.body;

        // Validate data
        for (const city of cities) {
            if (!city.name || !city.state) {
                return res.status(400).json({ message: 'Missing required fields in city data' });
            }

            // Check if city already exists in this state
            const existingCity = await City.findOne({ name: city.name, state: city.state });
            if (existingCity) {
                return res.status(400).json({ message: `City ${city.name} already exists in state ${city.state}` });
            }
        }

        const savedCities = await City.insertMany(cities);
        res.status(201).json(savedCities);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};