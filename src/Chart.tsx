import React, { useEffect, useState } from 'react'
import { DatePicker, Space, Row, Col, Radio, RadioChangeEvent } from 'antd'
import RecordController from './controller/record'
import Utils from './utils'
import * as mathjs from 'mathjs'
import { DateType, Formatter } from './Ycontants'
import { LineOptions, Pieoption } from './components/ChatComponent'
import ChartComponent from './components/ChatComponent'
import dayjs, { Dayjs } from 'dayjs'
const { RangePicker } = DatePicker
const { chain } = mathjs

import {
  ClockCircleFilled,
  EuroCircleFilled,
  LineChartOutlined,
} from '@ant-design/icons'

const chartContainer: React.CSSProperties = {
  width: '100%',
  height: '260px',
}

function Chart() {
  const [size, setSize] = useState<any>('year')

  const [optionsList, setOptionsList] = useState<any[]>([])

  const [date, setDate] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf(DateType.year),
    dayjs().endOf(DateType.year),
  ])

  const [recordsRealm,setRecordsRealm] = useState<any>()

  useEffect(()=>{
    RecordController.filtered(Utils.dateSearchJoin(date)).then((recordsRealm)=>{
      setRecordsRealm(recordsRealm)
    })
  },[date,size])


  const countInRange = (timeRange:Dayjs[],collection:any)=>{
    let hours = chain(0), fee = chain(0);
    const records = collection.filtered(`startTime >= $0`,timeRange[0].toDate()).filtered(`endTime <= $0`,timeRange[1].toDate())
    records.forEach((record:any)=>{
      hours = hours.add(record.duration)
      const f = chain(record.duration).multiply(record.student.fee).done()
      fee = fee.add(f)
    })
    return {
      hours:hours.done(),
      fee:fee.done()
    }
  }

  useEffect(()=>{
    recordsRealm?.removeAllListeners()

    recordsRealm?.addListener((collection:any)=>{
      // 构造图形
      console.log('构建图形')
      //构建折线图坐标
      const days = Utils.getAllDateInRange(date, size)
      const hourMap:Map<string,number> = new Map()
      const feeMap:Map<string,number> = new Map()
      days.forEach((day:Dayjs)=>{
        const start  = day.startOf(size)
        const end = day.endOf(size)
        const countFeeHours = countInRange([start,end],collection)
        hourMap.set(day.format(Formatter[size as keyof typeof DateType]),countFeeHours.hours)
        feeMap.set(day.format(Formatter[size as keyof typeof DateType]),countFeeHours.fee)
      })

      // 构建饼图
      const attended = countInRange([date[0],dayjs().startOf(DateType.day)],collection)
      const unattended = countInRange([dayjs().startOf(DateType.day),date[1]],collection)
      const lineXAxis = Array.from(hourMap.keys())

      const countHour = chain(attended.hours).add(unattended.hours).done()
      const countFee = chain(attended.fee).add(unattended.fee).done()

      setOptionsList([
        new Pieoption(attended.hours, unattended.hours, `${countHour}h`, '{b}:{c}h'),
        new LineOptions(lineXAxis, Array.from(hourMap.values())),
        new Pieoption(attended.fee, unattended.fee, `￥${countFee}`, '{b}:{c}元'),
        new LineOptions(lineXAxis, Array.from(feeMap.values())),
      ])
    })

  },[recordsRealm])



  const handleSizeChange = (e: RadioChangeEvent) => {
    console.log(e.target.value)
    setSize(e.target.value)
  }

  const handleDateChange = (date: any) => {
    date[0] = date[0].startOf(DateType[size as keyof typeof DateType])
    date[1] = date[1].endOf(DateType[size as keyof typeof DateType])
    console.log(date)
    setDate(date)
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{marginBottom:'15px',fontWeight:600}}>
        <Space style={{ fontSize: '28px' }}>
          <LineChartOutlined />
          <span>数据统计</span>
        </Space>
      </div>
      <Space>
        <Radio.Group value={size} onChange={handleSizeChange}>
          <Radio.Button value={DateType.year}>年</Radio.Button>
          <Radio.Button value={DateType.quarter}>季</Radio.Button>
          <Radio.Button value={DateType.month}>月</Radio.Button>
          <Radio.Button value={DateType.week}>周</Radio.Button>
          <Radio.Button value={DateType.day}>日</Radio.Button>
        </Radio.Group>
        <RangePicker value={date} onChange={handleDateChange} picker={size} />
      </Space>

      <section>
        <h2>
          <Space style={{ fontSize: '21px' }}>
            <ClockCircleFilled />
            <span>time</span>
          </Space>
        </h2>
        <Row gutter={16}>
          <Col span={12}>
            <div style={chartContainer}>
              <ChartComponent option={optionsList[0]} />
            </div>
          </Col>
          <Col span={12}>
            <div style={chartContainer}>
              <ChartComponent option={optionsList[1]} />
            </div>
          </Col>
        </Row>
      </section>

      <section>
        <h2>
          <Space style={{ fontSize: '21px' }}>
            <EuroCircleFilled />
            <span>fee</span>
          </Space>
        </h2>
        <Row gutter={16}>
          <Col span={12}>
            <div style={chartContainer}>
              <ChartComponent option={optionsList[2]} />
            </div>
          </Col>
          <Col span={12}>
            <div style={chartContainer}>
              <ChartComponent option={optionsList[3]} />
            </div>
          </Col>
        </Row>
      </section>
    </div>
  )
}

export default Chart
