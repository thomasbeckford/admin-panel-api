import { AuthenticationError } from 'apollo-server-express'
import { IContext } from '../../types'

// Todo: check how to set the interface here.
const hasRole = (role: string, errorMsg?: string) => (next: any) => async (
  root: any,
  args: any,
  context: IContext,
  info: any
) => {
  if (context.user?.role && context.user.role.toUpperCase() !== role) {
    throw new AuthenticationError(
      errorMsg ?? 'No tienes permiso para realizar esto'
    )
  }

  return next(root, args, context, info)
}

export default hasRole
