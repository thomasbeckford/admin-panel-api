import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'

import { UserInputError, ValidationError } from 'apollo-server-express'
import { Resolvers } from '../../types'
import { isAuthenticated, hasRole } from '../middlewares'

const workplaceResolver: Resolvers = {
  Query: {
    getWorkplaces: async (parent, args, { models }) => {
      const { WorkplaceModel } = models

      const workplaces = await WorkplaceModel.find().populate('client')

      return workplaces
    },
    getWorkplacesByLocation: async (
      parent,
      { location: { coordinates, distance } },
      { models }
    ) => {
      // add a middleware for this
      if (coordinates.length !== 2)
        throw new UserInputError('Las coordenadas ingresadas con invalidas')

      const { WorkplaceModel } = models

      try {
        const workplaces = await WorkplaceModel.find({
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates
              },
              $maxDistance: distance
            }
          }
        })
        return workplaces
      } catch (err) {
        throw new Error('Ocurrió un error al buscar los centros de trabajo')
      }
    }
  },
  Mutation: {
    createWorkplace: async (
      parent,
      { input: { name, client, coordinates } },
      { models }
    ) => {
      // add a middleware for this
      if (coordinates.length !== 2)
        throw new UserInputError('Las coordenadas ingresadas con invalidas')

      const { WorkplaceModel, ClientModel } = models

      const clientFound = await ClientModel.findById(client)

      if (!clientFound)
        throw new ValidationError('El cliente ingresado no existe')

      const location = { type: 'Point', coordinates }

      const workplace = await WorkplaceModel.create({
        name,
        location,
        client
      })

      // eslint-disable-next-line no-underscore-dangle
      await clientFound.update({ $push: { workplaces: workplace._id } })

      const workplacePopulated = await workplace
        .populate('client')
        .execPopulate()

      return {
        success: true,
        code: 200,
        message: 'User created',
        workplace: workplacePopulated
      }
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    getWorkplaces: [isAuthenticated(), hasRole('ADMIN')],
    getWorkplacesByLocation: [isAuthenticated()]
  },
  Mutation: {
    createWorkplace: [isAuthenticated(), hasRole('ADMIN')]
  }
}

const composedResolvers = composeResolvers(
  workplaceResolver,
  resolversComposition
)

export default composedResolvers
