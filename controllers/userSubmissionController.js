import UserSubmission from '../models/UserSubmission.js';
import { verifyToken } from '../middleware/auth.js';
import moment from 'moment';


// Get all user submissions (for admin)
export const getUserSubmissions = async (req, res) => {
    try {
        const submissions = await UserSubmission.find()
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's own submissions
export const getUserOwnSubmissions = async (req, res) => {
    try {
        const userEmail = req.user.email;

        const submissions = await UserSubmission.find({
            submittedBy: userEmail
        })
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get public submissions (without user email for privacy)
export const getPublicSubmissions = async (req, res) => {
    try {
        // Fetch submissions but exclude the submittedBy field for privacy
        const submissions = await UserSubmission.find({}, {
            'centerData': 1,
            'submittedAt': 1,
            'createdAt': 1,
            'updatedAt': 1
        })
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if user has submitted today
export const checkTodaySubmission = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'day');

        const submission = await UserSubmission.findOne({
            submittedBy: userEmail,
            submittedAt: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
            }
        });

        if (submission) {
            res.json({ hasSubmitted: true, submissionId: submission._id });
        } else {
            res.json({ hasSubmitted: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user submission for a specific date
export const getUserSubmissionByDate = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const date = req.params.date;

        // Parse the date string to a Date object
        const startOfDay = moment(date).startOf('day');
        const endOfDay = moment(startOfDay).endOf('day');

        const submission = await UserSubmission.findOne({
            submittedBy: userEmail,
            submittedAt: {
                $gte: startOfDay.toDate(),
                $lte: endOfDay.toDate()
            }
        });

        if (submission) {
            res.json(submission);
        } else {
            res.status(404).json({ message: 'No submission found for this date' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user submission by ID
export const getUserSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        // Verify that the submission belongs to the user
        const submission = await UserSubmission.findOne({
            _id: id,
            submittedBy: userEmail
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found or does not belong to user' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user submission
export const updateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;
        const { centerData } = req.body;

        // Verify that the submission belongs to the user
        const submission = await UserSubmission.findOne({
            _id: id,
            submittedBy: userEmail
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found or does not belong to user' });
        }

        // Get the original submission to preserve media that aren't being updated
        const originalSubmission = await UserSubmission.findById(id);

        // Create updated center data starting with the new data
        const updatedCenterData = { ...centerData };

        // Handle media preservation: if media is provided in the update, handle it properly
        if (centerData.media && originalSubmission.centerData.media) {
            // Start with the original media to preserve categories not being updated
            const mergedMedia = { ...originalSubmission.centerData.media };

            // For each media category provided in the update request:
            // - If the frontend sends a list, replace the category with that list
            // - This list contains both existing media (not removed) and new media (added)
            for (const [category, updatedMediaList] of Object.entries(centerData.media)) {
                if (Array.isArray(updatedMediaList)) {
                    // Replace the category with the complete list sent by frontend
                    mergedMedia[category] = updatedMediaList;
                }
            }

            updatedCenterData.media = mergedMedia;
        } else if (!centerData.media && originalSubmission.centerData.media) {
            // If no media data is provided in the update request but original submission had media,
            // preserve all original media (user only updated text fields)
            updatedCenterData.media = originalSubmission.centerData.media;
        }

        // Update the submission
        const updatedSubmission = await UserSubmission.findOneAndUpdate(
            { _id: id, submittedBy: userEmail },
            {
                centerData: updatedCenterData,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


