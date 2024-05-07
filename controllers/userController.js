const User = require('../models/User')
const Conversation = require('../models/Conversation')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({message: 'No users found'})
    }
    res.json(users)
})

const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, roles, active} = req.body
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }
    
    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate) {
        return res.status(409).json({message: 'Username unavailable'})
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = {
        username,
        "password": hashedPassword,
        roles,
        "active": active === false || active === true ? active : false,
    }
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({message: `New user ${username} created`})
    } else {
        res.status(400).json({message: 'Invalid user data'})
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const {sourceId, id, username, roles, password, active} = req.body
    if (!sourceId || !id || !username ||!Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'})
    }

    const sourceUser = await User.findById(sourceId).exec()
    const isAdmin = sourceUser?.roles.includes('Admin')
    const isDemo = sourceUser?.roles.includes('Demo')
    if (!isAdmin || isDemo) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const user = await User.findById(id).exec()
    const targetUserIsAdmin = user?.roles.includes('Admin')

    if (!user) {
        return res.status(404).json({message: 'User not found'})
    }

    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({message: 'Username unavailable'})
    }

    user.username = username
    user.roles = roles

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    if (isAdmin && targetUserIsAdmin) {
        user.active = true
    } else {
        user.active = active === false || active === true ? active : user.active
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated`})
})

const deleteUser = asyncHandler(async (req, res) => {
    const {sourceId, id} = req.body
    if (!sourceId || !id) {
        return res.status(400).json({message: 'User ID is required'})
    }

    const sourceUser = await User.findById(sourceId).exec()
    const isAdmin = sourceUser?.roles.includes('Admin')
    const isDemo = sourceUser?.roles.includes('Demo')
    if (isDemo) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const conversations = await Conversation.find({user: id}).lean().exec()
    if (!isAdmin && conversations) {
        return res.status(400).json({message: 'User has conversations. Delete conversations first'})
    } else if (isAdmin && conversations) {
        await Conversation.deleteMany({user: id}).exec()
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({message: 'User not found'})
    }

    if (!sourceUser?.active) {
        return res.status(403).json({message: 'Forbidden'})
    }

    const result = await user.deleteOne()

    const reply = `User ${user.username} with ID ${user._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}