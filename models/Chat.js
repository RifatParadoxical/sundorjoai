const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    contextSummary: {
        type: String,
        default: ''
    }
});






chatSchema.pre('save', function () {
    this.updatedAt = Date.now();
});




chatSchema.methods.addMessage = function (role, content, imageUrl = null) {
    this.messages.push({
        role,
        content,
        imageUrl,
        timestamp: new Date()
    });
    return this.save();
};

chatSchema.methods.getConversationHistory = function () {
    return this.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.imageUrl && { image: msg.imageUrl })
    }));
};

module.exports = mongoose.model('Chat', chatSchema);

