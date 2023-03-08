import React, { useState, useEffect } from 'react'
import RecordController from '../controller/record'
import Roles from '../controller/student'
import { TimePicker } from 'antd'
import { Dayjs } from 'dayjs'
import { RangeValue } from 'rc-picker/lib/interface'
import { FREQUENCY, selectOptions } from '../Ycontants'
import Utils from '../utils'
import {
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Space,
  message,
} from 'antd'

import { useSetRecoilState } from 'recoil'
import { clendarKey } from '../state'
import { v4 as uuidv4 } from 'uuid'

const { RangePicker } = DatePicker

const weekOptions = [
  {
    label: '一',
    value: 1,
  },
  {
    label: '二',
    value: 2,
  },
  {
    label: '三',
    value: 3,
  },
  {
    label: '四',
    value: 4,
  },
  {
    label: '五',
    value: 5,
  },
  {
    label: '六',
    value: 6,
  },
  {
    label: '日',
    value: 0,
  },
]

function RecordPatchAddModal() {
  const [open, setOpen] = useState(false)
  const [weekshow, setWeekshow] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()

  const setKey = useSetRecoilState(clendarKey)

  const [studentOptions, setStudentOptions] = useState<any[]>([])

  const showModal = () => {
    setOpen(true)
  }

  useEffect(() => {
    // 查询学生
    Roles.filtered(`status='1'`).then((result) => {
      const arr: any[] = []
      result?.forEach((item: any) => {
        arr.push({
          label: item.name,
          value: item.name,
          object: item,
        })
      })
      setStudentOptions(arr)
    })
  }, [open])

  const handleOk = async () => {
    try {
      setConfirmLoading(true)
      // 表单验证
      await form.validateFields()

      const fields = form.getFieldsValue()

      let days: Dayjs[] = []
      const { daterange, frequency, name, tiemrange, duration } = fields
      if (weekshow) {
        days = Utils.getAlldayByWeekInRange(
          daterange[0],
          daterange[1],
          frequency[1]
        )
      } else {
        days = Utils.getAlldayInRange(daterange[0], daterange[1])
      }
      const index = Utils.findIndexByName(name, studentOptions)

      const paramsModel = {
        student: studentOptions[index].object,
        startTime: tiemrange[0],
        endTime: tiemrange[1],
        duration: parseFloat(duration),
      }

      const params = days.map((day) => {
        return Object.assign(
          {
            date: day,
          },
          paramsModel
        )
      })

      await RecordController?.createPatch(params)
      setKey(uuidv4())
      message.success('操作成功')
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleTimeChange = (time: RangeValue<Dayjs>) => {
    if (time && time[0] && time[1]) {
      const duration = time[1].diff(time[0], 'h', true).toFixed(1).toString()
      form.setFieldValue('duration', duration)
    }
  }

  const setfrequencyVal = (nval: number, position: number) => {
    let frequencyVal = form.getFieldValue('frequency')
    if (!Array.isArray(frequencyVal)) {
      frequencyVal = []
    }
    frequencyVal[position] = nval
    form.setFieldValue('frequency', frequencyVal)
  }

  const handleFrequencyFirstChange = (val: number) => {
    setfrequencyVal(val, 0)

    const show = val === FREQUENCY.weekly ? true : false
    setWeekshow(show)
  }

  const handleFrequencySecondChange = (val: number) => {
    setfrequencyVal(val, 1)
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        批量添加
      </Button>
      <Modal
        title="批量添加"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        forceRender
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          autoComplete="off"
        >
          <Form.Item
            label="日期区间"
            name="daterange"
            rules={[{ required: true, message: '请选择日期区间' }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            label="频率"
            name="frequency"
            rules={[{ required: true, message: '请选择频次' }]}
          >
            <Space>
              <Select
                style={{ width: 120 }}
                options={selectOptions.frequency}
                onChange={handleFrequencyFirstChange}
              ></Select>
              {weekshow && (
                <Select
                  style={{ width: 120 }}
                  onChange={handleFrequencySecondChange}
                  options={weekOptions}
                ></Select>
              )}
            </Space>
          </Form.Item>
          <Form.Item
            label="学生"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Select options={studentOptions} />
          </Form.Item>

          <Form.Item
            label="时间"
            name="tiemrange"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <TimePicker.RangePicker
              minuteStep={10}
              onChange={handleTimeChange}
              format="HH:mm"
            />
          </Form.Item>

          <Form.Item label="时长" name="duration">
            <Input disabled={true} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default RecordPatchAddModal
