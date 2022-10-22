const fs = require('fs')
// 公共方法

// 循环创建目录
function CreateDirectory(directory) {
    return fs.mkdirSync(directory, { recursive: true })
}

// 提取文件
function GetFilenameFromDirectory(path) {
    if(path == "") return ""
    let arr = path.split("/")
    return arr[arr.length-1] // 返回最后一个元素
}

// 返回二进制路径和名称
function Get7ZName() {
    if (process.platform == 'darwin') {
        return "darwin_7zz"
    } else if (process.platform == 'win32') {
        return "win32_7zz"
    } 
    return "linux_7zz"
}

module.exports = {
    CreateDirectory,
    GetFilenameFromDirectory,
    Get7ZName
}