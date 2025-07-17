let cachedRules = [];
let isInitialized = false;

// 扩展名提取函数
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

chrome.storage.onChanged.addListener((changes) => {
    if (changes.rules) {
        cachedRules = changes.rules.newValue || [];
    }
});

function handleDownload(item, suggest) {
    if (!isInitialized) {
        console.warn("Rules not initialized yet, using default path");
        suggest({ filename: `Others/${item.filename}` });
        return;
    }

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

// 初始化并设置监听
initializeRules().then(() => {
    chrome.downloads.onDeterminingFilename.addListener(handleDownload);
}).catch((error) => {
    console.error("Failed to initialize rules:", error);
    // 即使初始化失败也设置监听，使用默认路径
    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
        suggest({ filename: `Others/${item.filename}` });
    });
});