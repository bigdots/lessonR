import {ipcRenderer} from 'electron'
import Realm from 'realm'

export class Student extends Realm.Object {
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
  _id!: Realm.BSON.UUID
  name!: string
  status!: number
  fee!: string
  createdAt!: Date
  modifyAt!: Date
  records: Realm.List<Record> | null = null
  isDelete = false

  static generate(data: object) {
    return Object.assign(data, {
      _id: new Realm.BSON.UUID(),
      createdAt: new Date(),
    })
  }
}

export class Record extends Realm.Object {
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
  _id!: Realm.BSON.UUID
  date!: string
  startTime!: Date
  endTime!: Date
  duration!: number
  student: Realm.Object<Student> | null = null
  createdAt!: Date
  modifyAt!: Date
  isDelete = false

  static generate(data: object) {
    return Object.assign(data, {
      _id: new Realm.BSON.UUID(),
      createdAt: new Date(),
    })
  }
}

async function run(): Promise<Realm> {
  // get userdataPath
  const dbpath = await ipcRenderer.invoke('get-path', 'data.realm')
  console.log('db path', dbpath)

  return Realm.open({
    path: dbpath,
    schemaVersion: 1,
    // deleteRealmIfMigrationNeeded: true, //debug
    schema: [Student, Record],
  })
}

const realmPromise = run().catch((err) => {
  console.error('Failed to open realm:', err)
})

export default realmPromise
