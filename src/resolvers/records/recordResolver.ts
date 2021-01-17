import { composeResolvers, ResolversComposerMapping } from 'graphql-tools'
import moment from 'moment'
import { ValidationError } from 'apollo-server-express'

import { Resolvers } from '../../types'
import { isAuthenticated } from '../middlewares'

function getDates(start: moment.Moment, end: moment.Moment) {
  const dates = []

  while (start >= end) {
    dates.push(start.toISOString())

    start.add(-1, 'days')
  }
  return dates
}

const recordResolver: Resolvers = {
  Query: {
    getRecords: async (parent, args, { models, user }) => {
      const { RecordModel } = models

      /** Get the dates from params */
      const startDay = moment.utc().endOf('day')
      const endDay = moment.utc().subtract(14, 'days').startOf('day')

      const records = await RecordModel.find({
        user: user?.id,
        entryDate: { $gte: endDay.toDate(), $lte: startDay.toDate() }
      })
        .sort('-entryDate')
        .populate('user')
        .populate('workplace')

      const dates = getDates(startDay, endDay)

      const grouped = dates.reduce((acc: any, date: any) => {
        const recordsFilter = records.filter(record =>
          moment.utc(record.entryDate).isSame(date, 'day')
        )
        acc.push({ date, records: recordsFilter })
        return acc
      }, [])
      return grouped
    },
    hasCheckInActive: async (parent, args, { models, user }) => {
      const { RecordModel } = models
      const dateUTC = moment.utc()
      const startDay = dateUTC.startOf('day').toDate()
      const endDay = dateUTC.endOf('day').toDate()

      const record = await RecordModel.findOne({
        user: user?.id,
        entryDate: { $gte: startDay, $lte: endDay },
        exitDate: null
      })
        .sort('-entryDate')
        .populate('user')
        .populate('workplace')

      return record
    }
  },
  Mutation: {
    checkIn: async (parent, { input }, { models, user }) => {
      const { RecordModel, WorkplaceModel } = models
      const dateUTC = moment.utc()
      const entryDate = dateUTC.toDate()
      const startDay = dateUTC.startOf('day').toDate()
      const endDay = dateUTC.endOf('day').toDate()

      const alreadyCheckIn = await RecordModel.findOne({
        user: user?.id,
        entryDate: {
          $gte: startDay,
          $lte: endDay
        },
        exitDate: null
      })

      if (alreadyCheckIn) {
        throw new ValidationError(
          'Ya has realizado una entrada hoy, debes realizar una salida.'
        )
      }

      /** Check if exists the workplace and if is in the range */
      const workplaces = await WorkplaceModel.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: input.coordinates
            },
            $maxDistance: 100 // TODO: add this to config
          }
        }
      })
      const workplace = workplaces?.find(work => work.id === input.workplace)

      if (!workplace)
        throw new ValidationError(
          'El centro de trabajo no existe o estas fuera de rango'
        )

      const record = await RecordModel.create({
        workplace: workplace.id,
        user: user?.id,
        entryDate
      })

      const recordPopulated = await record
        .populate('user')
        .populate('workplace')
        .execPopulate()

      return {
        message: 'Has realizado la entrada con éxito',
        record: recordPopulated
      }
    },
    checkOut: async (parent, { input }, { models, user }) => {
      const { RecordModel, WorkplaceModel } = models
      const dateUTC = moment.utc()
      const startDay = dateUTC.startOf('day').toDate()
      const endDay = dateUTC.endOf('day').toDate()

      /** Check if exists the workplace and if is in the range */
      const workplaces = await WorkplaceModel.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: input.coordinates
            },
            $maxDistance: 100 // TODO: add this to config
          }
        }
      })
      const workplace = workplaces?.find(work => work.id === input.workplace)

      if (!workplace)
        throw new ValidationError(
          'El centro de trabajo no existe o estas fuera de rango'
        )

      const record = await RecordModel.findOne({
        user: user?.id,
        workplace: workplace.id,
        entryDate: { $gte: startDay, $lte: endDay },
        exitDate: null
      })
        .sort('-entryDate')
        .populate('user')
        .populate('workplace')

      if (!record)
        throw new ValidationError(
          'Debes realizar una entrada antes de una salida.'
        )

      record.exitDate = new Date()

      await record.save()

      return {
        message: 'Has realizado la salida con éxito',
        record
      }
    }
  }
}

const resolversComposition: ResolversComposerMapping<Resolvers> = {
  Query: {
    getRecords: [isAuthenticated()]
  },
  Mutation: {
    checkIn: [isAuthenticated()],
    checkOut: [isAuthenticated()]
  }
}

const composedResolvers = composeResolvers(recordResolver, resolversComposition)

export default composedResolvers
