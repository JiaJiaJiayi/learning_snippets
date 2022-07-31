export interface Props {
  /**
   * 相关标题
   */
  relatedTitle?: string;
  /**
   * 话题名
   */
  title: string;
  /**
   * 「话题名」图标
   */
  titleIcon?: string;
  /**
   * 「话题名」图标位置
   * @defaultValue after
   */
  titleIconPosition?: "before" | "after";
  /**
   * 话题图片
   */
  icon: string;
  /**
   * 话题描述文本
   */
  description: string[];
  /**
   * 话题描述文本样式
   * @defaultValue text
   */
  descriptionType?: "text" | "tag";
  /**
   * 话题描述文本分割符
   * @defaultValue split
   */
  descriptionSplit?: "none" | "split";
  /**
   * 话题跳转 schema
   */
  openSchema: string;

  /**
   * @ignore
   */
  log_data?: Record<string, unknown>;
}
