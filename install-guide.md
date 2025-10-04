# Node.js 安裝指南

## 🚨 **重要提示**
您的系統目前沒有安裝 Node.js，這是運行此應用程序所必需的。

## 📥 **安裝步驟**

### 1. 下載 Node.js
- 瀏覽器會自動打開 https://nodejs.org/
- 點擊綠色的 **"下載 LTS"** 按鈕（推薦穩定版本）
- 下載適合 Windows 的安裝程序

### 2. 安裝 Node.js
1. 運行下載的 `.msi` 安裝文件
2. 按照安裝向導的指示進行
3. **重要：** 確保勾選 "Add to PATH" 選項
4. 完成安裝後 **重啟電腦**

### 3. 驗證安裝
重啟後，打開 PowerShell 或命令提示符，輸入：
```bash
node --version
npm --version
```

如果顯示版本號，說明安裝成功！

## 🚀 **啟動應用程序**

安裝 Node.js 後，您可以：

### 方法 1：使用批處理文件（最簡單）
1. 雙擊 `start.bat` 文件
2. 按任意鍵繼續
3. 等待依賴安裝完成
4. 瀏覽器訪問 http://localhost:5000

### 方法 2：手動命令
在 PowerShell 中運行：
```bash
npm install
npm start
```

## 📋 **配置 Unipile API**

在啟動應用之前，請：
1. 打開 `.env` 文件
2. 將 `your_unipile_api_key_here` 替換為您的實際 API 密鑰
3. 保存文件

## ❓ **常見問題**

**Q: 安裝後仍然顯示 "無法辨識 'node'"？**
A: 請重啟電腦，確保環境變量生效。

**Q: 如何獲取 Unipile API 密鑰？**
A: 訪問 Unipile 官網註冊並獲取 API 密鑰。

**Q: 可以不安裝 Node.js 嗎？**
A: 不可以，Node.js 是運行後端服務器的必要條件。

## 📞 **需要幫助？**
如果遇到問題，請檢查：
1. Node.js 是否正確安裝
2. 是否重啟了電腦
3. PowerShell 是否以管理員身份運行