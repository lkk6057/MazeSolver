var canvas;
var ctx;
var overlay;
var overlayCTX;
var hud;
var hudCTX;
var baseImage;
var mousePositionElement;
var mainEle;
var zoomFactor = 1;
window.onload=function(){
mainEle = document.getElementById("main");
mousePositionElement = document.getElementById("mouseHUD");
    canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
hud = document.getElementById('hud');
hudCTX = hud.getContext('2d');
overlay = document.getElementById("overlay");
overlayCTX = overlay.getContext('2d');
hud.addEventListener("mousemove",moveMouse);
document.addEventListener("mousedown",mouseDown);
document.addEventListener("mouseup",mouseUp);
document.addEventListener("keydown",keyDown);
baseImage = new Image();
  baseImage.onload = function() {
scaleCanvases(baseImage.width,baseImage.height);
loadCanvasImage(baseImage);
resize();
  }
    baseImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAYAAACoYAD2AAAAAXNSR0IArs4c6QAAAeVJREFUWEfNmNsSgyAMROH/P9qOncHByOZssA/1rUJDOGwu2FtrR/vzpx/HkTrZe2/ZlDEe59H/XC6nnT6TPJ05X45n/I7v1Xicr/4XHST7XydnUooAkakSjfPVSVwkaSfu0ZAdRZreXySznTikx0bIDml3Rfjh5DyJtKcIE5lolzSaOrki6GpPac7V4nwy6GQW7Sr6iSSNR9IY3a6G4pG5JKOWV+vdSLoaq0a7mz/VPHncaoeUL6tEnfmWJl0SRNi1E/OtnScpKslBlRUUSRndlBddEirvUS1XvYOM7t3oJI3RuIzutwSr+bK63jZJR0tZ0q7U+jRPUj/pao+0rLR4bWT0k7t9JGnMzbdZT2DlSUovLlGlRdUVDcKWk9kdx9Umzcs0Wuon1Y533xNBJKmOmLRL4zsatrogl1T1jkMataNbRaersWp0r+wuNUnRWq3BpD0lrYcmiVi1C6KOXkXzyo/bFwzSCNVoOgEiptZ/1O4sX81OVslTQdj+gkFaUjWXNFslKkm6ROmLxW4WmNe3uqC3RKnLIS3jHcfVHpEnorYmacfUX1a16K5nk6zktaxrons7flWjGk1R6ZIm4tEORjflt7e1WdmfiS4rjuvYboVy7cva7RqgaCUNV9b5CcnKgjtzPzke0DpG2aFWAAAAAElFTkSuQmCC";
}
window.addEventListener("resize",resize);
function resize(e){
var factorX = window.innerWidth/1920;
var factorY = window.innerHeight/900;
zoomFactor = Math.min(factorX,factorY);
 mainEle.setAttribute("style",`zoom:${zoomFactor}`);
}
var mazeMap;
function loadCanvasImage(image){
mazeMap = [];
ctx.imageSmoothingEnabled = false;
overlayCTX.imageSmoothingEnabled = false;
              ctx.drawImage(image, 0, 0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.stroke();
    var black = 0;
    for(var y=0;y<canvas.height;y++){
        var row = [];
        for(var x = 0;x<canvas.width;x++){
            row[x]= isBlack(ctx,x,y);
        }
        mazeMap.push(row);
    }

initializePath();

}
function scaleCanvases(width,height){
canvas.width = width;
canvas.height =height;
    overlay.width = width;
    overlay.height = height;
    hud.width = width;
    hud.height = width;
}
var canvasMousePos = {x:-1,y:-1};
var isMouseDown = false;
var editMode = 0;
function moveMouse(e){
    var x = Math.floor(e.offsetX/(820*zoomFactor/mazeMap.length));
    var y = Math.floor(e.offsetY/(820*zoomFactor/mazeMap.length));
if(x!=canvasMousePos.x||y!=canvasMousePos.y){
    var oldPos = canvasMousePos;
    canvasMousePos = {x:x,y:y};
    canvasMouseMoved(oldPos);
   }
}
function editMousePositionStatus(){
    mousePositionElement.innerHTML = ` (${canvasMousePos.x},${canvasMousePos.y})`
}
function canvasMouseMoved(oldPos){
editMousePositionStatus();
if(!isMouseDown){
    if(isWall(canvasMousePos)){
    setPixelColor(hudCTX,255,255,255,255,canvasMousePos.x,canvasMousePos.y);
    editMode = 0;
}
    else{
            setPixelColor(hudCTX,0,0,0,255,canvasMousePos.x,canvasMousePos.y);
        editMode = 1;
    }
    hudCTX.clearRect(oldPos.x,oldPos.y,1,1);
}
else{
    editPixel(canvasMousePos);
}
}
function keyDown(e){
    switch(e.keyCode){
        case 82:
            initializePath();
            break;
                case 83:
            document.getElementById("startPoint").value = ` (${canvasMousePos.x},${canvasMousePos.y})`;
            initializePath();
            break;
                    case 68:
            generateMaze();
            break;
                case 69:
            document.getElementById("endPoint").value = ` (${canvasMousePos.x},${canvasMousePos.y})`;
            initializePath();
            break;
                case 70:
            togglePaused();
            break;
                        case 67:
            clearMaze();
            initializePath();
            break;
                        case 81:
            location.reload();
            break;
                            case 87:
            fillMaze();
            break;
           }
}

function togglePaused(){
    settings.paused = !settings.paused;
    var pauseText = settings.paused ? "Unpause (F)" : "Pause (F)";
    document.getElementById("pauseButton").innerHTML = pauseText;
    initializePath();
}
function generateMaze(){
    loadSettings();
    const mazeSettings = {
        width: settings.size,
        height: settings.size,
        wallSize: 1,
        removeWalls: 0,
        entryType: '',
        bias: '',
        color: '#000000',
        backgroudColor: '#FFFFFF',
        solveColor: '#cc3737'
    }
var maze = new Maze(mazeSettings);
maze.generate();
scaleCanvases(maze.matrix.length,maze.matrix.length);
mazeMap = [];
    for(var y=0;y<maze.matrix.length;y++){
        var row = [];
        for(var x = 0;x<maze.matrix[0].length;x++){
            var wall = maze.matrix[x][y]=="1";
            row[x] = wall;
            var point = {x:x,y:y};
        }
        mazeMap.push(row);
    }
for(var y = 0;y<mazeMap.length;y++){
    for(var x =0;x<mazeMap[0].length;x++){
var wall = mazeMap[y][x];
        var point = {x:x,y:y};
                    setWall(point,wall);
    }
}
    
                document.getElementById("startPoint").value = ` (0,1)`;
            document.getElementById("endPoint").value = ` (${mazeMap[mazeMap.length-2].length-1},${mazeMap.length-2})`;
    loadSettings();
setWall(startingPoint,false);
setWall(targetPoint,false);
    
    
initializePath();

}
function clearMaze(){
    for(var x=0;x<canvas.width;x++){
        for(var y=0;y<canvas.height;y++){
            var point = {x:x,y:y};
            setWall(point,false);
        }
    }
    initializePath();
}
function fillMaze(){
        for(var x=0;x<canvas.width;x++){
        for(var y=0;y<canvas.height;y++){
            var point = {x:x,y:y};
            setWall(point,true);
        }
        }
    
setWall(startingPoint,false);
setWall(targetPoint,false);
    initializePath();
}
function setWall(point,wall){
    if(wall){
                                    setPixelColor(ctx,0,0,0,255,point.x,point.y);
                        mazeMap[point.y][point.x]=true; 
       }
    else{
                                setPixelColor(ctx,255,255,255,255,point.x,point.y);
                        mazeMap[point.y][point.x]=false;
    }
}
function editPixel(pixel){
    switch(editMode){
        case 0:
            setPixelColor(ctx,255,255,255,255,pixel.x,pixel.y);
            mazeMap[pixel.y][pixel.x]=false;
        break;
        case 1:
            setPixelColor(ctx,0,0,0,255,pixel.x,pixel.y);
                        mazeMap[pixel.y][pixel.x]=true;
        break;
           }
    initializePath();
}
function mouseDown(e){
    if(e.button==0){
       isMouseDown = true;
        editPixel(canvasMousePos);
            hudCTX.clearRect(canvasMousePos.x,canvasMousePos.y,1,1);
       }
}

function mouseUp(e){
 if(e.button==0){
    isMouseDown = false;
    }   
}
function mouseLeave(e){
    isMouseDown = false;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function getPixelColor(context,x,y){
      var pixel = context.getImageData(x, y, 1, 1);
  var data = pixel.data;
        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
    return rgba;
}
function setPixelColor(context,r,g,b,a,x,y){
context.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
context.fillRect( x, y, 1, 1 );
}
function isBlack(context,x,y){
    var color = getPixelColor(context,x,y);
                if(color=="rgba(0, 0, 0, 255)"){
               return true;
               }
    return false;
}
var openNodes = [];
var closedNodes = [];
var startingPoint={x:0,y:1};
var currentPoint;
var targetPoint= {x:40,y:39};
var pathFinderId;
var settings = {paused:false,pulseDelay:40, pulseGap: 8};
var solved = false;
var solvedPath = [];
var solvedAnimation;
function loadSettings(){
    settings.size = document.getElementById("mazeSize").value;
    settings.cornerTravel = document.getElementById("cornerTravelCheck").checked;
    settings.singleStep = document.getElementById("singleStepCheck").checked;
    settings.slowPath = document.getElementById("slowPathCheck").checked;
    settings.pathDelay = document.getElementById("pathDelay").value;
        
    var startingPointSetting = document.getElementById("startPoint").value.replace("(","").replace(")","").replace(" ","").split(",");
    startingPoint.x = Number(startingPointSetting[0]);
    startingPoint.y = Number(startingPointSetting[1]);
    
    var endingPointSetting = document.getElementById("endPoint").value.replace("(","").replace(")","").replace(" ","").split(",");
    targetPoint.x = Number(endingPointSetting[0]);
    targetPoint.y = Number(endingPointSetting[1]);
    
}

function initializePath(){
    solved = false;
    if(pathFinderId!=null){
       clearInterval(pathFinderId);
       }
    if(solvedAnimation!=null){
       clearInterval(solvedAnimation);
       }
    loadSettings();
        overlayCTX.clearRect(0,0,overlay.width,overlay.height);
    openNodes = [];
    closedNodes = [];
    colorEnds();
    currentPoint = startingPoint;
    if(!settings.paused){
    var catalyst = new Node(currentPoint,currentPoint,false,true);
    closedNodes.push(catalyst);
    iteratePathfinding();
    pathFinderId = setInterval(iterateChunk,settings.pathDelay);
}
}
function iterateChunk(){
    if(settings.singleStep){
iteratePathfinding();
}
    else{
            for(var i = 0;i<openNodes.length;i++){
    var targetFound = iteratePathfinding();
    if(targetFound){
    solved = true;
    solvedAnimation = setInterval(solvedAnimate,settings.pulseDelay);
       break;
       }
    }
    }
}
var solvedIndex = settings.pulseGap;
function solvedAnimate(){
    if(solved){
if(solvedIndex<0){
   solvedIndex = settings.pulseGap;
   }
 var animatedPath = [];
var bluePoints = [];
var blueIndexes = [];
for(var i = solvedIndex;i<solvedPath.length;i+=settings.pulseGap){
    bluePoints.push(solvedPath[i]);
    blueIndexes.push(i);
}
for(var i = 0;i<solvedPath.length;i++){
    if(!blueIndexes.includes(i)){
       animatedPath.push(solvedPath[i]);
       }
    else{
    }
}
colorSolved(animatedPath);
colorBlue(bluePoints);
    solvedIndex--;
       }
    else{
        clearInterval(solvedAnimation);
    }
}
function iteratePathfinding(){
        var neighbors = getNeighborPositions(currentPoint);
        var newNodes = [];
    for(var i = 0;i<neighbors.length;i++){
        var neighbor = neighbors[i];
        var node = new Node(neighbor,currentPoint);
        var retrievedNode = getNode(neighbor);
        if(retrievedNode==null){
        newNodes.push(node);
    }
        else if(node.fCost<retrievedNode.fCost&&node.open){
                //openNodes[retrievedNodeIndex] = node;
            //console.log("try overwrite");
                }
    }
            if(currentPoint.x==targetPoint.x&&currentPoint.y==targetPoint.y){
       clearInterval(pathFinderId);
            traceSolution(getNode(currentPoint));
                return true;
            }
       else{
        closeNode(currentPoint);
      addOpenNodes(newNodes);     
    var bestLead = getBestOpenLead();
    //var bestLead = getClosestLead();
    currentPoint = bestLead.position;
   /* console.log(openNodes);
    console.log(closedNodes);
console.log("best lead:");*/
        //console.log(currentPoint);
return false;
       }
}
function addOpenNodes(newNodes){
        openNodes = openNodes.concat(newNodes);
    var points = [];
for(var i = 0;i<newNodes.length;i++){
    var newNode = newNodes[i];
    points.push(newNode.position);
}
colorOpen(points);
}
var greenColor = {r:50,g:205,b:50,a:255};
var redColor = {r:255,g:0,b:0,a:255};
var cyanColor = {r:0,g:255,b:255,a:255};
var blueColor = {r:0,g:71,b:171,a:255};
var startColor = {r:255,g:0,b:255,a:180};
var endColor = {r:191,g:64,b:191,a:180};
function colorOpen(points){
    colorInOverlay(points,greenColor);
}
function colorClosed(points){
        colorInOverlay(points,redColor);
}
function colorBlue(points){
    colorInOverlay(points,blueColor);
}
function colorSolved(points){
        colorInOverlay(points,cyanColor);
}
function colorEnds(){
    colorInOverlay([startingPoint],startColor);
    colorInOverlay([targetPoint],endColor);
}
function colorInOverlay(points,color){
        for(var i =0;i<points.length;i++){
        var point = points[i];
        setPixelColor(overlayCTX,color.r,color.g,color.b,color.a,point.x,point.y);
        
    }
}
function getBestOpenLead(){
    var runningMinFCost = openNodes[0].fCost;
    var runningBestLead = openNodes[0];
    for(var i = 0;i<openNodes.length;i++){
        var openNode = openNodes[i];
        if((openNode.fCost<runningMinFCost)||(openNode.fCost==runningMinFCost&&openNode.hCost<runningBestLead.hCost)){
           runningMinFCost = openNode.fCost;
            runningBestLead = openNode;
           }
    }
    return runningBestLead;
}
function closeNode(position){
    var openNodeIndex = getOpenNodeIndex(position);
    if(openNodeIndex>-1){
       var closedNode = openNodes[openNodeIndex];
        closedNode.setOpen(false);
        openNodes.splice(openNodeIndex,1);
        closedNodes.push(closedNode);
        colorClosed([closedNode.position]);
       }
}
function getNodesFromPoints(points,baseNode){
for(var i = 0;i<points.length;i++){
    var point = points[i];
    var retrievedNode = getNode(point);
    var newNode = new Node(point,baseNode.position);
}
}
function traceSolution(node){
var currentNode = node;    
var path = [];

while(!currentNode.starting){
if(path.includes(currentNode.position)){
   console.log("infinite loop");
    console.log(openNodes);
    break;
   }
    if(currentNode.origin==null&&!currentNode.starting){
   return null;
   }
//console.log(currentNode.position.x+" "+currentNode.position.y+" jumping "+currentNode.origin.x+" "+currentNode.origin.y+" ["+currentNode.jumpCost+"]");
path.push(currentNode.position);

currentNode = getNode(currentNode.origin);
          }
//colorSolved(path);
path.splice(0,1);
solvedPath = path;
    colorEnds();
}

function getGCost(node){
var cumulativePoints = 0;
var currentNode = node;    
var path = [];
var nextNode = getNode(currentNode.origin);
if(nextNode==null||nextNode.fCost==null||settings.slowPath){
while(!currentNode.starting){
if(path.includes(currentNode.position)){
   console.log("infinite loop");
    console.log(openNodes);
    break;
   }
    if(currentNode.origin==null&&!currentNode.starting){
   return null;
   }
cumulativePoints+=currentNode.jumpCost;
//console.log(currentNode.position.x+" "+currentNode.position.y+" jumping "+currentNode.origin.x+" "+currentNode.origin.y+" ["+currentNode.jumpCost+"]");
path.push(currentNode.position);
currentNode = getNode(currentNode.origin);
          }
//console.log("total "+cumulativePoints);
return cumulativePoints;
}
else{
    return nextNode.gCost+node.jumpCost;
}
}
function getNode(point){
            for(var i = 0;i<openNodes.length;i++){
            var openNode = openNodes[i];
        if(openNode.position.x==point.x&&openNode.position.y==point.y){
           return openNode;
           }
    }
    for(var i = 0;i<closedNodes.length;i++){
        var closedNode = closedNodes[i];
        if(closedNode.position.x==point.x&&closedNode.position.y==point.y){
           return closedNode;
           }
    }
  return null; 
}
function getOpenNodeIndex(point){
for(var i = 0;i<openNodes.length;i++){
    var openNode = openNodes[i];
    if(openNode.position.x==point.x&&openNode.position.y==point.y){
       return i;
       }
}
return -1;
}
function getHCost(point){
    var hCost = getApproximateCost(point,targetPoint);
    return hCost;
}
function getApproximateCost(point1,point2){
   var cost = Math.floor(getDistance(point1,point2)*10);
    return cost;
}
function getDistance(point1,point2){
var a = point2.x-point1.x;
var b = point2.y-point1.y;
    var distance = Math.sqrt(a**2+b**2);
return distance;
}
var cornerBaseNeighbors = [{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1}];
var adjacentBaseNeighbors = [{x:-1,y:0},{x:0,y:1},{x:1,y:0},{x:0,y:-1}]
function getNeighborPositions(point){
var neighbors = [];
var baseNeighbors = settings.cornerTravel ? cornerBaseNeighbors : adjacentBaseNeighbors;
for(var i = 0;i<baseNeighbors.length;i++){
var baseNeighbor = baseNeighbors[i];
    var neighbor = {x:baseNeighbor.x+point.x,y:baseNeighbor.y+point.y};
if(isValid(neighbor)){
   neighbors.push(neighbor);
   }
}
return neighbors;
}
function isValid(point){
//console.log(point.x+" "+point.y+" "+isOpen(point)+" "+withinBounds(point)+" "+!isWall(point));
    return isOpen(point)&&withinBounds(point)&&!isWall(point);
}
function isOpen(point){
    for(var i = 0;i<closedNodes.count;i++){
        var closedNode = closedNodes[i];
        if(closedNode.x==point.x&&closedNode.y==point.y){
           return false;
           }
    }
    return true;
}
function withinBounds(point){
var width = ctx.canvas.width;
var height = ctx.canvas.height;
    if(point.x>=0&&point.x<width&&point.y>=0&&point.y<height){
return true;
}
return false;
}
function isWall(point){
    return mazeMap[point.y][point.x];
}
class Node{
    constructor(position,origin,open=true,starting = false){
        this.position = position;
        this.origin = origin;
        this.open = open;
        this.starting = starting;
        this.jumpCost = getApproximateCost(position,origin);
        this.setCosts(getGCost(this),getApproximateCost(position,targetPoint));
    }
    setOpen(open){
        this.open = open;
    }
    setCosts(gCost,hCost){
        this.gCost = gCost;
        this.hCost = hCost;
        this.fCost = this.gCost+this.hCost;
    }
}