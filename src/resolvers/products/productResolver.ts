import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'
import { ValidationError } from 'apollo-server-express'

import { Resolvers } from '../../types'
import { isAuthenticated, hasRole } from '../middlewares'

const productResolver: Resolvers = {
  Query: {
    getProduct: async (parent, { id }, { models }) => {
      const { ProductModel, LoanModel } = models
      const product = await ProductModel.findById(id)

      if (!product) throw new ValidationError('El producto ingresado no existe')

      const devolution = await LoanModel.findOne({
        product: product.id,
        devolutionDate: null
      })

      return {
        ...product.toJSON(),
        devolution
      }
    },
    getProducts: async (parent, args, { models }) => {
      const { ProductModel } = models
      const products = await ProductModel.find()

      return products
    }
  },
  Mutation: {
    createProduct: async (parent, { input }, { models }) => {
      const { ProductModel } = models

      try {
        const newProduct = await ProductModel.create({
          ...input
        })

        return {
          success: true,
          code: 200,
          message: 'Producto creado con exito!',
          object: newProduct
        }
      } catch (err) {
        throw new ValidationError('Ocurrió un error al crear el producto')
      }
    },
    updateProduct: async (parent, { id, input }, { models }) => {
      const { ProductModel } = models

      try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, input, {
          new: true,
          runValidators: true
        })

        if (!updatedProduct) {
          throw new ValidationError('El producto ingresado no existe')
        }

        return {
          success: true,
          code: 200,
          message: 'Producto actualizado con exito!',
          object: updatedProduct
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al actualizar el producto'
        )
      }
    },
    deleteProduct: async (parent, { id }, { models }) => {
      const { ProductModel } = models

      try {
        const result = await ProductModel.findByIdAndRemove(id)

        if (!result) {
          throw new ValidationError('El producto ingresado no existe')
        }

        return {
          success: true,
          code: 200,
          message: 'Producto eliminado con exito!'
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al eliminar el producto'
        )
      }
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    getProduct: [isAuthenticated()],
    getProducts: [isAuthenticated(), hasRole('ADMIN')]
  },
  Mutation: {
    createProduct: [isAuthenticated(), hasRole('ADMIN')],
    updateProduct: [isAuthenticated(), hasRole('ADMIN')],
    deleteProduct: [isAuthenticated(), hasRole('ADMIN')]
  }
}

const composedResolvers = composeResolvers(
  productResolver,
  resolversComposition
)

export default composedResolvers
