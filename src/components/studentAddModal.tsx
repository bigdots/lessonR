import React, {useEffect, useRef, useState} from 'react'
import {Modal, Form, Select, Input, message} from 'antd'
import StudentController from '@/controller/student'
import {ModalType, selectOptions, STATUS} from '@/Ycontants'

// import { UpdateMode } from 'realm'

function StudentAddModal(props: any) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const {children} = props

  const pageType = useRef(ModalType.add)

  useEffect(() => {
    if (props.data) {
      pageType.current = ModalType.edit
    }
  }, [props])

  useEffect(() => {
    if (pageType.current === ModalType.edit) {
      const {name, fee, status, _id} = props.data
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
    try {
      // 表单验证
      await form.validateFields()
      const fields = form.getFieldsValue()
      fields.fee = parseFloat(fields.fee)

      // let res
      if (pageType.current === ModalType.add) {
        // 查询是否有重名
        let exists = await StudentController.select()
        exists = exists?.filtered(
          `name == '${fields.name}'`
        )

        if (exists && exists.length) {
          message.warning('已存在该学生')
          return
        }
        await StudentController?.insert([fields])
      } else {
        await StudentController?.update(
          [{_id: props.data._id, ...fields}],
        )
      }
      message.success('操作成功')
      setOpen(false)
      form?.resetFields()
    } catch (e) {
      console.error(e)
      message.error('操作失败，请联系管理员')
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
        title="新增"
        open={open}
        onOk={handleOk}
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
          initialValues={
            {status: STATUS.keep}
          }
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[
              {required: true, message: '请输入姓名'},
              {
                type: 'string',
                max: 5,
                message: '最长为5个字符',
              },
            ]}
          >
            <Input disabled={pageType.current === ModalType.edit}/>
          </Form.Item>

          <Form.Item
            label="费用/时"
            name="fee"
            rules={[
              {required: true, message: '请输入费用'},
              {
                pattern: /^\d+(\.\d+)?$/,
                message: '数字格式不正确',
              },
            ]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{required: true, message: '请选择状态'}]}
          >
            <Select style={{width: 120}} options={selectOptions.status}/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default StudentAddModal
