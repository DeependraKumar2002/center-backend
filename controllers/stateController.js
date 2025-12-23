import State from '../models/State.js';

// Get all states
export const getAllStates = async (req, res) => {
    try {
        const states = await State.find().sort({ name: 1 });
        res.json(states);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new state
export const createState = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if state already exists
        const existingState = await State.findOne({ name });
        if (existingState) {
            return res.status(400).json({ message: 'State already exists' });
        }

        const state = new State({ name });
        const savedState = await state.save();
        res.status(201).json(savedState);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk create states from CSV
export const createStatesBulk = async (req, res) => {
    try {
        const states = req.body;

        // Validate data
        for (const state of states) {
            if (!state.name) {
                return res.status(400).json({ message: 'Missing required fields in state data' });
            }

            // Check if state already exists
            const existingState = await State.findOne({ name: state.name });
            if (existingState) {
                return res.status(400).json({ message: `State ${state.name} already exists` });
            }
        }

        const savedStates = await State.insertMany(states);
        res.status(201).json(savedStates);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};