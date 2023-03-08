import React, { useEffect, useRef, useState } from 'react'
import { Modal, Form, Select, Input, message } from 'antd'
import StudentController from '../controller/student'
import { ModalType, selectOptions } from '../Ycontants'
// import { UpdateMode } from 'realm'

function StudentPatchAddModal(props: any) {
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()
  const { children } = props

  let pageType = useRef(ModalType.add)

  useEffect(() => {
    if (props.data) {
      pageType.current = ModalType.edit
    }
  }, [props])

  useEffect(() => {
    if (pageType.current === ModalType.edit) {
      const { name, fee, status, _id } = props.data
      form.setFieldsValue({
        _id,
        name,
        fee,
        status,
      })
    } else {
      form.resetFields()
    }
  }, [form, props.data])

  const showModal = () => {
    setOpen(true)
  }

  const handleOk = async () => {
    setConfirmLoading(true)
    try {
      // 表单验证
      await form.validateFields()
      const fields = form.getFieldsValue()
      fields.fee = parseFloat(fields.fee)

      // let res
      if (pageType.current === ModalType.add) {
        // 查询是否有重名
        const exists = await StudentController.filtered(
          `name == '${fields.name}'`
        )

        if (exists && exists.length) {
          message.warning('已存在该学生')
          return
        }
        await StudentController?.create(fields)
      } else {
        await StudentController?.create(
          { _id: props.data._id, ...fields },
          'modified'
        )
      }

      message.success('添加成功')
      setOpen(false)
    } catch (e) {
      console.error(e)
      message.error('操作失败，请联系管理员')
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
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
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '请输入姓名' },
              {
                type: 'string',
                max: 5,
                message: '最长为5个字符',
              },
            ]}
          >
            <Input disabled={pageType.current === ModalType.edit} />
          </Form.Item>

          <Form.Item
            label="费用/时"
            name="fee"
            rules={[
              { required: true, message: '请输入费用' },
              {
                pattern: /^\d+(\.\d+)?$/,
                message: '数字格式不正确',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select style={{ width: 120 }} options={selectOptions.status} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default StudentPatchAddModal
