import { mergeResolvers } from 'graphql-tools'

import userResolver from './users'
import workplaceResolver from './workplaces'
import productResolver from './products'
import loanResolver from './loans'
import clientResolver from './clients'
import recordResolver from './records'

const resolvers = [
  userResolver,
  workplaceResolver,
  productResolver,
  loanResolver,
  clientResolver,
  recordResolver
]

export default mergeResolvers(resolvers)
