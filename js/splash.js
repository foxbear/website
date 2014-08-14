var canvas, words, fox, bear;
paper.install(window);

// Import SVG tag to the canvas, re-scale and assign event handlers
window.onload = function() {
		// Get a reference to the canvas object
		canvas = document.getElementById('splashCanvas');
		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		// Create a Paper.js Path to draw a line into it:
		words = project.importSVG(document.getElementById('svg') , { expandShapes: true } );
		// Do some initial scaling/positioning
        words.scale(1, .8); // correct initial scaling from SVG import
		updateScale( .5 );
		
		fox = words.children.fox;
		bear = words.children.bear;
		
		// Whenever the window is resized, updateScale...
		view.onResize = function(event) {
			updateScale( .5 );
		}
        
        // Whenever a frame occurs, updateFrame
        view.onFrame = function( event ){
            updateFrame( event , fox, bear );
        }
}

// For now, oscillate opacity. Eventually , morph words...
updateFrame = function( event , fox, bear ){

    var period = 480
    var frame_count = event.count
    // Create a periodic function that counts down to zero from some value,
    // then back up to the value,
    var i = Math.abs(frame_count%period - ( period/2 ) );
    // console.log(i);
    
    var fox_opac = map_range( i , 0 , ( period/2 ) , 0 , 1)
    var bear_opac = map_range( i , 0 , ( period/2 ) , 1 , 0)
    
    fox.children.forEach( function(letter_group){
        if ( letter_group.name != "blank" ){
            letter_path = letter_group.children[0]
            // letter_path.strokeColor.alpha = fox_opac;
            letter_path.fillColor.alpha = fox_opac;
        }
    });
    
    bear.children.forEach( function(letter_group){
        letter_path = letter_group.children[0];
        letter_path.strokeColor.alpha = bear_opac;
        // letter_path.fillColor.alpha = bear_opac;
    }); 
    
}

// Scale 'words' to the new window dimension, then reset the desired scale
updateScale = function( scale ){
	canvas.height = canvas.height - (canvas.height*.1);
	words.fitBounds(view.bounds, false);
	words.position = view.bounds.center;
	words.scale( scale );
}

map_range = function (value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}