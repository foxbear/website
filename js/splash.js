var canvas, words, fox, bear;
paper.install(window);

window.onload = function() {
		// Get a reference to the canvas object
		canvas = document.getElementById('splashCanvas');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		// Create a Paper.js Path to draw a line into it:
		words = project.importSVG(document.getElementById('svg'));
		// Do some initial scaling/positioning
        words.scale(1, .8); // correct initial scaling from SVG import
		updateScale( .5 );
		
		fox = words.children.fox;
		bear = words.children.bear;
		
		// Whenever the window is resized, updateScale...
		view.onResize = function(event) {
			updateScale( .5 );
		}

}

// Scale 'words' to the new window dimension, then reset the desired scale
updateScale = function( scale ){
	canvas.height = canvas.height - (canvas.height*.1);
	words.fitBounds(view.bounds, false);
	words.position = view.bounds.center;
	words.scale( scale );
}

/*
words.fillColor = null;
words.strokeColor = 'black';

var yesGroup = words.children.yes;
var noGroup = words.children.no;
yesGroup.transformContent = true;
noGroup.transformContent = true;

// Resize the words to fit snugly inside the view:
project.activeLayer.fitBounds(view.bounds);
project.activeLayer.scale(0.8);

yesGroup.position = view.center;
noGroup.position = [-900, -900];

function onMouseMove(event) {
	noGroup.position = event.point;
	for (var i = 0; i < yesGroup.children.length; i++) {
		for (var j = 0; j < noGroup.children.length; j++) {
			showIntersections(noGroup.children[j], yesGroup.children[i])
		}
	}
}

function showIntersections(path1, path2) {
	var intersections = path1.getIntersections(path2);
	for (var i = 0; i < intersections.length; i++) {
		new Path.Circle({
			center: intersections[i].point,
			radius: 5,
			fillColor: '#009dec'
		}).removeOnMove();
	}
}
*/

