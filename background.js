let cachedRules = [];
let isInitialized = false;

function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex >= 0
        ? `.${filename.slice(lastDotIndex + 1).toLowerCase().trim()}`
        : '';
}

function initializeRules() {
    return new Promise((resolve) => {
        chrome.storage.sync.get('rules', ({ rules }) => {
            if (!rules) {
                rules = [
                    { id: 1, name: "文档文件", extensions: ".doc, .docx, .txt, .pdf", path: "/Documents" },
                    { id: 2, name: "图片文件", extensions: ".jpg, .png, .jpeg, .gif, .webp", path: "/Images" },
                    { id: 3, name: "表格文件", extensions: ".xls, .xlsx, .csv", path: "/Documents/Spreadsheets" },
                    { id: 4, name: "压缩文件", extensions: ".zip, .rar, .tar, .gz, .7z", path: "/Archives" },
                    { id: 5, name: "音频文件", extensions: ".mp3, .wav, .flac, .aac", path: "/Music" },
                    { id: 6, name: "视频文件", extensions: ".mp4, .avi, .mkv, .mov", path: "/Videos" },
                    { id: 7, name: "代码文件", extensions: ".js, .py, .java, .cpp, .c", path: "/Code" },
                    { id: 8, name: "配置文件", extensions: ".json, .xml, .yaml", path: "/Config" }
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

function cleanPath(path) {
    return path.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

// 监听规则变化
chrome.storage.onChanged.addListener((changes) => {
    if (changes.rules) {
        cachedRules = changes.rules.newValue || [];
    }
});

function processDownload(item, suggest) {
    const ext = getFileExtension(item.filename);
    if (!ext) {
        suggest({ filename: `Others/${item.filename}` });
        return;
    }

    const matchedRule = cachedRules.find(rule =>
        rule.extensions
            .split(',')
            .map(e => e.trim().toLowerCase())
            .includes(ext)
    );

    const targetPath = cleanPath(matchedRule ? matchedRule.path : 'Others');
    suggest({ filename: `${targetPath}/${item.filename}` });
}

// 核心修复：重构下载处理逻辑
function handleDownload(item, suggest) {
    if (isInitialized) {
        processDownload(item, suggest);
    } else {
        // 同步返回默认路径，避免阻塞
        suggest({ filename: `Others/${item.filename}` });
        // 异步初始化以备后续下载使用
        if (!isInitialized) initializeRules();
    }
}

function setupAlarms() {
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'keepAlive') {
            console.log('Service Worker 保活唤醒');
        }
    });
}

async function initExtension() {
    try {
        await initializeRules();

        // 注册下载监听器（确保只注册一次）
        chrome.downloads.onDeterminingFilename.removeListener(handleDownload);
        chrome.downloads.onDeterminingFilename.addListener(handleDownload);

        // 设置alarm监听器
        setupAlarms();

        // 创建保活定时器
        chrome.alarms.create('keepAlive', {
            periodInMinutes: 5,
            delayInMinutes: 1  // 延迟启动避免冲突
        });
    } catch (error) {
        console.error("初始化失败:", error);
    }
}

chrome.runtime.onInstalled.addListener(initExtension);
chrome.runtime.onStartup.addListener(initExtension);

if (chrome.runtime.id) initExtension();