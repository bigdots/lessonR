import {COLORS, Formatter, TIME_LINE_MAP, WEEK_MAP} from '@/Ycontants'
import {Button, List, message, Modal} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import React, {useState, useEffect, useRef, RefObject} from 'react'
import * as mathjs from 'mathjs'
import styled from '@emotion/styled'

import html2canvas from 'html2canvas'
import Utils from "@/utils";
import lunisolar from 'lunisolar'
import {jsx, css, Global, ClassNames} from '@emotion/react'

const {chain} = mathjs


const TableModal: React.FC<{ dataSource: any }> = ({dataSource}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const colorMap = useRef<Map<string, string>>(new Map)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const tableData = useRef<Array<string[]>>([])
  const startDate = useRef<Dayjs | undefined>()
  useEffect(() => {
    let startDay: Dayjs | undefined;
    let endDay: Dayjs | undefined;

    const usedColors: string[] = []
    dataSource.forEach((val: any, key: string) => {

      if (!colorMap.current.has(val.student.name)) {
        let color = COLORS[Math.floor(Math.random() * COLORS.length)]
        while (usedColors.includes(color)) {
          color = COLORS[Math.floor(Math.random() * COLORS.length)]
        }
        colorMap.current.set(val.student.name, color)
      }

      const currentDay = dayjs(val.date)
      // console.log(890, !startDay, !endDay)
      if (!startDay || !endDay) {
        startDay = currentDay
        endDay = currentDay
      } else {
        if (startDay.isAfter(currentDay)) {
          startDay = currentDay
        }
        if (endDay.isBefore(currentDay)) {
          endDay = currentDay
        }
      }
    })

    // console.log(cMap)

    // setColorMap(cMap)

    startDate.current = startDay

    if (!startDay || !endDay) {
      return
    }

    const startWeek = startDay.week() // 第一天是第几周
    const endWeek = endDay.week() // 最后一天是第几周
    // 时间段是第一个索引值,日期是第二个索引值arr[][index]
    const result: Array<string[]> = []
    //初始化数据
    const weekDiff = endWeek - startWeek
    // i 是行，前三行是日期，星期和阴历，五个时间点，所以是5行
    for (let i = 0; i < 5 * (weekDiff + 1); i++) {
      // j是列,第一列是时间，一周七天，所以是7列
      for (let j = 0; j < 7; j++) {
        if (!result[i]) {
          result[i] = []
        }
        result[i][j] = ''
      }
    }

    // 将课程填入result
    dataSource.forEach((val: any, key: string) => {
      // 时间段是第一个索引值,日期是第二个索引值arr[][index]
      let index1 = Utils._getLessonNameAndIndex(dayjs(val.startTime))
      const curWeek = dayjs(val.date).week()
      // day方法返回： 0 是星期天,1是星期一
      const index2 = dayjs(val.date).subtract(1, 'day').day()

      if (index1 !== undefined) {
        index1 = index1 + (curWeek - startWeek) * 5

        // console.log(index1, index2)
        result[index1][index2] = val.student.name
      }
    })
    tableData.current = result
  })

  const TableContainer = styled.table`
    width: 100%;
    text-align: center;

    &, td, th {
      border: 1px solid #1a1a1a;
      border-collapse: collapse;
    }

    td {
      height: 20px;
    }

    th {
      background-color: #bfbfbf;
    }
  `

  const TdWraper = styled.td`
    background-color: ${props => props.bgcolor};
  `
  return (
    <>
      <Button type="primary" onClick={showModal}>
        表格
      </Button>
      <Modal
        width='60%'
        title="课表"
        footer={null}
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <TableContainer>
          <tbody>
          {tableData.current.map((data, index) => {
            // 当前周的开始日期 = 开始日期 + 周
            const currentDay = startDate.current?.add(parseInt(`${index / 5}`), 'week')
            // 每5条一周，一周开头前三行展示日期
            const isWeekStart = index % 5 === 0

            return (<>
              <TableHead isShow={isWeekStart} day={currentDay}></TableHead>
              <tr>
                {/*添加第一列*/}
                {<th>{TIME_LINE_MAP[index % 5]}</th>}
                {data.map((item, i) => {
                  let bgColor = colorMap.current.get(item)
                  bgColor = bgColor ? bgColor : ''
                  console.log(bgColor)
                  return (
                    <TdWraper bgcolor={bgColor}>{item}</TdWraper>
                  )
                })}
              </tr>
            </>)
          })}
          </tbody>
        </TableContainer>
      </Modal>
    </>
  )
}


const TableHead: React.FC<{ isShow: boolean, day: Dayjs | undefined }> = ({isShow, day}) => {
  if (isShow && day) {
    return <>
      <tr>
        {/*添加第一列*/}
        <th rowSpan={3}>时间/日期</th>
        {new Array(7).fill('').map((item, index) => {
          console.log(day?.add(index, 'day').format('MM-DD'))
          return <th key={index}>{day?.add(index, 'day').format('MM-DD')}</th>
        })}
      </tr>
      <tr>
        {new Array(7).fill('').map((item, index) => {
          return <th key={index}>{WEEK_MAP[day?.add(index, 'day').week() as keyof typeof WEEK_MAP]}</th>
        })}
      </tr>
      <tr>
        {new Array(7).fill('').map((item, index) => {
          return <th key={index}> {lunisolar(day?.add(index, 'day').format(Formatter.day)).format('lD')}</th>
        })}
      </tr>
    </>
  } else {
    return null
  }
}


export default TableModal
