import { Controller } from './controller'
import { Student } from '../model'
import { UUID } from 'bson'
import RecordController from './record'

class StudentController extends Controller {
  delete(_id: UUID): Promise<void> {
    return this.objectForPrimaryKey(_id).then((object: any) => {
      // 删除该学生下所有课程
      object?.records?.forEach((record: any) => {
        console.log(record)
        RecordController.delete(record._id)
      })
      super.delete(_id)
    })
  }
}

export default new StudentController(Student.schema)
