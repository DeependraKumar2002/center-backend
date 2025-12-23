import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    url: String,
    publicId: String,
    type: String, // 'image' or 'video'
    originalName: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        },
        address: String
    },
    address: String
});

const mediaCategorySchema = new mongoose.Schema({
    entry: [mediaSchema],
    passage: [mediaSchema],
    biometricDeskSetup: [mediaSchema],
    biometricDeskCount: [mediaSchema],
    entryToPassage: [mediaSchema]
});

const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
    },
    address: String
});

const userSubmissionSchema = new mongoose.Schema({
    submittedBy: {
        type: String,
        required: true
    },
    centerData: {
        centerCode: String,
        centerName: String,
        state: String,
        city: String,
        location: locationSchema,
        biometricDeskCount: String,
        media: mediaCategorySchema
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('UserSubmission', userSubmissionSchema);