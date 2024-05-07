const mongoose = require('mongoose')

const spotifySchema = new mongoose.Schema({
    currentSong: {
        type: [String],
        default: ['', '']
    },
    songRequest: {
        type: [String],
        default: ['', '']
    },
    input: {
        type: String,
        default: ''
    },
    searchResults: {
        type: [[String]],
        default: [],
    },
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