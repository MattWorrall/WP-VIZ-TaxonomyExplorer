/**
 * Defines the margin configuration for the visualisation.
 *
 * @date 2018-11-27
 * @export
 * @interface IMarginConfig
 */
export interface IMarginConfig {
  /**
   * The top margin.
   *
   * @type {number}
   * @memberof IMarginConfig
   */
  top: number;
  
  /**
   * The bottom margin.
   *
   * @type {number}
   * @memberof IMarginConfig
   */
  bottom: number;
  
  /**
   * The left margin.
   *
   * @type {number}
   * @memberof IMarginConfig
   */
  left: number;
  
  /**
   * The right margin.
   *
   * @type {number}
   * @memberof IMarginConfig
   */
  right: number;
}