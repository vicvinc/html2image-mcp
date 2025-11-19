/**
 * HTML2Image Unified MCP Server - 单文件完整MCP服务
 * 集成HTML转图片功能和MCP协议的完整解决方案
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { z } from 'zod';

/**
 * 配置
 */
const CONFIG = {
  name: "html2image-mcp",
  version: "2.1.0",
  outputDir: process.env.OUTPUT_DIR || './generated-images',
  defaultTimeout: parseInt(process.env.TIMEOUT) || 30000,
  maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE) || 10 * 1024 * 1024, // 10MB
  browserOptions: {
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
};

/**
 * Zod Schemas for validation
 */
const ConvertHTMLFileSchema = z.object({
  htmlPath: z.string().min(1, 'HTML file path is required'),
  outputPath: z.string().optional(),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  quality: z.number().min(0).max(100).default(80),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fullPage: z.boolean().default(false),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).default('networkidle2'),
  waitForSelector: z.string().optional(),
  omitBackground: z.boolean().default(false)
});

const ConvertHTMLContentSchema = z.object({
  html: z.string().min(1, 'HTML content is required').max(10_000_000, 'HTML content too large'),
  outputPath: z.string().optional(),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  quality: z.number().min(0).max(100).default(80),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fullPage: z.boolean().default(false),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).default('networkidle2'),
  waitForSelector: z.string().optional(),
  omitBackground: z.boolean().default(false)
});

const ScreenshotSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  outputPath: z.string().optional(),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  quality: z.number().min(0).max(100).default(80),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  fullPage: z.boolean().default(false),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).default('networkidle2'),
  waitForSelector: z.string().optional(),
  omitBackground: z.boolean().default(false),
  selector: z.string().optional(),
  userAgent: z.string().optional(),
  headers: z.record(z.string()).optional(),
  auth: z.object({
    username: z.string(),
    password: z.string()
  }).optional()
});

/**
 * Browser Management
 */
class BrowserManager {
  constructor() {
    this.browser = null;
    this.initializing = false;
  }

  async getBrowser() {
    if (this.browser) {
      return this.browser;
    }

    if (this.initializing) {
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.browser;
    }

    this.initializing = true;
    try {
      this.browser = await puppeteer.launch(CONFIG.browserOptions);
      console.error('🚀 Browser started successfully');
      return this.browser;
    } catch (error) {
      this.initializing = false;
      throw new Error(`Failed to start browser: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.error('🔌 Browser closed');
    }
  }
}

/**
 * HTML2Image Conversion Class
 */
class HTML2ImageConverter {
  static async convertHTMLFile(htmlPath, options) {
    const browserManager = new BrowserManager();
    const browser = await browserManager.getBrowser();
    const page = await browser.newPage();

    try {
      // Read HTML file
      const htmlContent = await fs.readFile(htmlPath, 'utf-8');

      // Set viewport
      if (options.width && options.height) {
        await page.setViewport({
          width: options.width,
          height: options.height,
          deviceScaleFactor: 2
        });
      }

      // Set HTML content with base URL for resolving relative paths
      const baseUrl = `file://${path.dirname(path.resolve(htmlPath))}/`;
      await page.setContent(htmlContent, {
        waitUntil: options.waitUntil,
        timeout: CONFIG.defaultTimeout
      });

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 5000
        });
      }

      // Configure screenshot options
      const screenshotOptions = {
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined,
        fullPage: options.fullPage,
        omitBackground: options.omitBackground
      };

      // Take screenshot
      const buffer = await page.screenshot(screenshotOptions);

      // Generate output path if not provided
      const outputPath = options.outputPath || await this.generateOutputPath(options.format, 'html-file');

      // Ensure output directory exists
      await this.ensureDirectoryExists(path.dirname(outputPath));

      // Save image
      await fs.writeFile(outputPath, buffer);

      // Get absolute path
      const absolutePath = path.resolve(outputPath);

      return {
        success: true,
        outputPath: absolutePath,
        absolutePath: absolutePath,
        size: buffer.length,
        format: options.format,
        htmlPath: path.resolve(htmlPath),
        dimensions: { width: options.width, height: options.height },
        fileUri: `file://${absolutePath}` // MCP-compliant URI format
      };

    } finally {
      await page.close();
    }
  }

  static async convertHTMLContent(html, options) {
    const browserManager = new BrowserManager();
    const browser = await browserManager.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport
      if (options.width && options.height) {
        await page.setViewport({
          width: options.width,
          height: options.height,
          deviceScaleFactor: 2
        });
      }

      // Set HTML content
      await page.setContent(html, {
        waitUntil: options.waitUntil,
        timeout: CONFIG.defaultTimeout
      });

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 5000
        });
      }

      // Configure screenshot options
      const screenshotOptions = {
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined,
        fullPage: options.fullPage,
        omitBackground: options.omitBackground
      };

      // Take screenshot
      const buffer = await page.screenshot(screenshotOptions);

      // Generate output path if not provided
      const outputPath = options.outputPath || await this.generateOutputPath(options.format, 'html-content');

      // Ensure output directory exists
      await this.ensureDirectoryExists(path.dirname(outputPath));

      // Save image
      await fs.writeFile(outputPath, buffer);

      // Get absolute path
      const absolutePath = path.resolve(outputPath);

      return {
        success: true,
        outputPath: absolutePath,
        absolutePath: absolutePath,
        size: buffer.length,
        format: options.format,
        dimensions: { width: options.width, height: options.height },
        fileUri: `file://${absolutePath}` // MCP-compliant URI format
      };

    } finally {
      await page.close();
    }
  }

  static async captureScreenshot(url, options) {
    const browserManager = new BrowserManager();
    const browser = await browserManager.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport
      if (options.width && options.height) {
        await page.setViewport({
          width: options.width,
          height: options.height,
          deviceScaleFactor: 2
        });
      }

      // Set user agent if provided
      if (options.userAgent) {
        await page.setUserAgent(options.userAgent);
      }

      // Set headers if provided
      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      // Set authentication if provided
      if (options.auth) {
        await page.authenticate(options.auth);
      }

      // Navigate to URL
      await page.goto(url, {
        waitUntil: options.waitUntil,
        timeout: CONFIG.defaultTimeout
      });

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 5000
        });
      }

      // Configure screenshot options
      const screenshotOptions = {
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined,
        fullPage: options.fullPage,
        omitBackground: options.omitBackground
      };

      // Handle element-specific screenshot
      if (options.selector) {
        const element = await page.$(options.selector);
        if (element) {
          screenshotOptions.clip = await element.boundingBox();
        }
      }

      // Take screenshot
      const buffer = await page.screenshot(screenshotOptions);

      // Generate output path if not provided
      const outputPath = options.outputPath || await this.generateOutputPath(options.format, 'screenshot');

      // Ensure output directory exists
      await this.ensureDirectoryExists(path.dirname(outputPath));

      // Save image
      await fs.writeFile(outputPath, buffer);

      // Get absolute path
      const absolutePath = path.resolve(outputPath);

      return {
        success: true,
        outputPath: absolutePath,
        absolutePath: absolutePath,
        size: buffer.length,
        format: options.format,
        url: url,
        dimensions: screenshotOptions.clip || { width: options.width, height: options.height },
        fileUri: `file://${absolutePath}` // MCP-compliant URI format
      };

    } finally {
      await page.close();
    }
  }

  static async generateOutputPath(format, prefix) {
    const timestamp = Date.now();
    const filename = `${prefix}_${timestamp}.${format}`;
    return path.join(CONFIG.outputDir, filename);
  }

  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

/**
 * 创建MCP服务器实例
 */
const server = new Server(
  {
    name: CONFIG.name,
    version: CONFIG.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 工具列表定义
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "convert_html_file_to_image",
        description: "Convert HTML file to an image with absolute path return",
        inputSchema: {
          type: "object",
          properties: {
            htmlPath: {
              type: "string",
              description: "Path to the HTML file to convert"
            },
            outputPath: {
              type: "string",
              description: "Custom output path for the generated image (optional)"
            },
            format: {
              type: "string",
              enum: ["png", "jpeg", "webp"],
              description: "Image format",
              default: "png"
            },
            width: {
              type: "number",
              description: "Image width in pixels"
            },
            height: {
              type: "number",
              description: "Image height in pixels"
            },
            quality: {
              type: "number",
              description: "Image quality 0-100 (for JPEG/WebP)",
              default: 80
            },
            fullPage: {
              type: "boolean",
              description: "Capture full page",
              default: false
            },
            waitUntil: {
              type: "string",
              enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
              description: "Wait condition",
              default: "networkidle2"
            },
            waitForSelector: {
              type: "string",
              description: "CSS selector to wait for before capture"
            },
            omitBackground: {
              type: "boolean",
              description: "Make background transparent",
              default: false
            }
          },
          required: ["htmlPath"]
        }
      },
      {
        name: "convert_html_to_image",
        description: "Convert HTML content to an image with absolute path return",
        inputSchema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "HTML content to convert"
            },
            outputPath: {
              type: "string",
              description: "Custom output path for the generated image (optional)"
            },
            format: {
              type: "string",
              enum: ["png", "jpeg", "webp"],
              description: "Image format",
              default: "png"
            },
            width: {
              type: "number",
              description: "Image width in pixels"
            },
            height: {
              type: "number",
              description: "Image height in pixels"
            },
            quality: {
              type: "number",
              description: "Image quality 0-100 (for JPEG/WebP)",
              default: 80
            },
            fullPage: {
              type: "boolean",
              description: "Capture full page",
              default: false
            },
            waitUntil: {
              type: "string",
              enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
              description: "Wait condition",
              default: "networkidle2"
            },
            waitForSelector: {
              type: "string",
              description: "CSS selector to wait for before capture"
            },
            omitBackground: {
              type: "boolean",
              description: "Make background transparent",
              default: false
            }
          },
          required: ["html"]
        }
      },
      {
        name: "capture_screenshot",
        description: "Capture a screenshot of a webpage with absolute path return",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the webpage to capture"
            },
            outputPath: {
              type: "string",
              description: "Custom output path for the generated image (optional)"
            },
            format: {
              type: "string",
              enum: ["png", "jpeg", "webp"],
              description: "Image format",
              default: "png"
            },
            width: {
              type: "number",
              description: "Viewport width in pixels"
            },
            height: {
              type: "number",
              description: "Viewport height in pixels"
            },
            quality: {
              type: "number",
              description: "Image quality 0-100 (for JPEG/WebP)",
              default: 80
            },
            fullPage: {
              type: "boolean",
              description: "Capture full page",
              default: false
            },
            waitUntil: {
              type: "string",
              enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
              description: "Wait condition",
              default: "networkidle2"
            },
            waitForSelector: {
              type: "string",
              description: "CSS selector to wait for before capture"
            },
            omitBackground: {
              type: "boolean",
              description: "Make background transparent",
              default: false
            },
            selector: {
              type: "string",
              description: "CSS selector for element to capture"
            },
            userAgent: {
              type: "string",
              description: "Custom user agent"
            },
            headers: {
              type: "object",
              description: "Custom HTTP headers"
            },
            auth: {
              type: "object",
              properties: {
                username: { type: "string" },
                password: { type: "string" }
              },
              description: "Basic authentication credentials"
            }
          },
          required: ["url"]
        }
      }
    ]
  };
});

/**
 * 工具调用处理
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    let toolName;

    switch (name) {
      case "convert_html_file_to_image":
        const validatedFileArgs = ConvertHTMLFileSchema.parse(args);
        result = await HTML2ImageConverter.convertHTMLFile(validatedFileArgs.htmlPath, validatedFileArgs);
        toolName = "HTML file conversion";
        break;

      case "convert_html_to_image":
        const validatedContentArgs = ConvertHTMLContentSchema.parse(args);
        result = await HTML2ImageConverter.convertHTMLContent(validatedContentArgs.html, validatedContentArgs);
        toolName = "HTML content conversion";
        break;

      case "capture_screenshot":
        const validatedScreenshotArgs = ScreenshotSchema.parse(args);
        result = await HTML2ImageConverter.captureScreenshot(validatedScreenshotArgs.url, validatedScreenshotArgs);
        toolName = "Webpage screenshot";
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // 格式化响应为MCP ResourceLink格式
    const response = {
      success: true,
      data: result,
      message: `${toolName} completed successfully`,
      resourceLink: {
        type: 'resource_link',
        uri: result.fileUri,
        name: `Generated image (${result.format})`,
        mimeType: `image/${result.format}`,
        description: `${toolName} result - ${result.size} bytes`,
        metadata: {
          absolutePath: result.absolutePath,
          size: result.size,
          format: result.format,
          dimensions: result.dimensions,
          tool: toolName,
          timestamp: new Date().toISOString()
        }
      }
    };

    // 返回MCP格式的响应
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2)
        }
      ]
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          }
        ],
        isError: true
      };
    }

    console.error(`Error in tool ${name}:`, error);

    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * 启动MCP服务器
 */
async function main() {
  console.error(`🚀 Starting ${CONFIG.name} v${CONFIG.version} (Unified)`);
  console.error(`📁 Output directory: ${path.resolve(CONFIG.outputDir)}`);

  // Ensure output directory exists
  await HTML2ImageConverter.ensureDirectoryExists(CONFIG.outputDir);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`✅ ${CONFIG.name} Unified MCP server running on stdio`);
  console.error(`🛠️ Available tools: convert_html_file_to_image, convert_html_to_image, capture_screenshot`);
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 优雅关闭
const browserManager = new BrowserManager();

process.on('SIGINT', async () => {
  console.error('\n🛑 Shutting down HTML2Image MCP Unified Server...');
  await browserManager.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\n🛑 Shutting down HTML2Image MCP Unified Server...');
  await browserManager.cleanup();
  process.exit(0);
});

// 启动服务器
main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
