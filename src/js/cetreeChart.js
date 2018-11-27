Graphio.namespace("Graphio.cetreeChart");

/**
 * input: array with label (string) and value (number)
 */
Graphio.cetreeChart = function(elementQuery, input, configuration, debug) {
	d3.selection.prototype.moveToFront = function() {
		  return this.each(function(){
		    this.parentNode.appendChild(this);
		  });
		};
	//take DOM element
	var chart = d3.select(elementQuery);
	//check configuration
	var conf = checkConfiguration(configuration, chart);
	var data;
	
	//bounds data
	var svgWidth;
	var svgHeight;
	
	var chartWidth;
	var chartHeight;
	
	//create locale and tooltip object
	var loc;
	var tip;

	//main objects
	var svg;
	var g;
	
	//scales
	var tree, root, nodes;
	var maxDepth;
	//decrease factor scale, to decrease max radius when depth increase
	var decreaseFactorScale;
	var z;

	//initialize chart
	init();
	//read container dimensions and update chart to fit container
	updateBounds();

	//create and return the controller
	var controller  = {};
	controller.updateBounds = updateBounds;
	controller.selectExpandNode = selectExpandNode;
	return controller;

	function init(){
		//create data with raw data (input) and columns
		data = JSON.parse(JSON.stringify(input));
		//build hierarchy structure
		data = d3.hierarchy(data, function(d){
			return d.children;
		});
		//on flare data, value are only on leaves;
		//so sum children value to populate value of not leaf nodes
		data.sum(function(d){
			return d.value;
		});
		//get all nodes
		nodes = data.descendants();
		//calculate max levels
		maxDepth = d3.max(nodes, function(d){
			return d.depth;
		});
		//decrease factor scale, to decrease max radius when depth increase
		decreaseFactorScale = d3.scaleLinear().domain([0, maxDepth]).range([1, 0.8]);
		//add max value of brothers
		data.eachAfter(function(d){
			if(d.children){
				var maxValue = d3.max(d.children, function(d){
					return d.value;
				});
				var minValue = d3.min(d.children, function(d){
					return d.value;
				});
				for(var i=0; i<d.children.length; i++){
					d.children[i].data.minSiblingValue = minValue;
					d.children[i].data.maxSiblingValue = maxValue;
				}
			}
		});
		//add value to root (there is one value)
		data.data.minSiblingValue = data.value;
		data.data.maxSiblingValue = data.value;
		//add color to nodes
		var lev1Count = 0;
		data.each(function(d){
			if(d.depth === 0){
				d.color = "#000000";
			}
			else if(d.depth === 1){
				d.color = conf.color[lev1Count];
				lev1Count++;
				lev1Count = lev1Count % conf.color.length;
			}
			else{
				d.color = d.parent.color;
			}
		});
		
		//collapse all nodes
		data.eachAfter(function(d){
			collapseNode(d);
		});
		
		//update dimensions
		updateDimensions();
		//create locales
		if(conf.locale == 'it'){
			loc = d3.formatLocale({decimal : ",", thousands : ".", grouping:[3], currency:["€", ""]});
		}
		else if(conf.locale == 'en'){
			loc = d3.formatLocale({decimal : ".", thousands : ",", grouping:[3], currency:["$", ""]});
		}
		//create svg element with tooltip
		svg = chart.append("svg");
		if(conf.tip.enabled){
			tip = d3.tip().attr('class', 'd3-tip').offset([-10,0]).html(
				function(d){
					return conf.tip.formatFunction(d, loc);
				});
			svg.call(tip);
		}
		
		//create tree
		tree = d3.tree();
		//create circle radius scale
		z = d3.scaleLinear();
		//draw chart container
		g = svg.append("g").attr("transform", "translate(" + conf.margin.left  + "," + conf.margin.top + ")");

	}
	
	/**
	 * collapse the node specified
	 */
	function collapseNode(node){
		if(node.children){
			node._children = node.children;
			node.children = null;
		}
	}
	
	/**
	 * Gets the root from a node if the tree
	 */
	function getRootFromNode(node){
		if(!node.parent){
			return node;
		}
		else{
			return getRootFromNode(node.parent);
		}
	}
	/**
	 * close current node and all its children
	 */
	function closeNodes(node){
		var children;
		if(node.children){
			children = node.children;
		}
		else{
			children = node._children;
		}
		if(children){
			for(var i=0; i<children.length; i++){
				closeNodes(children[i]);
			}
		}
		//close node
		if(node.children){
			node._children = node.children;
			node.children = null;
		}
	}
	
	/**
	 * Expand the specified node, collapsing all other nodes
	 */
	function expandNode(node){
		//find root
		var root = getRootFromNode(node);
		if(root){
			//close all nodes
			closeNodes(root);
		}
		//expand the current node, and all its ancestors
		var currentNode = node;
		while(currentNode){
			if(currentNode._children){
				currentNode.children = currentNode._children;
				currentNode._children = null;
			}
			currentNode = currentNode.parent;
		}
	}
	
	/**
	 * update the whole chart when data changes
	 */
	function update(source){
		//function to calculate node radius
		function nodeRadius(d){
			if(!d.parent){
				//root
				return conf.circleRadius.max;
			}
			else{
				var parentRadius = nodeRadius(d.parent);
				z.domain([d.data.minSiblingValue, d.data.maxSiblingValue]);
				var decreaseFactor = decreaseFactorScale(d.depth);
				z.range([conf.circleRadius.min * decreaseFactor, parentRadius * decreaseFactor]);
				return z(d.value);
			}
		}
		tree.size([chartHeight, chartWidth]);
		root = tree(data);
		//hide tooltip on update
		d3.select(".d3-tip").style("opacity", 0);
		//normalize fixed depth
		var maxTextWidth;
		if(conf.rootWidth && conf.rootWidth > 0){
			var widthExceptRoot = chartWidth * (1 - conf.rootWidth);
			maxTextWidth = widthExceptRoot / maxDepth - conf.circleRadius.max;
		}
		else{
			maxTextWidth = chartWidth / (maxDepth + 1) - conf.circleRadius.max;
		}
		root.each(function(d){
			//var widthExceptRoot = chartWidth - rootLinkSpace;
			if(conf.rootWidth && conf.rootWidth > 0){
				var widthExceptRoot = chartWidth * (1 - conf.rootWidth);
				if(d.depth > 0){
					d.y = (d.depth - 1) * (widthExceptRoot / (maxDepth)) + (conf.rootWidth * chartWidth);
				}
				else{
					d.y = 0;
				}
			}
			else{
				d.y = d.depth * (chartWidth / (maxDepth + 1));
			}
			
		});
		
		//draw links
		//select all links, and set actual links
		var link = g.selectAll("path.link").data(root.links(), function(d){
			return d.target.data.id;
		});
		//function to get path for a link; if isStart is true, the link start and finished in
		//source node; otherwise, the link starts in the source node and ends in the target node;
		//this is useful for transition.
		function linkPath(d, isStart){
			if(!isStart){
				return "M" + d.target.y + "," + d.target.x
	            + "C" + (d.target.y + d.target.parent.y) / 2 + "," + d.target.x
	            + " " + (d.target.y + d.target.parent.y) / 2 + "," + d.target.parent.x
	            + " " + d.target.parent.y + "," + d.target.parent.x;
			}
			else{
				return "M" + d.target.parent.y + "," + d.target.parent.x
	            + "C" + (d.target.parent.y + d.target.parent.y) / 2 + "," + d.target.parent.x
	            + " " + (d.target.parent.y + d.target.parent.y) / 2 + "," + d.target.parent.x
	            + " " + d.target.parent.y + "," + d.target.parent.x;
			}
		}
		//if tree changes, move all links to new position
		link.transition().duration(conf.animation.moveDuration).attr("d",
			function(d) {
				return linkPath(d, false);
		});
		//enter new links, with default style and from and to source node
		var linkEnter = link.enter().insert("path").attr("class", "link").attr("d",
			function(d) {
				return linkPath(d, true);
			})
		.attr("opacity", 0)
		.style("fill", "none")
		.style("stroke-opacity", 0.4)
		.style("stroke-linecap", "round")
		.style("stroke", function(d){
			//link color is target node color
			return d.target.color;
		})
		.style("stroke-width", function(d){
			return nodeRadius(d.target) * 2;
		});
		//transition of link to target node, with full opacity
		linkEnter.transition().duration(conf.animation.expandDuration).attr("d", function(d){
			return linkPath(d, false);
		}).attr("opacity", 1);
		//delete links are translated to source node, with decreasing opacity, and then removed
		link.exit().transition().duration(conf.animation.expandDuration).attr("d", function(d){
			return linkPath(d, true);
		}).attr("opacity", 0).remove();
		
		//draw nodes
		//select all nodes, and set the actual nodes
		var node = g.selectAll("g.node").data(root.descendants(), function(d){
			return d.data.id;
		});
		//add new nodes on the parent, transparent
		var nodeEnter = node.enter().append("g").attr("class", "node")
			.attr("transform", function(d) {
				if(d.parent){
					return "translate(" + d.parent.y + "," + d.parent.x + ")";
				}
				else{
					return "translate(" + d.y + "," + d.x + ")";
				}
				
		})
		.attr("opacity", 0)
		.on("click", function(d) {
			if(conf.onClick){
				conf.onClick(d, d3.select(this), d.depth);
			}
		});
		//move new nodes to final position
		nodeEnter.transition().duration(conf.animation.expandDuration).attr("transform", function(d) {
				return "translate(" + d.y + "," + d.x + ")";
		})
		.attr("opacity", 1);
		
		//add tooltip if enabled
		if(conf.tip.enabled){
			nodeEnter.on('mouseover', tip.show)
			 .on('mouseout', tip.hide);
		}
		
		//add circle node to new data
		nodeEnter.append("circle").attr("r", function(d){
			return nodeRadius(d);
		})
		.style("fill", function(d){
			return d.color;
		})
		.style("stroke", function(d){
			return d.color;
		})
		.style("stroke-opacity", function(d){
			return 0.6;
		})
		.style("fill-opacity", function(d){
			return 0.4;
		});
		//add text node to new data
		nodeEnter.append("text")
		.attr("transform", function(d){
			return "translate(" + (nodeRadius(d) + 5) + ",0)";
		})
		.attr("x", -10)
		.attr("dy", 0)
		.attr("font-family", conf.font.family)
		.attr("font-size", conf.font.size)
		.attr("font-weight", function(d){
			return d.selected ? "bold" : "";
		})
		.text(function(d){
			return d.depth == 0? "" : d.data.label;
		}).call(wrap, maxTextWidth);
		//on resize, all wrapping of all nodes must be recalculated
		node.select("text").call(wrap, maxTextWidth);
		//create selection of existing and new nodes
		var allNodes = node.merge(nodeEnter);
		//add class on node that is currently selected
		allNodes.classed("selected", function(d){
			return d.selected;
		});
		//also if selection is programmatically
		/*nodeEnter.classed("selected", function(d){
			return d.selected;
		})*/
		//if tree changes, move old nodes to now position
		node.transition().duration(conf.animation.moveDuration).attr("transform",
		function(d) {
			return "translate(" + d.y + "," + d.x + ")";
		});
		//update selection status of circle of all nodes (existing and new)
		allNodes.select("circle").transition().duration(conf.animation.moveDuration)
		.style("fill", function(d){
			return d.selected ? "#FFFFFF" : d.color;
		})
		.style("stroke-opacity", function(d){
			return d.selected ? 1.0 : 0.6;
		})
		.style("fill-opacity", function(d){
			return d.selected ? 1.0 : 0.4;
		})
		//update selection status of text of all nodes
		node.select("text").transition().duration(conf.animation.moveDuration)
		.attr("font-weight", function(d){
			return d.selected ? "bold" : "";
		});
		//nodes that must be deleted; do it with transition:
		//move to parent and hide
		var nodeExit = node.exit().transition().duration(conf.animation.expandDuration)
		.attr("transform", function(d) {
				if(d.parent){
					return "translate(" + d.parent.y + "," + d.parent.x + ")";
				}
				else{
					return "translate(" + d.y + "," + d.x + ")";
				}
				
		})
		.attr("opacity", 0).remove();
		
		//to move selected node over links, redraw it
		//d3.select("g.node.selected").moveToFront();
		//move all node elements to front (links are back)
		g.selectAll("g.node").moveToFront();
	}

	/**
	 * expand the specified node at the specified level;
	 * if selected is true, check the specified node as selected,
	 * otherwise expand the node only; if expandCurrentNode is false,
	 * expand up to the node parent; if is true, expand also the node children
	 */
	var previousSelection;
	function selectExpandNode(level, nodeId, selected, expandCurrentNode){
		var node;
		//find node with specified id
		for(var i=0; i<nodes.length; i++){
			var d = nodes[i];
			if(d.depth === level && d.data.id == nodeId){
				node = d;
			}
		}
		//deselect previous node
		if(previousSelection){
			delete previousSelection.selected;
			previousSelection = null;
		}
		if(node){
			//expand node
			if(expandCurrentNode){
				expandNode(node);
			}
			else{
				expandNode(node.parent);
			}
			//if do selection, select
			if(selected){
				node.selected = true;
				previousSelection = node;
			}
			//update
			update(node);
		}
	}

	/**
	 * check the configuration, and return the final configuration,
	 * without change conf
	 */
	function checkConfiguration(configuration, container){
		var conf;
		if(configuration){
			conf = JSON.parse(JSON.stringify(configuration));
		}
		else{
			conf = {};
		}
		if(!conf.locale){
			conf.locale = "en";
		}
		if(!conf.input){
			conf.input = {};
		}
		if(!conf.input.idField){
			throw "'conf.input.idField' not specified";
		}
		if(!conf.input.labelField){
			throw "'conf.input.labelField' not specified";
		}
		if(!conf.input.valueField){
			throw "'conf.input.valueField' not specified";
		}
		if(!conf.font){
			conf.font = {};
		}
		if(!conf.font.family){
			conf.font.family = "sans-serif";
		}
		if(!conf.font.size){
			conf.font.size = 10;
		}
		if(!conf.margin){
			conf.margin = {};
		}
		if(!conf.margin.top){
			conf.margin.top = 0;
		}
		if(!conf.margin.bottom){
			conf.margin.bottom = 0;
		}
		if(!conf.margin.left){
			conf.margin.left = 0;
		}
		if(!conf.margin.right){
			conf.margin.right = 0;
		}
		if(!conf.circleRadius){
			conf.circleRadius = {};
		}
		if(!conf.circleRadius.min){
			conf.circleRadius.min = 5;
		}
		if(!conf.circleRadius.max){
			conf.circleRadius.max = 30;
		}
		if(!conf.circleStroke){
			conf.circleStroke = 1;
		}
		//% of width to be reserved to root and links to level 1
		//<=0 to not consider
		if(!conf.rootWidth){
			conf.rootWidth = 0.3;
		}
		
		if(!conf.width){
			conf.width = {}
		}
		if(!conf.height){
			conf.height = {}
		}
		if(!conf.width.max){
			conf.width.max = -1;
		}
		if(!conf.width.min){
			conf.width.min = -1;
		}
		if(!conf.height.max){
			conf.height.max = -1;
		}
		if(!conf.height.min){
			conf.height.min = -1;
		}
		
		if(!conf.color){
			conf.color = ["#B0CB52", "#DAE6B0", "#38A962", "#00632E", "#41A62A"];
		}
		
		if(!conf.animation){
			conf.animation = {};
		}
		if(!conf.animation.expandDuration){
			conf.animation.expandDuration = 0;
		}
		if(!conf.animation.moveDuration){
			conf.animation.moveDuration = 0;
		}
		
		if(configuration.onClick){
			conf.onClick = configuration.onClick;
		}
		
		if(!conf.tip){
			conf.tip = {};
		}
		if(typeof configuration.tip.formatFunction !== "function"){
			conf.tip.enabled = false;
		}
		else{
			conf.tip.enabled = true;
			conf.tip.formatFunction = configuration.tip.formatFunction;
		}
		return conf;
	}
	
	/**
	 * private function to read bounds variables
	 */
	function updateDimensions(){
		//update dimensions
		conf.width.current = chart.style("width");
		conf.width.current = conf.width.current.length > 2 ? Number(conf.width.current.substring(0, conf.width.current.length -2)):0;
		conf.height.current = chart.style("height");
		conf.height.current = conf.height.current.length > 2 ? Number(conf.height.current.substring(0, conf.height.current.length -2)):0;
		//hack to avoid no stop increase
		if(conf.height.current > 4){
			conf.height.current -=4;
		}
		//now resize between max and min
		if(conf.width.min > -1 && conf.width.current < conf.width.min){
			conf.width.current = conf.width.min;
		}
		if(conf.width.max > -1 && conf.width.current > conf.width.max){
			conf.width.current = conf.width.max;
		}
		if(conf.height.min > -1 && conf.height.current < conf.height.min){
			conf.height.current = conf.height.min;
		}
		if(conf.height.max > -1 && conf.height.current > conf.height.max){
			conf.height.current = conf.height.max;
		}
		//subtract margins
		svgWidth = conf.width.current - conf.margin.left - conf.margin.right;
		svgHeight = conf.height.current - conf.margin.top - conf.margin.bottom;
		chartWidth = svgWidth;
		chartHeight = svgHeight;
	}
	
	/**
	 * function that update the chart dimensions in order to the available space
	 */
	function updateBounds(){
		//read html element dimensions and update dimensions
		updateDimensions();
		svg.attr("height", conf.height.current + "px")
		.attr("width", conf.width.current + "px")
		//redraw tree
		update(root);
	}
	
	
	/**
	 * wraps the text of the elements to multiple line, breaking on words
	 */
	function wrap(texts, width){
		texts.each(function(d, i, nodes){
			var text = d3.select(this);
			//if text is split across tspan, get them all
			var children = text.selectAll("tspan");
			var currentText = "";
			if(children.nodes().length > 0){
				for(var i=0; i<children.nodes().length; i++){
					currentText += children.nodes()[i].textContent + " ";
				}
			}
			else{
				currentText = text.text();
			}
			//trim string
			currentText = currentText.trim();
	        var words = currentText.split(/\s+/).reverse(),
	        word,
	        lineCount=0,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	        while (word = words.pop()) {
	        	line.push(word);
	        	tspan.text(line.join(" "));
	        	if (tspan.node().getComputedTextLength() > width) {
	        		line.pop();
	        		tspan.text(line.join(" "));
	        		line = [word];
	        		tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", /*++lineNumber **/lineHeight + dy + "em").text(word);
	        		lineCount++;
	        	}
	        }
		});
	}
}