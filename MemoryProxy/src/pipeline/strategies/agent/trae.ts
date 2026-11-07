/**
 * Trae / Trae CN / Doubao AgentStrategy。
 *
 * 三家客户端均按通用 OpenAI Chat Completions 接入。身份优先由请求头预选
 * （`x-team-id` / `x-agent-id` / `x-task-id`）；缺失时走 session-init 表单：
 *   - `body.tools` 声明 `AskUserQuestion` → 卡片表单（client plan-item 交互）
 *   - 未声明 → 纯文字表单（session/workbuddy/text-form.ts）
 *
 * 实际生效的分流在 `session/codebuddy/init.ts`（`isHeaderOnlyAgent` 已不再
 * 包含三家）+ `session/index.ts` 的 AskUserQuestion 重渲染分支，本文件字段
 * 为契约对齐。
 */

import { doubaoAdapter, traeAdapter, traeCnAdapter } from "../../../agent-adapters/trae.js";
import { STAGE_PRESETS, type AgentStrategy } from "./types.js";

export const traeStrategy: AgentStrategy = {
  ...traeAdapter,
  supportsSessionForm: true,
  bypassOnPresetFail: false,
  stageGates: STAGE_PRESETS.full,
};

export const traeCnStrategy: AgentStrategy = {
  ...traeCnAdapter,
  supportsSessionForm: true,
  bypassOnPresetFail: false,
  stageGates: STAGE_PRESETS.full,
};

export const doubaoStrategy: AgentStrategy = {
  ...doubaoAdapter,
  supportsSessionForm: true,
  bypassOnPresetFail: false,
  stageGates: STAGE_PRESETS.full,
};
