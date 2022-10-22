const ElectronStore = require('electron-store')
const defined = require('./defined')

let store = new ElectronStore;

function Get() {
    return store.get(defined.DEFAULT_HTTP_HOST_STORE_KEY)
}

function Set(data) {
    let store = new ElectronStore;
    store.set(defined.DEFAULT_HTTP_HOST_STORE_KEY,  data)
}

function Init() {
    let store = new ElectronStore;
    let data = store.get(defined.DEFAULT_HTTP_HOST_STORE_KEY)
    if (data == undefined) {
        console.log("初始化配置: ", defined.StoreData)
        Set(defined.StoreData)
    } else {
        console.log("当前配置:", JSON.stringify(data))
    }
}

module.exports = {
    Init,
    Get,
    Set
}