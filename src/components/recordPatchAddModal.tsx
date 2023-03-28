import React, {useState, useEffect} from 'react'
import RecordController from '../controller/record'
import Roles from '../controller/student'
import {TimePicker} from 'antd'
import dayjs, {Dayjs} from 'dayjs'
import {RangeValue} from 'rc-picker/lib/interface'
import {Formatter, FREQUENCY, selectOptions} from '../Ycontants'
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


const {RangePicker} = DatePicker

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

  const [studentOptions, setStudentOptions] = useState<any[]>([])

  const showModal = () => {
    setOpen(true)
  }

  useEffect(() => {
    // 查询学生
    Roles.select().then((res) => {
      return res?.filtered(`status='1'`)
    }).then((result) => {
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

  const _genFetchParams = async () => {
    // 表单验证
    await form.validateFields()

    const fields = form.getFieldsValue()
    const {name, timeRange, duration, dateRange, frequency} = fields

    console.log(dateRange)

    // 获取学生id
    const index = Utils.findIndexByName(name, studentOptions)
    const student = studentOptions[index].object
    // 获取区内日具体日期
    let days: Dayjs[] = []
    if (weekshow) {
      // 如果是每周
      days = Utils.getAlldayByWeekInRange(
        dateRange[0],
        dateRange[1],
        frequency[1]
      )
    } else {
      // 如果是每天
      days = Utils.getAlldayInRange(dateRange[0], dateRange[1])
    }

    console.log(days)

    return days.map((day) => {
      const date = day.format(Formatter.day)
      return {
        student,
        startTime: dayjs(
          `${date} ${timeRange[0].format(Formatter.time)}`
        ).startOf('minute')
          .toDate(),
        endTime: dayjs(
          `${date} ${timeRange[1].format(Formatter.time)}`
        ).startOf('minute')
          .toDate(),
        duration: parseFloat(duration),
        date,
      }
    })
  }

  const handleOk = async () => {
    try {
      const params = await _genFetchParams()

      await RecordController?.insert(params)
      message.success('操作成功')
      setOpen(false)
    } catch (e) {
      console.error(e)
    }
  }


  const handleDel = async () => {
    try {
      const params = await _genFetchParams()
      await RecordController.deletePatch(params)
      message.success('操作成功')
      setOpen(false)
    } catch (e) {
      console.error(e)
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

  const setFrequencyVal = (nval: number, position: number) => {
    let frequencyVal = form.getFieldValue('frequency')
    if (!Array.isArray(frequencyVal)) {
      frequencyVal = []
    }
    frequencyVal[position] = nval
    form.setFieldValue('frequency', frequencyVal)
  }

  const handleFrequencyFirstChange = (val: number) => {
    setFrequencyVal(val, 0)

    const show = (val === FREQUENCY.weekly)
    setWeekshow(show)
  }

  const handleFrequencySecondChange = (val: number) => {
    setFrequencyVal(val, 1)
  }

  return (
    <>
      <Button type="primary" onClick={showModal}>
        批量操作
      </Button>
      <Modal
        title="批量操作"
        open={open}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        forceRender
        footer={[
          <Button key='cancel' onClick={handleCancel}>
            取消
          </Button>,
          <Button type="primary" key='add' onClick={handleOk}>
            批量新增
          </Button>,
          <Button
            key='del'
            type="primary"
            onClick={handleDel}
            danger
          >
            批量删除
          </Button>,
        ]}
      >
        <Form
          name="basic"
          form={form}
          labelCol={{span: 6}}
          wrapperCol={{span: 18}}
          autoComplete="off"
        >
          <Form.Item
            label="日期区间"
            name="dateRange"
            rules={[{required: true, message: '请选择日期区间'}]}
          >
            <RangePicker/>
          </Form.Item>
          <Form.Item
            label="频率"
            name="frequency"
            rules={[{required: true, message: '请选择频次'}]}
          >
            <Space>
              <Select
                style={{width: 120}}
                options={selectOptions.frequency}
                onChange={handleFrequencyFirstChange}
              ></Select>
              {weekshow && (
                <Select
                  style={{width: 120}}
                  onChange={handleFrequencySecondChange}
                  options={weekOptions}
                ></Select>
              )}
            </Space>
          </Form.Item>
          <Form.Item
            label="学生"
            name="name"
            rules={[{required: true, message: '请输入姓名'}]}
          >
            <Select options={studentOptions}/>
          </Form.Item>

          <Form.Item
            label="时间"
            name="timeRange"
            rules={[{required: true, message: '请选择时间'}]}
          >
            <TimePicker.RangePicker
              minuteStep={10}
              onChange={handleTimeChange}
              format="HH:mm"
            />
          </Form.Item>

          <Form.Item label="时长" name="duration">
            <Input disabled={true}/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default RecordPatchAddModal