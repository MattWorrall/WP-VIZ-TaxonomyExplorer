/**
 * Defines the configuration of the tooltips shown for the nodes in the visualisation.
 * 
 * The tooltips are generated using the d3-tip library; see https://github.com/Caged/d3-tip.
 *
 * @date 2018-11-27
 * @export
 * @interface ITipConfig
 */
export interface ITipConfig {
  /**
   * Specifies whether tooltips are enabled.
   *
   * @type {boolean}
   * @memberof ITipConfig
   */
  enabled: boolean;
  
  /**
   * Specifies the formatting function for the tooltip.
   *
   * @type {*}
   * @memberof ITipConfig
   */
  formatFunction?: any;
}