"use strict";
/**
 * Функція для малювання графа
 *
 * @param opts {Object} параметри для малювання графа
 * @param opts.width {Number} ширина полотна
 * @param opts.height {Number} висота полотна
 * @param opts.graphContainer {String} контейнер, в який буде поміщено граф
 * @param opts.nodesArr {Array} [Object: {name: {String}}] мвсив вершин
 * @param opts.edgesArr {Array} [Object: {source: {String}, target: {String}}] масив дуг
 *
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
	//window.focus();
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

	var edges = containerInner.selectAll("line")
		.data(opts.edgesArr)
		.enter()
		.append("line")
		.attr({
			'id': function(d,i) {return 'edge'+i},
			'class': "edge",
			'marker-end': 'url(#arrowhead)'
		})
		.style({
			"pointer-events": "none"
		});

	var nodes = containerInner.selectAll("circle")
		.data(opts.nodesArr)
		.enter()
		.append("circle")
		.attr({
			"class":"node"
		})
		.on('dblclick', releaseNode)
		.call(drag);

	var nodelabels = containerInner.selectAll(".nodelabel")
		.data(opts.nodesArr)
		.enter()
		.append("text")
		.attr({
			"x":function(d){return d.x;},
			"y":function(d){return d.y;},
			"class":"node-label",
			"stroke":"black"
		})
		.text(function(d){
			return d.name;
		})
		.on('dblclick', releaseNode)
		.call(drag);

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

	force.on("tick", function(){
		edges.attr({
			"x1": function(d){return d.source.x;},
			"y1": function(d){return d.source.y;},
			"x2": function(d){return d.target.x;},
			"y2": function(d){return d.target.y;}
		});

		nodes.attr({
			"cx":function(d){return d.x;},
			"cy":function(d){return d.y;}
		});

		nodelabels.attr({
			"x": function(d) { return d.x; },
			"y": function(d) { return d.y; }
		});
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