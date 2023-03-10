import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Table,
  Select,
  Space,
  Divider,
  message,
  Modal,
} from 'antd'
import StudentAddModal from '@/components/studentAddModal'
import StudentController from '@/controller/student'
import { Formatter, NICECOLORS, selectOptions } from '@/Ycontants'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
const { Column } = Table

export default function App() {
  const [dataSource, setDataSource] = useState<[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const lesson: any = useRef(null)
  const [form] = Form.useForm()
  const [realmResults, steRealmResults] = useState<any>()

  useEffect(() => {
    StudentController.filtered().then((res)=>{
      steRealmResults(res)
    })
  }, [])

  useEffect(() => {
    // 移除之前的所有监听
    realmResults?.removeAllListeners()
    // 添加新的监听
    realmResults?.addListener((collection: any) => {
      setDataSource(collection.slice(0, collection.length))
    })
  }, [realmResults])

  // 查询
  const handleQuery = async () => {
    try {
      const values = form.getFieldsValue()
      let resultRealm  = await StudentController.filtered()
      const {name,status} = values
      if(name){
        resultRealm = resultRealm?.filtered(`name CONTAINS '${name}'`)
      }
      if(status!==undefined && status!==null){
        resultRealm = resultRealm?.filtered(`status == '${status}'`)
      }
      resultRealm = resultRealm?.sorted('modifyAt', true)
      steRealmResults(resultRealm)
    } catch (e) {
      message.error('查询失败')
      console.log(e)
    }
  }

  const handleDel = (item: any) => {
    setIsModalOpen(true)
    lesson.current = item
  }

  const handleDelOK = async () => {
    if (!lesson.current) {
      return
    }

    try {
      // await StudentController.delete(lesson.current._id)
      // message.success('删除成功')
      // setIsModalOpen(false)
      // handleQuery().then(() => {
      //   setIsModalOpen(false)
      // })

      await StudentController.delete(lesson.current._id)
      message.success('删除成功')
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      message.error('删除失败')
    }
  }

  return (
    <div style={{padding:"0 15px"}}>
      <Form
        name="basic"
        layout="inline"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        autoComplete="off"
      >
        <Form.Item label="姓名" name="name">
          <Input />
        </Form.Item>

        <Form.Item label="状态" name="status">
          <Select style={{ width: 120 }} options={selectOptions.status} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" onClick={handleQuery}>
            查询
          </Button>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <StudentAddModal>
            <Button type="primary">新增</Button>
          </StudentAddModal>
        </Form.Item>
      </Form>
      <Divider />
      <Table rowKey="name" dataSource={dataSource} bordered>
        <Column title="姓名" dataIndex="name" key="name" align="center" />
        <Column title="费用" dataIndex="fee" key="fee" align="center" />
        <Column title="状态" dataIndex="status" key="status" align="center" />
        <Column
          title="创建时间"
          dataIndex="createdAt"
          key="createdAt"
          align="center"
          render={(_: any) => {
            return dayjs(_).format(Formatter.day)
          }}
        />
        <Column
          title="操作"
          dataIndex="status"

          key="action"
          align="center"
          render={(_: any, record: any) => {
            return (
              <Space size="middle">
                <StudentAddModal data={record}>
                  <EditFilled className={NICECOLORS} />
                </StudentAddModal>
                <DeleteFilled
                  className={NICECOLORS}
                  onClick={() => {
                    handleDel(record)
                  }}
                />
              </Space>
            )
          }}
        />
      </Table>
      <Modal
        title="警告"
        open={isModalOpen}
        onOk={handleDelOK}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      >
        <p>此操作会一并删除该学生下的所有课程记录，确认继续？</p>
      </Modal>
    </div>
  )
}
