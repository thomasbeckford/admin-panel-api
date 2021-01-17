import mongoose, { Schema } from 'mongoose'
import { hash, genSalt, compare } from 'bcrypt'
import { ValidationError } from 'apollo-server-express'

import { createAccessToken, createRefreshToken } from '../utils'
import { IUser } from './interfaces'

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre del usuario es requerido']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido del usuario es requerido']
  },
  email: {
    type: String,
    required: [true, 'El email del usuario es requerido'],
    unique: true
  },
  username: {
    type: String,
    required: [true, 'El username del usuario es requerido'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña del usuario es requerido']
  },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  active: { type: Boolean, default: false },
  tokenCount: { type: Number, default: 0 }
})

UserSchema.pre('save', async function hashPassword(next) {
  const user = this as IUser

  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await genSalt(10) // Todo: set in config
    user.password = await hash(user.password, salt)
    return next()
  } catch (e) {
    return next(e)
  }
})

UserSchema.path('email').validate(function checkValid(email: string) {
  const emailRegex = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/
  return emailRegex.test(email)
}, 'El email no tiene un formato válido')

UserSchema.methods.authenticate = async function call(password: string) {
  const user = this as IUser

  const check = await compare(password, user.password)
  if (check) {
    const updated = await mongoose
      .model('User')
      .findOneAndUpdate(
        { username: user.username },
        { $inc: { tokenCount: 1 } },
        { new: true }
      )
    return {
      accessToken: createAccessToken(updated),
      refreshToken: createRefreshToken(updated)
    }
  }

  throw new ValidationError('La contraseña ingresa es incorrecta')
}

// Export the model and return your IUser interface
export default mongoose.model<IUser>('User', UserSchema)
