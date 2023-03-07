import React, { useEffect, useState } from 'react'
import { DatePicker, Space, Row, Col, Radio, RadioChangeEvent } from 'antd'
import RecordController from './controller/record'
import Utils from './utils'
import * as mathjs from 'mathjs'
import { DateType, Formatter } from './Ycontants'
import { LineOptions, Pieoption } from './components/ChatComponent'
import ChartComponent from './components/ChatComponent'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { chain } = mathjs

import {
  ClockCircleFilled,
  EuroCircleFilled,
  LineChartOutlined,
} from '@ant-design/icons'

function Chart() {
  const [size, setSize]: [size: any, setSize: Function] = useState('year')

  const [optionsList, setOptionsList] = useState([{}, {}, {}, {}])

  const [date, setDate]: [date: any, setDate: Function] = useState([
    dayjs().startOf(DateType.year),
    dayjs().endOf(DateType.year),
  ])

  // 查询数据，并生成图像
  useEffect(() => {
    // console.log('构建图形', Utils.dateSearchJoin(date))

    RecordController.filtered(Utils.dateSearchJoin(date)).then((list) => {
      // 构造图形

      // console.log(list.slice(0, list.length))

      let attended = [0, 0] //已上的;课时，费用
      let unattended = [0, 0] //未上的

      let lineYAxis1 = new Map() // 纵坐标，课时
      let lineYAxis2 = new Map() // 纵坐标，fee

      let lineXAxis = Utils.getAllDateInRange(date, size) // 横坐标，时间

      lineXAxis.forEach((x) => {
        lineYAxis1.set(x, 0)
        lineYAxis2.set(x, 0)
      })

      list.forEach((item: any, index: number) => {
        const current = dayjs()

        const mapkey = dayjs(item.date).format(
          Formatter[size as keyof typeof Formatter]
        )
        lineYAxis1.set(
          mapkey,
          chain(lineYAxis1.get(mapkey)).add(item.duration).done()
        )
        lineYAxis2.set(
          mapkey,
          chain(lineYAxis2.get(mapkey)).add(item.student.fee).done()
        )

        if (dayjs(item.date).isAfter(current)) {
          // 未上
          unattended[0] = chain(unattended[0]).add(item.duration).done()
          const fee = chain(item.duration).multiply(item.student.fee).done()
          unattended[1] = chain(unattended[1]).add(fee).done()
        } else {
          attended[0] = chain(attended[0]).add(item.duration).done()
          const fee = chain(item.duration).multiply(item.student.fee).done()
          attended[1] = chain(attended[1]).add(fee).done()
        }
      })

      setOptionsList([
        new Pieoption(attended[0], unattended[0], 'hours', '{b}:{c}h'),
        new LineOptions(lineXAxis, Array.from(lineYAxis1.values())),
        new Pieoption(attended[1], unattended[1], 'fee', '{b}:{c}元'),
        new LineOptions(lineXAxis, Array.from(lineYAxis2.values())),
      ])
    })
  }, [date, size])

  const style: React.CSSProperties = {
    width: '100%',
    height: '260px',
  }

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
      <h1>
        <Space style={{ fontSize: '28px' }}>
          <LineChartOutlined />
          <span>数据统计</span>
        </Space>
      </h1>
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
            <div style={style}>
              <ChartComponent option={optionsList[0]} />
            </div>
          </Col>
          <Col span={12}>
            <div style={style}>
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
            <div style={style}>
              <ChartComponent option={optionsList[2]} />
            </div>
          </Col>
          <Col span={12}>
            <div style={style}>
              <ChartComponent option={optionsList[3]} />
            </div>
          </Col>
        </Row>
      </section>
    </div>
  )
}

export default Chart
