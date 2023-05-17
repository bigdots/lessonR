import React from 'react';
import {DownloadOutlined} from '@ant-design/icons';
import {Button,} from 'antd';
import {ipcRenderer} from "electron";


const XlsxExport: React.FC<{ data: any, tableMerges: any[] }> = (props) => {

  const handleExport = async () => {
    await ipcRenderer.invoke('export-excel', props.data, props.tableMerges)
  }

  return (
    <Button icon={<DownloadOutlined/>} type='primary' onClick={handleExport}>导出到excel</Button>
  );
};

export default XlsxExport;

