const Spotify = require('../models/Spotify')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

const getState = asyncHandler(async (req, res) => {
    state = await Spotify.find().lean().exec()
    if (!state) {
        return res.status(400).json({message: 'Spotify state not found'})
    }

    res.json(state)
})

const createState = asyncHandler(async (req, res) => {
    const {sourceId, songRequest, input, playState, controlPlayState, volume} = req.body
    console.log(req.body)
    if (!sourceId
        || !(songRequest === '' || songRequest.length)
        || !(input === '' || input.length)
        || !(playState === 0 || playState === 1)
        || !(controlPlayState >= -1 && controlPlayState <= 1)
        || !(volume >= 0 && volume <= 100)) {
        return res.status(400).json({message: 'All fields are required'})
    }

    const sourceUser = await User.findById(sourceId).exec()
    const isAdmin = sourceUser?.roles.includes('Admin')
    if (!isAdmin) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const stateObject = {songRequest, input, playState, controlPlayState, volume}
    
    const state = await Spotify.create(stateObject)
    if (state) {
        res.status(201).json({message: `New Spotify state created`})
    } else {
        res.status(400).json({message: 'Invalid Spotify state data'})
    }
})

const updateState = asyncHandler(async (req, res) => {
    const {sourceId, songRequest, input, playState, controlPlayState, volume} = req.body
    if (!sourceId
        || !(songRequest === '' || songRequest.length)
        || !(input === '' || input.length)
        || !(playState === 0 || playState === 1)
        || !(controlPlayState >= -1 && controlPlayState <= 1)
        || !(volume >= 0 && volume <= 100)) {
        return res.status(400).json({message: 'All fields are required'})
    }

    const sourceUser = await User.findById(sourceId).exec()
    const isAdmin = sourceUser?.roles.includes('Admin')
    if (!isAdmin) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const state = await Spotify.findOne().exec()

    if (!state) {
        return res.status(404).json({message: 'Spotify state not found'})
    }

    state.songRequest = songRequest
    state.input = input
    state.playState = playState
    state.controlPlayState = controlPlayState
    state.volume = volume

    const updatedState = await state.save()

    res.json({message: `State updated`})
})

module.exports = {
    getState,
    createState,
    updateState,
}