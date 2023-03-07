import { DeleteFilled, EditFilled, PlusSquareFilled } from '@ant-design/icons'
import { message, Modal, Space, Timeline } from 'antd'
import { useEffect, useRef, useState } from 'react'
import RecordController from '../controller/record'
import dayjs, { Dayjs } from 'dayjs'
import RecordAddModal from './recordAddModal'
import { Formatter, ModalType, NICECOLORS } from '../Ycontants'
import { style } from 'typestyle'
import lunisolar from 'lunisolar'
import { useSetRecoilState } from 'recoil'
import { clendarKey } from '../state'
import { v4 as uuidv4 } from 'uuid'

const right = style({
  height: '100%',
  width: 200,
  background: '#4E6EF2',
  textAlign: 'center',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '0 16px 16px 0',
})

const line1 = style({
  color: '#fff',
  lineHeight: '45px',
})

const line2 = style({
  verticalAlign: 'center',
  width: '80px',
  height: '80px',
  margin: '0 auto',
  lineHeight: '80px',
  fontSize: '52px',
  background: 'rgba(255, 255, 255, 0.5)',
  borderRadius: '12px',
})

const line3 = style({
  lineHeight: '21px',
  display: 'flex',
  flexDirection: 'column',
  margin: '30px 0',
})

const line4 = style({
  textAlign: 'left',
  // background: 'background: rgba(255, 255, 255, 0.15)',
  padding: '15px',
})

const taskItem = style({
  textAlign: 'left',
  color: '#fff',
})

function LessonDaily({ date }: { date: Dayjs }) {
  const [data, setData]: [data: any[], setData: any] = useState([])

  const lesson: any = useRef(null)

  const setKey = useSetRecoilState(clendarKey)

  useEffect(() => {
    RecordController.filtered(`date='${date.format('YYYY/MM/DD')}'`).then(
      (results) => {
        setData(results)
      }
    )
  }, [date])

  const handleDel = (item: any) => {
    setIsModalOpen(true)
    lesson.current = item
  }

  const handleDelOK = async () => {
    if (!lesson.current) {
      return
    }

    try {
      await RecordController.delete(lesson.current._id)
      setKey(uuidv4())
      message.success('删除成功')
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      message.error('删除失败')
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const lis = data.map((item) => {
    return {
      color: 'red',
      children: (
        <Space direction="horizontal">
          <Space direction="vertical">
            <span className={taskItem}>{`${dayjs(item.startTime).format(
              Formatter.time
            )}-${dayjs(item.endTime).format(Formatter.time)}`}</span>
            <span className={taskItem}>{item.student?.name}</span>
          </Space>

          <RecordAddModal data={item}>
            <EditFilled className={NICECOLORS} />
          </RecordAddModal>
          <DeleteFilled
            className={NICECOLORS}
            onClick={() => {
              handleDel(item)
            }}
          />
        </Space>
      ),
    }
  })

  lis.push({
    color: 'red',
    children: (
      <RecordAddModal type={ModalType.add}>
        <PlusSquareFilled className={NICECOLORS} />
      </RecordAddModal>
    ),
  })

  const lunisolarVal = lunisolar(date.toDate())

  return (
    <>
      <section className={right}>
        <span className={line1}>{date.format('YYYY-MM-DD')}</span>
        <span className={line2}>{date.format('DD')}</span>
        <div className={line3}>
          <span>{lunisolarVal.format('lM lD')}</span>
          <span>{`${lunisolarVal.format('cY年')} ${lunisolarVal.format(
            'cZ'
          )}`}</span>
          <span>{`${lunisolarVal.format('cM月')} ${lunisolarVal.format(
            'cD日'
          )}`}</span>
        </div>
        <div className={line4}>
          <Timeline items={lis} />
        </div>
        <Modal
          title="警告"
          open={isModalOpen}
          onOk={handleDelOK}
          onCancel={() => {
            setIsModalOpen(false)
          }}
        >
          <p>删除后不可恢复，确认删除此数据吗？</p>
        </Modal>
      </section>
    </>
  )
}

export default LessonDaily
