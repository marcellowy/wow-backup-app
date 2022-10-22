// 打开app,检查登录状态
// 根据不同的状态,显示不同的界面
const ElectronStore = require('electron-store')
const {Post} = require('./http')
const store = require('./store')

const {LOGINED_USER_ID_KEY, LOGINED_NICKNAME_KEY, LOGINED_TOKEN_KEY} = require('./defined')

async function LoadCheckLogin(event) {
    let info = GetLoginInfo()
    // console.log( info);
    if (info.userId != "" && info.token != "") {
        // 已登录
        return info
    } else {
        // 未登录
        return false
    }
}

// 获取已登录的信息
function GetLoginInfo() {
    return {
        userId: store.Get().login.user_id,
        token: store.Get().login.token,
        nickname: store.Get().login.nickname,
    }
}

// 登录操作
async function Login(event, data) {
    const ret = await Post("/api/user/login", data, null)
    // 写进store
    if(ret.code == 0)  {
        // 后端返回成功 
        let data = store.Get()
        {
            data.login.user_id = ret.data.user_id
            data.login.token = ret.data.token
            data.login.nickname = ret.data.nickname
        }
        store.Set(data)
    }
    return ret
}

// 注销操作
async function Logout(event) {
    let data = store.Get()
    data.login = {
        user_id: "",
        token: "",
        nickname: ""
    }
    store.Set(data)
}

module.exports = {
    LoadCheckLogin,
    GetLoginInfo,
    Login,
    Logout
}