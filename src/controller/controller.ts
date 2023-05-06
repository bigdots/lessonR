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

  // 关闭数据库
  close() {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.close()
    })
  }


  // 查询，不包含已经删除的
  select(): Promise<Realm.Results<Realm.Object<unknown, never>> | undefined> {
    return this.realmPromise.then((realm: Realm | void) => {
      return realm?.objects(this.schema?.name).filtered('isDelete == false')
    })
  }

  // 根据id查询数据
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
          data._id = new UUID().toHexString(); //id
          data.createdAt = new Date(); //创建日期
          data.modifyAt = new Date(); //修改日期
          data.isDelete = false;// 删除标记符
          console.log(11, data);
          realm.create(this.schema?.name, data)
        })
      })
    }).catch((e) => {
      console.error(e)
      return Promise.reject('系统开小差了')
    })
  }

  // 更新数据
  update(lists: any[]) {
    return this.realmPromise.then((realm: Realm | void) => {
      realm?.write(() => {
        lists.forEach((data: any) => {
          data.modifyAt = new Date() //修改日期
          realm.create(this.schema?.name, data, Realm.UpdateMode.Modified)
        })
      })
    }).catch((e) => {
      console.error(e)
      return Promise.reject('系统开小差了')
    })
  }

  // 删除数据，数据的delete字段设为true
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

}
