import Realm from 'realm'

export class Student extends Realm.Object {
  _id!: Realm.BSON.UUID
  name!: string
  status!: number
  fee!: string
  createdAt!: Date
  modifyAt!: Date
  records: Realm.List<Record> | null = null
  isDelete: boolean = false

  static schema: Realm.ObjectSchema = {
    name: 'Student',
    properties: {
      _id: 'string',
      name: 'string',
      status: 'int',
      fee: 'float',
      createdAt: 'date',
      modifyAt: 'date',
      isDelete: 'bool',

      records: {
        type: 'linkingObjects',
        objectType: 'Record',
        property: 'student',
      },
    },
    primaryKey: '_id',
  }

  static generate(data: object) {
    return Object.assign(data, {
      _id: new Realm.BSON.UUID(),
      createdAt: new Date(),
    })
  }
}

export class Record extends Realm.Object {
  _id!: Realm.BSON.UUID
  date!: string
  startTime!: Date
  endTime!: Date
  duration!: number
  student: Realm.Object<Student> | null = null
  createdAt!: Date
  modifyAt!: Date
  isDelete: boolean = false

  static schema: Realm.ObjectSchema = {
    name: 'Record',
    properties: {
      _id: 'string',
      startTime: 'date',
      date: 'string',
      endTime: 'date',
      duration: 'float',
      student: 'Student',
      createdAt: 'date',
      modifyAt: 'date',
      isDelete: 'bool',
    },
    primaryKey: '_id',
  }

  static generate(data: object) {
    return Object.assign(data, {
      _id: new Realm.BSON.UUID(),
      createdAt: new Date(),
    })
  }
}

const config = {
  // path: 'realmData/data.realm',
  schemaVersion: 1,
  // deleteRealmIfMigrationNeeded: true, //debug
  schema: [Student, Record],
}

const realm: Promise<Realm> = Realm.open(config)

export default realm

// 远程储存
// const app = new Realm.App({ id: 'yzg' })
// const user = this.app.logIn(Realm.Credentials.anonymous())
// this.realmPromise = this.user
//   .then((user) => {
//     return Realm.open({
//       schema: [schema],
//       sync: {
//         user: user,
//         flexible: true,
//       },
//     })
//   })
//   .catch((e) => {
//     console.error(e)
//     throw new Error('用户登录realm失败')
//   })
