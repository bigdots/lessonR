import { Controller } from './controller'
import Realm from 'realm'
import { Record } from '../model'
import { Formatter } from '../Ycontants'
import dayjs from 'dayjs'

class RecordController extends Controller {
  create(data: any, mode?: any): Promise<void> {
    let newdata = this._handleTime(data)

    return super.create(newdata, mode)
  }

  private _handleTime(data: any) {
    let newdata: any = {}
    const { date, startTime, endTime } = data

    if (date) {
      newdata.date = data.date.format('YYYY/MM/DD')
    }

    if (startTime) {
      newdata.startTime = dayjs(
        `${date.format(Formatter.day)} ${startTime.format(Formatter.time)}`
      )
        .startOf('minute')
        .toDate()
    }

    if (endTime) {
      newdata.endTime = dayjs(
        `${date.format(Formatter.day)} ${endTime.format(Formatter.time)}`
      )
        .startOf('minute')
        .toDate()
    }

    return Object.assign(data, newdata)
  }

  createPatch(datas: any[], mode?: any): Promise<void> {
    const ndatas = datas.map((data) => {
      return this._handleTime(data)
    })
    return super.createPatch(ndatas, mode)
  }
}

export default new RecordController(Record.schema)
