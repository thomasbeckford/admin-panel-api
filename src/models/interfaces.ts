import { Document } from 'mongoose'

export interface ILoan extends Document {
  user: IUser['_id']
  product: IProduct['_id']
  requestDate?: Date
  devolutionDate?: Date | null
}

export interface IProduct extends Document {
  name: string
  description: string
  loans: [ILoan['_id']]
}

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string

  role: string
  active?: boolean
  tokenCount?: number

  authenticate: (password: string) => Promise<any>
}

export interface IWorkplace extends Document {
  name: string
  location: any

  client: IClient['_id']
}

export interface IClient extends Document {
  name: string
  workplaces: [IWorkplace['_id']]
}

/* add maybe location entry and exit */
export interface IRecord extends Document {
  entryDate: Date
  exitDate?: Date | null
  workplace: IWorkplace['_id']
  user: IUser['_id']
}
