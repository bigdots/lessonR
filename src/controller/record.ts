import {Controller} from './controller'
import {Record} from '../model'

class RecordController extends Controller {


  // dateRange
  async deletePatch(dataArr: any[]): Promise<void> {
    const objects = await this.select()
    // 删除的id数组
    const ids = new Set()
    dataArr.forEach((data) => {
      console.log(objects?.length)
      let result = objects;
      const {
        student,
        startTime,
        endTime,
        date
      } = data

      if (student) {
        result = result?.filtered(`student._id == '${student._id}'`)
      }


      if (startTime) {
        result = result?.filtered('startTime == $0', startTime)
      }

      if (endTime) {
        result = result?.filtered('endTime == $0', endTime)
      }

      if (date) {
        result = result?.filtered(`date == '${date}'`)
      }


      if (result && result.length > 0) {
        result.forEach((r: any) => {
          // console.log(r)
          ids.add(r._id)
        })
      }

    })

    return super.delete(Array.from(ids) as any[])
  }

}

export default new RecordController(Record.schema)
