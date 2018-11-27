/**
 * Defines the configuration for the animations that occur when interacting with the Taxonomy Explorer.
 *
 * @date 2018-11-27
 * @export
 * @interface IAnimationConfig
 */
export interface IAnimationConfig {
  /**
   * The duration (in ms) for the node expansion animation.
   *
   * @type {number}
   * @memberof IAnimationConfig
   */
  expandDuration: number;

  /**
   * The duration (in ms) for the tree move animation.
   *
   * @type {number}
   * @memberof IAnimationConfig
   */
  moveDuration: number;
}