import React, {useEffect, useRef, useState} from 'react'
import {
  Button,
  Form,
  Input,
  DatePicker,
  Space,
  Table,
  message,
  Modal,
} from 'antd'

import RecordAdd from '@/components/recordAddModal'
import RecordController from '@/controller/record'
import {Formatter, NICECOLORS} from '@/Ycontants'
import RecordAddModal from '@/components/recordAddModal'
import {DeleteFilled, EditFilled} from '@ant-design/icons'
import dayjs from 'dayjs'
import {ColumnsType} from 'antd/es/table'
import CountModal from './components/CountModal'

interface DataType {
  _id: any
  startTime: Date
  date: string
  endTime: Date
  duration: number
  student: any
  createdAt: Date
  modifyAt: Date
  isDelete: boolean
}

const calWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row-reverse',
  padding: '10px 30px 10px 0',
}

const RecordPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const lesson: any = useRef(null)
  const {RangePicker} = DatePicker
  const [realmResults, steRealmResults] = useState<any>()
  const [form] = Form.useForm()

  useEffect(() => {
    RecordController.select().then((realmResults) => {
      steRealmResults(realmResults)
    })
  }, [])

  // 查询
  const handleQuery = async () => {
    try {
      setCurrent(1)  // 页码设为第一页
      const values = form.getFieldsValue()
      const {dateRange, name} = values
      let resultRealm = await RecordController.select()
      if (name) {
        resultRealm = resultRealm?.filtered(`student.name CONTAINS '${name}'`)
      }
      if (dateRange && dateRange[0]) {
        resultRealm = resultRealm?.filtered(`date >= '${dateRange[0].format(Formatter.day)}'`)
      }
      if (dateRange && dateRange[1]) {
        resultRealm = resultRealm?.filtered(`date <= '${dateRange[1].format(Formatter.day)}'`)
      }
      resultRealm = resultRealm?.sorted('startTime')
      //按照开始时间排序
      steRealmResults(resultRealm)
    } catch (e) {
      message.error('查询失败，请联系管理员')
      console.log(e)
    }
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '姓名',
      dataIndex: 'student',
      align: 'center',
      render: (_: any, record: any) => {
        return record.student?.name
      },
    },
    {
      title: '日期',
      align: 'center',
      dataIndex: 'date',
    },
    {
      title: '开始时间',
      align: 'center',
      dataIndex: 'startTime',
      render: (_: Date) => {
        return dayjs(_).format(Formatter.time)
      },
    },

    {
      title: '结束时间',
      align: 'center',
      dataIndex: 'endTime',
      render: (_: Date) => {
        return dayjs(_).format(Formatter.time)
      },
    },
    {
      title: '时长',
      align: 'center',
      dataIndex: 'duration',
    },
    {
      title: '创建时间',
      align: 'center',
      dataIndex: 'createdAt',
      render: (_: any) => {
        return dayjs(_).format(Formatter.day)
      },
    },
    {
      title: '操作',
      align: 'center',
      key: 'action',
      render: (_: any, record: any) => {
        return (
          <Space size="middle">
            <RecordAddModal data={record}>
              <EditFilled className={NICECOLORS}/>
            </RecordAddModal>
            <DeleteFilled
              className={NICECOLORS}
              onClick={() => {
                handleDel(record)
              }}
            />
          </Space>
        )
      },
    },
  ]

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const selectedRowKeysMap = useRef<Set<string>>(new Set())
  const selectedRowsMap = useRef<Map<string, DataType>>(new Map())

  const rowSelection = {
    selectedRowKeys,
    onChange: () => {
      setSelectedRowKeys(Array.from(selectedRowKeysMap.current))
    },
    onSelect: (
      record: DataType,
      selected: boolean,
    ) => {
      if (selected) {
        selectedRowKeysMap.current.add(record._id)
        selectedRowsMap.current.set(record._id, record)
      } else {
        selectedRowKeysMap.current.delete(record._id)
        selectedRowsMap.current.delete(record._id)
      }
    },
    onSelectAll: (
      selected: boolean,
      selectedRows: DataType[],
      changeRows: DataType[]
    ) => {
      if (selected) {
        changeRows.forEach((record) => {
          selectedRowKeysMap.current.add(record._id)
          selectedRowsMap.current.set(record._id, record)
        })
      } else {
        changeRows.forEach((record) => {
          selectedRowKeysMap.current.delete(record._id)
          selectedRowsMap.current.delete(record._id)
        })
      }
    },
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
      await RecordController.delete([lesson.current._id])
      message.success('删除成功')
      // 更新日历
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      message.error('删除失败，请联系管理员')
    }
  }

  const [current, setCurrent] = useState<number>(1)
  const [total, setTotal] = useState<number>(500)
  const [pageSize, setPageSize] = useState<number>(10)

  const Pagination = {
    showSizeChanger: true,
    current: current,
    total: total,
    pageSize: pageSize,
    pageSizeOptions: [10, 20, 50],
    onChange: (page: number, newpageSize: number) => {
      if (newpageSize !== pageSize) {
        // 改变每页尺寸
        setCurrent(1)
        setPageSize(newpageSize)
        return
      }
      setCurrent(page)
    },
  }

  useEffect(() => {
    // 移除之前的所有监听
    realmResults?.removeAllListeners()
    // 添加新的监听
    realmResults?.addListener((collection: any) => {
      // 分页取数据
      setTotal(collection.length)
      const start = (current - 1) * pageSize
      const end = Math.min(start + pageSize, collection.length)
      const res = collection.slice(start, end)

      const r: any = []
      res.map((item: any, index: number) => {
        if (!r[index]) {
          r[index] = {}
        }
        r[index]['_id'] = item['_id']
        r[index]['startTime'] = item['startTime']
        r[index]['date'] = item['date']
        r[index]['endTime'] = item['endTime']
        r[index]['duration'] = item['duration']
        r[index]['student'] = item['student']
        r[index]['createdAt'] = item['createdAt']
        r[index]['modifyAt'] = item['modifyAt']
        r[index]['isDelete'] = item['isDelete']
      })
      setDataSource(r)
    })
  }, [realmResults, current, total, pageSize])

  return (
    <div style={{padding: "0 15px"}}>
      <Form
        name="basic"
        layout="inline"
        form={form}
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
        initialValues={{remember: true}}
        autoComplete="off"
      >
        <Space>
          <Form.Item label="姓名" name="name">
            <Input/>
          </Form.Item>

          <Form.Item label="日期" name="dateRange">
            <RangePicker/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleQuery}>
              查询
            </Button>
          </Form.Item>

          <Form.Item>
            <RecordAdd/>
          </Form.Item>
        </Space>
      </Form>
      {/*<Divider />*/}

      <div style={calWrap}>
        <CountModal dataSource={selectedRowsMap.current}></CountModal>
      </div>

      <Table
        columns={columns}
        bordered
        rowSelection={rowSelection}
        pagination={Pagination}
        rowKey="_id"
        dataSource={dataSource}
      />

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
    </div>
  )
}

export default RecordPage
