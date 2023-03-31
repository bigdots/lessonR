import {style} from 'typestyle'

// import { Dayjs } from 'dayjs'

export enum DAY {
  Sun,
  Mon,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
}

export const WEEK_MAP = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  0: '星期日',
}

export const TIME_LINE_MAP = {
  4: '8:00-10:00',
  5: '10:30-12:00',
  6: '13:30-15:00',
  7: '16:00-18:00',
  8: '18:30-20:30',
}

export enum STATUS {
  stop,
  keep,
}

export enum FREQUENCY {
  daily,
  weekly,
}

export enum ModalType {
  add,
  edit,
}

export enum Formatter {
  year = 'YYYY',
  month = 'YYYY/MM',
  quarter = 'YYYY/Q',
  day = 'YYYY/MM/DD',
  time = 'HH:mm',
  week = 'ww',
}

export const NICECOLORS = style({
  transition: 'all .2s',
  color: 'rgb(250, 173, 20)',
  $nest: {
    '&:hover': {
      transform: 'scale(1.2)',
      color: '#ff4d4f',
    },
  },
})

export enum DateType {
  year = 'year',
  quarter = 'quarter',
  month = 'month',
  week = 'week',
  day = 'day',
}

export const selectOptions = {
  status: [
    {
      label: '上课中',
      value: STATUS.keep,
    },
    {
      label: '已停课',
      value: STATUS.stop,
    },
  ],
  frequency: [
    {
      label: '每周',
      value: FREQUENCY.weekly,
    },
    {
      label: '每天',
      value: FREQUENCY.daily,
    },
  ],
}
