
const {Post, DownloadBackup} = require('./http')
const md5File = require('md5-file')
const store = require('./store')
const fs = require('fs')
const { exec } = require('child_process')
const {app} = require('electron')
const {GAME_ANCIENT,GAME_FORMAL} =  require('./defined')
const {Get7ZName} = require('./common')

// 从服务端获取备份
async function GetBackupFromServer(event, game) {
    return await Post("/api/backup/list", {})
}

// 从服务端删除备份
async function DeleteBackupFromServer(event, data) {
    return await Post("/api/backup/delete", data) 
}

// 恢复备份
// 先下载,再恢复
// 若本地已经存在,就直接恢复
async function RecoverBackup(data, callback) {
    // console.log( data)
    // 查询服务器上的备份
    let ret = await Post("/api/backup/query-by-backup-id", data)
    if (ret.code != 0) return ret

    // 判断游戏
    let backupFilePath = store.Get().game_directory.remini.backup_full_path
    let gameDirectory = store.Get().game_directory.remini.path
    if (ret.data.game == GAME_FORMAL) {
        // TODO: 其他版本的游戏
    } else if (ret.data.game == GAME_ANCIENT) {
        // TODO: 其他版本的游戏
    }

    // 与本地备份比较
    let localFile = compareLocalFile(backupFilePath, ret.data.hash)
    if (localFile == "") {
        // 本地文件不存在, 从服务器下载
        console.log("从服务器下载文件: ", data)
        
            const ret = await DownloadBackup("/api/backup/download", data, null, backupFilePath)
            console.log(ret)
        try{
        } catch(e) {
            // 下载文件失败
            return {code: 1, message: "下载文件失败"}
        }
        console.log(ret)
        console.log("文件下载完成")
    }

    // 解压
    // -aoa	Overwrite All existing files without prompt.
    // -aos	Skip extracting of existing files.
    // -aou	aUto rename extracting file (for example, name.txt will be renamed to name_1.txt).
    // -aot	auto rename existing file (for example, name.txt will be renamed to name_1.txt).
    // darwin_7zz
    const command = app.getAppPath() + "/bin/" + Get7ZName() + " -aoa x \""+ localFile + "\" " 
    console.log("执行解压命令:", command)
    exec(command, { cwd: gameDirectory }, callback)
    return {code: 0, message: ""}
}

// 比较本地文件
// path 备文件目录
function compareLocalFile(path, hash) {
    let files = ""
    
        files = fs.readdirSync(path)
    try {
    } catch(e) {
        // 如果目录不存在就会报错
        console.log(e.message)
        return ""
    }

    for (let i=0; i<files.length; i++) {
        let filePath = path + "/" + files[i]
        let newHash = md5File.sync(filePath)
        if(newHash == hash) {
            return filePath
        }
    }
    return ""
}

module.exports = {
    GetBackupFromServer,
    DeleteBackupFromServer,
    RecoverBackup
}