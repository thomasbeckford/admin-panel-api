import { IResolvers } from 'graphql-tools'
import { Models } from './models'

export interface IUserContext {
  id: number
  role: string
}

export interface IContext {
  models: Models
  user?: IUserContext
}

export interface Resolvers extends IResolvers {
  Query: IResolvers<any, IContext>
  Mutation: IResolvers<any, IContext>
}
