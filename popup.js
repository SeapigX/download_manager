let rules = [];

chrome.storage.sync.get('rules', (data) => {
    rules = data.rules || [];
    renderRules();
});

const rulesContainer = document.getElementById('rulesContainer');
const ruleModal = document.getElementById('ruleModal');
const modalTitle = document.getElementById('modalTitle');
const ruleForm = document.getElementById('ruleForm');
const ruleIdInput = document.getElementById('ruleId');
const ruleNameInput = document.getElementById('ruleName');
const extensionsInput = document.getElementById('extensions');
const savePathInput = document.getElementById('savePath');
const addRuleBtn = document.getElementById('addRuleBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const resetBtn = document.getElementById('resetBtn');

let currentEditId = null;

function renderRules() {
    rulesContainer.innerHTML = '';

    rules.forEach(rule => {
        const ruleElement = document.createElement('div');
        ruleElement.className = 'rule-item';
        ruleElement.innerHTML = `
            <div class="rule-name" data-label="规则名称">${rule.name}</div>
            <div class="rule-extensions" data-label="文件后缀">${rule.extensions}</div>
            <div class="rule-path" data-label="保存路径">${rule.path}</div>
            <div class="rule-actions" data-label="操作">
                <button class="action-btn edit-btn" data-id="${rule.id}">✏️</button>
                <button class="action-btn delete-btn" data-id="${rule.id}">🗑️</button>
            </div>
        `;
        rulesContainer.appendChild(ruleElement);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRule(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteRule(btn.dataset.id));
    });
}

function openAddModal() {
    modalTitle.textContent = '添加新规则';
    ruleIdInput.value = '';
    ruleNameInput.value = '';
    extensionsInput.value = '';
    savePathInput.value = '';
    currentEditId = null;
    ruleModal.style.display = 'flex';
}

function editRule(id) {
    const rule = rules.find(r => r.id == id);
    if (rule) {
        modalTitle.textContent = '编辑规则';
        ruleIdInput.value = rule.id;
        ruleNameInput.value = rule.name;
        extensionsInput.value = rule.extensions;
        savePathInput.value = rule.path;
        currentEditId = id;
        ruleModal.style.display = 'flex';
    }
}

function deleteRule(id) {
    if (confirm('确定要删除这条规则吗？')) {
        rules = rules.filter(rule => rule.id != id);
        chrome.storage.sync.set({ rules }, () => {
            renderRules();
        });
    }
}

function saveRule(e) {
    e.preventDefault();

    const name = ruleNameInput.value.trim();
    const extensions = extensionsInput.value.trim();
    const path = savePathInput.value.trim();

    if (!name || !extensions || !path) {
        alert('请填写所有字段！');
        return;
    }

    chrome.storage.sync.get('rules', (data) => {
        let currentRules = data.rules || [];

        if (currentEditId) {
            const index = currentRules.findIndex(r => r.id == currentEditId);
            if (index !== -1) {
                currentRules[index] = { id: Number(currentEditId), name, extensions, path };
            }
        } else {
            const newId = currentRules.length > 0 ? Math.max(...currentRules.map(r => r.id)) + 1 : 1;
            currentRules.push({ id: newId, name, extensions, path });
        }

        chrome.storage.sync.set({ rules: currentRules }, () => {
            rules = currentRules;
            renderRules();
            ruleModal.style.display = 'none';
        });
    });
}

function resetRules() {
    if (confirm('确定要重置所有规则吗？这将恢复为初始状态。')) {
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
            renderRules();
        });
    }
}

addRuleBtn.addEventListener('click', openAddModal);
closeModal.addEventListener('click', () => ruleModal.style.display = 'none');
cancelBtn.addEventListener('click', () => ruleModal.style.display = 'none');
ruleForm.addEventListener('submit', saveRule);
resetBtn.addEventListener('click', resetRules);

window.addEventListener('click', (e) => {
    if (e.target === ruleModal) {
        ruleModal.style.display = 'none';
    }
});
