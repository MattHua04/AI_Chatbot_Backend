const mongoose = require('mongoose')

const spotifySchema = new mongoose.Schema({
    song: {
        type: String,
        default: ''
    },
    input: {
        type: String,
        default: ''
    },
    searchResults: [{
        type: String,
    }],
    playState: {
        type: Number,
        default: 0
    },
    controlPlayState: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        default: 50
    }
})

module.exports = mongoose.model('Spotify', spotifySchema)