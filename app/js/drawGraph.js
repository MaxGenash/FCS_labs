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
	var w = opts.width || (window.innerWidth*0.8 > 800) ? window.innerWidth*0.8 : 800;
	var h = opts.height || (window.innerHeight*0.7 > 500) ? window.innerHeight*0.7 : 500;
	var linkDistance=60;

	//var colors = d3.scale.category10();

	var svg = d3.select(opts.graphContainer).append("svg").attr({"width":w,"height":h});
	resize();
	//window.focus();
	d3.select(window).on("resize", resize);

	var force = d3.layout.force()
		.nodes(opts.nodesArr)
		.links(opts.edgesArr)
		.size([w,h])
		.linkDistance([linkDistance])
		.charge([-500])
		.theta(0.1)
		.gravity(0.05)
		.start();

	var edges = svg.selectAll("line")
		.data(opts.edgesArr)
		.enter()
		.append("line")
		.attr("id",function(d,i) {return 'edge'+i})
		.attr('marker-end','url(#arrowhead)')
		.style("stroke","#ccc")
		.style("pointer-events", "none");

	var nodes = svg.selectAll("circle")
		.data(opts.nodesArr)
		.enter()
		.append("circle")
		.attr({
			"r":15,
			"class":".node"
		})
		.style("fill", "white")
		.call(force.drag);

	var nodelabels = svg.selectAll(".nodelabel")
		.data(opts.nodesArr)
		.enter()
		.append("text")
		.attr({
			"x":function(d){return d.x;},
			"y":function(d){return d.y;},
			"class":"nodelabel",
			"stroke":"black"
		})
		.text(function(d){
			return d.name;
		})
		.call(force.drag);


	//стрілки
	svg.append('defs').append('marker')
		.attr({'id':'arrowhead',
			'viewBox':'-0 -5 10 10',
			'refX':25,
			'refY':0,
			//'markerUnits':'strokeWidth',
			'orient':'auto',
			'markerWidth':10,
			'markerHeight':10,
			'xoverflow':'visible'})
		.append('svg:path')
		.attr('d', 'M 0,-5 L 10 ,0 L 0,5')
		.attr('fill', '#ccc')
		.attr('stroke','#ccc');

	force.on("tick", function(){
		edges.attr({"x1": function(d){return d.source.x;},
			"y1": function(d){return d.source.y;},
			"x2": function(d){return d.target.x;},
			"y2": function(d){return d.target.y;}
		});

		nodes.attr({"cx":function(d){return d.x;},
			"cy":function(d){return d.y;}
		});

		nodelabels.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; });
	});

	function resize() {
		w = (window.innerWidth*0.8 > 800) ? window.innerWidth*0.8 : 800;
		h = (window.innerHeight*0.7 > 500) ? window.innerHeight*0.7 : 500;
		svg.attr("width", w)
			.attr("height", h);
	}
}