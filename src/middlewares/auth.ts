import { Request, Response, NextFunction } from 'express'
import {
  validateAccessToken,
  validateRefreshToken,
  createRefreshToken,
  createAccessToken
} from '../utils'
import createModels from '../models'

interface AuthRequest extends Request {
  user: any
}
const { UserModel } = createModels()

const AuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const req = request as AuthRequest
  const refreshToken = req.get('x-refresh-token')
  const accessToken = req.get('x-access-token')

  if (!accessToken && !refreshToken) return next()

  const decodedAccessToken: any = validateAccessToken(accessToken)
  if (decodedAccessToken?.user) {
    const user = await UserModel.findById(decodedAccessToken.user.id).select(
      'role active'
    )

    if (user?.active) {
      req.user = user
    }
    return next()
  }

  const decodedRefreshToken: any = validateRefreshToken(refreshToken)
  if (decodedRefreshToken?.user) {
    const user = await UserModel.findById(decodedRefreshToken.user.id).select(
      'role active tokenCount'
    )
    if (
      !user ||
      user.tokenCount !== decodedRefreshToken.user.count ||
      !user.active
    )
      return next()
    req.user = user

    const tokens = {
      accessToken: createAccessToken(user),
      refreshToken: createRefreshToken(user)
    }
    response.set({
      'Access-Control-Expose-Headers': 'x-access-token,x-refresh-token',
      'x-access-token': tokens.accessToken,
      'x-refresh-token': tokens.refreshToken
    })
  }
  return next()
}

export default AuthMiddleware
