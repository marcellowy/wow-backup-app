const store = require('./store')
const fs = require('fs')
const {BrowserWindow} = require('electron')

// 获取怀旧服大脚版本
function GetReminiBigFootVersion() {
    let file = store.Get().game_directory.remini.backup.addons.full_path + "/BigFoot/Version.cn.lua"
    if(!fs.existsSync(file)) return null; // 没有安装大脚
    let content = fs.readFileSync(file)
    // 正则提取大脚版本
    // if GetLocale()~='zhCN' then return end
    // local main= "3.4.0."
    // local minor = "171"
    // BIGFOOT_VERSION = "zhCN"..main..minor;

    let v1 = /local[\s]{0,}main[\s]{0,}=[\s]{0,}\"([0-9\.]{1,})\"/.exec(content)
    let v2 = /local[\s]{0,}minor[\s]{0,}=[\s]{0,}\"([0-9\.]{1,})\"/.exec(content)
    // delete v1['index']
    // delete v1['input']
    // delete v1['groups']
    // delete v2['index']
    // delete v2['input']
    // delete v2['groups']
    // console.log( v1)
    // console.log( v2)
    if(v1.length > 1 && v2.length > 1)
        return v1[1] + v2[1]
    return null
}

// 仅提取内容
function getContent(file) {
    // 提取内容
    let content = fs.readFileSync(file)
    // 正则提取版本
    return /https\:\/\/wow.bfupdate.178.com\/BigFoot\/Interface\/classic\/Interface.(.*?).zip/.exec(content)
}

// 获取在线大脚版本
async function GetReminiOnlineBigFootVersion(url) {
    const file = '/tmp/nga_remini.html'
    // if(fs.existsSync(file)) {
    //     return new Promise((resolve, reject) => {
    //         let result = getContent(file)
    //         // console.log( result[0], result[1])
    //         if(result.length > 1) {
    //             // result[0] // 完整路径
    //             // result[1] // 版本
    //             resolve( {code: 0, newUrl: result[0], newVersion: result[1], currentVersion: ""} )
    //         } else {
    //             // 获取版本失败
    //             reject( {code: 1, message: "获取新版本失败"})
    //         }
    //     })
    // }
    return new Promise( (resolve, reject) => {
        let w = new BrowserWindow();
        w.loadURL(url)
        w.webContents.on('did-finish-load', (event,a) => {
            // https://wow.bfupdate.178.com/BigFoot/Interface/classic/Interface.3.4.0.171.zip
            w.webContents.savePage(file, 'HTMLComplete').then(() => {
                console.log('Page was saved successfully.')
                w.close()
                let result = getContent(file)
                if(result.length > 1) {
                    // result[0] // 完整路径
                    // result[1] // 版本
                    resolve( {code: 0, newUrl: result[0], newVersion: result[1], currentVersion: ""} )
                } else {
                    // 获取版本失败
                    reject( {code: 1, message: "获取新版本失败"})
                }
            }).catch(err => {
                w.close()
            })
        })
    })
}

module.exports = {
    GetReminiBigFootVersion,
    GetReminiOnlineBigFootVersion
}