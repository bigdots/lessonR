import realmPromise from '../model/index'
import dayjs from 'dayjs'
import { RecordObject } from '@/global'
// import { UpdateMode } from 'realm'
const { UUID } = Realm.BSON

export class Controller {
  constructor(schema: any) {
    this.schema = schema
    this.realmPromise.then((realm: Realm | void) => {
      this.realm = realm
    })
  }

  protected schema

  protected realm: Realm | void = undefined

  private realmPromise = realmPromise

  objectForPrimaryKey(promaryKey: Realm.BSON.UUID) {
    return this.realmPromise.then((realm: Realm | void) => {
      // return realm.objects(this.schema?.name)
      return realm?.objectForPrimaryKey(this.schema?.name, promaryKey)
    })
  }

  delete(_id: Realm.BSON.UUID): Promise<void> {
    return this.create(
      {
        _id,
        isDelete: true,
      },
      'modified'
    )
  }

  // 清除数据
  async clear() {
    return this.realmPromise.then((realm: Realm | void) => {
      // 获取两周前的今天
      const tag = dayjs(new Date()).subtract(2, 'week').toDate()
      const crash = realm
        ?.objects(this.schema?.name)
        .filtered('isDelete == true')
        .filtered('modifyAt < $0', tag)
      // console.log(crash.length)
      realm?.write(() => {
        realm.delete(crash)
      })
    })
  }

  create(data: any, mode?: any): Promise<void> {
    const schemaName = this.schema?.name

    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        if (mode) {
          realm.create(schemaName, this._handleDefaultData(data, mode), mode)
        } else {
          realm.create(schemaName, this._handleDefaultData(data))
        }
      })
    })
  }

  private _handleDefaultData(data: any, mode?: any) {
    const defaultData = mode
      ? {
          modifyAt: new Date(), //修改日期
        }
      : {
          _id: new UUID().toHexString(),
          createdAt: new Date(),
          modifyAt: new Date(), //修改日期
          isDelete: false,
        }

    return Object.assign(data, defaultData)
  }

  createPatch(datas: any[], mode?: any) {
    // console.log(datas)
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        datas.forEach((data) => {
          mode
            ? realm.create(
                this.schema?.name,
                this._handleDefaultData(data),
                mode
              )
            : realm.create(this.schema?.name, this._handleDefaultData(data))
        })
      })
    })
  }

  objects(): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
    return this.realmPromise.then((realm: Realm | void) => {
      return realm?.objects(this.schema?.name)
    })
  }

  close() {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.close()
    })
  }

  filtered(
    paramsString?: string
  ): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
    return this.objects().then((objects) => {
      const res = objects?.filtered('isDelete == false')
      if (paramsString) {
        return res?.filtered(paramsString)
      }

      // 按照修改时间的先后顺序排列
      return res
    })
  }

  searchSnyc(params: string) {
    if (!this.realm) {
      throw new Error('realm not open')
    }
    let tasks = this.realm
      .objects(this.schema?.name)
      .filtered('isDelete == false')
    if (params) {
      tasks = tasks.filtered(params)
    }

    return tasks
  }
}
