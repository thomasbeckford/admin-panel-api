import { sign, verify } from 'jsonwebtoken'
import config from './config'

const createToken = (user: any, key: string, expire: number) => {
  return sign({ user }, key, { expiresIn: expire })
}

const createAccessToken = (user: any) => {
  const userData = { id: user.id }
  const { key, expire } = config.jwt.access

  return createToken(userData, key, expire)
}

const createRefreshToken = (user: any) => {
  const userData = { id: user.id, count: user.tokenCount }
  const { key, expire } = config.jwt.refresh

  return createToken(userData, key, expire)
}

const validateAccessToken = (token?: string) => {
  if (!token) return null
  try {
    return verify(token, config.jwt.access.key)
  } catch {
    return null
  }
}

const validateRefreshToken = (token?: string) => {
  if (!token) return null

  try {
    return verify(token, config.jwt.refresh.key)
  } catch {
    return null
  }
}

export {
  createAccessToken,
  createRefreshToken,
  validateAccessToken,
  validateRefreshToken
}
