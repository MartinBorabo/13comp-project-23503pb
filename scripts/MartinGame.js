console.log('%c MartinGame.js \n--------------------',
    'color: blue; background-color: white;');


console.log("%c t01_create_sprite", "color: blue;");


const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 200;
const PLAYER_HEIGHT = 25;
const PLAYER_WIDTH = 25;


const OBSTACLE_HEIGHT = PLAYER_HEIGHT;
const OBSTACLE_WIDTH = PLAYER_WIDTH;


var spawnDist = 0;
var nextSpawn = 0;
var score = 0;
var player;
 
var screenSelector = "start";  


var obstacles;


// preload()
// Called by P5 before setup
/*******************************************************/


/*******************************************************/
// setup()
/*******************************************************/
function setup() {
    console.log("setup: ");
    cnv= new Canvas(SCREEN_WIDTH, SCREEN_HEIGHT);
   
    obstacles = new Group();


    floor =  new Sprite(SCREEN_WIDTH/2,  SCREEN_HEIGHT, SCREEN_WIDTH, 4, 's');
    floor.color = color("black");
    world.gravity.y = 90;
   
    document.addEventListener("keydown",
        function(event) {
            if(screenSelector == "start"||screenSelector == "end"){
                screenSelector = "game"
                resetGame();
            }else{
                if(player.y > 184 ){// 184 - found from testing - floor level
                    console.log("Key pressed!");
                    player.vel.y = -20;
                }
            }
    });


}
/*******************************************************/
// draw()
/*******************************************************/
function draw() {
    if(screenSelector=="game"){
        gameScreen();
    }else if(screenSelector=="end"){
        endScreen();
    }else if(screenSelector=="start"){
        startScreen();
    }else{
        text("wrong screen - you shouldnt get here", 50, 50);
        console.log("wrong screen - you shouldnt get here")
    }
}


function newObstacle(){


    obstacle = new Sprite((SCREEN_WIDTH -100),  SCREEN_HEIGHT - OBSTACLE_HEIGHT/2, OBSTACLE_WIDTH, OBSTACLE_HEIGHT, 'k');
    obstacle.color = color("#FF007F");
    obstacle.vel.x = -10;
   
    obstacles.add(obstacle);
}
function youDead(_player, _obstacle){
    screenSelector = "end";
    player.remove();
    obstacles.removeAll();
    fb_saveScore_Game2(score);
}


// Main screen functions


function startScreen(){
    background("black");
    allSprites.visible = false;
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text("Welcome to the game", 210, 50);
    textSize(24);
    text("Press any key to start", 240, 110);
}


function gameScreen(){
    background("#0096FF");
    allSprites.visible = true;
    score++;
   
    if (frameCount> nextSpawn){
        newObstacle();
        nextSpawn = frameCount + random(10,120);
    }
   
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text(score, 50, 50);
}


function endScreen(){
    background("black");
    allSprites.visible = false;
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text("You DIED!!!! Too bad >:D", 50, 50);
    textSize(24);
    text("your score was: "+score, 50, 110);
    textSize(14);
    text("press any key to restart", 50, 150);
}


function resetGame(){
    player = new Sprite(PLAYER_WIDTH*1.2,  SCREEN_HEIGHT/2, 10, 10, 'd');
    player.color = color("black");
    player.collides(obstacles, youDead);
    score = 0;
}
/*******************************************************/
//  END OF APP
/*******************************************************/
