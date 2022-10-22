/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// 常量定义
const GAME_ANCIENT = "game_ancient"
const GAME_REMINI = "game_remini"
const GAME_FORMAL = "game_formal"
    
let DEFAULT_GAME = GAME_REMINI
let DEFAULT_GAME_DIRECTORY = ""

const GAME_REMINI_DIRECTORY_FONTS_FLAG = 2
const GAME_REMINI_DIRECTORY_ADDONS_FLAG = 4
const GAME_REMINI_DIRECTORY_ACCOUNT_FLAG = 8

const DEFAULT_MODAL_TEXT = "正在处理..."
const DEFAULT_MODAL_SETTING_DIRECTORY_TEXT = "请先设置目录"

// 禁止刷新操作
function srefresh(){
    var timer = null;
    if(document.addEventListener){//chrome、firefox、IE9+
        document.addEventListener('keydown',shieldRefresh);
    }else{//IE8-
        document.attachEvent('onkeydown',shieldRefresh);
    }
    function shieldRefresh(event){
        clearTimeout(timer);
        var event = event || window.event;
        var keycode = event.keyCode || event.which;
        if(keycode == 116){
            alert('触发F5按键');
            if(event.preventDefault){//chrome、firefox、IE9+
                event.preventDefault();
            }else{//IE8-
                event.keyCode = 0;
                event.returnValue = false;
            }
            timer = setTimeout(function(){
                alert('恢复刷新');
                if(document.removeEventListener){
                    document.removeEventListener('keydown',shieldRefresh);
                }else{
                    document.detachEvent('onkeydown',shieldRefresh);
                }
            }, 3000);
        }
    }
}

// 字节转可读大小
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    //toPrecision(3) 后面保留两位小数，如1.00GB
};

// 获取dom对象
function g(el) {
    return document.getElementById(el);
}

// 显示进度modal
function showModal(s) {
    if (s == undefined) s = DEFAULT_MODAL_TEXT
    bootstrap.Modal.getOrCreateInstance(g('exampleModal')).show()
    setTimeout(() => {
        g("modalText").innerHTML = s
    }, 200);
    
}

// 隐藏进度modal
function hideModal() {
    // g("modalText").innerText = ''
    // console.log( bootstrap.Modal.getOrCreateInstance(g('exampleModal')) )
    setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(g('exampleModal')).hide()    
    }, 500);
    
}

// 会自动消失的modal
function autoModal(msg) {
    showModal(msg + " 3 秒后自动关闭...")
    setTimeout(() => {
        hideModal()
    }, 3000);
}

// 设置目录提示
function isNeedSettingDirectory() {
    if(DEFAULT_GAME_DIRECTORY == "") {
        autoModal("<span style='color: red;'>" + DEFAULT_MODAL_SETTING_DIRECTORY_TEXT + "</span>")
        return true
    }
    return false
}

// 以上是公共方法
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 执行上传命令,等待主线程结束的通知
window.electronAPI.HandleBackupUpload( (event,data) => {
    if(data.code != 0) {
        // 上传失败
        return
    }
    // 上传成功
    autoModal("上传成功")
})

// 执行压缩命令,等待主线程结束
window.electronAPI.HandleCompress((event, data) => {
    if (data.code != 0) {
        autoModal(data.message) 
        return
    } 
    // 打包成功后,就可以上传了
    g("modalText").innerText = "开始上传文件...请耐心等待,上传时间会比较长"
    window.electronAPI.UploadBackup(DEFAULT_GAME, data.file)
})

// 执行解压命令,等待主线程通知解压结果
window.electronAPI.HandleUnzip((event, ret) => {
    console.log("解压命令主线程通知", ret)
    if (ret.code == 0 ) {
        autoModal("恢复成功")
    } else {
        // 恢复出错
        autoModal("恢复失败")
    }
})

// 以上是接收主线程通知方法
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 扫描目录
function scanDirectory() {

    // 检查游戏目录
    if (isNeedSettingDirectory() ) return

    let htmlTr = ""
    showModal()
    window.electronAPI.ScanDirectory(DEFAULT_GAME).then( (ret) => {
        if(ret.data.font.size > 0) {
            htmlTr += `<tr><td>1</td><td>字体</td><td>${bytesToSize(ret.data.font.size)}</td><td>
            <input type="checkbox" id="checkboxFont"/>
            </td></tr>`
        }

        if(ret.data.addons.size > 0) { 
            htmlTr += `<tr><td>2</td><td>插件</td><td>${bytesToSize(ret.data.addons.size)}</td><td>
            <input type="checkbox" id="checkboxPlugin"/>
            </td></tr>`
        }

        if(ret.data.account.size > 0) {
            htmlTr += `<tr><td>3</td><td>帐号配置</td><td>${bytesToSize(ret.data.account.size)}</td><td>
            <input type="checkbox" id="checkboxAccount"/>
            </td></tr>`
        }

        if(htmlTr == "") return

        g("backupList").innerHTML = htmlTr
    }).catch((e)=>{
        
    }).finally(()=>{
        setTimeout(() => {
            hideModal()
            g("backupList").innerHTML = htmlTr
        }, 500);  
    })
}

// 获取目录并设置到界面上
function getGameDirectory(t){
    showModal()
    window.electronAPI.getGameDirectory(t).then((path) => {
        g("gameDirectoryInput").value = path
        updateViewConfig()
    }).catch(() => {

    }).finally(() => {
        hideModal()
    });
}

// 检查登录
async function checkLogin()     {
    const ret = await window.electronAPI.LoadCheckLogin()
    // console.log(ret)

    if (!ret || ret.userId == "") {
        // 未登录
        g("logined").style.display = "none"
        g("login").style.display = "flex"
        return
    }

    g("loginNickname").innerText = ret.nickname
    g("logined").style.display = "flex"
    g("login").style.display = "none"
}

// 显示登录框
async function checkLoginAndView() {
    const ret = await window.electronAPI.LoadCheckLogin()

    if (!ret || ret.userId == "") {
        bootstrap.Modal.getOrCreateInstance(g('loginModal')).show()
        return false
    }
    return true
}

// 更新渲染层本地配置
async function updateViewConfig() {
    const ret = await window.electronAPI.GetLocalConfig()
    console.log( ret)
    DEFAULT_GAME =  ret.default_game
    if(DEFAULT_GAME == GAME_ANCIENT) {

    } else if (DEFAULT_GAME == GAME_REMINI) {
        DEFAULT_GAME_DIRECTORY = ret.game_directory.remini.path
    } else if (DEFAULT_GAME == GAME_FORMAL) {

    }
}

window.onload = function() {
    // 初始化快捷键禁用
    srefresh()

    // 初始化目录
    setTimeout(async () => {

        await updateViewConfig()

        // 游戏框目录
        g("gameDirectoryInput").value = DEFAULT_GAME_DIRECTORY

        // 设置登录view
        await checkLogin()

        // 初始化第一个tab
        initHomeTab()
    }, 100);
}

// 选择tab home
g("nav-home-tab").addEventListener('show.bs.tab', () => {
    initHomeTab()
})

// 选择从备份恢复
g("nav-profile-tab").addEventListener('show.bs.tab', async () => {

    // 检查游戏目录
    if (isNeedSettingDirectory() ) return

    // 检查是不是有登录
    if (!await checkLoginAndView() ) return;

    showModal()

    window.electronAPI.GetBackupFromServer(DEFAULT_GAME_DIRECTORY).then((ret) => {
        let htmlTr = '';
        if(ret.code == 0 && ret.data.length >0 ) {
            // 获取数据成功 
            ret.data.forEach((el,i) => {
                htmlTr += `<tr class="backup-list-line-${el.backup_id}">
                    <td>${++i}</td>
                    <td>${el.name}</td>
                    <td>${bytesToSize(el.size)}</td>
                    <td>${el.created_at}</td>
                    <td>
                        <input type='button' class='btn btn-primary btn-sm recover-btn' value='恢复' data-id='${el.backup_id}' />
                        <input type='button' class='btn btn-danger btn-sm delete-btn' value='删除' data-id='${el.backup_id}' />
                    </td>
                    </tr>`
            })
            g('localBackupList').innerHTML = htmlTr
            document.querySelectorAll(".recover-btn").forEach((e) => {
                e.addEventListener('click', RecoverBackup)
            })
            document.querySelectorAll(".delete-btn").forEach((e) => {
                e.addEventListener('click', DeleteBackup)
            })
            return
        } else {
            htmlTr += "<tr><td colspan='5' style='text-align: center;padding: 20px 0;'>还没有备份</td></tr>"
            g('localBackupList').innerHTML = htmlTr
        }
    }).catch((e) => {
        
        
    }).finally(() => {
        hideModal()
    })
})

//  home tab初始化
function initHomeTab() {
    scanDirectory()
}

// 选择游戏目录
g("changeDir").addEventListener('click', async () => {
    console.log( DEFAULT_GAME)
    window.electronAPI.ChooseDirectory(DEFAULT_GAME).then(async (ret)=>{
        await updateViewConfig()
        g("gameDirectoryInput").value = DEFAULT_GAME_DIRECTORY
    }).catch(()=>{

    }).finally(()=>{

    })
});

// 开始备份
g("ready").addEventListener('click', async () => {

    if (isNeedSettingDirectory() ) return

    let data = {flag: 0}
    if(g("checkboxFont") && g("checkboxFont").checked) data.flag += GAME_REMINI_DIRECTORY_FONTS_FLAG
    if(g("checkboxFont") && g("checkboxPlugin").checked) data.flag += GAME_REMINI_DIRECTORY_ADDONS_FLAG
    if(g("checkboxFont") && g("checkboxAccount").checked) data.flag += GAME_REMINI_DIRECTORY_ACCOUNT_FLAG

    if(data.flag == 0) {
        autoModal("请先选择要备份的内容")
        return
    }

    if(!await checkLoginAndView()) return;
    showModal()

    // 处理结果由主线程通知，不在这里处理
    window.electronAPI.CompressBackup(DEFAULT_GAME_DIRECTORY, data.flag)
})

// 登录
g('goLogin').addEventListener('click', async () => {

    let phone = g('loginPhone').value
    let password = g('loginPassword').value

    if(phone.length != 11 || password.length < 6) {
        g('loginHelpText').innerText = "登录帐号和密码不规范"
        return
    }

    g('loginHelpText').innerText = "登录中...";
    let ret = await window.electronAPI.Login({
        phone: phone,
        password: password
    })
    g('loginHelpText').innerText = "";

    console.log( ret);
    
    if (ret.code == 0 ) {
        // 登录成功
        bootstrap.Modal.getOrCreateInstance(g('loginModal')).hide()
        await checkLogin()
        return
    }

    g('loginHelpText').innerText = ret.message;
})

// 注销操作
g("logoutBtn").addEventListener('click', async () => {
    await window.electronAPI.Logout()
    await checkLogin()
})

// 点击恢复按钮
async function RecoverBackup(){
    if (!await checkLoginAndView() ) return;
    var r=confirm("确定要恢复吗？");
	if (r==true){
		x = "确定";
	} else {
		return;
	}
    showModal("正在恢复...")

    let id = this.dataset.id;
    let ret = await window.electronAPI.RecoverBackup({
        backup_id: id
    })
    console.log("恢复执行结果", ret)
    console.log("等待最后的通知")
}

// 点击删除备份按钮
async function DeleteBackup() {

    if (!await checkLoginAndView() ) return;

    showModal()

    let id = this.dataset.id;
    let ret = await window.electronAPI.DeleteBackupFromServer({
        backup_id: id
    })

    if (ret.code == 0) {
        // 删除成功 
        document.querySelector('.backup-list-line-' + id).remove();
        hideModal()
    }
}
