import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    emoji: {
        type: String,
        required: true
    }
}, { _id: false });

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String
        },
        image: {
            type: String
        },
        reactions: [reactionSchema]
    }, 
    { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);