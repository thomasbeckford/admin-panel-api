import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'

import schema from './schema'
import createModels from './models'
import { AuthMiddleware } from './middlewares'
import config from './config'
import { IContext } from './types'

const getConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return config.db.production
  }

  return config.db.development
}

const dbConfig = getConfig()
const app: express.Application = express()
app.use('*', cors())
app.use(AuthMiddleware)

const server = new ApolloServer({
  schema,
  context: async ({ req }: any) => {
    const models = createModels()
    const context: IContext = { models, user: req.user }

    return context
  }
})

server.applyMiddleware({ app })

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 4000, () => {
  mongoose.connect(dbConfig.uri, dbConfig.options).then(() => {
    // eslint-disable-next-line no-console
    console.log('\n🚀App running')
  })
})
