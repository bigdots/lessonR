import {Formatter, TIME_LINE_MAP, WEEK_MAP} from '@/Ycontants'
import {Button, Empty, Modal} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import React, {useEffect, useRef, useState} from 'react'
import styled from '@emotion/styled'
import Utils from "@/utils";
import lunisolar from 'lunisolar'
import randomColor from 'randomcolor'
import XlsxExport from '@/components/XlsxExport'

const TableModal: React.FC<{ dataSource: any }> = ({dataSource}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const colorMap = useRef<Map<string, string>>(new Map)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const tableData = useRef<Array<any[]>>([])
  const startDate = useRef<Dayjs | undefined>()
  useEffect(() => {
    if (dataSource.size <= 0) {
      return;
    }

    colorMap.current = assignColors(dataSource)

    const {startDay, endDay} = findDateRange(dataSource)

    startDate.current = startDay

    if (!startDay || !endDay) {
      return
    }


    tableData.current = generateTabularData(startDay, endDay, dataSource)
  }, [])

  /**
   * 生成颜色
   * @param dataSource
   * @return Map<studentName,color>
   */
  const assignColors = (dataSource: Map<string, any>) => {
    const studentIdColorMap = new Map()
    dataSource.forEach((val: any, key: string) => {
      const id = val.student._id
      if (!studentIdColorMap.has(id)) {
        studentIdColorMap.set(id, '#fff')
      }
    })

    const colorArr = randomColor({
      luminosity: 'light',
      count: studentIdColorMap.size
    });

    studentIdColorMap.forEach((val, key) => {
      studentIdColorMap.set(key, colorArr.pop())
    })
    return studentIdColorMap
  }

  /**
   * 确认日期区间
   * @param dataSource
   */
  const findDateRange = (dataSource: Map<string, any>) => {
    let startDay: Dayjs | undefined;
    let endDay: Dayjs | undefined;
    dataSource.forEach((val: any, key: string) => {
      const currentDay = dayjs(val.date)
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

    // 取开始日期当前周的第一天
    startDay = startDay?.startOf('week')
    // 取结束日期当前周的最后一天
    endDay = endDay?.endOf('week')
    console.log(startDay?.format(Formatter.day), endDay?.format(Formatter.day))

    return {
      startDay,
      endDay
    }
  }

  /**
   * 生成表格数据
   * @param startDay
   * @param endDay
   * @param dataSource
   */
  const generateTabularData = (startDay: Dayjs, endDay: Dayjs, dataSource: Map<string, any>) => {
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

        result[index1][index2] = val
      }
    })


    return result
  }


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


  const TdWrapper = styled('td')<{ bgColor: string }>`
    background-color: ${props => props['bgColor' as keyof typeof props]};
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
        onCancel={() => setIsModalOpen(false)}
      >
        {/*<Button type='primary' onClick={handleExportTable}>导出</Button>*/}
        {dataSource.size > 0 && <TableContainer>
          <tbody>
          {tableData.current.map((data: any[], index) => {
            // 当前周的开始日期 = 开始日期 + 周
            const currentDay = startDate.current?.add(parseInt(`${index / 5}`), 'week')

            // 每5条一周，一周开头前三行展示日期
            const isWeekStart = index % 5 === 0
            const timeLineVal = TIME_LINE_MAP[index % 5]

            return (<>
              <TableHead isShow={isWeekStart} day={currentDay} key={`thead_${index}`}></TableHead>
              <tr key={`tr_${index}`}>
                {/*添加第一列*/}
                {<th>{timeLineVal}</th>}
                {data.map((item, i) => {
                  let bgColor = colorMap.current.get(item?.student?._id)
                  bgColor = bgColor ? bgColor : '#fff'
                  let content = ''
                  if (item) {
                    const timeRange = `${dayjs(item.startTime).format(Formatter.time)}-${dayjs(item.endTime).format(Formatter.time)}`
                    content = timeRange === timeLineVal ? item.student.name : `${item.student.name}（${timeRange}）`
                  }
                  return (
                    <TdWrapper key={i} bgColor={bgColor}>{content}</TdWrapper>
                  )
                })}
              </tr>
            </>)
          })}
          </tbody>

        </TableContainer>}
        {dataSource.size <= 0 && <Empty/>}
        <XlsxExport data={tableData.current} startDate={startDate.current} colorMap={colorMap.current}/>
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
          return <th key={index}>{day?.add(index, 'day').format('MM-DD')}</th>
        })}
      </tr>
      <tr>
        {new Array(7).fill('').map((item, index) => {
          return <th key={index}>{WEEK_MAP[day?.add(index, 'day').day() as keyof typeof WEEK_MAP]}</th>
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
