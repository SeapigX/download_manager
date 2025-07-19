// background.js (Manifest V3 Service Worker)

// 缓存的规则和状态
let cachedRules = [];
let isInitialized = false;

// 获取文件后缀
function getFileExtension(filename) {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? `.${filename.slice(idx + 1).toLowerCase().trim()}` : '';
}

// 清理路径
function cleanPath(path) {
    return path.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

// 初始化默认规则
async function initializeRules() {
    if (isInitialized) return;
    return new Promise((resolve) => {
        chrome.storage.sync.get('rules', ({ rules }) => {
            if (!rules) {
                rules = [
                    { id: 1, name: "文档文件",    extensions: ".doc,.docx,.txt,.pdf",            path: "/Documents" },
                    { id: 2, name: "图片文件",    extensions: ".jpg,.png,.jpeg,.gif,.webp",     path: "/Images" },
                    { id: 3, name: "表格文件",    extensions: ".xls,.xlsx,.csv",               path: "/Documents/Spreadsheets" },
                    { id: 4, name: "压缩文件",    extensions: ".zip,.rar,.tar,.gz,.7z",         path: "/Archives" },
                    { id: 5, name: "音频文件",    extensions: ".mp3,.wav,.flac,.aac",           path: "/Music" },
                    { id: 6, name: "视频文件",    extensions: ".mp4,.avi,.mkv,.mov",            path: "/Videos" },
                    { id: 7, name: "代码文件",    extensions: ".js,.py,.java,.cpp,.c",          path: "/Code" },
                    { id: 8, name: "配置文件",    extensions: ".json,.xml,.yaml",               path: "/Config" }
                ];
                chrome.storage.sync.set({ rules }, () => {
                    cachedRules = rules;
                    isInitialized = true;
                    resolve();
                });
            } else {
                cachedRules = rules;
                isInitialized = true;
                resolve();
            }
        });
    });
}

// 处理下载路径
function processDownload(item, suggest) {
    const ext = getFileExtension(item.filename);
    let targetDir = 'Others';
    if (ext) {
        const rule = cachedRules.find(r =>
            r.extensions.split(',').map(e => e.trim()).includes(ext)
        );
        if (rule) targetDir = cleanPath(rule.path);
    }
    suggest({ filename: `${targetDir}/${item.filename}` });
}

// 下载监听入口
function handleDownload(item, suggest) {
    if (isInitialized) {
        processDownload(item, suggest);
    } else {
        // 首次调用，先给个默认返回
        suggest({ filename: `Others/${item.filename}` });
        // 异步初始化
        initializeRules();
    }
}

// 设置定时心跳，定期唤醒 SW
function setupAlarm() {
    chrome.alarms.create('keepAlive', {
        periodInMinutes: 1,
        delayInMinutes: 1
    });
}

// 所有事件绑定放在顶层，确保 SW 每次激活时即注册
chrome.storage.onChanged.addListener(({ rules }) => {
    if (rules) {
        cachedRules = rules.newValue;
    }
});

chrome.downloads.onDeterminingFilename.addListener(handleDownload);

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        // 心跳日志，可根据需要做轻量任务
        console.log('[keepAlive] Service Worker awakened');
    }
});

// 安装/更新触发
chrome.runtime.onInstalled.addListener(async () => {
    await initializeRules();
    setupAlarm();
});

// 浏览器启动触发
chrome.runtime.onStartup.addListener(async () => {
    await initializeRules();
    setupAlarm();
});

// 如果 SW 已加载，立即初始化一次
initializeRules().then(() => {
    setupAlarm();
});