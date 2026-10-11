# 全球访问计数服务

这个 Cloudflare Worker 根据访问请求的国家代码，将每次网页加载计入中国、美国、日本、新加坡、英国、德国、法国或“其他地区”。它不会保存原始 IP。

## 部署

下面的命令都在 `cloudflare-counter` 目录执行。

1. 登录 Cloudflare：

   ```bash
   npx wrangler@latest login
   ```

2. 部署免费 Worker：

   ```bash
   npx wrangler@latest deploy
   ```

3. 复制命令最后给出的 `https://...workers.dev` 地址，不要附加 `/api/visit`。

4. 回到网站根目录的 `index.html`，把下面这行的空 `content` 改为 Worker 地址：

   ```html
   <meta name="visitor-counter-endpoint" content="https://你的地址.workers.dev" />
   ```

5. 本地预览网站，确认计数成功后再提交并推送到 GitHub。

如果网站以后换成自定义域名，需要把 `wrangler.jsonc` 中 `ALLOWED_ORIGINS` 改为新网站的来源地址后重新部署。多个来源用英文逗号分隔。

## 本地检查

纯逻辑测试不需要安装依赖：

```bash
node --test test/counter-data.test.js
```

Worker 本地运行：

```bash
npx wrangler@latest dev
```
