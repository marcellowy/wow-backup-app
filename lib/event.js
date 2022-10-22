const {FileUpload} = require('./upload')
const directory = require('./directory')
const {OpenChooseDirectoryDialog} = require('./dialog')
const defined = require('./defined');
const store = require('./store')
const backup = require('./backup')

let mainWindow = null;

// 获取游戏目录
async function GetGameDirectory(event, game) {
    return directory.GetGameDirectory(game)
}

// 设置游戏目录
async function SetGameDirectory(event, game, path) {
    directory.SetGameDirectory(game, path)
}

// 选择游戏目录
async function ChooseDirectory(event, game) {
    let path = await OpenChooseDirectoryDialog()
    if (path == "") return // 用户取消了
    directory.SetGameDirectory(game, path)
    return {code: 0, data: {path: path}}
}

// 扫描目录下的文件并统计出size
async function ScanDirectory(event, game) {
    console.log("进行目录扫描,进行大小计算...")
    if (game == defined.GAME_REMINI) {
        console.log("加载怀旧服目录大小")
        let data = directory.GetReminiBackupDirectorySize()
        // console.log("结果:", data)
        return {code: 0, data: data}
    }
    throw '不支持的游戏'
}

// 打包目录
async function CompressBackup(event, game, flag) {
    console.log("开始打包备份")
    if ( game == defined.GAME_REMINI) {
        directory.CompressReminiDirectory(flag, (err, stdout, stderr, file) => {
            // 由于打包是一个耗时操作,此处结束后异步通知渲染层
            // console.log("打包结束")
            let code  = 0, message = "打包成功"
            if (err != null) {
                code = 255
                message = "打包压缩失败"
            }
            mainWindow.webContents.send('backup-compress', {
                code: code,
                message: message,
                file: file
            })
        })
    } else {
        throw '不支持的游戏'
    }
}

// 上传备份
async function UploadBackup(event, game, file) {
    
        console.log("开始上传文件:", file)
        await FileUpload(game, file, () => {
            // 上传完成
            console.log("上传完成")
            mainWindow.webContents.send('backup-upload', {
                code: 0,
                message: "上传成功"
            })
        })
    try {
    } catch(e) {
        // 上传出错
        console.log(e)
    }
    mainWindow.webContents.send("backup-upload", {
        code: 1
    })
}

// 恢复备份
async function RecoverBackup(event, data) {
    try{
        console.log("开始恢复备份")
        await backup.RecoverBackup(data, (err, stdout, stderr) => {
            console.log("恢复备份结束")
            if (err == null) {
                console.log("恢复备份成功")
                mainWindow.webContents.send("backup-unzip", {
                    code: 0
                })
            }
        })
        return
    } catch(e) {
        console.log("恢复备份发生了意外")
        console.log(e)
    }
    console.log("恢复备份失败")
    mainWindow.webContents.send("backup-unzip", {
        code: 1
    })
}

// 返回Store内容给渲染层
async function GetLocalConfig(event) {
    return store.Get()
}

function SetMainWindow(w) {
    mainWindow = w;
}

module.exports = {
    GetGameDirectory,
    SetGameDirectory,
    ChooseDirectory,
    ScanDirectory,
    CompressBackup,
    UploadBackup,
    GetLocalConfig,
    SetMainWindow,
    RecoverBackup
}

