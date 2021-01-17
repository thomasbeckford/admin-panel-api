import mongoose, { Schema } from 'mongoose'
import { ILoan } from './interfaces'

const LoanSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El producto es requerido']
  },
  requestDate: { type: Date, default: Date.now },
  devolutionDate: { type: Date }
})

export default mongoose.model<ILoan>('Loan', LoanSchema)
