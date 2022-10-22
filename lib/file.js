// 创建备份压缩文件名
function CreateBackupFilename() {
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime/10);
    return 'backup-' + timestamp + '.7z'
}

module.exports = {
    CreateBackupFilename
}