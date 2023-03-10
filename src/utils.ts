import dayjs, { Dayjs } from 'dayjs'
import { Formatter } from './Ycontants'

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
    let searchArr: Array<string> = []
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
    let searchArr: string[] = []

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
}

export default Utils
