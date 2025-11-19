# HTML2Image MCP Server

🖼️ **为AI智能体提供HTML转图片和网页截图功能的MCP服务器**

[![npm version](https://badge.fury.io/js/html2image-mcp.svg)](https://badge.fury.io/js/html2image-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

基于 Model Context Protocol (MCP) 的服务器，为 Claude、ChatGPT 等 AI 智能体提供强大的 HTML 转图片和网页截图功能。

## ✨ 特性

- 🎨 **HTML 转图片** - 将任意 HTML 内容转换为高质量图片
- 📸 **网页截图** - 捕获任意网页的截图
- 📦 **单文件解决方案** - 一个文件包含所有功能，无需额外服务器
- 🚀 **零配置部署** - 开箱即用，支持环境变量配置
- 📁 **绝对路径返回** - 遵循 MCP ResourceLink 标准
- 🛡️ **完善的错误处理** - 参数验证和异常处理
- ⚡ **高性能** - 基于 Puppeteer 的浏览器自动化

## 🚀 快速开始

### 安装

```bash
npm install html2image-mcp
```

### 基本使用

```bash
# 克隆项目
git clone https://github.com/vicvinc/html2image-mcp.git
cd html2image-mcp

# 安装依赖
npm install

# 启动 MCP 服务器
npm run mcp:unified
```

### Claude Desktop 配置

在 Claude Desktop 配置文件中添加：

```json
{
  "mcpServers": {
    "html2image": {
      "command": "node",
      "args": ["/path/to/html2image-mcp/mcp-server.js"],
      "env": {
        "OUTPUT_DIR": "./generated-images",
        "TIMEOUT": "30000",
        "HEADLESS": "true"
      }
    }
  }
}
```

## 🛠️ 工具

### 1. convert_html_to_image

将 HTML 内容转换为图片

**参数：**
- `html` (必需) - HTML 内容
- `format` - 图片格式：`png`|`jpeg`|`webp` (默认：png)
- `width`、`height` - 图片尺寸
- `outputPath` - 自定义输出路径
- `quality` - 图片质量 0-100 (JPEG/WebP)
- `omitBackground` - 透明背景

### 2. convert_html_file_to_image

将 HTML 文件转换为图片

**参数：**
- `htmlPath` (必需) - HTML 文件路径
- `format` - 图片格式：`png`|`jpeg`|`webp`
- `width`、`height` - 图片尺寸
- `outputPath` - 自定义输出路径
- `quality` - 图片质量 0-100

### 3. capture_screenshot

网页截图

**参数：**
- `url` (必需) - 网页 URL
- `format` - 图片格式：`png`|`jpeg`|`webp`
- `width`、`height` - 视口尺寸
- `fullPage` - 全页面截图
- `selector` - CSS 选择器截图
- `auth` - 认证信息 {username, password}

## 📁 项目结构

```
html2image-mcp/
├── mcp-server.js              # 主 MCP 服务器 (推荐)
├── mcp-wrapper.js            # MCP 包装器
├── server.js                 # HTTP 服务器
├── simple-api-server.js      # 简化 API 服务器
├── package.json              # 项目配置
├── README.md                 # 项目文档
├── LICENSE                   # MIT 许可证
├── .gitignore                # Git 忽略文件
├── .mcp.json                 # MCP 本地配置
├── mcp-config.json           # MCP 服务器配置
├── .vscode/                  # VS Code 配置
├── .claude/                  # Claude 配置
├── html/                     # HTML 示例文件
├── docs/                     # 文档
└── generated-images/         # 输出目录
```

## ⚙️ 配置

### 环境变量

```bash
OUTPUT_DIR=./generated-images    # 图片输出目录
TIMEOUT=30000                   # 超时时间(ms)
MAX_IMAGE_SIZE=10485760         # 最大图片大小(10MB)
HEADLESS=true                   # 无头浏览器模式
```

### 配置文件

**.mcp.json**
```json
{
  "outputDir": "./generated-images",
  "timeout": 30000,
  "maxImageSize": 10485760,
  "headless": true
}
```

**mcp-config.json**
```json
{
  "name": "html2image-mcp-server",
  "version": "2.0.0",
  "description": "HTML-to-Image MCP server with tools for AI agents"
}
```

## 🎯 使用示例

### 社交媒体图片

```javascript
convert_html_to_image({
  "html": "<div style='background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 60px; text-align: center; border-radius: 20px;'><h1>🚀 新产品发布</h1><p>让AI改变你的工作方式</p></div>",
  "width": 1200,
  "height": 630,
  "format": "png"
})
```

### 网站截图

```javascript
capture_screenshot({
  "url": "https://github.com",
  "width": 1200,
  "height": 800,
  "fullPage": false
})
```

### 学习进度卡片

```javascript
convert_html_to_image({
  "html": "<div style='background: linear-gradient(135deg, #6ee7b7, #3b82f6); color: white; padding: 80px; text-align: center; border-radius: 30px; font-family: Arial;'><h1 style='font-size: 3em; margin-bottom: 30px;'>💤 优质睡眠</h1><p style='font-size: 1.5em;'>今天睡眠质量不错，精力充沛！</p><div style='margin-top: 40px; background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px;'>🌟 睡眠质量评分: 8/10</div></div>",
  "width": 1080,
  "height": 1080,
  "format": "png"
})
```

## 📋 返回格式

所有工具返回 MCP ResourceLink 格式的绝对路径：

```json
{
  "success": true,
  "data": {
    "outputPath": "/path/to/generated-images/result.png",
    "absolutePath": "/path/to/generated-images/result.png",
    "fileUri": "file:///path/to/generated-images/result.png",
    "size": 1234567,
    "format": "png"
  },
  "resourceLink": {
    "type": "resource_link",
    "uri": "file:///path/to/generated-images/result.png",
    "name": "Generated image (png)",
    "mimeType": "image/png",
    "description": "HTML to image conversion result - 1234567 bytes"
  }
}
```

## 🔧 启动模式

### 统一模式 (推荐)
```bash
npm run mcp:unified
```

### 分离模式
```bash
npm run start:http  # 启动 HTTP 服务器
npm run mcp         # 启动 MCP 包装器
```

### 开发模式
```bash
npm run dev  # 自动重启开发服务器
```

## 🚨 故障排除

### 常见问题

**浏览器启动失败**
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

**权限错误**
```bash
chmod 755 ./generated-images
```

**内存不足**
```bash
node --max-old-space-size=4096 mcp-server.js
```

**MCP 连接问题**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server.js
```

## 🔗 相关链接

- **GitHub**: https://github.com/vicvinc/html2image-mcp
- **NPM**: https://www.npmjs.com/package/html2image-mcp
- **MCP 官网**: https://modelcontextprotocol.io/
- **Puppeteer 文档**: https://pptr.dev/
- **Claude MCP 集成**: https://docs.anthropic.com/claude/docs/mcp

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

🚀 **开始使用：** `npm install && npm run mcp:unified`

💡 **提示：** 统一模式提供最简单的部署方案，一个文件包含所有功能！