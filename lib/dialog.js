const {dialog} = require('electron')

// 打开选择目录的Dialog
async function OpenChooseDirectoryDialog() {
    const {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if(!canceled) return filePaths[0]
    return ""
}

module.exports = {
    OpenChooseDirectoryDialog
}