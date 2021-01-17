import { ValidationError } from 'apollo-server-express'
import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'

import extend from 'lodash/extend'

import { Resolvers } from '../../types'
import { isAuthenticated, hasRole } from '../middlewares'

const userResolver: Resolvers = {
  UserRole: {
    ADMIN: 'admin',
    EMPLOYEE: 'employee'
  },
  UserState: {
    ACTIVE: true,
    INACTIVE: false,
    ALL: 'all'
  },

  Query: {
    me: async (parent, args, { models, user }) => {
      const { UserModel } = models

      const me = await UserModel.findById(user?.id)
      return me
    },
    getUser: async (parent, { id }, { models }) => {
      const { UserModel } = models

      const user = await UserModel.findById(id)
      if (!user) throw new ValidationError('El usuario ingresado no existe')

      return user
    },
    getUsers: async (parent, { state, role }, { models }) => {
      const { UserModel } = models

      const options: any = { role }

      if (state !== 'all') options.active = state

      const users = await UserModel.find(options)

      return users
    }
  },
  Mutation: {
    signIn: async (
      parent,
      { input: { username, password, role } },
      { models }
    ) => {
      const { UserModel } = models

      const user = await UserModel.findOne({ username, role, active: true })
      if (!user) throw new ValidationError('El usuario ingresado no existe')

      const login = await user.authenticate(password)

      return { ...login, user }
    },
    createUser: async (parent, { user: userInput }, { models }) => {
      const { UserModel } = models

      try {
        const newUser = await UserModel.create({
          ...userInput
        })
        return {
          success: true,
          code: 200,
          message: 'Usuario creado con exito!',
          object: newUser
        }
      } catch (err) {
        throw new ValidationError('Ocurrió un error al crear el usuario')
      }
    },
    updateUser: async (parent, { id, input: userInput }, { models }) => {
      const { UserModel } = models

      try {
        const updateUser = await UserModel.findById(id)

        if (!updateUser) {
          throw new Error('El usuario ingresado no existe')
        }

        extend(updateUser, userInput)
        await updateUser.save({ validateModifiedOnly: true })

        return {
          success: true,
          code: 200,
          message: 'Usuario actualizado con exito!',
          object: updateUser
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al actualizar el usuario'
        )
      }
    },
    deleteUser: async (parent, { id }, { models }) => {
      const { UserModel } = models

      try {
        await UserModel.findByIdAndDelete(id)

        return {
          success: true,
          code: 200,
          message: 'Usuario eliminado con exito!'
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al actualizar el usuario'
        )
      }
    },
    toggleUserStatus: async (parent, { id, active }, { models }) => {
      const { UserModel } = models

      try {
        const updateUser = await UserModel.findById(id)

        if (!updateUser) throw new Error('No se encontró el usuario')

        updateUser.active = active
        await updateUser.save()

        return {
          success: true,
          code: 200,
          message: updateUser.active
            ? 'Usuario activado con exito'
            : 'Usuario desactivado con exito',
          user: updateUser
        }
      } catch (err) {
        throw new ValidationError(
          err.message ?? 'Ocurrió un error al actualizar el usuario'
        )
      }
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    me: [isAuthenticated()],
    getUser: [isAuthenticated(), hasRole('ADMIN')],
    getUsers: [isAuthenticated(), hasRole('ADMIN')]
  },
  Mutation: {
    createUser: [isAuthenticated(), hasRole('ADMIN')],
    updateUser: [isAuthenticated(), hasRole('ADMIN')],
    toggleUserStatus: [isAuthenticated(), hasRole('ADMIN')]
  }
}

const composedResolvers = composeResolvers(userResolver, resolversComposition)

export default composedResolvers
