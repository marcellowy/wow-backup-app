const axios = require("axios")
const { exec } = require('child_process')
const fs = require('fs')
const { app} = require('electron')
const { Get7ZName} = require('./common')

// 插件下载
// url 插件地址
// destination 保存目标
// callback 结果回调
async function DownloadBigFoot(url, destination, callback) {

    let ret = {code: 1, message: ""}
    let headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        "Host": "bbs.nga.cn",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7,zh-TW;q=0.6",
        "Accept-Encoding": "gzip, deflate"
    }
    
    if (fs.existsSync(destination)) {
        ret.code = 0
        ret.message = "文件存在"
        callback(ret)
        return
    }

    const response = await axios({ url, method: 'GET',  responseType: 'stream', headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    }})
    if (response.status != 200) {
        ret.message = "请求网络失败"
        callback(ret)
        return
    }

    // return console.log( response.data)

    const writer = fs.createWriteStream(destination)
    writer.on('finish', () => {
        ret.code = 0
        ret.message = "下载成功"
        console.log( ret.message)
        callback(ret)
    })
    writer.on('error', () => {
        ret.message = "下载失败"
        console.log( ret.message)
        callback(ret)
    })
    response.data.pipe(writer)
}

// 解压插件
// destination 解压目标
// target 解压的目录
async function Unzip(destination, target, callback) {
    let command = app.getAppPath() + "/bin/" + Get7ZName() + " -aoa x \""+ destination + "\" " 
    exec(command, {cwd: target}, callback)
}

module.exports = {
    DownloadBigFoot,
    Unzip
}