import React, {useEffect, useRef, useState} from 'react'
import { Badge, Calendar, Space, Spin } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import RecordPatchAddModal from './components/recordPatchAddModal'
import RecordController from './controller/record'
import RealmPromise from './model/index'
import LessonDaily from './components/lessonDaily'
import { style } from 'typestyle'
import {DateType, DAY, Formatter} from './Ycontants'
import lunisolar from 'lunisolar'
// import { useRecoilValue } from 'recoil'
// import { clendarKey } from './state'
// import { RecordObject } from './global'

// import RecordDeclare from './app.d'

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

const dateFullCellRender = (date: Dayjs,recordsMap:any) => {

  const isWeekend = date.day() === DAY.Sun || date.day() === DAY.Sat

  const lunisolarVal = lunisolar(date.toDate())

  const currentRecords = recordsMap.get(date.format(Formatter.day))

  return (
    <div className={isWeekend ? contentWeekend : content}>
      <span>{date.date()}</span>
      <span style={{ color: 'black' }}>{lunisolarVal.format('lD')}</span>
      {lunisolarVal.solarTerm?.toString() && (
        <span>{lunisolarVal.solarTerm?.toString()}</span>
      )}
      <span>
        <Space>
          {currentRecords &&
            currentRecords.map((item: any) => {
              return <Badge status="success" key={item._id} />
            })}
        </Space>
      </span>
    </div>
  )
}

export default function App() {


  const [date, setDate] = useState(dayjs())
  // const Key = useRecoilValue(clendarKey)
  const [recordsMap,setRecordsMap] = useState(new Map())

  // const recordsRealmRef = useRef<Realm.Results<any>|undefined>()

  const [recordsRealm, setRecordsRealm] = useState<any|undefined>()

  useEffect(() => {
    console.log('calendar')
    //  取本月+前后两个月，一共三月
    const  start= date.startOf(DateType.month).subtract(15,DateType.day).format(Formatter.day)
    const end = date.endOf(DateType.month).add(15,DateType.day).format(Formatter.day)
    // 查询课程数据
    RecordController.filtered().then((recordsRealm)=>{
      const records = recordsRealm?.filtered('date > $0', start).filtered('date < $0', end).sorted('date')
      setRecordsRealm(records)
    })

  }, [])

  useEffect(()=>{
    recordsRealm?.addListener( (collection:any)=>{
      console.log('recordsRealmRef listener')
      const recordsMap:Map<string,any> = new Map()
      collection?.forEach((item:any)=>{
        if(!recordsMap.has(item.date)){
          recordsMap.set(item.date,[item])
        }else{
          recordsMap.get(item.date).push(item)
        }
      })
      console.log(recordsMap)
      setRecordsMap(recordsMap)
    })
  },[recordsRealm])

  const onSelect = async (date: Dayjs) => {
    setDate(date)
  }

  const handlePanelChange = async (date: Dayjs, mode: string) => {

    if(mode ===DateType.year ){
        return;
    }

    //  取本月+前后两个月，一共三月
    const  start= date.startOf(DateType.month).subtract(15,DateType.day).format(Formatter.day)
    const end = date.endOf(DateType.month).add(15,DateType.day).format(Formatter.day)

    console.log(start)
    console.log(end)
    // 查询课程数据
    const recordsRealm = await RecordController.filtered()

    const records = recordsRealm?.filtered('date > $0', start).filtered('date < $0', end).sorted('date')
    // 修改查询realm
    setRecordsRealm(records)

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
    return (
      <>
        <div style={{ position: 'absolute', top: '30px', left: '50px' }}>
          <RecordPatchAddModal />
        </div>
        <aside></aside>
        <section className={contentWrap}>
          <div style={wrapperStyle}>
            <Calendar
              onSelect={onSelect}
              onPanelChange={handlePanelChange}
              dateFullCellRender={(date) => dateFullCellRender(date,recordsMap)}
            />
          </div>
          <div>
            <LessonDaily date={date} data={recordsMap.get(date.format(Formatter.day))}/>
          </div>
        </section>
      </>
    )
  }

  return render()
}
