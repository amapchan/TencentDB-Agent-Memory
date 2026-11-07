/**
 * Trae / Trae CN / Doubao 客户端适配器。
 *
 * 仓库内暂无这三家客户端的抓包样本（`adapters/` 只有 opencode），因此按
 * **通用 OpenAI Chat Completions** 形态接入：
 *   - 主端点：`POST /{agent}/{spaceId}/v1/chat/completions`（同时接受不带 `/v1`）
 *   - body 与 CodeBuddy / dsh / opencode 同族：`messages[]` + SSE
 *   - 身份走 header 预选（`x-team-id` / `x-agent-id` / `x-task-id`），
 *     不弹 proxy 伪造的 ask-user tool（未抓包不猜 tool 名，避免 unknown tool 400）
 *
 * 三个客户端行为完全一致，仅 agentKind 标签不同；后续谁先抓到包，谁单独
 * 特化 classifyRequest / extractUserText 即可，不影响另外两家。
 *
 * # 两个适配点
 *   - `classifyRequest`: 保守识别 title-gen（无 tools + max_tokens≤128 +
 *     已知标题 prompt 前缀）；其余一律 main。没有抓包证据，不做更激进的分类。
 *   - `extractUserText`: 复用 `extractUserQueryText` —— 纯文本原样返回，若客户端
 *     未来塞 `<system-reminder>` / `<user_query>` wrapper 也能吃掉。
 */

import { extractUserQueryText } from "../common/user-query-extractor.js";
import { defaultAdapter } from "./default.js";
import type { AgentAdapter, AgentKind } from "./types.js";

/**
 * 已知的标题生成 prompt 前缀（来自 dsh / opencode 的抓包）。
 * Trae / Doubao 若使用相同模板即可命中；不同模板则退化为 main，不会误伤。
 */
const TITLE_PROMPT_PREFIXES = [
  "You are a title generator.",
  "Create a concise title for an AI coding-assistant session",
];

const TITLE_MAX_TOKENS_CEIL = 128;

function isTitleGenRequest(body: Record<string, unknown>): boolean {
  // 条件 1：主对话恒带 tools；无 tools 才可能是标题/压缩类辅助请求
  const tools = body.tools;
  if (Array.isArray(tools) && tools.length > 0) return false;

  // 条件 2：小 max_tokens（兼容 OpenAI 新字段 max_completion_tokens）
  const maxTokens = body.max_tokens ?? body.max_completion_tokens;
  if (typeof maxTokens !== "number" || maxTokens > TITLE_MAX_TOKENS_CEIL) return false;

  // 条件 3：首条 system prompt 命中已知标题模板
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const first = messages[0] as { role?: string; content?: unknown } | undefined;
  if (!first || first.role !== "system" || typeof first.content !== "string") return false;
  const systemPrompt = first.content;
  return TITLE_PROMPT_PREFIXES.some((prefix) => systemPrompt.startsWith(prefix));
}

function createOpenAICompatAdapter(agentKind: AgentKind): AgentAdapter {
  return {
    agentKind,

    classifyRequest(body) {
      return isTitleGenRequest(body) ? "auxiliary" : "main";
    },

    extractUserText(content) {
      const raw = typeof content === "string" ? content : defaultAdapter.extractUserText(content);
      if (!raw) return null;
      const extracted = extractUserQueryText(raw);
      return extracted.length > 0 ? extracted : null;
    },
  };
}

export const traeAdapter = createOpenAICompatAdapter("trae");
export const traeCnAdapter = createOpenAICompatAdapter("trae-cn");
export const doubaoAdapter = createOpenAICompatAdapter("doubao");
