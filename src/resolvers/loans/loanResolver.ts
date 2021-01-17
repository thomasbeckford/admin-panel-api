import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'
import { ValidationError } from 'apollo-server-express'

import { Resolvers } from '../../types'
import { isAuthenticated, hasRole } from '../middlewares'

const loanResolver: Resolvers = {
  Query: {
    getLoan: async (parent, { id }, { models }) => {
      const { LoanModel } = models
      const loan = await LoanModel.findById(id)
        .populate('user')
        .populate('product')
      if (!loan) throw new ValidationError('El préstamo ingresado no existe')

      return loan
    },
    getLoans: async (parent, args, { models }) => {
      const { LoanModel } = models
      const loans = await LoanModel.find()
        .populate('user')
        .populate('product')
        .sort('-requestDate')

      return loans
    },
    userLoans: async (parent, args, { models, user }) => {
      const { LoanModel } = models
      const loans = await LoanModel.find({ user: user?.id })
        .populate('product')
        .sort('-requestDate')
      return loans
    }
  },
  Mutation: {
    createLoan: async (parent, { input }, { models, user }) => {
      const { LoanModel, ProductModel } = models

      let currentUser = user?.id

      if (user?.role === 'admin' && input.user) {
        currentUser = input.user
      }

      const product = await ProductModel.findById(input.product)

      if (!product) throw new ValidationError('El producto ingresado no existe')

      const checkLoan = await LoanModel.findOne({
        product: input.product,
        devolutionDate: null
      })

      if (checkLoan) throw new ValidationError('Este producto ya está tomado')

      const loan = await LoanModel.create({
        user: currentUser,
        product: input.product
      })

      // eslint-disable-next-line no-underscore-dangle
      await product.update({ $push: { loans: loan._id } })

      const loanPopulated = await loan
        .populate('user')
        .populate('product')
        .execPopulate()

      return {
        success: true,
        code: 200,
        message: 'Se ha generado el préstamo correctamente',
        loan: loanPopulated
      }
    },
    devolutionLoan: async (parent, { input }, { models, user }) => {
      const { LoanModel } = models

      const options = { _id: input.id, user: user?.id }

      if (user?.role === 'admin' && input.user) {
        options.user = input.user
      }

      const loan = await LoanModel.findOne(options)

      if (!loan) throw new ValidationError('El prestamo no existe')

      if (loan.devolutionDate)
        throw new ValidationError('Este prestamo ya ha sido devuelto')

      loan.devolutionDate = new Date()

      await loan.save()

      return {
        success: true,
        code: 200,
        message: 'Se ha generado la devolución correctamente',
        loan
      }
    },
    deleteLoan: async (parent, { id }, { models }) => {
      const { LoanModel, ProductModel } = models

      const loan = await LoanModel.findById(id)

      if (loan) {
        await loan.remove()

        await ProductModel.update(
          { _id: loan.product },
          // eslint-disable-next-line no-underscore-dangle
          { $pull: { loans: loan._id } }
        )
        return true
      }
      throw new ValidationError('El prestamo no  existe')
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    getLoan: [isAuthenticated()],
    getLoans: [isAuthenticated(), hasRole('ADMIN')],
    userLoans: [isAuthenticated(), hasRole('EMPLOYEE')]
  },
  Mutation: {
    createLoan: [isAuthenticated()],
    devolutionLoan: [isAuthenticated()],
    deleteLoan: [isAuthenticated(), hasRole('ADMIN')]
  }
}

const composedResolvers = composeResolvers(loanResolver, resolversComposition)

export default composedResolvers
