import {Formatter, TIME_LINE_MAP, WEEK_MAP} from '@/Ycontants'
import {Button, Empty, Modal, Space} from 'antd'
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

  const tableData = useRef<any>([])
  const tableMerges = useRef<any>([])
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

    const r = generateTabularData(startDay, endDay, dataSource)

    tableData.current = r.result
    tableMerges.current = r.merges
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
    const dataArr: Array<string[]> = []
    //初始化数据
    const weekDiff = endWeek - startWeek
    // i 是行，前三行是日期，星期和阴历，五个时间点，所以是5行
    for (let i = 0; i < 5 * (weekDiff + 1); i++) {
      // j是列,第一列是时间，一周七天，所以是7列
      for (let j = 0; j < 7; j++) {
        if (!dataArr[i]) {
          dataArr[i] = []
        }
        dataArr[i][j] = ''
      }
    }

    // 将课程填入dataArr
    dataSource.forEach((val: any, key: string) => {
      // 时间段是第一个索引值,日期是第二个索引值arr[][index]
      let index1 = Utils._getLessonNameAndIndex(dayjs(val.startTime))
      const curWeek = dayjs(val.date).week()
      // day方法返回： 0 是星期天,1是星期一
      const index2 = dayjs(val.date).subtract(1, 'day').day()

      if (index1 !== undefined) {
        index1 = index1 + (curWeek - startWeek) * 5

        dataArr[index1][index2] = val
      }
    })

    // 格式化数据
    const result: Array<any[]> = []
    const merges: Array<any> = []
    dataArr.map((item: any, index: number) => {
      // 当前周的开始日期 = 开始日期 + 周
      const currentDay = startDate.current?.add(parseInt(`${index / 5}`), 'week')

      // 每5条一周，一周开头前三行展示日期
      const isWeekStart = index % 5 === 0
      const timeLineVal = TIME_LINE_MAP[index % 5]

      const mod = Math.ceil(index / 5)
      // const r = mod*8

      if (isWeekStart) {
        merges.push({s: {r: mod * 8, c: 0}, e: {r: mod * 8 + 2, c: 0}})

        // 日期
        const dates = new Array(7).fill('').map((item, index) => {
          const val = currentDay ? currentDay?.add(index, 'day').format('MM-DD') : ''
          return headerFormatter(val)
        })

        // 星期
        // const days = new Array(7).fill('').map((item, index) => {
        //   const val = WEEK_MAP[currentDay?.add(index, 'day').day() as keyof typeof WEEK_MAP]
        //   return headerFormatter(val)
        // })

        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((item, index) => {
          return headerFormatter(item)
        })

        // 农历
        const lunisolarDays = new Array(7).fill('').map((item, index) => {
          const val = lunisolar(currentDay?.add(index, 'day').format(Formatter.day)).format('lD')
          return headerFormatter(val)
        })

        result.push([headerFormatter('日期/时间'), ...dates],
          [headerFormatter(''), ...days],
          [headerFormatter(''), ...lunisolarDays],)
      }

      const names = item.map((item: any, i: number) => {
        let content = ''
        if (item) {
          const timeRange = `${dayjs(item.startTime).format(Formatter.time)}-${dayjs(item.endTime).format(Formatter.time)}`
          content = timeRange === timeLineVal ? item.student.name : `${item.student.name}（${timeRange}）`
        }

        let bgColor = colorMap.current.get(item?.student?._id)
        bgColor = bgColor ? bgColor.replace('#', '') : 'ffffff'

        return contentFormatter(content, bgColor)
      })

      names.unshift(headerFormatter(timeLineVal))
      result.push(names)
    })

    return {
      result,
      merges
    }
  }

  // 表格头单元格格式
  const headerFormatter = (val: string) => {
    return {
      v: val,
      t: 's',
      s: {
        // font 字体属性
        font: {
          bold: true,
        },
        // alignment 对齐方式
        alignment: {
          vertical: 'center', // 垂直居中
          horizontal: 'center', // 水平居中
        },
        border: {
          top: {style: 'thin'},
          bottom: {style: 'thin'},
          left: {style: 'thin'},
          right: {style: 'thin'}
        },
        // fill 颜色填充属性
        fill: {
          fgColor: {rgb: 'cccccc'},
        },
      }
    }
  }

  // 内容，单元格格式
  const contentFormatter = (val: string, bgcolor: string) => {
    return {
      v: val,
      t: 's',
      s: {
        // font 字体属性
        font: {
          bold: true,
        },
        // alignment 对齐方式
        alignment: {
          vertical: 'center', // 垂直居中
          horizontal: 'center', // 水平居中
        },
        // fill 颜色填充属性
        fill: {
          fgColor: {rgb: bgcolor},
        },
        border: {
          top: {style: 'thin'},
          bottom: {style: 'thin'},
          left: {style: 'thin'},
          right: {style: 'thin'}
        },
      }
    }
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

  const getRowSpan = (r: number, c: number) => {
    // merges.push({s: {r: mod * 8, c: 0}, e: {r: mod * 8 + 2, c: 0}})
    const isExist = tableMerges.current.find((item: any) => {
      return item.s.r === r && item.s.c === c
    })
    return isExist ? 3 : 1
  }

  const isRenderCol = (r: number, c: number) => {
    // 第二第三行的第一列不渲染
    return !((r % 8 === 1 || r % 8 === 2) && c === 0)
  }

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
        {dataSource.size > 0 && <>
          <Space direction={"vertical"} style={{width: '100%'}}>
            <TableContainer>
              <tbody>
              {tableData.current.map((data: any[], index: number) => {
                return (<tr key={index}>
                  {data.map((item, i) => {
                    return isRenderCol(index, i) &&
                      <TdWrapper
                        key={i}
                        rowSpan={getRowSpan(index, i)}
                        bgColor={`#${item.s.fill.fgColor.rgb}`}>
                        {item.v}
                      </TdWrapper>
                  })}
                </tr>)
              })}
              </tbody>
            </TableContainer>
            <XlsxExport data={tableData.current} tableMerges={tableMerges.current}/>
          </Space>
        </>}
        {dataSource.size <= 0 && <Empty/>}
      </Modal>
    </>
  )
}

export default TableModal
