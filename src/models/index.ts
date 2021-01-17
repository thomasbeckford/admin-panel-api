import { Model } from 'mongoose'
import UserModel from './User'
import WorkplaceModel from './Workplace'
import ProductModel from './Product'
import LoanModel from './Loan'
import ClientModel from './Client'
import RecordModel from './Record'

import {
  IUser,
  IWorkplace,
  IProduct,
  ILoan,
  IClient,
  IRecord
} from './interfaces'

export interface Models {
  UserModel: Model<IUser>
  WorkplaceModel: Model<IWorkplace>
  ProductModel: Model<IProduct>
  LoanModel: Model<ILoan>
  ClientModel: Model<IClient>
  RecordModel: Model<IRecord>
}

const createModels = (): Models => {
  const models: Models = {
    UserModel,
    WorkplaceModel,
    ProductModel,
    LoanModel,
    ClientModel,
    RecordModel
  }

  return models
}

export default createModels
