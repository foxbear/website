var canvas, words, fox, bear, fox_bear, fox_letter_paths , bear_letter_paths ;
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
            strokeColor: "#555555",
            strokeWidth: 1 ,
            // fillColor: new Color(1, 0, 0, .5)
        }));
        fox_bear.children.forEach(function(path){ path.closed = true});
        
        // Arrays of paths - per letter
        fox_letter_paths = [];
        bear_letter_paths = [];
        // Setup work for morphing paths
        for ( var i = 0; i < 4 ;  i++) {
            // console.log(i);

            fox_letter = fox.children[i];
            bear_letter = bear.children[i];
            
            // Traverse paths and groups of paths to get flat arrays of paths
            fox_letter_paths[i] = [];
            child_apply( fox_letter.children[0] , function(child){fox_letter_paths[i].push(child);});
                
            bear_letter_paths[i] = [];
            child_apply( bear_letter.children[0] , function(child){bear_letter_paths[i].push(child);});
        }
        
        subdivide_word( fox_letter_paths );
        // subdivide_word( bear_letter_paths );
        // Hide the words
        // fox.visible = false;
        // bear.visible = false;
        fox.strokeColor = "#FFFFFF";
        bear.strokeColor = "#000000";
        // bear.fillColor = 'white'
        // fox.fillColor = 'white'
        
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

    var period = 880
    var frame_count = event.count
    // Create a periodic function that counts down to zero from some value,
    // then back up to the value,
    var i = Math.abs(frame_count%period - ( period/2 ) );
    // console.log(i);
    
    var fox_opac = map_range( i , 0 , ( period/2 ) , 0 , 1)
    var bear_opac = map_range( i , 0 , ( period/2 ) , 1 , 0)
    
    fox.children.forEach( function(letter_group){

            letter_path = letter_group.children[0]
            
            // letter_path.strokeColor.alpha = fox_opac;
            letter_path.strokeColor.alpha = fox_opac;
            
    });
    
    bear.children.forEach( function(letter_group){
        letter_path = letter_group.children[0];
        letter_path.strokeColor.alpha = bear_opac;
        // letter_path.fillColor.alpha = bear_opac;
    }); 
    
    var t = map_range( i , 0 , ( period/2 ) , 1 , 0);
    var alpha = map_range( i , 0 , ( period/2 ) , 0 , 1);
    // Iterate over each letter  and morph between the two
    for ( var i = 0; i < 4 ;  i++) {
        // console.log(i);

        source_letter = fox.children[i];
        target_letter = bear.children[i];
        
        new_segments = morphStep( fox_letter_paths[i], bear_letter_paths[i] , t);
        
        fox_bear.children[i].removeSegments();
        fox_bear.children[i].addSegments( new_segments );
        
        fox_bear.children[i].strokeColor.alpha = alpha;
        
        if (i == 3){
            fox_bear.children[i].strokeColor.alpha = 0;
            fox.children[i].strokeColor.alpha = 0;
        }
    }
    
}

// Finds the next incremental change of the source_path's vertices
// by drawing a line to the closest point on the target path and obtaining point t on this line
morphStep = function( fox_letter_paths , bear_letter_paths , t ){
    
    new_segments = []
     
    for (var i = 0; i < fox_letter_paths.length ; i++) {
        source_path = fox_letter_paths[i]
        
         for (var j = 0; j < source_path.segments.length ; j++) {
            source_segment = source_path.segments[j]
            

            target_segment = undefined ;// bear_letter_paths[i].segments[j]
            if (target_segment === undefined){
                // target_pt = bear_letter_paths[i].getNearestPoint( source_segment.point );
                // target_segment = bear_letter_paths[i].getLocationOf( target_pt ).segment;
                
                // target_segment = bear_letter_paths[i].segments[0]
                
                rand_idx = Math.floor( (Math.random() * ( bear_letter_paths[i].segments.length-1)) + 1);
                target_segment = bear_letter_paths[i].segments[rand_idx]
            }
            
            candidate_segment = lerp_segment( source_segment , target_segment , t )
            // console.log( candidate_segment )
            new_segments.push( candidate_segment );
        };
        
    }
    
    return new_segments
}

subdivide_word = function( fox_letter_paths ){
    for ( var i = 0; i < 4 ;  i++) {
        // Subdivide paths
        for (var j = 0; j < fox_letter_paths[i].length ; j++) {
            source_path = fox_letter_paths[i][j]
            subdivide_path( source_path , 4);
         }
    }
}
        
// UNFINISHED/untested -
// If this element has children, apply the lambda to the children. 
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

subdivide_path = function( source_path, subdivisions){

    subdivide = function(source_path){
        for (var k = 0; k < source_path.segments.length ; k+=2) {
            start_idx = k
            if (k == source_path.segments.length-1){ end = 0;}
            else{ end_idx = k+1}
            subdiv_segment(source_path , start_idx , end_idx , 2 );
        }
    }
    
    for( var s = 0; s< subdivisions-1; s++){
        subdivide(source_path);
    }
    
}

// Subdivide a segment n times
subdiv_segment = function( path , start_idx , end_idx ){
    
    pt0 = path.segments[start_idx].point
    pt1 = path.segments[end_idx].point
    mid_pt = lerp_pt( pt0 , pt1, .5)
    
    path.removeSegment( start_idx )
    path.insertSegments( start_idx, [ new Segment(pt0) , new Segment (mid_pt) ] )
    // console.log(pt0, pt1, mid_pt);
}

// Linear interpolate a curve relative to a target path
lerp_segment = function( source_segment , target_segment , t ){

    next_pt = lerp_pt ( source_segment.point , target_segment.point , t);
    
    var new_segment = new Segment(next_pt); // source_segment.handleIn , source_segment.handleOut
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