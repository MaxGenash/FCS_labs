"use strict";
/**
 * Функція для малювання графа
 *
 * @param opts {Object} параметри для малювання графа
 * @param opts.width {Number} ширина полотна
 * @param opts.height {Number} висота полотна
 * @param opts.graphContainer {String} контейнер, в який буде поміщено граф
 * @param opts.nodesArr {Array} [Object: {name: {String}}] масив вершин, name - лейбл на вершинах
 * @param opts.edgesArr {Array} [Object: {source: {String}, target: {String}}] масив дуг
 * @param opts.drawEdgeLabels {Boolean} чи малювати лейбли на ребрах (true - малювати)
 * @param opts.drawNodeLabels {Boolean} чи малювати лейбли на вершинах (true - малювати)
 * @param opts.curvedEdges {Boolean} чи робити ребра зігнутими (true - робити)
 */
export default function drawGraph(opts){
	var initialW = opts.width || (window.innerWidth*0.8 > 800) ? window.innerWidth*0.8 : 800,
	 	initialH = opts.height || (window.innerHeight*0.7 > 500) ? window.innerHeight*0.7 : 500,
		margin = {top: -5, right: -5, bottom: -5, left: -5},	//початкове значення відступів(потім при масштабуванні зміниться)
		width = initialW - margin.left - margin.right,
		height = initialH - margin.top - margin.bottom,
		linkDistance = 60,
		minZoom = 0.1,
		maxZoom = 10;

	var zoom = d3.behavior.zoom()
    .scaleExtent([minZoom, maxZoom])
    .on("zoom", zoomed);

	var drag = d3.behavior.drag()
		.origin(function(d) { return d; })
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended);

	var svg = d3.select(opts.graphContainer)
		.append("svg")
		.attr({
			width: width + margin.left + margin.right, 
			height: height + margin.top + margin.bottom
		})
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);

	resize();
	d3.select(window).on("resize", resize);

	var rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

	var container = svg.append("g");
	var containerInner = container.append("g");

	var force = d3.layout.force()
		.nodes(opts.nodesArr)
		.links(opts.edgesArr)
		.size([width, height])
		.linkDistance([linkDistance])
		.charge([-5000])
		.theta(0.1)
		.gravity(0.1)
		.start();

	//edges
	var edges;
	if(opts.curvedEdges) {
		edges = containerInner.selectAll("path")
			.data(opts.edgesArr)
			.enter()
			.append("svg:path");
	} else {
		edges = containerInner.selectAll("line")
			.data(opts.edgesArr)
			.enter()
			.append("line");
	}
	edges.attr({
		'id': function(d,i) {return 'edge'+i},
		'class': "edge",
		'marker-end': 'url(#arrowhead)'
	}).style({
		"pointer-events": "none"
	});

	//nodes
	var nodes = containerInner.selectAll("circle")
		.data(opts.nodesArr)
		.enter()
		.append("circle")
		.attr({
			"class": "node"
		})
		.on('dblclick', releaseNode)
		.call(drag);

	//node labels
	if(opts.drawNodeLabels){
		var nodelabels = containerInner.selectAll(".nodelabel")
			.data(opts.nodesArr)
			.enter()
			.append("text")
			.attr({
				"x":function(d){return d.x;},
				"y":function(d){return d.y;},
				"class":"node-label"
			})
			.text(function(d){
				return d.name;
			})
			.on('dblclick', releaseNode)
			.call(drag);
	}

	//edge labels
	if(opts.drawEdgeLabels) {
		var edgelabels = containerInner.selectAll(".edge-label")
			.data(opts.edgesArr)
			.enter()
			.append("text")
			.style("pointer-events", "none")
			.attr({
				'class': 'edge-label',
				'text-anchor': 'start',
				'x': 50,
				'y': -20
			})
			.append("textPath")
			.attr("xlink:href", function(d,i) { return "#edge" + i; })
			.text(function (d, i) { return d.label });
	}

	//arrows
	var arrows = containerInner.append('defs')
		.append('marker')
		.attr({
			'id': "arrowhead",
			'class': "arrowhead",
			'viewBox':'-0 -5 10 10',
			'refX':25,
			'refY':0,
			//'markerUnits':'strokeWidth',
			'orient':'auto',
			'markerWidth':10,
			'markerHeight':10,
			'xoverflow':'visible'
		})
		.append('svg:path')
		.attr('d', 'M 0,-5 L 10 ,0 L 0,5');
	var arrowsRed = containerInner.select("defs")
		.append('marker')
		.attr({
			'id': "arrowhead-inverse-edge",
			'class': "arrowhead-inverse-edge",
			'viewBox':'-0 -5 10 10',
			'refX':25,
			'refY':0,
			//'markerUnits':'strokeWidth',
			'orient':'auto',
			'markerWidth':10,
			'markerHeight':10,
			'xoverflow':'visible'
		})
		.append('svg:path')
		.attr('d', 'M 0,-5 L 10 ,0 L 0,5');

	force.on("tick", function() {
		if(opts.curvedEdges) {
			edges.attr({
				"d": function (d) {
					//якщо у нас є обернений зв'язок, то малюємо зігнуті ребра, інакше прямі
					var reverseEdgeIndex = opts.edgesArr.findIndex(el => (el.source.index === d.target.index) && (el.target.index === d.source.index));
					if (reverseEdgeIndex < 0) {
						return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
					} else {
						var dx = d.target.x - d.source.x,
							dy = d.target.y - d.source.y,
							dr = Math.sqrt(dx * dx + dy * dy);
						return "M" + d.source.x + "," + d.source.y +
							"A" + 2 * dr + "," + 2 * dr + " 0 0,1 " + d.target.x + "," + d.target.y;
					}
				},
				"class": function (d) {
					if(d.source.index > d.target.index)
						return "edge inverse";
					else
						return "edge";
				},
				'marker-end': function (d) {
					if(d.source.index > d.target.index)
						return 'url(#arrowhead-inverse-edge)';
					else
						return 'url(#arrowhead)';
				}
			});
		} else {
			edges.attr({
				"x1": function (d) { return d.source.x; },
				"y1": function (d) { return d.source.y; },
				"x2": function (d) { return d.target.x; },
				"y2": function (d) { return d.target.y; }
			});
		}

		nodes.attr({
			"cx": function (d) { return d.x; },
			"cy": function (d) { return d.y; }
		});

		if(opts.drawNodeLabels) {
			nodelabels.attr({
				"x": function (d) { return d.x; },
				"y": function (d) { return d.y; }
			});
		}
	});

	function dragstarted(d) {
		d3.event.sourceEvent.stopPropagation();
		d3.select(this).classed("dragging", true);
		force.stop();
	}

	function dragged(d) {
		d.px += d3.event.dx;
		d.py += d3.event.dy;
		d.x += d3.event.dx;
		d.y += d3.event.dy;
	}

	function dragended(d) {
		d.fixed = true;	//зафіксувати вершину якщо її перетащили
		d3.select(this).classed("dragging", false);
		force.resume();
	}

	function releaseNode(d){
		d3.event.stopPropagation();	//Відміняємо масштабування
		d.fixed = false;
		force.resume();
	}

	function resize() {
		initialW = (window.innerWidth*0.8 > 800) ? window.innerWidth*0.8 : 800;
		initialH = (window.innerHeight*0.7 > 500) ? window.innerHeight*0.7 : 500;
		width = initialW - margin.left - margin.right;
		height = initialH - margin.top - margin.bottom;
		svg.attr("width", width)
			.attr("height", height);
	}

	function zoomed() {
		container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}	
}