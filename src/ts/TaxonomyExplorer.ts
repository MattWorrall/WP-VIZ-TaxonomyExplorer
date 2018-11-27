import * as d3 from 'd3';
import * as d3Tip from 'd3-tip';
import { ITaxonomyExplorerConfig } from './config/ITaxonomyExplorerConfig';
import './d3-extensions';
import { ITaxonomyHierarchyNode } from './ITaxonomyHierarchyNode';

export class TaxonomyExplorer {

  private chart: d3.Selection<any, any, HTMLElement, undefined>;
  private config: ITaxonomyExplorerConfig;
  private data: any;
  private svgWidth: number;
  private svgHeight: number;
  private chartWidth: number;
  private chartHeight: number;
  private loc: any;
  private tip: any;
  private svg: d3.Selection<SVGSVGElement, any, HTMLElement, undefined>;
  private g: d3.Selection<SVGGElement, any, HTMLElement, undefined>;
  private tree: d3.TreeLayout<any>;
  private root: any;
  private nodes: Array<d3.HierarchyNode<ITaxonomyHierarchyNode>>;
  private maxDepth: number;
  private decreaseFactorScale: d3.ScaleLinear<number, number>;
  private z: d3.ScaleLinear<number, number>;
  private previousSelection: any;
  private currentWidth: number;
  private currentHeight: number;

  constructor(elementQuery: string, input: any, config: ITaxonomyExplorerConfig) {
    this.chart = d3.select(elementQuery);

    // TODO merge config and defaults

    this.init(input);

    this.updateBounds();

    const controller: any = {};
    controller.updateBounds = this.updateBounds;
    controller.selectExpandNode = this.selectExpandNode;
    return controller;
  }

  private init(input: any) {
    this.data = JSON.parse(JSON.stringify(input));
    const d3Data: d3.HierarchyNode<ITaxonomyHierarchyNode> = d3.hierarchy(this.data, (d: any) => {
      return d.children;
    });

    d3Data.sum((d: any) => {
      return d.value;
    });

    this.nodes = d3Data.descendants();
    this.maxDepth = d3.max(this.nodes, (d: d3.HierarchyNode<ITaxonomyHierarchyNode>) => {
      return d.depth;
    });

    this.decreaseFactorScale = d3.scaleLinear().domain([0, this.maxDepth]).range([1, 0.8]);
    
    d3Data.eachAfter((d: d3.HierarchyNode<any>) => {
      if (d.children) {
        const maxValue = d3.max(d.children, (datum: d3.HierarchyNode<ITaxonomyHierarchyNode>) => {
          return datum.value;
        });
        const minValue = d3.min(d.children, (datum: d3.HierarchyNode<ITaxonomyHierarchyNode>) => {
          return datum.value;
        });
        for (const child of d.children) {
          (child as d3.HierarchyNode<ITaxonomyHierarchyNode>).data.minSiblingValue = minValue;
          (child as d3.HierarchyNode<ITaxonomyHierarchyNode>).data.maxSiblingValue = maxValue;
        }
      }
    });
    d3Data.data.minSiblingValue = d3Data.value;
    d3Data.data.maxSiblingValue = d3Data.value;

    let lev1Count = 0;
    d3Data.each((d: d3.HierarchyNode<ITaxonomyHierarchyNode>) => {
      if (d.depth === 0) {
        (d as any).color = '#000000';
      }
      else if(d.depth === 1){
				(d as any).color = this.config.color[lev1Count];
				lev1Count++;
				lev1Count = lev1Count % this.config.color.length;
			}
			else{
				(d as any).color = (d.parent as any).color;
			}
    });

    d3Data.eachAfter((d: d3.HierarchyNode<ITaxonomyHierarchyNode>) => {
      this.collapseNode(d);
    });

    this.updateDimensions();

    if (this.config.locale.toLowerCase() === 'it') {
      this.loc = d3.formatLocale({decimal : ',', thousands : '.', grouping:[3], currency:['€', '']});
    }
    else if(this.config.locale.toLowerCase() === 'en'){
			this.loc = d3.formatLocale({decimal : '.', thousands : ',', grouping:[3], currency:['$', '']});
    }
    
    this.svg = this.chart.append('svg');

    if (this.config.tip.enabled) {
      this.tip = d3Tip().attr('class', 'd3-tip').offset([-10, 0]).html((d: any) => {
        return this.config.tip.formatFunction(d, this.loc);
      });
      this.svg.call(this.tip);
    }

    this.tree = d3.tree();

    this.z = d3.scaleLinear();

    this.g = this.svg.append('g').attr('transform', 'translate(' + this.config.margin.left + ',' + this.config.margin.top + ')');
  }

  private collapseNode(node: d3.HierarchyNode<ITaxonomyHierarchyNode>): void {
    if (node.children) {
      (node as any)._children = node.children;
      node.children = null;
    }
  }

  private getRootFromNode(node: d3.HierarchyNode<ITaxonomyHierarchyNode>): d3.HierarchyNode<ITaxonomyHierarchyNode> {
    if (!node.parent) {
      return node;
    } else {
      return this.getRootFromNode(node.parent);
    }
  }

  private closeNodes(node: d3.HierarchyNode<ITaxonomyHierarchyNode>) {
    let children: Array<d3.HierarchyNode<ITaxonomyHierarchyNode>>;

    if (node.children) {
      children = node.children;
    } else {
      children = (node as any)._children;
    }

    if (children) {
      for (const child of children) {
        this.closeNodes(child);
      }
    }

    this.collapseNode(node);
  }

  private expandNode(node: d3.HierarchyNode<ITaxonomyHierarchyNode>) {
    const root = this.getRootFromNode(node);
    if (root) {
      this.closeNodes(root);
    }

    let currentNode = node;
    while (currentNode) {
      this.collapseNode(currentNode);
      currentNode = currentNode.parent;
    }
  }

  private update(source: any) {

  }

  private selectExpandNode(level: number, nodeId: number, selected: boolean, expandCurrentNode: any) {
    let node: d3.HierarchyNode<ITaxonomyHierarchyNode>;
    for (const n of this.nodes) {
      if (n.depth === level && n.data.id === nodeId) {
        node = n;
      }
    }

    if (this.previousSelection) {
      delete this.previousSelection.selected;
      this.previousSelection = null;
    }

    if (node) {
      if (expandCurrentNode) {
        this.expandNode(node);
      } else {
        this.expandNode(node.parent);
      }
      if (selected) {
        (node as any).selected = true;
        this.previousSelection = node;
      }
      this.update(node);
    }
  }

  private updateDimensions(): void {
    const chartWidth = this.chart.style('width')
    this.currentWidth = chartWidth.length > 2 ? Number(chartWidth.substring(0, chartWidth.length - 2)) : 0;
    const chartHeight = this.chart.style('height');
    this.currentHeight = chartHeight.length > 2 ? Number(chartHeight.substring(0, chartHeight.length - 2)) : 0;

    // hack to avoid no stop increase
		if(this.currentHeight > 4){
			this.currentHeight -=4;
		}
		// now resize between max and min
		if(this.config.width.min > -1 && this.currentWidth < this.config.width.min){
			this.currentWidth = this.config.width.min;
		}
		if(this.config.width.max > -1 && this.currentWidth > this.config.width.max){
			this.currentWidth = this.config.width.max;
		}
		if(this.config.height.min > -1 && this.currentHeight < this.config.height.min){
			this.currentHeight = this.config.height.min;
		}
		if(this.config.height.max > -1 && this.currentHeight > this.config.height.max){
			this.currentHeight = this.config.height.max;
		}
		// subtract margins
		this.svgWidth = this.currentWidth - this.config.margin.left - this.config.margin.right;
		this.svgHeight = this.currentHeight - this.config.margin.top - this.config.margin.bottom;
		this.chartWidth = this.svgWidth;
		this.chartHeight = this.svgHeight;
  }

  private updateBounds(): void {
    this.updateDimensions();

    this.svg.attr('height', this.currentHeight + 'px')
      .attr('width', this.currentWidth + 'px');
    
    this.update(this.root);
  }

  private wrap(texts: d3.Selection<SVGTextElement, any, any, undefined>, width: number) {
    texts.each((d: SVGTextElement, i: number, nodes: any) => {
      const text = d3.select(d);
      const children = text.selectAll('tspan');
      let currentText: string = '';
      if (children.nodes().length > 0) {
        for (const child of children.nodes()) {
          currentText += (child as SVGTSpanElement).textContent;
        }
      } else {
        currentText = text.text();
      }

      currentText = currentText.trim();
      const words = currentText.split(/\s+/).reverse();
      let word = words.pop();
      let line = [];
      const lineHeight = 1.1; // em
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy'));
      let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while (word) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', lineHeight + dy + 'em').text(word);
        }
        word = words.pop();
      }
    })
  }
}