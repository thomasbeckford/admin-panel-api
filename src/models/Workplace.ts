import mongoose, { Schema } from 'mongoose'
import { IWorkplace } from './interfaces'

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

const WorkplaceSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [3, 'El nombre es inválido']
  },
  location: {
    type: pointSchema,
    required: [true, 'La ubicación es requerida'],
    index: '2dsphere'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'El cliente es requerido']
  }
})

export default mongoose.model<IWorkplace>('Workplace', WorkplaceSchema)
