//Canvas set up
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = "30px Serif";
let gameSpeed = 1;
let gameOver = false;

//Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}

canvas.addEventListener("mousedown", function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener("mouseup", function(){
    mouse.click = false;
})

//Player
const playerLeft = new Image();
playerLeft.src = "assets/jetpack_man_left.png";
const playerRight = new Image();
playerRight.src = "assets/jetpack_man_right.png";
class Player {
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 692;
        this.spriteHeight = 599;
    }
    update(){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan(dy, dx);
        this.angle = theta;
        if (mouse.x !=this.x){
            this.x -= dx/20;
        }
        if (mouse.y != this.y){
            this.y -= dy/20;
        }
    }
    draw(){
        if (mouse.click) {
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        // ctx.fillStyle = "red";
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        ctx.closePath();
        ctx.fillRect (this.x, this.y, this.radius, 10);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        //if jetpack man is on the right of my mouse
        if (this.x >= mouse.x){
            ctx.drawImage(playerLeft, this.frameX*this.spriteWidth, 
            this.frameY*this.spriteHeight, this.spriteWidth, this.spriteHeight,
            0-60, 0-55, this.spriteWidth/4.5, this.spriteHeight/4.5)
        } else {
            ctx.drawImage(playerRight, this.frameX*this.spriteWidth, 
                this.frameY*this.spriteHeight, this.spriteWidth, this.spriteHeight,
                0-95, 0-55, this.spriteWidth/4.5, this.spriteHeight/4.5)
        }
        ctx.restore();

    }
}
const player = new Player();

//Clouds
const cloudsArray = [];
const cloudImage = new Image();
cloudImage.src = "assets/cloud.png";
class Cloud {
    constructor(){
        this.x = Math.random()*canvas.width;
        this.y = canvas.height + 100;
        this.radius = 40;
        this.speed = Math.random()*5 + 1;
        this.distance;
        this.counted = false;
    }
    update(){
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx*dx + dy*dy);
    }
    draw(){
        // ctx.fillStyle = "blue";
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI *2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();
        ctx.drawImage(cloudImage, this.x-70, this.y-70, this.radius*3.5, this.radius*3.5);
    }
}

const cloudPop = document.createElement("audio");
cloudPop.src = "audio/Plop.ogg";

function handleClouds(){
    if (gameFrame % 50 == 0){
        cloudsArray.push(new Cloud());
        // console.log(cloudsArray.length);
    }
    for (let i = 0; i < cloudsArray.length; i++){
        cloudsArray[i].update();
        cloudsArray[i].draw();
        if (cloudsArray[i].y < 0 - cloudsArray[i].radius*2){
            cloudsArray.splice(i, 1);
            i--;
        } //collision between cloud and jetpack man
        else if (cloudsArray[i].distance < cloudsArray[i].radius + player.radius){
            if (!cloudsArray[i].counted){
                cloudPop.play();
                score++;
                cloudsArray[i].counted = true;
                cloudsArray.splice(i, 1);
                i--;
            }
                
        }
    }
}

//Repeating backgrounds
const background = new Image();
background.src = "assets/background1.png";
const BG = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
}
function handleBackground(){
    BG.x -=gameSpeed;
    if (BG.x < - BG.width) BG.x = 0;
    ctx.drawImage(background, BG.x, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x + BG.width, BG.y, BG.width, BG.height);
}

//Enemies
const enemyImage = new Image();
enemyImage.src = "assets/raven.png";

class Enemy {
    constructor(){
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90;
        this.radius = 60;
        this.speed = Math.random()*2 +2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 271;
        this.spriteHeight = 194;
    }
    draw(){
        // ctx.fillStyle = "red";
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        // ctx.fill();
        ctx.drawImage(enemyImage, this.frameX*this.spriteWidth, this.frameY*this.spriteHeight,
            this.spriteWidth, this.spriteHeight, this.x-75, this.y-55, this.spriteWidth/1.8, this.spriteHeight/1.8);
    }
    update(){
        this.x -= this.speed;
        if (this.x < 0 - this.radius*2){
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random()*2 +2;
        }
        //animate sprite for every 5 frames
        if (gameFrame % 5 == 0){
            this.frameX++;
            this.frameX %= 5;
        }
        //collision with enemy and player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance <this.radius + player.radius){
            handleGameOver();
        }
        
    }
}
const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

function handleGameOver(){
    ctx.fillStyle = "black";
    ctx.font = "40px Serif";
    ctx.fillText("GAME OVER", 270, 250)
    gameOver = true;
}

//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground();
    handleClouds();
    player.update();
    player.draw();
    handleEnemies();
    ctx.fillStyle = "black";
    ctx.fillText("Score: "+ score, 10, 40);
    gameFrame++;
    if (!gameOver) requestAnimationFrame(animate);
}
animate();

//make sure mouse positions are correct when resizing
window.addEventListener("resize", function(){
    canvasPosition = canvas.getBoundingClientRect();
})