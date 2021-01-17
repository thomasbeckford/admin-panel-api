import mongoose, { Schema } from 'mongoose'
import { IRecord } from './interfaces'

const RecordSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es requerido']
    },
    workplace: {
      type: Schema.Types.ObjectId,
      ref: 'Workplace',
      required: [true, 'El centro de trabajo es requerido']
    },
    entryDate: { type: Date, default: Date.now },
    exitDate: { type: Date }
  },
  { toJSON: { virtuals: true } }
)

export default mongoose.model<IRecord>('Record', RecordSchema)
