import { AuthenticationError } from 'apollo-server-express'
import { IContext } from '../../types'

// Todo: check how to set the interface here.
const isAuthenticated = () => (next: any) => async (
  root: any,
  args: any,
  context: IContext,
  info: any
) => {
  if (!context.user) {
    throw new AuthenticationError('Debes iniciar sesión para hacer esto')
  }

  return next(root, args, context, info)
}

export default isAuthenticated
