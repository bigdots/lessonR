import React, { useState, useEffect, useRef } from 'react'
import { Modal, Form, Select, Input, DatePicker, message } from 'antd'
import RecordController from '../controller/record'
import StudentController from '../controller/student'
import { TimePicker } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { RangeValue } from 'rc-picker/lib/interface'
import { ModalType, STATUS } from '../Ycontants'
import Utils from '../utils'
import { useSetRecoilState } from 'recoil'
import { clendarKey } from '../state'
import { v4 as uuidv4 } from 'uuid'
// import { UpdateMode } from 'realm'

function RecordAddModal(props: any) {
  const { children } = props
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()

  let pageType = useRef(ModalType.add)

  const setKey = useSetRecoilState(clendarKey)

  useEffect(() => {
    if (props.data) {
      pageType.current = ModalType.edit
    }
  }, [props])

  useEffect(() => {
    if (pageType.current === ModalType.edit) {
      const { student, startTime, endTime, duration } = props.data
      form.setFieldsValue({
        name: student?.name,
        date: dayjs(startTime),
        tiemrange: [dayjs(startTime), dayjs(endTime)],
        duration,
      })
    } else {
      form.resetFields()
    }
  }, [form, props.data])

  const [studentOptions, setStudentOptions] = useState<any[]>([])

  const showModal = () => {
    setOpen(true)
  }

  useEffect(() => {
    StudentController.filtered(`status=${STATUS.keep}`).then((result) => {
      const arr: any[] = []
      let index = 0
      result?.sorted('modifyAt', true).forEach((item: any) => {
        arr.push({
          label: item.name,
          value: item.name,
          object: item,
        })

        index++
      })
      setStudentOptions(arr)
    })
  }, [open])

  const handleAdd = async (fields: any) => {
    // 表单验证
    const { name, date, tiemrange, duration } = fields
    const index = Utils.findIndexByName(name, studentOptions)
    return RecordController?.create({
      student: studentOptions[index].object,
      date: date,
      startTime: tiemrange[0],
      endTime: tiemrange[1],
      duration: parseFloat(duration),
    })
  }

  const handleUpdate = async (fields: any) => {
    // 表单验证
    const { name, date, tiemrange, duration } = fields

    const index = Utils.findIndexByName(name, studentOptions)
    return await RecordController?.create(
      {
        _id: props.data._id,
        student: studentOptions[index].object,
        date: date,
        startTime: tiemrange[0],
        endTime: tiemrange[1],
        duration: parseFloat(duration),
      },
      'modified'
    )
  }

  const handleOk = async () => {
    try {
      setConfirmLoading(true)
      const fields = form.getFieldsValue()
      await form.validateFields()
      if (pageType.current === ModalType.add) {
        await handleAdd(fields)
      } else {
        await handleUpdate(fields)
      }
      setKey(uuidv4())
      message.success('操作成功')
      setOpen(false)
      form?.resetFields()
    } catch (e) {
      message.error('操作失败，请联系管理员')
      console.error(e)
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form?.resetFields()
  }

  const handleTimeChange = (time: RangeValue<Dayjs>) => {
    if (time && time[0] && time[1]) {
      // const duration = time[1].diff(time[0], 'h')
      const duration = time[1].diff(time[0], 'h', true).toFixed(1).toString()
      form.setFieldValue('duration', duration)
    }
  }

  return (
    <>
      <div onClick={showModal}>{children}</div>
      <Modal
        title="新增"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        forceRender
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 14 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
        >
          <Form.Item
            label="学生"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Select style={{ width: 120 }} options={studentOptions} />
          </Form.Item>
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择上课日期' }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="时间"
            name="tiemrange"
            rules={[{ required: true, message: '请选择上课时间' }]}
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

export default RecordAddModal
