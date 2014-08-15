var canvas, words, fox, bear, fox_bear;
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
        fox_bear = words.addChild( new Group({
            children: [new Path () , new Path () , new Path () , new Path ()],
            // Set the stroke color of all items in the group:
            strokeColor: 'steelblue',
            strokeWidth: 1
        }));
        
        
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

    var period = 120
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
    
    var t = map_range( i , 0 , ( period/2 ) , 1 , 0);

    // Iterate over each letter  and morph between the two
    for ( var i = 0; i < 4 ;  i++) {
        // console.log(i);

        source_letter = fox.children[i];
        target_letter = bear.children[i];
        
        new_segments = morphStep( source_letter, target_letter , t);
        
        fox_bear.children[i].removeSegments();
        fox_bear.children[i].addSegments( new_segments );
    }
}

// Finds the next incremental change of the source_path's vertices
// by drawing a line to the closest point on the target path and obtaining point t on this line
morphStep = function( source_letter , target_letter , t ){
    
    // console.log(source_letter.name , target_letter.name);
    
    
    source_letter_paths = [];
    child_apply( source_letter.children[0] , function(child){source_letter_paths.push(child);});
        
    target_letter_paths = [];
    child_apply( target_letter.children[0] , function(child){target_letter_paths.push(child);});
    
    new_segments = []
    // console.log(source_letter_paths , target_letter_paths);
    source_letter_paths.forEach( function(source_path ){
        
        source_path.segments.forEach( function( source_segment ){
            
            candidate_segment = lerp_segment( source_segment , target_letter_paths[0] , t )
            // console.log( candidate_segment )
            new_segments.push( candidate_segment );
        });
        
    });
    
    return new_segments
}

// UNFINISHED/untested -
// If this element has children, apply the lambda to the children. 
// Else, apply the lambda directly
// This is needed because some paths 
child_apply = function( group , lambda ){
    output = [];
    if ( group.children === undefined ){
        output.push( lambda( group ) );
    }
    else {
        group.children.forEach( function(child){
            output.push( lambda( child ) );
        });
    }
    return output
}

// UNFINISHED/untested - Linear interpolate a curve relative to a target path
lerp_segment = function( source_segment , target_path , t ){
    // console.log(source_segment , target_path , t);
    target_pt1 = target_path.getNearestPoint( source_segment.point );
    // console.log(target_pt1);
    
    next_pt = lerp_pt ( source_segment.point , target_pt1 , t);
    // next_handle1 = lerp_pt ( curve.handle1 , foo , t);
    // next_handle2 = lerp_pt ( curve.handle2 ,  foo , t);
    
    var new_segment = new Segment(next_pt, source_segment.handleIn , source_segment.handleOut);
    return new_segment
}

// Linnear interpolation between two points
lerp_pt = function( pt0, pt1 , t ){
    var point = new Point( lerp(pt0.x , pt1.x , t) ,  lerp(pt0.y , pt1.y , t) );
   return point;
}

// Linnear interpolation between two values
lerp = function( v0 , v1  , t ){
    return (1-t)*v0 + t*v1;
}

// Given a value and two ranges, map the value in range 1 into the value in range 2
map_range = function (value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// Scale 'words' to the new window dimension, then reset the desired scale
updateScale = function( scale ){
	canvas.height = canvas.height - (canvas.height*.1);
	words.fitBounds(view.bounds, false);
	words.position = view.bounds.center;
	words.scale( scale );
}