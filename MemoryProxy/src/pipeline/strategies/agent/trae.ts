/**
 * Trae / Trae CN / Doubao AgentStrategy。
 *
 * 三家客户端均按通用 OpenAI Chat Completions 接入，且没有交互式 form UI：
 * 身份完全由请求头预选（`x-team-id` / `x-agent-id` / `x-task-id`）。
 * 因此与 pi / hermes / openclaw 同属 header-only 客户端：
 *   - `supportsSessionForm: false`
 *   - `bypassOnPresetFail: true`（preset 失败绝不弹 form，直接 bypass）
 *
 * 实际生效的 bypass 在 `session/codebuddy/init.ts` 的 `isHeaderOnlyAgent`
 * 分支（集合定义见 `session/preset.ts`），本文件字段为契约对齐。
 */

import { doubaoAdapter, traeAdapter, traeCnAdapter } from "../../../agent-adapters/trae.js";
import { STAGE_PRESETS, type AgentStrategy } from "./types.js";

export const traeStrategy: AgentStrategy = {
  ...traeAdapter,
  supportsSessionForm: false,
  bypassOnPresetFail: true,
  stageGates: STAGE_PRESETS.full,
};

export const traeCnStrategy: AgentStrategy = {
  ...traeCnAdapter,
  supportsSessionForm: false,
  bypassOnPresetFail: true,
  stageGates: STAGE_PRESETS.full,
};

export const doubaoStrategy: AgentStrategy = {
  ...doubaoAdapter,
  supportsSessionForm: false,
  bypassOnPresetFail: true,
  stageGates: STAGE_PRESETS.full,
};
