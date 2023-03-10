import React, { Suspense, useEffect } from 'react'
import { ConfigProvider, Tabs } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import locale from 'antd/locale/zh_CN'
import { useSetRecoilState } from 'recoil'
import { v4 as uuidv4 } from 'uuid'
import { clendarKey } from './state'
// import { RecoilRoot } from 'recoil'
import RecordController from './controller/record'
import StudentController from './controller/student'

import advancedFormat from 'dayjs/plugin/advancedFormat'
import WeekOfYear from 'dayjs/plugin/WeekOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'

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
  const setKey = useSetRecoilState(clendarKey)
  const onChange = (key: string) => {
    // 因为日历页面与其它业务逻辑挂钩，所以进入日历页面，重新渲染日历页面
    if (key === Keys.Calendar) {
      setKey(uuidv4())
    }
  }

  useEffect(() => {
    //清除标记为删除的数据
    console.log('清除数据')
    RecordController.clear()
    StudentController.clear()
  })

  return (
    // <RecoilRoot>
    <ConfigProvider locale={locale}>
      <Suspense fallback={null}>
        <Tabs
          onChange={onChange}
          destroyInactiveTabPane={true}
          type="card"
          items={tabItems}
        />
      </Suspense>
    </ConfigProvider>
    // </RecoilRoot>
  )
}
