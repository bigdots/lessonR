import {Controller} from './controller'
import Realm from 'realm'
import {Record} from '../model'
import {Formatter} from '../Ycontants'
import dayjs from 'dayjs'
import {string} from "mathjs";

class RecordController extends Controller {
  // create(data: any, mode?: any): Promise<void> {
  //   const newData = this._handleTime(data)
  //
  //   return super.create(newData, mode)
  // }

  // createPatch(datas: any[], mode?: any): Promise<void> {
  //   const ndatas = datas.map((data) => {
  //     return this._handleTime(data)
  //   })
  //   return super.createPatch(ndatas, mode)
  // }


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


  // private _handleTime(data: any) {
  //   const newdata: any = {}
  //   const {date, startTime, endTime} = data
  //
  //   if (date) {
  //     newdata.date = data.date.format('YYYY/MM/DD')
  //   }
  //
  //   if (startTime) {
  //     newdata.startTime = dayjs(
  //       `${date.format(Formatter.day)} ${startTime.format(Formatter.time)}`
  //     )
  //       .startOf('minute')
  //       .toDate()
  //   }
  //
  //   if (endTime) {
  //     newdata.endTime = dayjs(
  //       `${date.format(Formatter.day)} ${endTime.format(Formatter.time)}`
  //     )
  //       .startOf('minute')
  //       .toDate()
  //   }
  //
  //   return Object.assign(data, newdata)
  // }
}

export default new RecordController(Record.schema)
