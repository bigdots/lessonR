import React, {useState} from 'react';
import {UploadOutlined} from '@ant-design/icons';
import {Button, Modal, Upload,} from 'antd';
import type {UploadFile, UploadProps} from 'antd/es/upload/interface';

import {read, utils} from 'xlsx';
import {Formatter} from "@/Ycontants";
import dayjs from "dayjs";
import StudentController from '@/controller/student'
import RecordController from '@/controller/record'

const {warning, success} = Modal;


const XlsxInput: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);


  const readerOnload = async (e: ProgressEvent<FileReader>) => {
    try {
      const workbook = read(e.target?.result, {type: 'binary'});
      const data: any[] = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
        defval: '',
        raw: false,
        dateNF: 'yyyy-mm-dd'
      });
      const res: any[] = []

      // console.log(data)
      //
      // return;

      const students = await StudentController.select()

      for (let r = 1; r <= data.length; r++) {
        if (r % 8 === 1 || r % 8 === 2 || r % 8 === 3) {
          // 前三行表头，不做处理
          continue;
        }
        const item: string[] = data[r - 1]
        for (let i = 0; i < item.length; i++) {
          if (i === 0) {
            continue;
          }
          if (!item[i]) {
            continue
          }

          const cIndex = item[i].indexOf('（')
          const name = cIndex >= 0 ? item[i].slice(0, cIndex) : item[i]
          const student = students?.filtered(`name == '${name}'`)

          if (student && student.length > 0) {
            // 已存在学生
            const date = dayjs(data[Math.floor(r / 8) * 8][i]).format(Formatter.day)
            const startTime = dayjs(`${date} ${item[0].split('-')[0]}`).startOf('minute')
            const endTime = dayjs(`${date} ${item[0].split('-')[1]}`).startOf('minute')
            const duration = parseFloat(endTime.diff(startTime, 'h', true).toFixed(1).toString())
            student.forEach((item: any) => {
              // console.log(item)
              res.push({
                student: item,
                startTime: startTime.toDate(),
                endTime: endTime.toDate(),
                duration,
                date,
              })
            })

          } else {
            // 不存在的学员之间跳过
            console.error(`学员${name}不存在`)
            // throw new Error('student not exist')
          }
        }
      }

      await RecordController.insert(res)
      success({
        content: '数据导入成功！',
      });
    } catch (e: any) {
      // console.error(e)
      // const content = e.message === 'student not exist' ? '请确保已在系统中创建表格中的所有学员' : '读取文件失败，请检查excel格式是否正确'
      warning({
        content: '读取文件失败，请检查excel格式是否正确'
      });
    }

  }

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      const reader = new FileReader();
      reader.onload = readerOnload
      reader.readAsBinaryString(file);
      return false;
    },
    maxCount: 1,
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    fileList,
    itemRender: () => {
      return null
    },
  };

  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined/>} type='primary'>从excel导入</Button>
      </Upload>
    </>
  );
};

export default XlsxInput;

