import {Controller} from './controller'
import {Student} from '../model'
import RecordController from './record'

class StudentController extends Controller {
  delete(_ids: Realm.BSON.UUID[]): Promise<void> {
    const recordIds: Realm.BSON.UUID[] = []
    _ids.forEach(async (_id) => {
      const object: any = await this.selectByPrimaryKey(_id)
      const curIds = object?.records?.map((record: any) => {
        return record._id
      })
      recordIds.concat(curIds)
    })

    return RecordController.delete(recordIds)
  }
}

export default new StudentController(Student.schema)
