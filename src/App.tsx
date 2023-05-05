import React, {Suspense, useEffect} from 'react'
import {ConfigProvider, Tabs} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import locale from 'antd/locale/zh_CN'
import RecordController from './controller/record'
import StudentController from './controller/student'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import WeekOfYear from 'dayjs/plugin/WeekOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(dayOfYear)
dayjs.extend(minMax)
dayjs.extend(quarterOfYear)
dayjs.extend(advancedFormat)
dayjs.extend(WeekOfYear)
dayjs.locale('zh-cn')

const Record = React.lazy(() => import('./Record'))
const Student = React.lazy(() => import('./Student'))
const Calendar = React.lazy(() => import('./Calendar'))
const Chart = React.lazy(() => import('./Chart'))

enum Keys {
  Chart = 'Chart',
  Calendar = 'Calendar',
  Record = 'Record',
  Student = 'Student',
}

const tabItems = [
  {
    label: '首页',
    key: Keys.Chart,
    children: <Chart></Chart>,
  },
  {
    label: '日历',
    key: Keys.Calendar,
    children: <Calendar></Calendar>,
  },
  {
    label: '课时',
    key: Keys.Record,
    children: <Record></Record>,
  },
  {
    label: '学生',
    key: Keys.Student,
    children: <Student></Student>,
  },
]

export default function App() {
  useEffect(() => {
    //清除标记为删除的数据
    console.log('清除数据')
    RecordController.clear()
    StudentController.clear()
  })

  return (
    <ConfigProvider locale={locale}>
      <Suspense fallback={null}>
        <Tabs
          destroyInactiveTabPane={true}
          type="card"
          items={tabItems}
        />
      </Suspense>
    </ConfigProvider>
  )
}
