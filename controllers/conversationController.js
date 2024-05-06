const User = require('../models/User')
const Conversation = require('../models/Conversation')
const asyncHandler = require('express-async-handler')

const getUserConversations = asyncHandler(async (req, res) => {
    const user = req.query.user
    if (!user) {
        return res.status(400).json({message: 'All fields are required'})
    }

    let conversations
    if (user == "all") {
        conversations = await Conversation.find().lean().exec()
    } else {
        conversations = await Conversation.find({user: user}).lean().exec()
    }
    
    if (!conversations?.length) {
        return res.status(400).json({message: 'User has no conversations'})
    }
    res.json(conversations)
})

const createUserConversation = asyncHandler(async (req, res) => {
    const {user, title, content} = req.body
    if (!user || !title) {
        return res.status(400).json({message: 'All fields are required'})
    }
    const owner = await User.findById(user).exec()
    if (!owner?.active) {
        return res.status(403).json({message: 'Forbidden'})
    }
    const duplicate = await Conversation.findOne({title}).lean().exec()
    if (duplicate) {
        return res.status(409).json({message: 'Duplicate conversation'})
    }

    const conversationObject = {
        user,
        title,
        content
    }
    
    const conversation = await Conversation.create(conversationObject)
    if (conversation) {
        res.status(201).json({message: `New conversation ${title} created`, id: conversation._id})
    } else {
        res.status(400).json({message: 'Invalid conversation data'})
    }
})

const updateUserConversation = asyncHandler(async (req, res) => {
    const {id, user, title, content} = req.body
    if (!id || !user || !title || !content) {
        return res.status(400).json({message: 'All fields are required'})
    }

    const conversationUser = await User.findById(user).exec()

    if (!conversationUser) {
        return res.status(404).json({message: 'Conversation user not found'})
    }

    if (!conversationUser?.active) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const conversation = await Conversation.findById(id).exec()

    if (!conversation) {
        return res.status(404).json({message: 'Conversation not found'})
    }

    const duplicate = await Conversation.findOne({title}).lean().exec()
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({message: 'Duplicate conversation'})
    }

    conversation.user = user
    conversation.title = title
    conversation.content = content

    const updatedConversation = await conversation.save()

    res.json({message: `${updatedConversation.title} updated`})
})

const deleteUserConversation = asyncHandler(async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(400).json({message: 'Conversation ID is required'})
    }

    const conversation = await Conversation.findById(id).exec()

    const owner = await User.findById(conversation.user).exec()
    if (!owner?.active) {
        return res.status(403).json({message: 'Forbidden'})
    }

    if (!conversation) {
        return res.status(400).json({message: 'Conversation not found'})
    }

    const result = await conversation.deleteOne()

    const reply = `Conversation ${conversation.title} with ID ${conversation._id} deleted`

    res.json(reply)
})

module.exports = {
    getUserConversations,
    createUserConversation,
    updateUserConversation,
    deleteUserConversation
}