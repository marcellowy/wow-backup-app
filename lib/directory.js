const {app} = require('electron')
const defined = require('./defined')
const store = require('./store')
const fs = require('fs')
const lfile = require('./file')
const {exec} = require('child_process')
const {Get7ZName} = require('./common')

// GetGameDirectory 获取游戏目录 
function GetGameDirectory(game) {
    if (game == defined.GAME_ANCIENT) {
        return store.Get().game_directory.ancient.path
    } else if (game == defined.GAME_FORMAL) {
        return store.Get().game_directory.formal.path
    } else if (game == defined.GAME_REMINI) {
        return store.Get().game_directory.remini.path
    }
}

// SetGameDirectory 设置游戏目录
// 设置游戏目录的同时,插件目录,字体目录,帐号目录应该都同时设置好
function SetGameDirectory(game, path) {
    let data = store.Get()
    if (game == defined.GAME_ANCIENT) {
        data.game_directory.ancient.path = path
    } else if (game == defined.GAME_FORMAL) {
        data.game_directory.formal.path = path
    } else if (game == defined.GAME_REMINI) {
        data.game_directory.remini.path = path
        data.game_directory.remini.backup_full_path = path + "/" + data.game_directory.remini.backup_path
        data.game_directory.remini.backup.font.full_path = path + "/" + data.game_directory.remini.backup.font.path
        data.game_directory.remini.backup.addons.full_path = path + "/" + data.game_directory.remini.backup.addons.path
        data.game_directory.remini.backup.account.full_path = path + "/" + data.game_directory.remini.backup.account.path
    } else {
        throw "game error"
    }
    store.Set(data)
}

// GetGameBackupDirectory 获取游戏备份目录
function GetGameBackupDirectory(game) {
    if (game == defined.GAME_ANCIENT) {
        return store.Get().game_directory.ancient.backup_dir
    } else if (game == defined.GAME_FORMAL) {
        return store.Get().game_directory.formal.backup_dir
    } else if (game == defined.GAME_REMINI) {
        return store.Get().game_directory.remini.backup_dir
    } else {
        throw "game error"
    }
}

// SetGameBackupDirectory 设置游戏目录
function SetGameBackupDirectory(game, path) {
    let data = store.Get()
    if (game == defined.GAME_ANCIENT) {
        data.game_directory.ancient.backup_dir = path
    } else if (game == defined.GAME_FORMAL) {
        data.game_directory.formal.backup_dir = path
    } else if (game == defined.GAME_REMINI) {
        data.game_directory.remini.backup_dir = path
    } else {
        throw "game error"
    }
    store.Set(data)
}

// 获取传入目录大小
function GetDirectorySize(path) {
    let files, size = 0

    if(!fs.existsSync(path) ) return size   // 目录不存在

    try {
        files = fs.readdirSync(path)
    } catch(e) {
        // 如果目录不存在就会报错
        console.log(e.message)
        return size
    }

    files.forEach( (el) => {
        let filePath = path + "/" + el
        const states = fs.statSync(filePath)
        if(states.isDirectory()) {
            size += GetDirectorySize(filePath)
        } else {
            size += states.size
        }
    })
    return size
}

// 获取怀旧服目录大小
function GetReminiBackupDirectorySize() {
    let data = {
        font: {size: 0},
        addons: {size: 0},
        account: {size: 0}
    }
    data.font.size = GetDirectorySize(store.Get().game_directory.remini.backup.font.full_path)
    data.addons.size = GetDirectorySize(store.Get().game_directory.remini.backup.addons.full_path)
    data.account.size = GetDirectorySize(store.Get().game_directory.remini.backup.account.full_path)
    return data
}

// 压缩打包怀旧服目录,使用7z
// 返回打包后的路径
async function CompressReminiDirectory(flag, callback) {

    // 备份完整目录
    let gameDirectory = store.Get().game_directory.remini.path
    // 文件名
    let filename = lfile.CreateBackupFilename()
    // 完整备份文件带目录
    let file = store.Get().game_directory.remini.backup_full_path + "/" + filename
    // 7z 命令后面的目录
    let archivePath = new Array

    if(flag & defined.GAME_REMINI_DIRECTORY_FONTS_FLAG) {
        console.log("添加字体目录")
        archivePath.push(defined.GAME_REMINI_DIRECTORY_FONTS)
    }

    if(flag & defined.GAME_REMINI_DIRECTORY_ADDONS_FLAG) {
        console.log("添加插件目录")
        archivePath.push(defined.GAME_REMINI_DIRECTORY_ADDONS)
    }

    if(flag & defined.GAME_REMINI_DIRECTORY_ACCOUNT_FLAG) {
        console.log("添加帐号目录")
        archivePath.push(defined.GAME_REMINI_DIRECTORY_ACCOUNT)
    }
    
    // 创建压缩命令
    const command = app.getAppPath() + "/bin/" + Get7ZName() + " a \""+ file + "\" " + archivePath.join(' ')
    console.log("执行打包命令:", command)
    exec(command, { cwd: gameDirectory }, (err, stdout, stderr) => {
        console.log(err)
        console.log(stdout)
        console.log(stderr)
        callback(err, stdout, stderr, file)
    })
}

module.exports = {
    GetGameDirectory,
    SetGameDirectory,
    GetGameBackupDirectory,
    SetGameBackupDirectory,
    GetDirectorySize,
    GetReminiBackupDirectorySize,
    CompressReminiDirectory
}