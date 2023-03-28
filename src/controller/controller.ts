import realmPromise from '../model/index'
import dayjs from 'dayjs'

const {UUID} = Realm.BSON

export class Controller {
  protected schema
  protected realm: Realm | void = undefined
  private realmPromise = realmPromise

  constructor(schema: any) {
    this.schema = schema
    this.realmPromise.then((realm: Realm | void) => {
      this.realm = realm
    })
  }

  // objectForPrimaryKey(primaryKey: Realm.BSON.UUID) {
  //   return this.realmPromise.then((realm: Realm | void) => {
  //     return realm?.objectForPrimaryKey(this.schema?.name, primaryKey)
  //   })
  // }

  // delete(_id: Realm.BSON.UUID): Promise<void> {
  //   return this.create(
  //     {
  //       _id,
  //       isDelete: true,
  //     },
  //     'modified'
  //   )
  // }

  // deletePatch(datas: any[]): Promise<void> {
  //   return this.realmPromise.then((realm: Realm | void) => {
  //     realm?.write(() => {
  //       datas.forEach((data) => {
  //         realm.create(
  //           this.schema?.name,
  //           this._handleDefaultData(data),
  //           Realm.UpdateMode.Modified
  //         )
  //       })
  //     })
  //   })
  // }

  // 清除数据
  async clear() {
    return this.realmPromise.then((realm: Realm | void) => {
      // 获取两周前的今天
      const tag = dayjs(new Date()).subtract(2, 'week').toDate()
      const crash = realm
        ?.objects(this.schema?.name)
        .filtered('isDelete == true')
        .filtered('modifyAt < $0', tag)

      realm?.write(() => {
        realm.delete(crash)
      })
    })
  }

  // create(data: any, mode?: any): Promise<void> {
  //   const schemaName = this.schema?.name
  //
  //   return this.realmPromise.then((realm: Realm | void) => {
  //     realm?.write(() => {
  //       if (mode) {
  //         realm.create(schemaName, this._handleDefaultData(data, mode), mode)
  //       } else {
  //         realm.create(schemaName, this._handleDefaultData(data))
  //       }
  //     })
  //   })
  // }

  // createPatch(datas: any[], mode?: any) {
  //   // console.log(datas)
  //   return this.realmPromise.then((realm: Realm | void) => {
  //     realm?.write(() => {
  //       datas.forEach((data) => {
  //         mode
  //           ? realm.create(
  //             this.schema?.name,
  //             this._handleDefaultData(data),
  //             mode
  //           )
  //           : realm.create(this.schema?.name, this._handleDefaultData(data))
  //       })
  //     })
  //   })
  // }
  //
  // objects(): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
  //   return this.realmPromise.then((realm: Realm | void) => {
  //     return realm?.objects(this.schema?.name)
  //   })
  // }

  close() {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.close()
    })
  }

  // filtered(
  //   paramsString?: string
  // ): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
  //   return this.objects().then((objects) => {
  //     const res = objects?.filtered('isDelete == false')
  //     if (paramsString) {
  //       return res?.filtered(paramsString)
  //     }
  //     // 按照修改时间的先后顺序排列
  //     return res
  //   })
  // }

  // 查询，不包含已经删除的
  select(): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
    return this.realmPromise.then((realm: Realm | void) => {
      return realm?.objects(this.schema?.name).filtered('isDelete == false')
    })
  }

  selectByPrimaryKey(primaryKey: Realm.BSON.UUID) {
    return this.realmPromise.then((realm: Realm | void) => {
      return realm?.objectForPrimaryKey(this.schema?.name, primaryKey)
    })
  }

  // 查询，包含已经删除的
  selectAll(): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
    return this.realmPromise.then((realm: Realm | void) => {
      return realm?.objects(this.schema?.name)
    })
  }

  //  插入
  insert(lists: any[]) {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        lists.forEach((data: any) => {
          data._id = new UUID().toHexString(), //id
            data.createdAt = new Date(), //创建日期
            data.modifyAt = new Date(), //修改日期
            data.isDelete = false, // 删除标记符
            realm.create(this.schema?.name, data)
        })
      })
    }).catch(() => {
      return Promise.reject('系统开小差了')
    })
  }

  update(lists: any[]) {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        lists.forEach((data: any) => {
          data.modifyAt = new Date() //修改日期
          realm.create(this.schema?.name, data, Realm.UpdateMode.Modified)
        })
      })
    }).catch(() => {
      return Promise.reject('系统开小差了')
    })
  }

  delete(lists: Realm.BSON.UUID[]) {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        lists.forEach((id: any) => {
          // data.modifyAt = new Date() //修改日期
          // data.isDelete = true
          realm.create(this.schema?.name, {
            _id: id,
            modifyAt: new Date(),
            isDelete: true
          }, Realm.UpdateMode.Modified)
        })
      })
    }).catch(() => {
      return Promise.reject('系统开小差了')
    })
  }

  // private _handleDefaultData(data: any, mode?: any) {
  //   const defaultData = mode
  //     ? {
  //       modifyAt: new Date(), //修改日期
  //     }
  //     : {
  //       _id: new UUID().toHexString(),
  //       createdAt: new Date(),
  //       modifyAt: new Date(), //修改日期
  //       isDelete: false,
  //     }
  //
  //   return Object.assign(data, defaultData)
  // }
}
