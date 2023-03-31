import dayjs, {Dayjs} from 'dayjs'
import {Formatter} from './Ycontants'

class Utils {
  static getAlldayByWeekInRange(start: Dayjs, end: Dayjs, week: number) {
    const result = []
    let current = start.clone()

    while (current.day() !== week) {
      current = current.add(1, 'day')
    }
    // console.log(current.format('YYYY/MM/DD'))

    while (!current.isAfter(end)) {
      result.push(current)
      current = current.add(1, 'w')
      // console.log(current)
    }

    return result
  }

  static getAlldayInRange(start: Dayjs, end: Dayjs) {
    const result = []
    let current = start.clone()
    while (!current.isAfter(end)) {
      result.push(current)
      current = current.add(1, 'day')
    }

    return result
  }

  static cancatDate(date: Dayjs, time: Dayjs) {
    return dayjs(
      `${date.format('YYYY/MM/DD')} ${time.format('HH:mm')}`
    ).toDate()
  }

  static findIndexByName(name: string, arr: any[]) {
    return arr.findIndex((item: any) => {
      return item.label === name
    })
  }

  static dateSearchJoin(dateArray: Array<Dayjs>) {
    const searchArr: Array<string> = []
    if (dateArray) {
      searchArr.push(`date <= '${dateArray[1].format(Formatter.day)}'`)
      searchArr.push(`'${dateArray[0].format(Formatter.day)}' <= date `)
    }

    let str = ''
    if (searchArr.length > 0) {
      str = searchArr.join(' && ')
    }

    return str
  }

  static getAllDateInRange(dateRange: Dayjs[], step: any) {
    const result: Dayjs[] = []
    let current = dateRange[0].clone()
    while (!current.isAfter(dateRange[1])) {
      result.push(current)
      current = current.add(1, step)
    }

    return result
  }

  static jionSearchParams(values: any) {
    const searchArr: string[] = []

    Object.keys(values).forEach((key) => {
      if (values[key] === undefined || values[key] === '') {
        return
      }

      if (key === 'dateRange') {
        searchArr.push(`date <= '${values.dateRange[1].format(Formatter.day)}'`)
        searchArr.push(
          `'${values.dateRange[0].format(Formatter.day)}' <= date `
        )
        return
      }
      searchArr.push(`${key} == '${values[key]}'`)
    })

    let str = ''
    if (searchArr.length > 0) {
      str = searchArr.join(' && ')
    }

    return str
  }

  /**
   *
   * @param arr [] length 5
   */
  static genLessonArrInOneDay(records: any) {
    const result = ['', '', '', '', '']
    if (Array.isArray(records)) {
      records.forEach((record: any) => {
        const index = this._getLessonNameAndIndex(dayjs(record.startTime))
        if (index !== undefined) {
          result[index] = record.student.name
        }
      })
    }


    return result

  }

  /***
   * 获取课程的索引和name
   * @param startTime
   * @return index 课程的位置索引
   */
  static _getLessonNameAndIndex(startTime: Dayjs) {
    // ['8:00', '10:30', '13:30', '15:30', '16:00', '18:30']
    const alignmentArray = [
      startTime.hour(8).minute(0),
      startTime.hour(10).minute(30),
      startTime.hour(13).minute(30),
      startTime.hour(16).minute(0),
      startTime.hour(18).minute(30)
    ]


    let diff: undefined | number, index: undefined | number;
    alignmentArray.forEach((item, i) => {
      const newDiff = Math.abs(item.diff(startTime, 'm'))
      if (diff === undefined) {
        diff = newDiff
        index = i
        return;
      }

      if (newDiff < diff) {
        diff = newDiff
        index = i
      }

    })

    return index
  }
}


export default Utils
