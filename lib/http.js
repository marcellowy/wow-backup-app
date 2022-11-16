const axios = require("axios")
const ElectronStore = require('electron-store')
const defined = require('./defined')
const store = require('./store')
const fs = require('fs')

// 网络联通测试
async function Test() {
    let arr = [
        defined.HTTP_HOST,
        defined.HTTP_HOST_BACKUP1,
        defined.HTTP_HOST_BACKUP2,
        defined.HTTP_HOST_BACKUP3
    ]
    for(let i=0; i<arr.length; i++) {
        let url = arr[i] + "/ping";
        console.log("url: ", url)
        
            let response = await axios({
                url: url,
                timeout: 2000,
            });
            if (response.status == 200 ) {
                let store = new ElectronStore()
                console.log("Test http response:", response.data)
                console.log("SET HTTP HOST:", arr[i])
                store.set(defined.DEFAULT_HTTP_HOST_STORE_KEY, arr[i])
                defined.DEFAULT_HTTP_HOST =  arr[i]
                return true;
            }
        try {
        } catch(e) {
            
        }
    }
    return false
}

// 发送post请求
// 使其总是返回 {code:... message:}
async function Post(path, data, header){

    // 默认加上鉴权信息
    header = {
        "wow-user-id": store.Get().login.user_id,
        "wow-token": store.Get().login.token
    }


    let url = defined.DEFAULT_HTTP_HOST + path
    
    try {    
        response = await axios({
            url: url,
            method: 'POST',
            data: data,
            responseType: 'json',
            headers: header
        })
        if (response.status == 200) return response.data
        return {code: response.status, message: response.statusText, url: url}
    } catch(e) {
        console.log( e)
        return { code: 255, message: e.message, url}
    }
}

// 下载备份文件
// rename 文件重命名,不重命名填空
// dist 文件保存到的位置
async function DownloadBackup(path, postData, header, destination) {
    // 默认加上鉴权信息
    header = {
        "wow-user-id": store.Get().login.user_id,
        "wow-token": store.Get().login.token
    }
    
    let url = defined.DEFAULT_HTTP_HOST + path
    console.log("POST " + url)

    const response = await axios({
        url,
        method: 'POST',
        data: postData,
        headers: header,
        responseType: 'stream'
    })

    // const filename = response.headers['content-disposition'].replace(/\w+;filename=\"(.*)\"/, '$1')
    const writer = fs.createWriteStream(destination)
    response.data.pipe(writer)

    return new Promise( (resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

module.exports = {
    Test,
    Post,
    DownloadBackup
}