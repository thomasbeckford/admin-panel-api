import path from 'path'
import { loadFilesSync, mergeTypeDefs } from 'graphql-tools'

const typesArray = loadFilesSync(path.join(__dirname, './types'), {
  extensions: ['graphql']
})

const types = mergeTypeDefs(typesArray)

export default types
