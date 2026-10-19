# Grok Bot 能力与可接入面调研

> 调研对象：Grok Bot macOS 桌面版 `0.71.2`（`com.anysphere.sand`，产品名 “Grok Bot desktop agent”）。
>
> 方法：只读检查 `Grok Bot.app/Contents/Resources/app.asar` 中的 `dist` 代码与 `Info.plist`，没有读取账号、聊天、凭证或用户数据目录。版本更新后结论可能变化。
>
> 这份文档是调研与路线图，**不是本插件的运行时依赖**。本插件（dsh-grok-xai）不调用 Grok Bot。

## 结论

Grok Bot 是一个完整的桌面 Agent 平台，但**没有公开的本地 API/CLI**：

- 包内没有 `bin`；
- 主进程没有启动本地 HTTP server；
- 存在 `sand-dev` 控制端口（默认 `62150`），但只在未打包开发模式启用，生产包关闭；
- 页面与主进程通过 Electron IPC / 内部 MessagePort 通信，外部进程无法直接调用它的 Agent 或工具。

因此，能“直接接入”的面只有三个：

1. **Hooks**：Grok Bot 在 shell/MCP/文件/工具生命周期调用外部命令；
2. **Deep Link**：`grokbot://` / `sand://` 应用激活与交接；
3. **MCP**：Grok Bot 和 DSH 都是 MCP 客户端，可以共享同一批 MCP server。

其余能力更适合“移植成 DSH 插件”，而不是“调用 Grok Bot”。

## 身份与运行形态

| 项 | 值 |
|---|---|
| Bundle ID | `com.anysphere.sand` |
| 产品名 | Grok Bot |
| 版本 | 0.71.2 |
| 技术栈 | Electron + Anysphere Agent 栈 |
| URL Scheme | `grokbot://`、`sand://` |
| 桌面辅助 | `Grok Bot Computer Use.app`（`co.anysphere.grok-bot-computer-use`） |
| 数据根 | 应用私有目录；本文不读取、不依赖 |

从依赖和工具枚举可以看到它包含：本地 shell/文件、计算机控制、浏览器 Cookie 导入与安全填充、MCP、邮件/日历、iMessage、Slack/Teams、会议/电话、文档/Canvas、记忆/技能/例行任务、子 Agent、插件市场、1Password/虚拟卡等。

## 可直接接入的三个面

### 1. Hooks

Grok Bot 支持类似 Cursor/Claude Code 的生命周期 hooks。代码中可见的事件包括：

- `beforeShellExecution` / `afterShellExecution`
- `beforeMCPExecution` / `afterMCPExecution`
- `beforeReadFile` / `afterFileEdit`
- `beforeTabFileRead` / `afterTabFileEdit`
- `beforeSubmitPrompt`
- `afterAgentResponse` / `afterAgentThought`
- `preToolUse` / `postToolUse` / `postToolUseFailure`
- `sessionStart` / `sessionEnd`
- `subagentStart` / `subagentStop`
- `preCompact`
- `stop`
- `workspaceOpen`

Hook 返回值支持：

- `permission`: `allow` / `deny` / `ask`
- `user_message` / `agent_message`
- `continue`
- `additional_context`

**DSH 侧可做**：一个本地 `/grok-bot/hook` 接收端点，把事件记入 DSH 的审计/用量面板；也可以反过来做 Grok Bot 的策略层（拒绝危险 shell/MCP 调用、注入上下文）。这是投入最小、最直接的集成面。

### 2. Deep Link

已注册的 scheme：`grokbot://`、`sand://`。代码中可见的深链动作包括：

- `open-url`
- `switch-model`
- `start-fresh`
- `roll-back`
- `dashboard-action`
- `buy-credits`

**DSH 侧可做**：在会话/交付物上增加“在 Grok Bot 中打开”动作，做任务交接。没有发现“发送 prompt”的深链参数，因此不能把深链当成 Agent API。

### 3. MCP

Grok Bot 是 MCP **客户端**，支持添加、认证、重启、卸载 MCP server，并有连接器目录。代码中可见的服务器/域名包括：

- Google Workspace：Gmail、Drive、Calendar、Docs、Sheets、Slides（`*mcp.googleapis.com`）
- Slack（`mcp.slack.com`）、Notion（`mcp.notion.com`）、HubSpot
- GitHub、GitLab、Bitbucket、Azure DevOps、SharePoint
- Cloudflare、Linear、Jira、Confluence、Dropbox、Box、OneDrive
- 1Password

**DSH 侧可做**：用 DSH 的 `mcp-resources` 连接同一批 MCP server。注意：

- 不能复用 Grok Bot 的 OAuth token；DSH 要自己完成 OAuth。
- 部分连接器是 Anysphere/Cursor 私有 MCP，不一定对外可用；Google Workspace、Slack、Notion 等标准 MCP 更适合先接。
- Grok Bot 的 `grokbot://mcp/oauth/callback` 是它自己的 OAuth 回调，不是通用 API。

## 可移植的能力清单

| 优先级 | 能力 | Grok Bot 中的证据 | 建议的 DSH 实现 |
|---|---|---|---|
| P0 | 邮件/日历/云盘 | Gmail/Drive/Calendar/Docs/Sheets/Slides 连接器 | 新增 Google Workspace MCP bundle + OAuth |
| P0 | 团队协作 | Slack/Teams/Notion/HubSpot/Linear/Jira | MCP server 或原生工具 |
| P1 | 代码托管 | GitHub/GitLab/Bitbucket/Azure DevOps/SharePoint | GitHub/GitLab MCP 或 `gh`/`glab` 工具 |
| P1 | iMessage | `SendIMessage`、`SearchIMessages`、`FindIMessageChats`、`FetchIMessageAttachment` | macOS Messages 工具（AppleScript/IMCore） |
| P1 | 本机电脑操作 | `Computer`、`Read`、`Screenshot`、`Shell`、`AwaitShell`；Computer Use helper | DSH `computerUse` 服务 + macOS provider |
| P2 | 会议/电话 | `JoinMeeting`、`ReadMeetingTranscript`、`GetMeetingSummary`、`place_phone_call` | xAI Realtime Voice + 日历/会议 API |
| P2 | 记忆/技能/例行任务 | `RecallMemory`、`UpdateMemory`、`ProposeSkills`、`UpdateRoutine` | DSH memory 插件 + skill/goal/schedule |
| P3 | 凭证/1Password/虚拟卡 | `ListCredentials`、`FillCredential`、`RequestOnePasswordConnect` | 1Password Connect provider；虚拟卡不建议 |
| P3 | Canvas/文档 | `EditCanvas`、`ReadDocument`、`WriteDocument` | DSH deliverables/sidebar 扩展 |
| 不建议 | 插件市场 | Cursor 插件格式 + marketplace | 与 Cordis bundle 不兼容 |

## 不建议做的事

- **不要读取 Grok Bot 的凭证/token 文件**来复用登录态；这是私有格式，跨应用使用不稳定也不安全。
- **不要依赖 `sand-dev` RPC**（`agentsList`、`agentsCreate`、`deepLinkEmit` 等）；它是开发/内部通道，生产包关闭。
- **不要直接复用 Cursor 插件**；运行模型不同。
- **不要复用 Computer Use helper 的私有 IPC**；如需该能力，在 DSH 侧实现自己的 provider。
- **不要把 Grok Bot 的 OAuth 连接器 token 导入 DSH**；让每个应用各自完成 OAuth。

## 推荐落地顺序

1. **Hook Bridge**：DSH 暴露 `/grok-bot/hook`，配置 Grok Bot hooks 指向它；先做审计/用量/审批。
2. **MCP 连接器预设**：先 Google Workspace（Gmail/Drive/Calendar）+ Slack。
3. **Deep Link 交接**：DSH 加“在 Grok Bot 中打开”动作。
4. **iMessage + macOS Computer Use**：差异能力，需要原生权限和独立 helper。

## 与本插件的关系

本插件只负责 xAI 订阅登录、Grok 模型、用量和价格，不调用 Grok Bot。上面的 Hook Bridge 和 MCP 连接器预设是后续可选的独立插件方向。
