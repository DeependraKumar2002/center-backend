import UserSubmission from '../models/UserSubmission.js';
import { verifyToken } from '../middleware/auth.js';


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

// Get current user's submissions
export const getUserSubmissionByUser = async (req, res) => {
    try {
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json({ message: 'User email not found in token' });
        }

        const submissions = await UserSubmission.find({ submittedBy: userEmail })
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

// Delete a user submission
export const deleteUserSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user?.email;

        if (!userEmail) {
            return res.status(401).json({ message: 'User email not found in token' });
        }

        // Check if user is authorized to delete this submission
        const submission = await UserSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // User can only delete their own submissions
        if (submission.submittedBy !== userEmail) {
            return res.status(403).json({ message: 'Not authorized to delete this submission' });
        }

        await UserSubmission.findByIdAndDelete(id);
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a user submission
export const updateUserSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { centerData } = req.body;
        const userEmail = req.user?.email;

        if (!userEmail) {
            return res.status(401).json({ message: 'User email not found in token' });
        }

        // Check if user is authorized to update this submission
        const submission = await UserSubmission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // User can only update their own submissions
        if (submission.submittedBy !== userEmail) {
            return res.status(403).json({ message: 'Not authorized to update this submission' });
        }

        // Update the submission
        const updatedSubmission = await UserSubmission.findByIdAndUpdate(
            id,
            {
                centerData,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};