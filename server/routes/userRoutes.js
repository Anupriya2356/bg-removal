import express from 'express'
import { clerkWebhooks } from '../controllers/userController.js'

const userRouter =express.Router()

userRouter.post('/webhooks',clerkWebhooks)

export default userRouter  //export the router to use in other files