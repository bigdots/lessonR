import { Formatter } from '@/Ycontants'
import { Button, List, message, Modal } from 'antd'
import dayjs from 'dayjs'
import React, { useState, useEffect, useRef, LegacyRef, RefObject } from 'react'
import * as mathjs from 'mathjs'
const { chain } = mathjs
import html2canvas from 'html2canvas'

const CountModal: React.FC<{ dataSource: any }> = ({ dataSource }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const countDom: RefObject<HTMLDivElement> | null = useRef(null)
  const save_url = useRef('')
  const aDom: RefObject<HTMLAnchorElement> | null = useRef(null)

  const handleOk = () => {
    if (!countDom.current) {
      message.error('生成图片失败')
      return
    }

    html2canvas(countDom.current).then(function (canvas) {
      // console.log(canvas)
      // document.body.appendChild(canvas)
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

  return (
    <>
      <Button type="primary" onClick={showModal}>
        统计
      </Button>
      <Modal
        title="统计"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="导出为图片"
        cancelText="关闭"
      >
        <div ref={countDom}>
          <List
            size="small"
            // header={<div>Header</div>}
            footer={<Footer data={dataSource} />}
            bordered
            dataSource={dataSource}
            renderItem={(item: any) => {
              const { student, date, startTime, endTime } = item[1]
              return (
                <List.Item>
                  <div style={footWrap}>
                    <span>{student['name']}</span>
                    <span>{date}</span>
                    <span>{`${dayjs(startTime).format(Formatter.time)}-${dayjs(
                      endTime
                    ).format(Formatter.time)}`}</span>
                  </div>
                </List.Item>
              )
            }}
          />
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

const Footer: React.FC<{ data: any }> = ({ data }) => {
  const [conutH, setCountH] = useState<number>(0)
  const [conutF, setCountF] = useState<number>(0)

  useEffect(() => {
    let h = chain(0),
      f = chain(0)

    data.forEach((val: any, key: string) => {
      // console.log(val)
      h = h.add(val.duration)
      f = f.add(chain(val.duration).multiply(val.student.fee).done())
    })

    setCountF(f.done())
    setCountH(h.done())
  }, [data])

  return (
    <div style={footWrap}>
      <span>总时长：{conutH}h</span> <span>总费用：{conutF}元</span>
    </div>
  )
}

export default CountModal
