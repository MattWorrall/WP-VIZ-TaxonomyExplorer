/**
 * Defines the structure of the bound data.
 *
 * @date 2018-11-27
 * @export
 * @interface IInputConfig
 */
export interface IInputConfig {
  /**
   * The field in the data that contains the unique ID for a node.
   *
   * @type {string}
   * @memberof IInputConfig
   */
  idField: string;
  
  /**
   * The field in the data that contains the visual label for the node.
   *
   * @type {string}
   * @memberof IInputConfig
   */
  labelField: string;
  
  /**
   * The field in the data that contains the bound value of the node.
   *
   * @type {string}
   * @memberof IInputConfig
   */
  valueField: string;
}