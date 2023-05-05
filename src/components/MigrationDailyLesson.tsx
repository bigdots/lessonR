import React, {useState} from 'react'
import {DatePicker, Form, message, Modal} from 'antd'
import RecordController from '../controller/record'
import {Formatter} from '@/Ycontants'
import dayjs from 'dayjs'


function RecordAddModal(props: any) {
  const {children} = props
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()


  const showModal = () => {
    setOpen(true)
  }


  const handleOk = async () => {
    try {
      const {date} = form.getFieldsValue()
      await form.validateFields()

      // 批量修改日期
      let res = await RecordController.select()
      // console.log(props.date.format(Formatter.day))
      res = res?.filtered(`date == '${props.date.format(Formatter.day)}'`)

      res = res?.slice(0, res?.length) as any
      const objs = res?.map((item: any, index) => {

        const day = date.format(Formatter.day)
        return {
          _id: item._id,
          date: day,
          startTime: dayjs(
            `${day} ${dayjs(item.startTime).format(Formatter.time)}`
          ).startOf('minute')
            .toDate(),
          endTime: dayjs(
            `${day} ${dayjs(item.endTime).format(Formatter.time)}`
          ).startOf('minute')
            .toDate(),
        }
      })

      objs && await RecordController.update(objs)

      message.success('操作成功')
      setOpen(false)
      form?.resetFields()
    } catch (e) {
      message.error('操作失败，请联系管理员')
      console.error(e)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    form?.resetFields()
  }


  return (
    <>
      <div onClick={showModal}>{children}</div>
      <Modal
        title="课程迁移"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        forceRender
      >
        <Form
          name="basic"
          form={form}
          labelCol={{span: 8}}
          wrapperCol={{span: 14}}
          style={{maxWidth: 600}}
          autoComplete="off"
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{required: true, message: '请选择迁移日期'}]}
          >
            <DatePicker placeholder={'请选择迁移日期'}/>
          </Form.Item>

        </Form>
      </Modal>
    </>
  )
}

export default RecordAddModal
