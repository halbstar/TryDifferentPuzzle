////// Terminology///////
// board - board with tiles, each droppable, rectangular or square shaped

// shape -  basic div, from which starting position all element divs create shape

// elements -  elements of shape div. They create visible shape

//coment solver
//on drop make new div to drop if check undefined is passed

/////////////////////
/////CLASS BOARD//////
/////////////////////
//class Board. Defines board shape on a given width and height (number of tiles)
function Board(width, height, tileWidth, tileHeight){
		//number of tile in width
		this.width = width;
		//number of tiles in height
		this.height = height;
		// for now it is only posible to have square div elements (working on rectangular and beyond)
		//tile width in pixels (default = 80px)
		this.tileWidth = tileWidth || 40;
		//tile width in pixels (default = (square) = same as width
		this.tileHeight = tileHeight || this.tileWidth;
		
		// sum of tiles
		this.sumOfTiles = this.width*this.height

		//board width in pixels
		this.pixelBoardWidth = this.width*this.tileWidth;
		//board height in pixels
		this.pixelBoardHeight = this.height*this.tileHeight;

		// main array to collect data of tiles and dropped shapes
		this.boardArray = {};

		// temporary array of vurrent position of drop element
		this.onWhichTiles = [];
		//add style to each tile (-2 is for border)
		this.tileStyle = {
  			'width' : this.tileWidth-2,
  			'height' : this.tileHeight-2,
  			'border-radius': this.tileWidth/4,
  			'background-color': 'Khaki ',
  		};
	}
// Board class prototype object
Board.prototype = {
	constructor : Board,
//draw board by given number of tiles and dimensions
makeBoard : function (){
		$(".board").css({"width" : this.pixelBoardWidth + "px" , "height" : this.pixelBoardHeight + "px"})
	},
//draw tiles
makeTiles : function (){
		// 'this' doesn't work inside event function (it is taken over) so we are changing it to 'self' (could be anything)
		var self = this;		
  		
  		// loop O^2 - everything is set in this loop
		for (var h = 0; h < this.height; h++) {
			for (var w = 0; w < this.width; w++) 
			{
				// unique id is set to tile. Model for namig is id = "Tile width position"x"Tile height position"
				var tileId = ((w*this.tileWidth))+"x"+((h*this.tileHeight))
				$("<div class=\"tile\" id=\""+tileId+"\"></div>")
				.css(self.tileStyle)
				.appendTo(".board")

				// setting each element of boardArray initiali to true (for checking is tile in the board (maybe not the best solution))
				this.boardArray[tileId] = true

				//making each tile droppable
				$('#'+((w*this.tileWidth))+"x"+((h*this.tileHeight))).droppable({

    			  // drop segment : what to do when drop occurs
    			  drop: function( event, ui ) {
    			    $( this )
    			    
    			    // reset revert option on dragable shape for new if/else check
    			    ui.draggable.draggable('option','revert','invalid');

    			    // get droped shape id
    			    idOfDroppedDiv = ui.draggable.attr("id");
    			    
    			    // if check True turn overlaped tiles into false
    			    if(self.checkBoardArray(idOfDroppedDiv)){
    			    	//console.log('if')
    			    	self.changeBoardArray(idOfDroppedDiv)
    			    	$('.board').append(ui.draggable);
    			    	// remove now empty shape container, all shapes move one place left
    			    	self.removeEmptyShapeContainers()
    			    	// position shape exactly on tile
    			    	$(ui.draggable).offset($(this).offset());
    			    	// if all tiles are coverd show GAME OVER message
    			    	if(self.countCoveredTiles()){
    			    		$('.board').append($(self.gameOver()).css({"display":"inline"}).slideDown())
    			    	}
    			    }
    			    // else revert shape to previous position
    			    else{
    			    	//console.log('else')
    			    	// revert element to previous position
    			    	ui.draggable.draggable('option','revert',true); 
    			    	// filling self.onWhichTiles with outonWhichTiles which was made inside shape/drag/start segment, and represent staring array of positions for dragged shape
    			    	self.onWhichTiles = outonWhichTiles;

    			    	// upon revert change back to previous state
    			    	if(self.checkIsTileOut()){
    			    		self.boardArray[idOfDroppedDiv]= self.onWhichTiles
    			    	}    			    	
    			    };    			    	
    			  },
    			  // out block : what happens when shape is out of current tile
    			  out : function( event, ui ) {
    			  	$( this )
    			  	//console.log('out')
    			  	// get name of out div
    			  	idOfOutDiv = ui.draggable.attr("id")
    			  	self.revertToEmpty(idOfOutDiv)    			  	
    			  },    			 
    			});
			};
		};		
	},

// fill  this.boardArray with covered tiles. idOfDroppedDiv is set as an index so we can always ask which shape covers which tiles
changeBoardArray: function (idOfDroppedDiv){
	this.onWhichTileFunc(idOfDroppedDiv)
	this.boardArray[idOfDroppedDiv] = this.onWhichTiles
},

//checks is there any element of a shape that falls on an undefined tile (out of the board), 
checkIsTileOut : function(){
	for (var i = 0; i < this.onWhichTiles.length; i++) {
		if (typeof this.boardArray[this.onWhichTiles[i]]==='undefined'){
			return false
    	}
    }    	
    return true;
},

// loops through boardArray and onWhichTiles, compares elements, if one pair matches (that tile is coverd), false is returned, else true (all tiles under dropped shape are empty)
checkBoardArray : function(idOfDroppedDiv){
	this.onWhichTileFunc(idOfDroppedDiv);
	if (!this.checkIsTileOut()){
		return false
	}
	for (var name in this.boardArray){
		for (var i = 0; i < this.boardArray[name].length; i++) {
			for (var l = 0; l < this.onWhichTiles.length; l++) {
				if(this.onWhichTiles[l]===this.boardArray[name][i]){
					return false
				}
			};
		};
	}
	return true;
},

// function to shoot out the GAME OVER message. When number of tiles coverd is same as sumOfTiles it returns True
countCoveredTiles : function(){
	sum = 0
	for (var name in this.boardArray){
		if(!(typeof this.boardArray[name].length === 'undefined')){
			sum += (this.boardArray[name].length)
		}
	}
	return (this.sumOfTiles===sum)
},

// resets onWhichTiles to empty array, than fills it with new positions  of all shape elements usualy with respect to .board div but it could be any tile
onWhichTileFunc : function (idOfDroppedDiv, referenceID){
	refID = referenceID || '.board' || 0;
	// get array of of all child divs of main shape div
	var nameShapes = $('#' + idOfDroppedDiv +' > div');
	// empty this.onWhichTiles array
	this.onWhichTiles = []

  	for ( var i = nameShapes.length - 1; i >= 0; i--) {
  		// get current position of a shape
    	var shape  = $('#'+nameShapes[i].id).offset();
    	// get position of a reference div (board)
    	var board  = $(refID).offset() || 00;
    	// fill  this.onWhichTiles with ids of coverd tiles
    	this.onWhichTiles.push(this.roundHelperTileID(this.tileWidth, shape, board))
    };
},


// resets this.boardArray[key] to empty array (when shape is out/moved to new position). Shape no longer covers any tiles
revertToEmpty : function(idOfOutDiv){
	this.boardArray[idOfOutDiv] = []
},



///////helpers////////

//fills properly position object
hash : function (getPositionsArray, idOfDroppedDiv, left, top){
		
		if (typeof getPositionsArray[idOfDroppedDiv]==="undefined"){
			getPositionsArray[idOfDroppedDiv] = []
			getPositionsArray[idOfDroppedDiv].push([left,top])
		}
		else{
			getPositionsArray[idOfDroppedDiv].push([left,top])
		}
},

removeEmptyShapeContainers : function() {
	$('.shapesWrap').find('.shapeContainer:not(:has(*))').remove()	
},

// round helper :  rounds position to the nearest tile and returns that tiles id
roundHelper : function(raster, idOfDroppedDiv, board){
	return [(raster*Math.round((idOfDroppedDiv.left - board.left)/raster)),(raster*Math.round((idOfDroppedDiv.top - board.top)/raster))]
},
//round helper adition : returns id of closest tile
roundHelperTileID : function(raster, idOfDroppedDiv, board) {
	temp = this.roundHelper(raster, idOfDroppedDiv, board)
	return temp[0]+'x'+temp[1]
},

// message for GAME OVER
gameOver : function(){
	return "<div class='gameOver'><h2>GAME OVER</h2><h3>Congratulations!<br>You finally solved this puzzle!<br>Play with more tiles now?</h3></div>";
},

}


/////////////////////
/////CLASS SHAPES////
/////////////////////

function Shape(board, id) {
	//instance of Board class
	this.board = board;

	//id of shape
	this.shapeId = 100

	// array model
	////////////////////////////
	//      //       //       //            
	//  0,0 //  0,1  //  0,2  //
	//      //       //       //
	////////////////////////////
	//      //       //
	//  1,0 //  1,1  //
	//      //       //
	///////////////////
	// object that holds all shapes, and new shapes can be made here
	// shape must have name of valid html color name (http://www.w3schools.com/tags/ref_colornames.asp)
	// first shape must start with [0,0]
	this.shapes = {
    		Red        : [ [0,0] , [1,0] , [0,1] , [2,0]] , 
    		Blue       : [ [0,0] , [1,0] , [0,1] , [1,1]] ,
    		Yellow     : [ [0,0] , [1,0] , [1,1] ,      ] ,
    		Green      : [ [0,0] , [0,1] , [0,2] ,      ] ,
    		Purple     : [ [0,0] , [1,0] ,              ] ,
    		GoldenRod  : [ [0,0] , [0,1] , [1,1] ,      ] ,
    		OrangeRed  : [ [0,0] , [1,0] , [2,-1], [2,0]] , 
    	};
    // shapeDimensionsFunc() examines size of shape and gives dimensions to shapeContainer div
    this.shapeDimensions = this.shapeDimensionsFunc()
    // tile Style
	this.tileStyle = 
		{
  			'width' : this.board.tileWidth-2,
  			'height' : this.board.tileHeight-2,
  			'border-radius': this.board.tileWidth/4,
  			'position': 'absolute',
  			'border': '2px solid black',
  			'opacity': 0.5,
  		};
	}


Shape.prototype = {

	constructor : Shape,

// function that makes individual shape objects
shapeFunc : function(ShapeArr, shapeName){
		var raster = board.tileWidth;
		tempHtml = "";
		var that = this;
		// shape name ID
		shapeNameAndId = shapeName+this.shapeId
		// examines this.shapes and creates shapes shape from square divs and positions in this.shapes array. Each pair ([0,0]...[1,1]) is one positioned div
		for (var i = ShapeArr.length - 1; i >= 0; i--) {
    			(tempHtml += "<div class='tile' style='top:"+ShapeArr[i][0]*board.tileWidth+"px;left:"+ShapeArr[i][1]*board.tileHeight+"px;' id='"+shapeName+this.shapeId+i+"'></div>")
    		};    		
    	// shapes name becomes also shapes color
		tempHtml = $(tempHtml).css(that.tileStyle).css({'background-color' : shapeName })
		// final shape
		shapeHtml = $("<div class=Shape id="+shapeNameAndId+" style= 'width : " + that.board.tileWidth + "px ; height : " + that.board.tileHeight + "px ; position : absolute' ></div>")
			.append(tempHtml)
		// holds shapes until shape is drop onto the board. After that shapeContainer is destroyed
		shapeContainer = $("<div class=shapeContainer>  </div>")
			.css({
				'width': that.shapeDimensions[shapeName][0],
				'height': that.shapeDimensions[shapeName][1],
				'padding-left': that.paddingHelper(shapeName),
				'padding-bottom': 10,
			})
			.append(shapeHtml)

		$(shapeContainer)
  			.appendTo('.shapesWrap')
    	// on start of move (after drop) gets all coverd tiles ids
    	$( '#'+shapeNameAndId ).draggable({ 
    		start: function() {
    			outonWhichTiles = that.onWhichTileFunc(this.id)
		    },
    		revert: "invalid",
    	});
    	this.shapeId++
    	},
// modification of a board.onWhichTileFunc for start event
onWhichTileFunc : function (idOfDroppedDiv, referenceID){
	refID = referenceID || '.board' || 0;
	var nameShapes = $('#' + idOfDroppedDiv +' > div');
	onWhichTiles = []
  	for ( var i = nameShapes.length - 1; i >= 0; i--) {
    	var shape  = $('#'+nameShapes[i].id).offset();
    	var board  = $(refID).offset() || 0;
    	onWhichTiles.push(this.board.roundHelperTileID(this.board.tileWidth, shape, board))
    };
    return onWhichTiles
},
// main function for drawing ALL shape objects on screen, given in greedyArr object after MAKE NEW BOARD is pressed
allShapeFunct :	function (){
			greedyArr = this.greedy() //|| this.shapes
			for (var i in greedyArr) {
    			if (this.shapes.hasOwnProperty(greedyArr[i])) {
			    	this.shapeFunc(this.shapes[greedyArr[i]], greedyArr[i])			    	
			    }
			}
    	},
// function for seting dimensions of each shapeContainer div
shapeDimensionsFunc : function(){
	dimensionsArr = {}
	for (name in this.shapes){
		// all shapes must have at least 1,1 dimensions (0+1, 0+1)
		widthOfShape = 1;
		heightOfShape = 1;	
		for (var i = 0; i < this.shapes[name].length; i++) {
			// comparing if shape have vector that is more than 1 (0+1) in both directions. if true that is the new shape width+1
			if(this.shapes[name][i][1]+1>widthOfShape){
				widthOfShape = this.shapes[name][i][1]+1
			}
			if(this.shapes[name][i][0]+1>heightOfShape){
				heightOfShape = this.shapes[name][i][0]+1
			}
		};
		// multiply with pixel height and width
		dimensionsArr[name] = [widthOfShape*this.board.tileWidth, heightOfShape*this.board.tileHeight]
	}
	return dimensionsArr
},

// greedy function - for given area of board returns necessary number of all given shape in this.shapes to cover the board
greedy : function(){
	// filled with {name of shape : area of shape}  data
	greedyCountArr = {};
	// return array with names of all shapes (multiple times listed) to be used in allShapeFunct 
	greedyArr = [];
	// area of the board
	numberOfTiles = this.board.width*this.board.height
	// total number of tiles possibly coverd with shapes
	totalNumberOfTiles = 0
	//
	countElements = 0
	for (name in this.shapes)
	{
		// filled with {name of shape : area of shape}  data
		greedyCountArr[name]=this.shapes[name].length
		// count total number of elements in this.shape object
		countElements++
	}

	while(true)
	{
		for (name in greedyCountArr)
		{
			// loop until there is more tiles left uncovered
			if( (numberOfTiles - greedyCountArr[name]) >0)
			{
				(numberOfTiles -= greedyCountArr[name]);
				greedyArr.push(name)
			}
			// when number of tiles is 0 (every tile can be covered) return greedyArr
			else if((numberOfTiles - greedyCountArr[name]) == 0)
			{
				(numberOfTiles -= greedyCountArr[name]);
				greedyArr.push(name)
				return greedyArr
			}
			// if there is no more suitable elements after examining all possible elements return greedyArr (as is)
			else
			{
				if(countElements<0){
					return greedyArr
				}
				countElements--
			}
		}
	}
	
},
// when shape has some negative coordinate, this function helps properly padding of that particular div
paddingHelper : function(name){
		returnValue = 0
		for (var i = 0; i < this.shapes[name].length; i++) {
			if(this.shapes[name][i][0]<0){
				returnValue = Math.abs(this.shapes[name][i][0])*(this.board.tileWidth*1.2);
				break;
			}
			else if(this.shapes[name][i][1]<0){
				returnValue =  Math.abs(this.shapes[name][i][1])*(this.board.tileWidth*1.2);
				break;
			}
			else{
				returnValue =  this.board.tileWidth/2
			}

		};
		return returnValue	
},
};


