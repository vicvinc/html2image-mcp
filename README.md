# HTML2Image MCP Server v2.1.0

🖼️ **为AI智能体提供强大的HTML转图片和网页截图能力**

[![npm version](https://badge.fury.io/js/html2image-mcp.svg)](https://badge.fury.io/js/html2image-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 📑 目录

- [🚀 简介](#-简介)
- [🎯 核心功能](#-核心功能)
- [📦 安装和使用](#-安装和使用)
- [🔧 AI 智能体集成](#-ai-智能体集成)
- [🛠️ 工具详情](#️-工具详情)
- [🎨 使用示例](#-使用示例)
- [🏗️ 项目结构](#️-项目结构)
- [⚙️ 配置选项](#️-配置选项)
- [🔍 API 文档](#-api-文档)
- [🚨 故障排除](#-故障排除)
- [📊 性能优化](#-性能优化)
- [🔗 相关链接](#-相关链接)

## 🚀 简介

HTML2Image MCP Server 是一个基于 Model Context Protocol (MCP) 的服务器，为 AI 智能体提供强大的图像生成和网页截图功能。支持 HTML 转图片、网页截图等功能。

✨ **主要特性**：
- 🎨 HTML 转高质量图片
- 📸 网页截图和元素捕获
- 🔌 标准 MCP 协议支持
- 🛡️ 完善的参数验证和错误处理
- ⚡ 高性能浏览器管理
- 📁 绝对文件路径返回
- 🔗 MCP ResourceLink 格式支持

## 🎯 核心功能

### 1. HTML转图片 (`convert_html_to_image`)
将任意 HTML 内容转换为高质量图片，支持自定义样式、尺寸和格式。

**适用场景**：
- 社交媒体图片制作
- 营销物料生成
- 教程图表创建
- 产品展示设计
- 数据可视化

### 2. HTML文件转图片 (`convert_html_file_to_image`)
将 HTML 文件转换为图片，支持相对路径解析和自定义输出路径。

**适用场景**：
- 静态网页截图
- 报告生成
- 批量图片处理
- 文档转换

### 3. 网页截图 (`capture_screenshot`)
捕获任意网页的截图，支持全页面或特定元素捕获。

**适用场景**：
- 网站分析和存档
- 设计参考收集
- 竞品分析
- 内容监控
- 自动化测试

## 📦 安装和使用

### 安装依赖
```bash
npm install
```

### 启动服务器

**统一MCP服务器** (推荐)：
```bash
npm run mcp:unified
```

**分离模式** (HTTP + MCP)：
```bash
# 启动HTTP服务器
npm run start:http

# 启动MCP包装器
npm run mcp
```

**开发模式** (自动重启)：
```bash
npm run dev
```

## 🔧 AI 智能体集成

### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加：

**统一版本配置**：
```json
{
  "mcpServers": {
    "html2image": {
      "command": "node",
      "args": ["/path/to/html2image-mcp/mcp-server.js"],
      "env": {
        "OUTPUT_DIR": "./generated-images",
        "HEADLESS": "true"
      }
    }
  }
}
```

**分离版本配置**：
```json
{
  "mcpServers": {
    "html2image": {
      "command": "node",
      "args": ["/path/to/html2image-mcp/mcp-wrapper.js"],
      "env": {
        "HTTP_SERVER_URL": "http://localhost:3002"
      }
    }
  }
}
```

### 智能体使用示例

```
用户: 请创建一个关于"今天睡眠还不错"的图片

智能体调用: convert_html_to_image
参数: {
  "html": "<div style='background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 60px; text-align: center; border-radius: 20px; font-family: Arial;'><h1>今天睡眠还不错</h1><p>优质睡眠带来满满活力</p></div>",
  "width": 800,
  "height": 600,
  "format": "png"
}

结果: ✅ 已生成睡眠主题图片
```

## 🛠️ 工具详情

### convert_html_file_to_image
```json
{
  "name": "convert_html_file_to_image",
  "description": "Convert HTML file to an image (NEW)",
  "parameters": {
    "htmlPath": "HTML文件路径 (必需)",
    "format": "png|jpeg|webp (默认: png)",
    "width": "图片宽度 (像素)",
    "height": "图片高度 (像素)",
    "quality": "图片质量 0-100 (JPEG/WebP)",
    "outputPath": "自定义输出路径 (可选)",
    "waitUntil": "等待条件",
    "waitForSelector": "等待特定选择器",
    "omitBackground": "透明背景"
  }
}
```

### convert_html_to_image
```json
{
  "name": "convert_html_to_image",
  "description": "Convert HTML content to an image",
  "parameters": {
    "html": "HTML内容 (必需)",
    "format": "png|jpeg|webp (默认: png)",
    "width": "图片宽度 (像素)",
    "height": "图片高度 (像素)",
    "quality": "图片质量 0-100 (JPEG/WebP)",
    "outputPath": "自定义输出路径 (可选)",
    "waitUntil": "等待条件",
    "waitForSelector": "等待特定选择器",
    "omitBackground": "透明背景"
  }
}
```

### capture_screenshot
```json
{
  "name": "capture_screenshot",
  "description": "Capture a screenshot of a webpage",
  "parameters": {
    "url": "网页URL (必需)",
    "format": "png|jpeg|webp (默认: png)",
    "width": "视口宽度",
    "height": "视口高度",
    "fullPage": "全页面截图",
    "selector": "CSS选择器",
    "waitUntil": "等待条件",
    "userAgent": "自定义User-Agent",
    "auth": {"username": "用户名", "password": "密码"}
  }
}
```

## 🎨 使用示例

### 社交媒体图片
```bash
convert_html_to_image({
  "html": "<div style='background: linear-gradient(45deg, #ff6b6b, #4ecdc4); color: white; padding: 60px; text-align: center; border-radius: 20px;'><h1>🚀 新产品发布</h1><p>让AI改变你的工作方式</p></div>",
  "width": 1200,
  "height": 630,
  "format": "png"
})
```

### 教程步骤图
```bash
convert_html_to_image({
  "html": "<div style='background: #2c3e50; color: white; padding: 50px; font-family: Arial;'><h1>Step 1: 安装环境</h1><p>下载并安装Node.js...</p></div>",
  "width": 800,
  "height": 600,
  "format": "png"
})
```

### 网站截图
```bash
capture_screenshot({
  "url": "https://github.com",
  "width": 1200,
  "height": 800,
  "fullPage": false,
  "waitUntil": "networkidle2"
})
```

### 学习进度卡片
```bash
convert_html_to_image({
  "html": "<div style='background: linear-gradient(135deg, #6ee7b7, #3b82f6); color: white; padding: 80px; text-align: center; border-radius: 30px; font-family: Arial;'><h1 style='font-size: 3em; margin-bottom: 30px;'>💤 优质睡眠</h1><p style='font-size: 1.5em;'>今天睡眠质量不错，精力充沛！</p><div style='margin-top: 40px; background: rgba(255,255,255,0.2); padding: 20px; border-radius: 15px;'>🌟 睡眠质量评分: 8/10</div></div>",
  "width": 1080,
  "height": 1080,
  "format": "png"
})
```

## 🏗️ 项目结构

```
html2image-mcp/
├── mcp-server.js              # 统一MCP服务器 (推荐)
├── mcp-wrapper.js            # MCP包装器 (分离模式)
├── server.js                 # HTTP服务器 (分离模式)
├── mcp-config.json           # MCP配置文件
├── package.json              # 项目配置
├── README.md                 # 项目文档 (本文档)
├── test.html                 # 测试HTML文件
├── .gitignore                # Git忽略文件
└── generated-images/         # 输出图片目录
```

## ⚙️ 配置选项

### 环境变量
```bash
OUTPUT_DIR=./generated-images    # 图片输出目录
TIMEOUT=30000                   # 请求超时时间(ms)
MAX_IMAGE_SIZE=10485760         # 最大图片大小(10MB)
HEADLESS=true                   # 无头浏览器模式
```

### 浏览器选项
服务器使用 Puppeteer 进行图像生成，支持丰富的配置选项：
- 自定义视口大小
- 设备缩放比例
- 用户代理设置
- HTTP 头部配置
- 基础认证支持

## 🚀 绝对路径功能特性

### ✨ 返回格式增强
所有工具返回绝对文件路径，遵循 MCP ResourceLink 最佳实践：

```json
{
  "success": true,
  "data": {
    "outputPath": "/Users/vicvinc/Desktop/mcps/html-to-image-mcp/generated-images/result.png",
    "absolutePath": "/Users/vicvinc/Desktop/mcps/html-to-image-mcp/generated-images/result.png",
    "fileUri": "file:///Users/vicvinc/Desktop/mcps/html-to-image-mcp/generated-images/result.png",
    "size": 1234567,
    "format": "png"
  },
  "resourceLink": {
    "type": "resource_link",
    "uri": "file:///Users/vicvinc/Desktop/mcps/html-to-image-mcp/generated-images/result.png",
    "name": "Generated image (png)",
    "mimeType": "image/png",
    "description": "HTML to image conversion result - 1234567 bytes"
  }
}
```

### 🎯 核心优势
- **绝对路径**: 始终返回完整的文件系统路径
- **MCP 兼容**: 遵循 ResourceLink 标准格式
- **自动解析**: 相对路径自动转换为绝对路径
- **文件 URI**: 提供 `file:///` 格式的 URI 引用
- **元数据丰富**: 包含文件大小、格式、尺寸等详细信息

## 🔍 API 文档

### 健康检查 (HTTP模式)
```bash
GET /health
```

返回：
```json
{
  "status": "ok",
  "server": "html2image-mcp-server",
  "version": "2.1.0",
  "features": ["absolute-paths", "file-uris", "mcp-compliant"]
}
```

### HTTP API 端点 (分离模式)
```bash
POST /convert-html-file    # 转换HTML文件
POST /convert-html-content # 转换HTML内容
POST /capture-screenshot   # 网页截图
```

### MCP 端点 (统一模式)
```bash
# 通过 stdio 传输，支持所有 MCP 客户端
npm run mcp:unified
```

## 🚨 故障排除

### 常见问题

**1. 浏览器启动失败**
```bash
# 解决方案：安装系统依赖或使用Headless模式
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

**2. 权限错误**
```bash
# 确保输出目录有写入权限
chmod 755 ./generated-images
```

**3. 内存不足**
```bash
# 增加Node.js内存限制
node --max-old-space-size=4096 mcp-server-unified.js
```

**4. MCP连接问题**
```bash
# 检查MCP配置
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 测试MCP服务器
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server-unified.js
```

### 调试技巧
- 使用 `dev` 命令启用自动重启
- 检查服务器日志输出
- 验证 HTML 语法正确性
- 测试简化的 HTML 内容

## 📊 性能优化

### 建议
- 合理设置图片尺寸，避免过大的图片
- 使用 `waitUntil` 参数确保内容完全加载
- 批量处理时考虑并发限制
- 定期清理生成的图片文件

### 最佳实践
- 为不同平台优化图片尺寸
- 使用适当的图片格式平衡质量和大小
- 实施错误重试机制
- 监控资源使用情况

## 🔗 相关链接

### 核心文档
- [Model Context Protocol 官网](https://modelcontextprotocol.io/)
- [MCP 规范文档](https://modelcontextprotocol.io/specification/latest)
- [Puppeteer 文档](https://pptr.dev/)

### 使用示例
- [Claude Desktop MCP 集成](https://docs.anthropic.com/claude/docs/mcp)

### 开发资源
- [MCP SDK 文档](https://modelcontextprotocol.io/docs/sdk/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - 为AI应用提供标准化协议
- [Puppeteer](https://pptr.dev/) - 强大的浏览器自动化工具
- [Zod](https://zod.dev/) - TypeScript优先的模式验证

## ⚡ 快速开始

想要立即体验？只需几个简单步骤：

### 1️⃣ 安装
```bash
git clone https://github.com/your-org/html2image-mcp.git
cd html2image-mcp
npm install
```

### 2️⃣ 启动服务器
```bash
# 统一模式 (推荐)
npm run mcp:unified

# 或分离模式
npm run start:http
npm run mcp
```

### 3️⃣ 配置AI客户端
将服务器添加到您的AI客户端配置中，即可开始使用！

---

🚀 **开始使用：** `npm install && npm run mcp:unified`

💡 **提示**：统一模式提供最简单的部署方案，一个文件包含所有功能！