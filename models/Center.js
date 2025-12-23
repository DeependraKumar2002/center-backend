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

const centerSchema = new mongoose.Schema({
    centerCode: {
        type: String,
        required: true,
        unique: true
    },
    centerName: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    submittedBy: {
        type: String,
        required: true
    },
    location: locationSchema,
    biometricDeskCount: String,
    media: mediaCategorySchema
}, {
    timestamps: true
});

export default mongoose.model('Center', centerSchema);