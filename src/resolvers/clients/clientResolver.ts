import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'

import { ValidationError } from 'apollo-server-express'
import { Resolvers } from '../../types'
import { isAuthenticated, hasRole } from '../middlewares'

const clientResolver: Resolvers = {
  Query: {
    getClient: async (parent, { id }, { models }) => {
      const { ClientModel } = models

      const client = await ClientModel.findById(id).populate('workplaces')

      if (!client) throw new ValidationError('El cliente no existe')

      return client
    },
    getClients: async (parent, args, { models }) => {
      const { ClientModel } = models

      const clients = await ClientModel.find().populate('workplaces')

      return clients
    }
  },
  Mutation: {
    createClient: async (parent, { input }, { models }) => {
      const { ClientModel } = models

      try {
        const client = await ClientModel.create({ ...input })

        return {
          success: true,
          code: 200,
          message: 'Cliente creado con exito!',
          object: client
        }
      } catch (err) {
        throw new ValidationError('Ocurrió un error al crear el cliente')
      }
    },
    updateClient: async (parent, { id, input }, { models }) => {
      const { ClientModel } = models

      try {
        const client = await ClientModel.findByIdAndUpdate(id, input, {
          new: true,
          runValidators: true
        })

        if (!client) {
          throw new ValidationError('El cliente ingresado no existe')
        }

        return {
          success: true,
          code: 200,
          message: 'Cliente actualizado con exito!',
          object: client
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al actualizar el cliente'
        )
      }
    },
    deleteClient: async (parent, { id }, { models }) => {
      const { ClientModel } = models

      try {
        const result = await ClientModel.findByIdAndRemove(id)

        if (!result) {
          throw new ValidationError('El cliente ingresado no existe')
        }

        return {
          success: true,
          code: 200,
          message: 'Cliente eliminado con exito!'
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al eliminar el cliente'
        )
      }
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    getClient: [isAuthenticated(), hasRole('ADMIN')],
    getClients: [isAuthenticated(), hasRole('ADMIN')]
  },
  Mutation: {
    createClient: [isAuthenticated(), hasRole('ADMIN')],
    updateClient: [isAuthenticated(), hasRole('ADMIN')],
    deleteClient: [isAuthenticated(), hasRole('ADMIN')]
  }
}

const composedResolvers = composeResolvers(clientResolver, resolversComposition)

export default composedResolvers
