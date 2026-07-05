/**
 * 结局定义（内容即数据）。结局画面展示 title + lines；由 `ending` StoryStep 引用 endingId。
 * M5 先做 1 个「纵向切片」结局（集齐两部天书触发）；多结局矩阵见 STORY_BIBLE，后续扩充。
 */
export interface EndingDef {
  id: string;
  title: string;
  lines: string[];
}

export const ENDINGS: Record<string, EndingDef> = {
  "jianghu-chucheng": {
    id: "jianghu-chucheng",
    title: "结局 · 江湖初程",
    lines: [
      "你已集齐《射雕》与《鸳鸯刀》两部天书，",
      "在这方武侠世界里初露锋芒。",
      "十四天书尚有十二部散落江湖，",
      "更广阔的中原正等你去闯荡……",
      "",
      "——「江湖初程」一段落，江湖路远，后会有期。",
    ],
  },
};
