import React, {useEffect, useRef} from 'react';
import {UploadOutlined} from '@ant-design/icons';
import {Button, Modal,} from 'antd';
import {Formatter, TIME_LINE_MAP, WEEK_MAP} from "@/Ycontants";
import dayjs, {Dayjs} from "dayjs";
import {ipcRenderer} from "electron";
import lunisolar from "lunisolar";


const XlsxExport: React.FC<{ data: any, startDate: Dayjs | undefined, colorMap: Map<string, string> }> = (props) => {
  // 表格数据
  const sheetData = useRef<Array<any[]>>([])
  // 单元格合并
  const sheetMerges = useRef<Array<any>>([])

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

  useEffect(() => {
    const result: Array<any[]> = []
    const merges: Array<any> = []
    props.data.map((item: any, index: number) => {
      // 当前周的开始日期 = 开始日期 + 周
      const currentDay = props.startDate?.add(parseInt(`${index / 5}`), 'week')

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
        const days = new Array(7).fill('').map((item, index) => {
          const val = WEEK_MAP[currentDay?.add(index, 'day').day() as keyof typeof WEEK_MAP]

          return headerFormatter(val)
        })

        // 农历
        const lunisolarDays = new Array(7).fill('').map((item, index) => {
          const val = lunisolar(currentDay?.add(index, 'day').format(Formatter.day)).format('lD')
          return headerFormatter(val)
        })

        result.push([headerFormatter('日期/时间'), ...dates],
          ['', ...days],
          ['', ...lunisolarDays],)
      }

      const names = item.map((item: any, i: number) => {
        let content = ''
        if (item) {
          const timeRange = `${dayjs(item.startTime).format(Formatter.time)}-${dayjs(item.endTime).format(Formatter.time)}`
          content = timeRange === timeLineVal ? item.student.name : `${item.student.name}（${timeRange}）`
        }

        let bgColor = props.colorMap.get(item?.student?._id)
        bgColor = bgColor ? bgColor.replace('#', '') : 'ffffff'

        return contentFormatter(content, bgColor)
      })

      names.unshift(headerFormatter(timeLineVal))
      result.push(names)
    })
    sheetData.current = result
    sheetMerges.current = merges
  }, [])


  const handleExport = async () => {
    await ipcRenderer.invoke('export-excel', sheetData.current, sheetMerges.current)
  }

  return (
    <Button icon={<UploadOutlined/>} type='primary' onClick={handleExport}>导出到excel</Button>
  );
};

export default XlsxExport;

