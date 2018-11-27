import { IAnimationConfig } from './IAnimationConfig';
import { IDimensionConfig } from './IDimensionConfig';
import { IFontConfig } from './IFontConfig';
import { IInputConfig } from './IInputConfig';
import { IMarginConfig } from './IMarginConfig';
import { ITipConfig } from './ITipConfig';

/**
 * Defines the configuration structure of the visualisation.
 *
 * @date 2018-11-27
 * @export
 * @interface ITaxonomyExplorerConfig
 */
export interface ITaxonomyExplorerConfig {
  /**
   * The locale to use when formatting values.
   *
   * @type {string}
   * @memberof ITaxonomyExplorerConfig
   */
  locale?: string;

  /**
   * The input data.
   *
   * @type {IInputConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  input?: IInputConfig;
  
  /**
   * The font configuration.
   *
   * @type {IFontConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  font?: IFontConfig;
  
  /**
   * The margins for the visualisation.
   *
   * @type {IMarginConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  margin?: IMarginConfig;
  
  /**
   * The minimum and maximum radius of the circular nodes.
   *
   * @type {IDimensionConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  circleRadius?: IDimensionConfig;
  
  /**
   * The thickness of the stroke around each node.
   *
   * @type {number}
   * @memberof ITaxonomyExplorerConfig
   */
  circleStroke?: number;
  
  /**
   * The percentage of the width to be reserved for rendering the root node and links to level 1.
   *
   * @type {number}
   * @memberof ITaxonomyExplorerConfig
   */
  rootWidth?: number;
  
  /**
   * Defines the minimum and maximum width of the visualisation.
   *
   * @type {IDimensionConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  width?: IDimensionConfig;
  
  /**
   * Defines the minimum and maximum height of the visualisation.
   *
   * @type {IDimensionConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  height?: IDimensionConfig;
  
  /**
   * An array of colours to use in the visualisation.
   *
   * @type {string[]}
   * @memberof ITaxonomyExplorerConfig
   */
  color?: string[];
  
  /**
   * Defines the duration of the animations in the visualisation.
   *
   * @type {IAnimationConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  animation?: IAnimationConfig;
  
  /**
   * Defines an event handler (callback function) that is fired when a node is clicked.
   *
   * @type {*}
   * @memberof ITaxonomyExplorerConfig
   */
  onClick?: any;
  
  /**
   * Configures the tooltips to show when hovering over a node.
   *
   * @type {ITipConfig}
   * @memberof ITaxonomyExplorerConfig
   */
  tip?: ITipConfig;
}