import mongoose, { Schema } from 'mongoose'
import { IClient } from './interfaces'

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido']
  },

  workplaces: [{ type: Schema.Types.ObjectId, ref: 'Workplace' }]
})

export default mongoose.model<IClient>('Client', ClientSchema)
