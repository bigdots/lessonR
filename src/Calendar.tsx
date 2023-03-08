import React, { useEffect, useState } from 'react'
import { Badge, Calendar, Space, Spin } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import RecordPatchAddModal from './components/recordPatchAddModal'
import RecordController from './controller/record'
import RealmPromise from './model/index'
import LessonDaily from './components/lessonDaily'
import { style } from 'typestyle'
import { DAY } from './Ycontants'
import lunisolar from 'lunisolar'
import { useRecoilValue } from 'recoil'
import { clendarKey } from './state'

const dateFullCellRender = (date: Dayjs) => {
  const content = style({
    boxSizing: 'border-box',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  })

  const contentWeekend = style({
    boxSizing: 'border-box',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    color: '#F73131',
  })

  // 读取
  const realmResult = RecordController.searchSnyc(
    `date=='${date.format('YYYY/MM/DD')}'`
  )

  const isWeekend = date.day() === DAY.Sun || date.day() === DAY.Sat

  const lunisolarVal = lunisolar(date.toDate())

  return (
    <div className={isWeekend ? contentWeekend : content}>
      <span>{date.date()}</span>
      <span style={{ color: 'black' }}>{lunisolarVal.format('lD')}</span>
      {lunisolarVal.solarTerm?.toString() && (
        <span>{lunisolarVal.solarTerm?.toString()}</span>
      )}
      <span>
        <Space>
          {realmResult &&
            realmResult.map((item: any) => {
              return <Badge status="success" key={item._id} />
            })}
        </Space>
      </span>
    </div>
  )
}

export default function App() {
  const [RealmReady, setReady] = useState(false)

  const [date, setDate] = useState(dayjs())
  const Key = useRecoilValue(clendarKey)
  useEffect(() => {
    console.log('calendar')
    RealmPromise.then(() => {
      setReady(true)
    }).catch((e) => {
      console.error('open realm error', e)
    })
  }, [])

  const onSelect = async (date: Dayjs) => {
    setDate(date)
  }

  const handlePanelChange = (date: Dayjs, mode: string) => {
    console.log('handlePanelChange')
  }

  const contentWrap = style({
    padding: '15px 15px 0',
    display: 'flex',
    flexDirection: 'row',
    boxSizing: 'border-box',
  })

  const wrapperStyle: React.CSSProperties = {
    flex: 1,
    margin: '0 auto',
    border: '2px solid #4E6EF2',
    borderRadius: '16px 0 0 16px',
    padding: '15px',
  }

  const render = () => {
    if (RealmReady) {
      return (
        <>
          <div style={{ position: 'absolute', top: '30px', left: '50px' }}>
            <RecordPatchAddModal />
          </div>
          <aside></aside>
          <section className={contentWrap}>
            <div style={wrapperStyle}>
              <Calendar
                key={Key}
                onSelect={onSelect}
                onPanelChange={handlePanelChange}
                dateFullCellRender={(date) => dateFullCellRender(date)}
              />
            </div>
            <div>
              <LessonDaily date={date} />
            </div>
          </section>
        </>
      )
    } else {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Spin tip="Loading" size="large">
            <div className="content" />
          </Spin>
        </div>
      )
    }
  }

  return render()
}
