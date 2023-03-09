// declare namespace RecordDeclare {
export interface RecordObject {
  _id: string
  date: string
  startTime: Date
  endTime: Date
  duration: number
  student: Realm.Object<StudentObject>
  createdAt: Date
  modifyAt: Date
  isDelete: boolean
}

export interface StudentObject {
  _id: string
  name: string
  status: number
  fee: string
  createdAt: Date
  modifyAt: Date
  records: Realm.List<RecordObject>
  isDelete: boolean
}
// }
