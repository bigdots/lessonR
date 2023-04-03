import {Formatter, TIME_LINE_MAP, WEEK_MAP} from '@/Ycontants'
import {Button, List, message, Modal} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import React, {useState, useEffect, useRef, RefObject} from 'react'
import * as mathjs from 'mathjs'

const {chain} = mathjs
import html2canvas from 'html2canvas'
import Utils from "@/utils";
import lunisolar from 'lunisolar'

const TableModal: React.FC<{ dataSource: any }> = ({dataSource}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const countDom: RefObject<HTMLDivElement> | null = useRef(null)
  const save_url = useRef('')
  const aDom: RefObject<HTMLAnchorElement> | null = useRef(null)

  const handleOk = () => {
    if (!countDom.current) {
      return message.error('生成图片失败')
    }

    html2canvas(countDom.current).then(function (canvas) {
      // 下载功能
      save_url.current = canvas.toDataURL('image/png')
      aDom.current && aDom.current.click()
      setIsModalOpen(false)
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }
  const showModal = () => {
    setIsModalOpen(true)
  }

  const tableData = useRef<Array<string[]>>([])
  useEffect(() => {
    let startDay: Dayjs | undefined;
    let endDay: Dayjs | undefined;


    dataSource.forEach((val: any, key: string) => {
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
    console.log(1123, startDay, endDay)

    if (!startDay || !endDay) {
      return
    }

    const startWeek = startDay.week() // 第一天是第几周
    const endWeek = endDay.week() // 最后一天是第几周
    // 时间段是第一个索引值,日期是第二个索引值arr[][index]
    const result: Array<string[]> = []
    // TIME_LINE_MAP
    //初始化数据
    const weekDiff = endWeek - startWeek
    // i 是行，前三行是日期，星期和阴历
    for (let i = 0; i < 8 * (weekDiff + 1); i++) {
      // j是列,第一列是时间
      for (let j = 0; j < 7; j++) {
        // 当前日期
        const day = startDay.startOf('week').add(j + 7 * parseInt(`${i / 8}`), 'day')
        if (!result[i]) {
          result[i] = []
        }


        if (i % 8 === 0) {
          // 周几
          result[i][j] = WEEK_MAP[day.day() as keyof typeof WEEK_MAP]
        } else if (i % 8 === 1) {
          // 日期
          result[i][j] = day.format('MM-DD')
        } else if (i % 8 === 2) {
          // 阴历
          result[i][j] = lunisolar(day.toDate()).format('lD')
        } else {
          result[i][j] = ''
        }

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
        index1 = index1 + (curWeek - startWeek) * 8 + 3

        console.log(index1, index2)
        result[index1][index2] = val.student.name
      }
    })

    console.log(result)
    tableData.current = result

  })


  return (
    <>
      <Button type="primary" onClick={showModal}>
        表格
      </Button>
      <Modal
        title="课表"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="导出为图片"
        cancelText="关闭"
      >
        <div ref={countDom}>
          {/*表头：日期，阳历，阳历，阴历*/}

          <table border={1}>
            <tbody>
            {tableData.current.map((data, index) => {
              const line = index % 8
              return (<>
                <tr>
                  {/*添加之间列*/}
                  {line >= 3 && <td>{TIME_LINE_MAP[line as keyof typeof TIME_LINE_MAP]}</td>}
                  {line === 0 && <td rowSpan={3}>时间/日期</td>}
                  {data.map((item, i) => {
                    return (
                      <>
                        <td>{item}</td>
                      </>
                    )
                  })}
                </tr>

              </>)
            })}
            </tbody>
          </table>
        </div>
      </Modal>
      <a ref={aDom} href={save_url.current} download="统计.png"></a>
    </>
  )
}


const footWrap: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}

const Footer: React.FC<{ data: any }> = ({data}) => {
  const [countH, setCountH] = useState<number>(0)
  const [countF, setCountF] = useState<number>(0)

  useEffect(() => {
    let h = chain(0),
      f = chain(0)

    data.forEach((val: any) => {
      // console.log(val)
      h = h.add(val.duration)
      f = f.add(chain(val.duration).multiply(val.student.fee).done())
    })

    setCountF(f.done())
    setCountH(h.done())
  }, [data])

  return (
    <div style={footWrap}>
      <span>总时长：{countH}h</span> <span>总费用：{countF}元</span>
    </div>
  )
}

export default TableModal
