/**
 * Defines a generic configuration for a dimension.
 *
 * @date 2018-11-27
 * @export
 * @interface IDimensionConfig
 */
export interface IDimensionConfig {
  /**
   * The minimum value for the dimension.
   *
   * @type {number}
   * @memberof IDimensionConfig
   */
  min: number;
  
  /**
   * The maximum value for the dimension.
   *
   * @type {number}
   * @memberof IDimensionConfig
   */
  max: number;
}