const HTTP_HOST = "https://api-wow.wyi.hk"
const HTTP_HOST_BACKUP1 = HTTP_HOST
const HTTP_HOST_BACKUP2 = HTTP_HOST
const HTTP_HOST_BACKUP3 = HTTP_HOST

// 游戏类别
const GAME_ANCIENT = "game_ancient"
const GAME_REMINI = "game_remini"
const GAME_FORMAL = "game_formal"

// 默认使用的host
const DEFAULT_HTTP_HOST = HTTP_HOST;
const DEFAULT_HTTP_HOST_STORE_KEY = "http_host";

// Store key
const STORE_KEY = "wow_store_data"

const GAME_REMINI_DIRECTORY_FONTS = "Fonts"
const GAME_REMINI_DIRECTORY_FONTS_FLAG = 2;
const GAME_REMINI_DIRECTORY_ADDONS = "Interface/AddOns"
const GAME_REMINI_DIRECTORY_ADDONS_FLAG = 4;
const GAME_REMINI_DIRECTORY_ACCOUNT = "WTF/Account"
const GAME_REMINI_DIRECTORY_ACCOUNT_FLAG = 8;

// store 初始化存储结构
let StoreData = {
    default_game: GAME_REMINI,
    game_directory: {
        ancient: "",
        remini: {
            path: "",       // 游戏目录
            backup_path: "Backup", // 本地备份目录
            backup_full_path: "",  // 本地备份目录完整路径
            backup: {
                font: {
                    name: "字体",
                    flag: GAME_REMINI_DIRECTORY_FONTS_FLAG,
                    path: GAME_REMINI_DIRECTORY_FONTS,
                    full_path: ""
                },
                addons: {
                    name: "插件",
                    flag: GAME_REMINI_DIRECTORY_ADDONS_FLAG,
                    path: GAME_REMINI_DIRECTORY_ADDONS,
                    full_path: ""
                },
                account: {
                    name: "帐号配置",
                    flag: GAME_REMINI_DIRECTORY_ACCOUNT_FLAG,
                    path: GAME_REMINI_DIRECTORY_ACCOUNT,
                    full_path: ""
                }
            } // 需要备份的目录
        },
        formal: "",
    },
    login: {
        user_id: "",
        token: "",
        nickname: ""
    }
};

module.exports = {
    HTTP_HOST, HTTP_HOST_BACKUP1, HTTP_HOST_BACKUP2, HTTP_HOST_BACKUP3,
    GAME_ANCIENT, GAME_REMINI, GAME_FORMAL,
    DEFAULT_HTTP_HOST, DEFAULT_HTTP_HOST_STORE_KEY,
    StoreData,
    GAME_REMINI_DIRECTORY_FONTS,
    GAME_REMINI_DIRECTORY_FONTS_FLAG,
    GAME_REMINI_DIRECTORY_ADDONS,
    GAME_REMINI_DIRECTORY_ADDONS_FLAG,
    GAME_REMINI_DIRECTORY_ACCOUNT,
    GAME_REMINI_DIRECTORY_ACCOUNT_FLAG
}