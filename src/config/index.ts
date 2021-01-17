require('dotenv').config()

export default {
  jwt: {
    refresh: {
      expire: 60 * 60 * 24 * 7 * 24,
      key: process.env.JWT_REFRESH_KEY || 'somekeyforrefresh'
    },
    access: {
      expire: 60 * 60 * 24 * 7,
      key: process.env.JWT_ACCESS_KEY || 'somekeyforaccess'
    }
  },
  db: {
    development: {
      uri: 'mongodb://localhost:27017',

      options: {
        dbName: 'graphql',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }
    },
    production: {
      uri: `${process.env.DB_URI}`,
      options: {
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      }
    }
  }
}
