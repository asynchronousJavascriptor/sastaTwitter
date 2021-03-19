const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
    caption: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    retweets: {
        type: Number,
        default: 0
    },
    time: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

module.exports = mongoose.model('tweet', tweetSchema);