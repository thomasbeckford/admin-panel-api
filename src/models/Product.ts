import mongoose, { Schema } from 'mongoose'
import { IProduct } from './interfaces'

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      unique: [true, 'Un producto con este nombre ya existe'],
      required: [true, 'El nombre es requerido'],
      minlength: [3, 'El nombre es inválido']
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      minlength: [
        20,
        'La descripcion tiene que tener como mínimo 20 carácteres'
      ],
      maxlength: [
        600,
        'La descripcion tiene que tener como máximo 600 carácteres'
      ]
    },
    loans: [{ type: Schema.Types.ObjectId, ref: 'Loan' }]
  },
  { toJSON: { virtuals: true } }
)

export default mongoose.model<IProduct>('Product', ProductSchema)
