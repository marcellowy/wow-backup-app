const fs = require('fs')
const {Post} = require('./http')
const FormData = require('form-data')
const {Blob} = require('buffer')
const md5File = require('md5-file')
const common = require('./common')
// 上传文件
async function FileUpload(game, file, cb) {
    let stats = fs.statSync(file)
    if (stats == undefined) {
        console.log(file + " error")
        return
    }
    const filename = common.GetFilenameFromDirectory(file)
    const chunkSize = 20 * 1024 * 1024 // 分片大小
    const size = stats.size // 文件大小
    const pieces = Math.ceil(size / chunkSize) // 分片数量
    const hash = md5File.sync(file) // 文件md5
    console.log("hash:", hash)

    // 请求服务器获取是否已经有部分切片上传
    serverPiecesCount = 0; // @TODO: 实现获取服务器上的切片数
    
    let current = 0;
    let currentPieces = 1;

    if(serverPiecesCount > 0) {
        // 服务器已有分片
    }

    recursionUpload(file, current, currentPieces, size, chunkSize, async (cp, data) => {
        // 上传文件
        let formData = new FormData();
        formData.append("file", data, filename)
        formData.append("total", pieces) // 总的分片数
        formData.append("index", cp) // 当前分片
        formData.append("hash", hash) // 文件md5
        formData.append("size", size) // 文件总大小
        formData.append("game", game) // 当前备份所属游戏
        
        let ret = await Post('/api/backup/upload', formData, {})
        if (ret.code != 0) {
            console.log( ret)
            // 上传失败了
            throw '有分片上传失败'
        }
    }, cb)
}

// 递归上传分片
// cb1 上传文件回调
// cb2 全部上传完成回调
async function recursionUpload(file, current, currentPieces, fileSize, chunkSize, cb1,  cb2) {
    if( current > fileSize) {
        console.log("读取结束")
        await cb2()
        return
    }
    // console.log(current, current + chunkSize, fileSize)

    let content = []
    let readStream = fs.createReadStream(file, { start: current, end: current + chunkSize })

    // 读取数据
    readStream.on('data', (data) => {
        content.push(data)
    })

    // 数据读取完成
    readStream.on('end', async () => {
        await cb1(currentPieces, Buffer.concat(content))
        // 上传文件完成
        currentPieces++
        current += chunkSize +1 // createReadStream start and use [0, ] model
        recursionUpload(file, current, currentPieces, fileSize, chunkSize, cb1, cb2)
    })

    // 出错
    readStream.on('error', (err) => {
        console.log(err)
        throw err
    })
}

module.exports = {
    FileUpload,
}