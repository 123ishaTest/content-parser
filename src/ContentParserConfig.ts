export interface ContentParserConfig {
  /**
   * The root folder
   */
  path: string;

  debug: boolean;

  /**
   * The global key that all content must have
   */
  idKey: string;
}
