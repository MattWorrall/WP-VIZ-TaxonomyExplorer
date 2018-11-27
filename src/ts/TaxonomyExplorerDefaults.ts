import { IAnimationConfig } from './config/IAnimationConfig';
import { IDimensionConfig } from './config/IDimensionConfig';
import { IFontConfig } from './config/IFontConfig';
import { IMarginConfig } from './config/IMarginConfig';
import { ITaxonomyExplorerConfig } from './config/ITaxonomyExplorerConfig';
import { ITipConfig } from './config/ITipConfig';

export class TaxonomyExplorerDefaults implements ITaxonomyExplorerConfig {
  public locale = 'en';
  public font: IFontConfig = {
    family: 'sans-serif',
    size: 10
  };
  public margin: IMarginConfig = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };
  public circleRadius: IDimensionConfig = {
    min: 5,
    max: 30
  };
  public circleStroke = 1;
  public rootWidth = 0.3;
  public width: IDimensionConfig = {
    max: -1,
    min: -1
  };
  public height: IDimensionConfig = {
    max: -1,
    min: -1
  };
  public color = ['#B0CB52', '#DAE6B0', '#38A962', '#00632E', '#41A62A'];
  public animation: IAnimationConfig = {
    expandDuration: 0,
    moveDuration: 0
  };
  public tip: ITipConfig = {
    enabled: false
  };
}