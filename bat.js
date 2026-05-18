//This is the code which regards the bat enemy 
class Bat extends Humanoid{
  constructor(x, y){
    super(x, y);

    //Configs
    this.imageScale = 2;
    this.sizeX = 16 * this.imageScale;
    this.sizeY = 13 * this.imageScale;
    this.moveSpeed = 2;
    this.lookHeight = 64;
    this.maxSpeed = 2;
    this.minSpeed = 1.5;
    this.health = 2;
    this.type = "bat";
    this.startingY = this.y;
    this.maxDistance = 3;
    this.lastAttack;
    this.attackCD = 1500;
    this.active = true;
    this.attackDistance = 100;
    this.lookDistance = 350;
    this.lastRotation = 0;
    this.lastHitTaken = 0;
    this.windingUp = false;
    this.moveDir = 1;
    
    //Animations
    this.idle = "batIdle";
    this.death = "batDeath";
    this.attack = "batAttack";
    this.hit = "batHit";
    
    //Sprites
    this.sprites = {
      idle: {
        sheet: this.idle,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      attack: {
        sheet: this.attack,
        totalFrames: 7,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: false,
        oneTime: true
      },

      hit: {
        sheet: this.hit,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 2,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: false,
        oneTime: true
      },

      death: {
        sheet: this.death,
        totalFrames: 8,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: false,
      },

      deathFall: {
        sheet: this.death,
        totalFrames: 3,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 8,
        shouldLoop: false,
      },
    };
  }

  applyForces(){
    let lookAhead = this.directionFacing === "right" ? 25 : -25;
    let floorCheckX = this.x + lookAhead;
   
    if (checkIfPath(floorCheckX, this.y)) {
        this.directionFacing = this.directionFacing === "right" ? "left" : "right";
        this.moveDir *= -1;
    }


    if (this.actionState === "attack" || !this.active){
      this.x += this.xVel;
    }

    if (!this.active){
      this.xVel -= FRICTIONALFORCE * Math.sign(this.xVel);
    }

    if (this.moveSpeed !== 0 && this.actionState !== "attack" && this.active) {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "left" ? -1 : 1;

      this.xVel = this.moveDir * accel;
      this.x += this.xVel;
    }

    let distance = this.y - this.startingY;

    //While it may seem counter intuitive we apply gravity to the bat at a lower level, to mimic the bat actually flapping its wings to go up
    if (this.y - this.startingY < this.maxDistance && this.actionState === "idle" && !this.windingUp){
      let intensity = Math.max(0, distance);
      this.yVel += GRAVITATIONALFORCE/2 + intensity * 0.1;
    }

    if (!this.active || this.actionState === "death"){
      this.yVel += GRAVITATIONALFORCE;
    }
    
    this.yVel = Math.min(Math.max(this.yVel, -2), 2);

    if (this.actionState === "attack" && this.currentFrame === 4) {
      this.yVel -= 3; //for swoop effect
    }

    if (this.windingUp) {
      this.yVel = 0;
    }

    this.y += this.yVel;
  }

  display() {
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;
    this.xCrop = (this.currentFrame + anim.startFrame) * this.frameWidth;
    this.currentSheet = anim.sheet;
    this.totalImage = anim.totalFrames;

    //Make origin at Mushrooms"s current position to flip player image when neccesary
    push();
    translate(this.x, this.y);

    if (this.directionFacing === "left"){
      scale(-1, 1);
    }

    //If it is the correct frame to advance frames advance
    if (frameCount % anim.spriteSpeed === 0) {
      let lastFrame = this.currentFrame;
      this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;

      if (this.actionState === "idle" && this.currentFrame === 0 && abs(this.startingY - this.y) > this.maxDistance && this.active){
        this.yVel -= random(this.minSpeed, this.maxSpeed);
      }
      else if (this.actionState === "idle" && this.active){
        this.yVel -= 0.1;
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {

        if (this.actionState === "attack") {
          this.moveSpeed = 2;
          this.actionState = "idle";
        }

        //Whenever we get hit, check if we are still alive
        else if (this.actionState === "hit" && this.health <= 0) {
          this.actionState = "death";
          this.active = false;
        }
        
        //Return to idle if no conditions met
        else {
          this.lastActionState = this.actionState;
          this.actionState = "idle";
        }
        
        
      }
    }

    let angle = this.active ? Math.min(Math.max(this.y - this.startingY, -5), 20) : 0;
    if (this.actionState === 'idle'){
      rotate(angle);
    }
    else{
      rotate(this.lastRotation);
    }

    this.lastRotation = angle;

    if (this.windingUp){
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255,0 ,0);
    }
    else{
      drawingContext.shadowBlur = 0;
    }

    image(
      imageTable[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale * this.xScale,
      this.frameHeight * this.imageScale * this.yScale,
      this.xCrop,
      anim.yOffset,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
  }

  handleState() {
    //Skip if currently in an action state
    if (
      this.actionState === "attack" || 
      this.actionState === "hit" ||
      this.actionState === "attackWind" ||
      this.actionState === "attackRecover" || this.actionState === "deathFall"
    ) {
      return;
    }

    if (this.actionState === "death" && this.currentFrame === 7 && this.grounded && this.yVel === 0){
      this.actionState = "deathFall";
    }


    if (abs(this.xVel) > 0.2 && this.active){
      this.actionState = "idle";
    }
  }

  //Update mushroom
  update() {
    this.handleState();
    this.applyHit();
    this.runAI();

    //Reset animation frame
    if (this.actionState !== this.lastActionState) {
      this.currentFrame = 0;
      this.lastActionState = this.actionState;
    }
  }

  //What to do when hit
  onHit(blocked) {
    if (millis() - this.lastHitTaken < 250){
      return;
    }

    this.windingUp = false;
    if (blocked){
      this.health = 0;
    }
    else{
      this.health -= 1;
    }
    this.lastHitTaken = millis();
    this.actionState = "hit";
    this.moveSpeed = 0;
    this.yVel = 0;
    this.xVel = 0;
  }

  checkCollision(item) {
    if (this.cantCollide || !this.active) {
      return;
    }

    //Proper collisions
    let overlapX = (item.sizeX + this.sizeX) / 2 - Math.abs(item.x - this.x);
    let overlapY = (item.sizeY + this.sizeY) / 2 - Math.abs(item.y - this.y);

    if (overlapX > 0 && overlapY > 0) {
      return true;
    }
  }

  applyHit() {
    //Player dodges it if mushroom is currently attacking and player is rolling
    if (!this.active || this.actionState === "hit" || this.actionState === "stun") {
      return;
    }

    //Player hit on touch
    if (this.checkCollision(player)) {
      if (millis() - player.lastHitTaken < 1000) {
        return;
      }

      //Dont damage when dodging
      if (player.actionState === "rolling" && this.actionState === "attack") {
        player.didDodge();
        return;
      }

      //If player is blocking die
      if (this.actionState === "attack" && player.actionState === "blocking" && this.directionFacing !== player.directionFacing && this.actionState === "attack" && this.actionState !== "hit") {
        this.xVel = this.xVel * -1;
        freezeFrames = 10;
        screenShake = 4;
        this.onHit(true);
        this.moveSpeed = 0;
        player.didBlock();
        return;
      }

      player.gotHit();

      if (this.x < player.x) {
        if (!player.grounded) {
          player.xVel = 5;
        }
        else {
          player.xVel = 6;
        }
      }

      else {
        if (!player.grounded) {
          player.xVel = -5;
        }
        else {
          player.xVel = -6;
        }
      }

      player.yVel = player.grounded ? -3 : -5; 
      screenShake = 4;
    }
  }

  runAI(){
    //If being hit return
    if (this.actionState === "hit" ||
      this.actionState === "attack" || this.actionState === "death" ||
      !this.active) {
      return;
    }

    //Use this method of distance check rather than dist() for optimization
    let dx = this.x - player.x;
    let dy = this.y - player.y;
    let distSquared = dx * dx + dy * dy;
    let heightDiff = abs(this.y - player.y);

    if (abs(distSquared) < this.lookDistance * this.lookDistance && heightDiff < this.lookHeight){
      if (player.x > this.x) {
        this.directionFacing = "right";
        this.moveDir = 1;
      }
      else if (player.x < this.x ) {
        this.directionFacing = "left";
        this.moveDir = -1;
      }
    }

    //First check if the player is directly in front or behind, and if they are attack them
    if (abs(distSquared) < this.lookDistance * this.attackDistance && heightDiff < this.lookHeight) {
      if (millis() - this.lastAttack < this.attackCD) {
        return;
      }

      this.yVel = 0;
      this.windingUp = true;
      this.attacked = true;

      setTimeout(() => {
        {
          if (this.actionState === "hit" || !this.active || this.actionState === "death"){
            return;
          }
          this.actionState = "attack";
          this.lastAttack = millis();
          this.xVel = this.directionFacing === "right" ? 6 : -6;
          this.yVel += 4;
          this.windingUp = false;
        }  
      }, 250);
    }
    else if (this.moveSpeed === 0.25 && this.actionState === "idle"){
      this.moveSpeed = 2;
    }
  }
}