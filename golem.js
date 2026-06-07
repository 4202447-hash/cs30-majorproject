//This is the code regarding all golem, armoured golem, and rock related mobs

class Golem extends Humanoid{
  constructor(x, y){
    super(x, y);

    //Configs
    this.type = "golem";
    this.mode = "A";
    this.startingX = this.x;
    this.startingY = this.y;
    this.active = true;
    this.imageScale = 1.5;
    this.sizeY = 30 * this.imageScale;
    this.sizeX = 16 * this.imageScale;
    this.moveSpeed = 2.5;
    this.health = 10;
    this.atkACD = 5000;
    this.atkCCD = 4000;
    this.atkADistance = 330;
    this.attackCCnt = 0;
    this.atkCDistance = 200;
    this.lookDistance = 350;
    this.lookHeight = 64;
    this.hasTarget = false;
    this.moveDir = 0;
    this.actionState = "idleA";
    this.timeSinceIdle = 0;
    this.heightDiff = 64;
    this.lastModeSwitch = 0;

    //Sounds
    this.hoverFx = new p5.SoundFile(golemHoverFx.url);
    this.sounds = [this.hoverFx]

    //Set to negative 5000 to match the atkACD meaning he can attack as soon as he spawns
    this.lastAttackA = -5000;
    this.lastAttackC = -4000;

    //Animations
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.currentSheet = 0;
    this.yCrop = 0;

    this.atkA = "golemAtkA";
    this.atkC = "golemAtkC";
    this.deathA = "golemDeathA";
    this.deathB = "golemDeathB";
    this.hitA = "golemHitA";
    this.hitB = "golemHitB";
    this.idleA = "golemIdleA";
    this.idleB = "golemIdleB";
    this.run = "golemRun";
    this.reset = "golemReset";
    this.stun = "golemStun";

    //Sprites
    this.sprites = {
      idleA: {
        sheet: this.idleA,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 12,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      idleB: {
        sheet: this.idleB,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 12,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      attackA: {
        sheet: this.atkA,
        totalFrames: 12,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true
      },

      attackC: {
        sheet: this.atkC,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      deathA: {
        sheet: this.deathA,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 4,
        oneTime: true
      },

      deathB: {
        sheet: this.deathB,
        totalFrames: 9,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 4
      },

      hitA: {
        sheet: this.hitA,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      hitB: {
        sheet: this.hitB,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      running: {
        sheet: this.run,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
      },

      reset: {
        sheet: this.reset,
        totalFrames: 7,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      stun: {
        sheet: this.stun,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 12,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
      },
    };
  }

  //This will handle the golems gravity and movement
  applyForces(){
    //Movement
    this.top = this.y - this.sizeY / 2;
    this.bottom = this.y + this.sizeY / 2;
    this.left = this.x - this.sizeX / 2;
    this.right = this.x + this.sizeX / 2;

    //If there is nothing ahead of us return to idle as the player has gotten away
    let lookAhead = this.directionFacing === "right" ? 25 : -25;
    let floorCheckX = this.x + lookAhead;
    let floorCheckY = this.bottom + 40;

    if (!checkIfPath(floorCheckX, floorCheckY) && this.hasTarget) {
      this.moveDir = 0;
      this.hasTarget = false;
    }

    if (this.moveDir !== 0 && this.moveSpeed !== 0 && this.actionState !== "attackC") {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "right" ? 1 : -1;

      this.xVel = this.moveDir * accel;
    }

    //Apply gravity
    if (!this.grounded) {
      this.yVel += GRAVITATIONALFORCE;
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Apply friction, 1/4 in air
    if (this.moveDir === 0 || this.moveSpeed === 0) {
      let currentFriction = this.grounded
        ? FRICTIONALFORCE
        : FRICTIONALFORCE / 4;

      if (abs(this.xVel) <= currentFriction) {
        this.xVel = 0;
      }
      else {
        this.xVel -= (this.xVel > 0 ? 1 : -1) * currentFriction;
      }
    }

    //Reset ground state
    this.grounded = false;
  }

  display() {
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = (column + anim.startFrame) * this.frameWidth;

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

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {

        //After attack A keep us held still to give player an opening
        if (this.actionState === "attackA") {
          this.moveSpeed = 0;
          this.actionState = "idleA";
          this.mode = "A";
          this.madePebble = false;
        }

        if (this.actionState.startsWith("hit")){
          if (this.health % 4 === 0){
            if (this.mode === "A"){
              this.actionState = "reset";
            }
            this.attackA();
          }

          if (this.health % 5 === 0){
            if (this.mode === "A"){
              this.attackCCnt = 0;
              this.attackC();
            }
          }

          this.actionState = "idle" + this.mode;
        }

        //Set mode to B after golem resets
        else if (this.actionState === "reset") {
          if (!this.active){
            this.windingUp = false;
            this.actionState = "deathB";
            return;
          }

          this.windingUp = false;
          this.mode = "B";
          this.actionState = "idleB";

          if (this.health % 4 === 0){
            this.attackA();
          }
        }

        else if (this.actionState === "attackC" && this.attackCCnt !== 3) {
          this.xVel *= 0.5;
          this.screenShake += 3;
          this.directionFacing = this.directionFacing === "left" ? "right" : "left";
          this.attackC();
        }

        else if (this.actionState === "attackC" && this.attackCCnt === 3) {
          this.xVel *= 0.5;
          this.actionState = "idleA";
        }

        //Whenever we get hit, check if we are still alive
        else if (this.actionState === "hit" && this.health <= 0) {
          this.actionState = "death" + this.mode;
          this.active = false;
          this.windingUp = false;
        }

        else if (this.actionState === "deathA") {
          this.actionState = "reset";
        }
        
        //Return to idle if no conditions met
        else {
          this.lastActionState = this.actionState;
          this.actionState = "idle" + this.mode;
        }
      }
    }

    if (this.windingUp){
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255,0 ,0);
    }
    else{
      drawingContext.shadowBlur = 0;
    }

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale * this.xScale,
      this.frameHeight * this.imageScale * this.yScale,
      this.xCrop,
      this.yCrop,
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
      this.actionState.startsWith("attack") || 
      this.actionState.startsWith("hit") || this.actionState.startsWith("death") ||this.actionState === "raisePillar" ||
      this.actionState === "reset" || this.actionState === "stun"
    ) {
      return;
    }
    if (abs(this.xVel) > 0.1) {
      this.actionState = "running" ;
      
    }
    else if (this.actionState === "running") {
      this.actionState = "idle" + this.mode;
    }

    if (this.actionState.startsWith("idle")){
        playMobSound(this.hoverFx, null, null, this, true);
    }
  }

  update() {

    this.handleState();
    if (this.checkCollision(player)){
      this.applyHit();
    };
    this.runAI();

    //Reset animation frame
    if (this.actionState !== this.lastActionState) {
      this.currentFrame = 0;
      this.lastActionState = this.actionState;
      if (this.actionState.startsWith("idle")){
        this.timeSinceIdle = millis();
      }
    }
  }

  //What to do when hit
  onHit(damage) {
    if (this.windingUp || this.actionState === "reset" || !this.active){
      return;
    }

    this.windingUp = false;

    this.currentFrame = 0;
    this.moveSpeed = 0;
    this.health -= damage || 1;
    this.xVel = 0;
    if (this.health > 0){
      this.actionState = "hit" + this.mode;
    }
    else{
      this.actionState = "death" + this.mode;
      this.active = false;
      this.windingUp = false;
    }

    let distance = abs(this.x - player.x);

    if (distance > 10){
      this.xVel = player.x < this.x ? this.xVel + 3 : this.xVel - 3;
    }
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
    if (!this.active || this.actionState === "stun") {
      return;
    }

    //Player hit on touch
    if (this.checkCollision(player)) {
      if (millis() - player.lastHitTaken < player.hitCD) {
        return;
      }

      //If player is blocking get stunned
      if (player.actionState === "blocking" && this.directionFacing !== player.directionFacing && this.actionState === "attackC") {
        this.actionState = "stun";
        this.attackCCnt = 0;
        freezeFrames = 5;
        screenShake = 4;
        this.moveSpeed = 0;
        this.xVel = player.x < this.x ? 12 : -12;
        player.didBlock();
        return;
      }

      //Dont damage when dodging
      if (player.actionState === "rolling" && this.actionState.startsWith("attack")) {
        player.didDodge();
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
    if (
      this.actionState.startsWith("attack") || this.actionState.startsWith("death") || this.actionState === "reset" || this.actionState.startsWith("hit") || 
      !this.active) {
      return;
    }

    //Use this method of distance check rather than dist() for optimization
    let dx = this.x - player.x;
    let dy = this.y - player.y;
    let distSquared = dx * dx + dy * dy;
    let heightDiff = abs(this.y - player.y);

    //This is what makes the golem face and follow the player
    if (abs(distSquared) < this.lookDistance * this.lookDistance && heightDiff < this.lookHeight){
      this.hasTarget = true;

      //Reset mode if we are in true idle with player not around
      if (this.mode === "A" && this.actionState === "idleA" && !this.hasTarget){
        this.actionState = "reset";
        this.moveSpeed = 0;
        return;
      }

      if (player.x > this.x) {
        if (this.directionFacing !== "right"){
          this.moveSpeed = lerp(this.moveSpeed, 0, 0.1);
        }
        if (abs(this.moveSpeed) < 0.1){
          this.directionFacing = "right";
          this.moveDir = 1;

          //This check essentially makes the golem stand stillf or a little bit after attacking
        }
      }
      else if (player.x < this.x ) {
        if (this.directionFacing !== "left"){
          this.moveSpeed = lerp(this.moveSpeed, 0, 0.1);
        }
        if (abs(this.moveSpeed) < 0.1){
          this.directionFacing = "left";
          this.moveDir = -1;
        }
      }
    }

    //Attack C runs when following attack A when the player tries to approach to hit it
    if (this.mode === "A" && abs(distSquared) < this.atkCDistance * this.atkCDistance && heightDiff < this.lookHeight && millis() - this.lastAttackC > this.atkCCD){
      this.attackC();
      return;
    }

    //Mode reset to B so we can run attack A again
    if (millis() - this.lastAttackA > this.atkACD && this.mode === "A" && !this.actionState.startsWith("hit")){
      this.actionState = "reset";
      this.windingUp = false;
      return;
    }

    //Attack A
    
    if (abs(distSquared) < this.atkADistance * this.atkADistance && heightDiff < this.lookHeight && millis() - this.lastAttackA > this.atkACD) {
      this.attackA(distSquared);
    }
  }

  attackA(){
    if (this.mode === "A"){
      return;
    }
      
    if (player.x > this.x) {
      this.directionFacing = "right";
      this.moveDir = -1;
    }
    else if (player.x < this.x ) {
      this.directionFacing = "left";
      this.moveDir = 1;
    }

      
    this.yVel = 0;
    this.windingUp = true;
    this.actionState = "attackA";

    //If we are within the range of attack c we are too close for a ranged attack and thus we will release a burst instead
    if (abs(this.y - player.y) > 30){
      setTimeout(() => {
        {
          if (!this.active || this.actionState.startsWith("death")){
            return;
          }
          this.lastAttackA = millis();
          this.moveSpeed = 0;
          this.windingUp = false;

          if (!this.madePebble){
            this.madePebble = true;
            screenShake = 4;
            let pebble1 = new Pebble(this.x - 8, this.bottom, -1, "right", 6, 0);
            let pebble2 = new Pebble(this.x + 8, this.bottom, 1, "left", 6, 0);
            let pebble3 = new Pebble(this.x - 8, this.top, -1, "right", 3, -7);
            let pebble4 = new Pebble(this.x + 8, this.top, 1, "left", -3, -7);
            let pebble5 = new Pebble(this.x - 8, (this.bottom + this.top) /2, -1, "right", 8, -4);
            let pebble6 = new Pebble(this.x + 8, (this.bottom + this.top) / 2, 1, "left", -8, -4);
            let pebble7 = new Pebble(this.x - 8, this.top, -1, "right", 0, -25);
            let pebble8 = new Pebble(this.x - 8, this.top, -1, "left", 0, -25);
            entities.push(pebble1, pebble2, pebble3, pebble4, pebble5, pebble6, pebble7, pebble8);

            pebbleSummonFx.play(0, 1, 0.1, 0.4);
          }
        }  
      }, 400);
    }
    else{
      setTimeout(() => {
        {
          if (this.actionState.startsWith("hit") || !this.active || this.actionState.startsWith("death")){
            return;
          }
          this.actionState = "attackA";
          this.lastAttackA = millis();
          this.moveSpeed = 0;
          this.windingUp = false;

          if (!this.madePebble){
            this.madePebble = true;
            screenShake = 4;
            let pebble = new Pebble(this.x - 8, this.bottom, -1, "right", 6, 0);
            let Otherpebble = new Pebble(this.x + 8, this.bottom, 1, "left", 6, 0);

            entities.push(pebble, Otherpebble);
            pebbleSummonFx.play(0, 1, 0.1, 0.4);
          }
        }  
      }, 400);
    }
  }

  attackC(){
    if (this.attackCCnt === 3){
      this.attackCCnt = 0;
      return;
    }

    this.windingUp = true;
    this.xVel = 0;
    this.attackCCnt += 1;
    this.lastAttackC = millis();

    setTimeout(() => {
      {
        this.windingUp = false;
        if (!this.active || this.actionState.startsWith("death")){
          return;
        }
        this.actionState = "attackC";

        let dir = this.directionFacing === "left" ? -1 : 1;
        this.xVel = 5 * this.attackCCnt * dir * 2;
        golemRushFx.play();
      }  
    }, 250);
  }
}


class Pebble extends Humanoid{
  constructor(x, y, moveDir, lookDir, xVel, yVel){
    super(x, y);

    //Configs
    this.type = "pebble";
    this.startingX = this.x;
    this.startingY = this.y;
    this.active = true;
    this.imageScale = 1.5;
    this.sizeY = 12 * this.imageScale;
    this.sizeX = 12 * this.imageScale;
    this.moveSpeed = 5;
    this.lookDistance = 200;
    this.attackCD = 100000;
    this.lookHeight = 64;
    this.attackDistance = 200;
    this.hasTarget = false;
    this.directionFacing = lookDir;
    this.moveDir = moveDir;
    this.actionState = "idle";
    this.heightDiff = 64;
    this.attacked = false;
    this.creationTime = millis();
    this.xVel = xVel * this.moveDir;
    this.yVel = yVel;
    
    //sounds
    this.rollFx = new p5.SoundFile(rockRollFx.url)
    this.sounds = [this.rollFx]; 

    //Animations
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.currentSheet = 0;
    this.yCrop = 0;

    this.death = "pebbleDeath";
    this.run = "pebbleRun";
    this.idle = "pebbleIdle";


    //Sprites
    this.sprites = {
      running: {
        sheet: this.run,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
        breakPoint: 4
      },

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

      death: {
        sheet: this.death,
        totalFrames: 7,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 2,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },
    };
  }

  //This will handle the golems gravity and movement
  applyForces(){
    //Movement

    //If there is nothing ahead of us return to idle as the player has gotten away

    if (this.moveDir !== 0 && this.moveSpeed !== 0) {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "right" ? 1 : -1;

      this.xVel = this.moveDir * accel;
    }

    //Apply gravity
    if (!this.grounded && this.actionState) {
      this.yVel = Math.min(this.yVel + GRAVITATIONALFORCE, 20);
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Apply friction, 1/4 in air
    if (this.moveDir === 0 || this.moveSpeed === 0) {
      let currentFriction = this.grounded
        ? FRICTIONALFORCE
        : FRICTIONALFORCE / 4;

      if (abs(this.xVel) <= currentFriction) {
        this.xVel = 0;
      }
      else {
        this.xVel -= (this.xVel > 0 ? 1 : -1) * currentFriction;
      }
    }

    //Reset ground state
    this.grounded = false;
  }

  display() {
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = (column + anim.startFrame) * this.frameWidth;

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

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {
        //Whenever we get hit, check if we are still alive
        if (this.actionState === "death") {
          this.actionState = "death";
          this.active = false;

          this.rollFx.stop();
          this.rollFx.disconnect();
          this.rollFx = null;
          entities = entities.filter(item => item !== this);
        }
      }
    }

    if (this.windingUp){
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255,0 ,0);
    }
    else{
      drawingContext.shadowBlur = 0;
    }

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale * this.xScale,
      this.frameHeight * this.imageScale * this.yScale,
      this.xCrop,
      this.yCrop,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
  }

  handleState() {
    if (this.actionState === "death"){
      this.rollFx.stop();
      this.rollFx.dispose();
      return;
    }

    if (abs(this.xVel) > 0.1 ) {
      this.actionState = "running";

      //Init buffer to allow sound to load
      if(this.rollFx.isLoaded()){
        playMobSound(this.rollFx, null, null, this,  true);
      }
    }
    else if (this.actionState === "running") {
      this.actionState = "idle";
    }
  }

  update() {
    this.handleState();
    if (this.checkCollision(player)){
      this.applyHit();
    };
    this.runAI();

    //Reset animation frame
    if (this.actionState !== this.lastActionState) {
      this.currentFrame = 0;
      this.lastActionState = this.actionState;
      if (this.actionState === "idle"){
        this.timeSinceIdle = milils();
      }
    }
  }

  //What to do when hit
  onHit() {
    if (this.actionState === "death" || this.health === 0){
      return
    }

    this.moveSpeed = 0;
    this.health = 0;
    this.actionState = "death";
    rockThudFx.play(0, 1, 1, 0.2);
  }

  checkCollision(item) {
    if (this.cantCollide || !this.active) {
      return;
    }

    //Proper collisions
    let overlapX = (item.sizeX + this.sizeX) / 2 - Math.abs(item.x - this.x);
    let overlapY = (item.sizeY + this.sizeY) / 2 - Math.abs(item.y - this.y);

    if (overlapX > 0 && overlapY > 0) {
      this.onHit();
      return true;
    }
  }

  applyHit() {
    //Player dodges it if mushroom is currently attacking and player is rolling
    if (!this.active || this.actionState === "stun") {
      return;
    }

    //Player hit on touch
    if (this.checkCollision(player)) {
      if (millis() - player.lastHitTaken < player.hitCD) {
        return;
      }

      //If player is blocking get stunned
      if (player.actionState === "blocking" && this.directionFacing !== player.directionFacing) {
        freezeFrames = 5;
        screenShake = 4;
        this.moveSpeed = 0;
        this.xVel = player.x < this.x ? this.xVel + 12 : this.xVel - 12;
        player.didBlock();
        this.onHit();
        return;
      }

      //Dont damage when dodging
      if (player.actionState === "rolling") {
        player.didDodge();
        return;
      }

      player.gotHit();
      this.onHit();

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
    if (this.actionState.startsWith("hit") ||
      this.actionState.startsWith("attack") || this.actionState.startsWith("death") || this.actionState === "reset" || 
      !this.active) {
      return;
    }

    //Use this method of distance check rather than dist() for optimization
    let dx = this.x - player.x;
    let dy = this.y - player.y;
    let distSquared = dx * dx + dy * dy;
    let heightDiff = abs(this.y - player.y);

    if (abs(distSquared) < this.attackDistance * this.attackDistance && heightDiff < this.lookHeight) {

      if (millis() - this.lastAttack < this.attackCD) {
        return;
      }

      this.windingUp = true;

      setTimeout(() => {
        {
          if (this.actionState.startsWith("hit") || !this.active || this.actionState.startsWith("death")){
            return;
          }
          this.lastAttack = millis();
          this.moveSpeed = 5;
          if (this.grounded){
            this.yVel =- 4;
          }

          this.windingUp = false;
        }  
      }, 250);
    }
  }
}

class ArmoredGolem extends Humanoid{
  constructor(x, y){
    super(x, y);
    this.type = "armGolem";
    this.mode = "armored";
    this.raisingPillars = false;
    this.active = true;
    this.centerX = 1476;
    this.centerY = 444;
    this.imageScale = 4;
    this.sizeY = 30 * this.imageScale;
    this.sizeX = 20 * this.imageScale;
    this.pillarY = this.bottom = this.y + this.sizeY / 2; //Just set this so we know where to sprout pillars from
    this.moveSpeed = 0;
    this.health = 1;
    this.moveDir = 0;
    this.actionState = "idle";
    this.timeSinceIdle = 0;
    this.lastModeSwitch = 0;
    this.hitCD = 300;
    this.stageWidth = 50 * cellSize;
    this.flashLength = 150;
    this.timeNearPlayer = 0;
    this.rockSlideDone = false;
    this.rockSliding = false;
    
    //Attack specific
    this.lastPillars = -12000;
    this.pillarsCD = 15000;
    this.lastSweep = -2000;
    this.sweepCD = 5000;
    this.lastShot = -6000;
    this.shotCD = 8000;
    this.lastRock = 0;
    this.rockCD = 4000;
    this.pillarsActive = false;
    this.sweeping = false;

    //Animations
    this.frameWidth = 0;
    this.frameHeight = 0;
    this.currentSheet = 0;
    this.yCrop = 0;

    //Neutral golem counterpart anims
    this.atkA = "golemAtkA";
    this.atkC = "golemAtkC";
    this.deathA = "golemDeathA";
    this.deathB = "golemDeathB";
    this.idleA = "golemIdleA";
    this.idleB = "golemIdleB";
    this.reset = "golemReset";
    this.stun = "golemStun";

    //Armoured Golem anims
    this.idle = "armGolemIdle";
    this.sweep = "armGolemSweep";
    this.break = "armGolemBreak";
    this.ability = "armGolemAbility";
    this.shoot = "armGolemShoot";
    this.pillars = "armGolemPillars";

    this.sprites = {
      idleA: {
        sheet: this.idleA,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 12,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      idleB: {
        sheet: this.idleB,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 12,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      attackA: {
        sheet: this.atkA,
        totalFrames: 12,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true
      },

      attackC: {
        sheet: this.atkC,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      deathA: {
        sheet: this.deathA,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 4,
        oneTime: true
      },

      deathB: {
        sheet: this.deathB,
        totalFrames: 9,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 4
      },

      reset: {
        sheet: this.reset,
        totalFrames: 7,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 3,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      idle: {
        sheet: this.idle,
        totalFrames: 4,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 8,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
      },

      sweep: {
        sheet: this.sweep,
        totalFrames: 8,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      shoot: {
        sheet: this.shoot,
        totalFrames: 10,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime:true,
        breakPoint: 4
      },

      raisePillar: {
        sheet: this.pillars,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 4
      },
      
      lowerPillar: {
        sheet: this.pillars,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 6,
        breakPoint: 4,
        oneTime: true,
        rowOffset: 1, //Literally only needed for this animation as it starts on the second row
      },

      armourBreak: {
        sheet: this.break,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        oneTime: true,
        breakPoint: 4
      },

      ability: {
        sheet: this.ability,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: true,
        breakPoint: 4
      },
    };
  }

  applyForces(){
    if (this.moveSpeed !== 0) {
      this.speed = this.moveSpeed;

      this.moveDir = this.directionFacing === "right" ? -1 : 1;

      this.xVel = this.moveDir * this.speed;
    }

    //Apply gravity
    if (!this.grounded && !this.raisingPillars && !this.rockSliding) {
      this.yVel += GRAVITATIONALFORCE / 2;
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Reset ground state
    this.grounded = false;

    //Movement
    this.top = this.y - this.sizeY / 2;
    this.bottom = this.y + this.sizeY / 2;
    this.left = this.x - this.sizeX / 2;
    this.right = this.x + this.sizeX / 2;
  }

  display() {
    //Reset animation frame
    if (this.actionState !== this.lastActionState) {
      this.currentFrame = 0;
      this.lastActionState = this.actionState;
    }

    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;
    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;

      if (anim.rowOffset){
        this.yCrop += 64 * anim.rowOffset;
      }
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = column * this.frameWidth;

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
      if (freezeFrames === 0){
        this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;
      }

      if (this.actionState === "shoot" && this.currentFrame === 5){
        this.moveSpeed = 10;
      }

      if (this.actionState === "shoot" && this.currentFrame === 7){
        this.shootProjectile();
        this.moveSpeed = 0;
        this.xVel = 0;
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      if (this.actionState === "sweep" && this.currentFrame === 6){
        this.createShockwave();
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {   
        if (this.actionState === "armourBreak"){
          this.lastActionState = this.actionState;
          this.actionState = "reset";
        }

        else if (this.actionState === "reset"){
          this.lastActionState = this.actionState;
          this.actionState = "deathB";
          
          //Reuse sfx for golem death
          pebbleSummonFx.play();
        }
      
        else {
          this.lastActionState = this.actionState;
          this.actionState = "idle";
        }
      }
    }

    if (millis() - this.lastHitTaken < this.flashLength) {
      drawingContext.filter = "brightness(30) contrast(2)"; 
    }

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale * this.xScale,
      this.frameHeight * this.imageScale * this.yScale,
      this.xCrop,
      this.yCrop,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
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

  update() {
    if (this.checkCollision(player)){
      this.applyHit();
    };
    this.runAI();
  }

  applyHit() {
    if (millis() - player.lastHitTaken < player.hitCD){
      return
    }

    //Player hit on touch (if not dodging)
    if (this.checkCollision(player)) {
      //Dont damage when dodging
      if (player.actionState === "rolling" && this.actionState.startsWith("attack")) {
        player.didDodge();
        return;
      }

      player.gotHit();

      if (this.x < player.x) {
        if (!player.grounded) {
          player.xVel = 6;
        }
        else {
          player.xVel = 7;
        }
      }

      else {
        if (!player.grounded) {
          player.xVel = -6;
        }
        else {
          player.xVel = -7;
        }
      }

      player.yVel = player.grounded ? -3 : -5; 
      screenShake = 4;
    }
  }

  onHit(damage) {
    if (!this.active){
      return;
    }

    this.lastHitTaken = millis();
    this.health -= damage || 1;
    if (this.health < 0){
      this.health = 0;
    }
  }

  rockShower(){
    let rockPos = [];
    let stageLeft = this.centerX - this.stageWidth / 2;
    this.rockSliding = true; 

    for (let x = stageLeft + 100; x < stageLeft + this.stageWidth - 100; x+= 50){
      rockPos.push(x);
    }

    for (let x = 0; x < 100; x++){
      let number = Math.round(random(0, rockPos.length));
      let posX = rockPos[number];
      let posY = 60; //from testing
      let lookDir = random(-1, 1);
      let facing;

      if (lookDir >= 0){
        lookDir = 1;
        facing = "right"  
      }
      else{
        lookDir = -1;
        facing = "left"
      }

      setTimeout(() => {
        let rock = new FallingRock(posX, posY, lookDir, facing, 0, 0);
        entities.push(rock);
      }, x * 100);

      setTimeout(() => {
        this.rockSliding = false;
        this.actionState = "lowerPillar";
        setTimeout(() => {
          this.actionState = "armourBreak";
        }, 300);
      }, 10000);
    }
  }

  raisePillars(){
    this.raisingPillars = true;
    this.x =lerp(this.x, this.centerX, 0.1);
    this.y = lerp(this.y, this.centerY, 0.1);
    this.yVel = 0;

    if (abs(this.x - this.centerX) < 1){
      this.actionState = "raisePillar";

      let direction = random() < 0.5 ? 1 : -1;
      let stageLeft = this.centerX - this.stageWidth / 2; 
      let safeZoneWidth = 3 * cellSize;

      let pillarPos = [];

      for (let x = stageLeft; x < stageLeft + this.stageWidth - safeZoneWidth; x+= 100){
        pillarPos.push(x);
      }

      if (direction === -1) {
        pillarPos.reverse();
        for (let pillar of pillarPos){
          pillar += safeZoneWidth;
        }
      } //Changes the direction from which the pillars sprout

      for (let x = 0; x < pillarPos.length - 1; x++){
        setTimeout(() => {
          if (!this.active){
            return;
          }

          let pillar = new Pillars(pillarPos[x], this.pillarY);
          entities.push(pillar);
          screenShake = 4 + 0.5 * x;
          playMobSound(eruptionFx, 0.5, null, this, false, true)
        }, 200 * x);

        setTimeout(() => {
          if (!this.active){
            return;
          }
          let warning = new PillarWarning(pillarPos[x], this.pillarY + 50);
          entities.push(warning);
        }, 100);
      }

      this.lastPillars = millis();
      setTimeout(() => {
        this.pillarsActive = false;
        this.raisingPillars = false;
        this.actionState = "lowerPillar";
      }, 200 * pillarPos.length + 1000);
    }
  }

  shootRock(){
    screenShake = 4;
    //These coordinates are from the map
    let x = 108;
    let y = 636;
    let rock = new GiantRock(x, y, 1, "right", 6, 0);
    this.screenShake += 2;
    
    entities.push(rock);
    
    pebbleSummonFx.play(0, 1, 0.1, 0.1)
  }

  createShockwave(){
    let x = this.x;
    x = this.directionFacing === "left" ? x - 40 : x + 40;
    let newShockwave = new ShockWave(x, this.bottom - 65);
    entities.push(newShockwave);
  }

  shootProjectile(){
    let direction = player.x > this.x ? 1 : -1;
    let projectile = new Projectile(this.x, this.y + 25, direction, this);
    entities.push(projectile);
    laserFx.play();
  }

  runAI(){
    //If being hit return
    if (this.rockSliding){
      screenShake = 10;
      if (abs(this.x - this.centerX) < 1){
        this.x =lerp(this.x, this.centerX, 0.1);
      }
      return;
    }

    if (this.health <= 0 && !this.rockSlideDone){
      this.yVel = 0;
      this.rockShower();
      this.actionState = "raisePillar";
      this.rockSlideDone = true;
      this.raisingPillars = false;
      this.active = false;
    }

    if ( 
      !this.active || this.health === 0) {
      return;
    }

    //This is what makes the golem face the player
    if (abs(player.x - this.x < 200)){
      this.hasTarget = true;
    }
    
    if (!this.hasTarget){
      return;
    }

    if (player.x > this.x) {
      this.directionFacing = "right";
    }
    else if (player.x < this.x ) {
      this.directionFacing = "left";
    }  

    //Record how long the player has been within shockwave reach of the player
    let dX = abs(player.x - this.x);
    let dY = abs(player.y - this.y);
    if (dX < 150 && dY < 150){
      this.timeNearPlayer += 1;
    }
    else {
      this.timeNearPlayer = 0;
    }

    if (this.pillarsActive || this.actionState === "sweep" || this.actionState == "shoot"){
      return;
    }

    //Shockwave if the player is nearby for a long time
    if (this.timeNearPlayer > 100 && millis() - this.lastSweep > this.sweepCD && !this.pillarsActive && !this.sweeping){
      this.actionState = "sweep";
      this.lastSweep = millis();
      this.timeNearPlayer = 0;
      
      if (this.health < 50){
        this.sweeping = true;
        setTimeout(() => {
          this.actionState = "sweep";
          this.lastSweep = millis();
          this.timeNearPlayer = 0;
          this.sweeping = false;
        }, 400);
      }
      return;
    }

    //Pillars the high priority spammy attack
    if (millis() - this.lastPillars > this.pillarsCD && !this.pillarsActive && !this.sweeping){
      this.raisePillars();
      return;
    }

    if (millis() - this.lastShot > this.shotCD && !this.pillarsActive && !this.sweeping && this.grounded){
      this.actionState = "shoot";
      this.lastShot = millis();
      if (this.health < 40){
        setTimeout(() => {
          this.actionState = "shoot";
          this.lastShot = millis();
        }, 300);

        setTimeout(() => {
          this.actionState = "shoot";
          this.lastShot = millis();
        }, 600);
      }

      else if (this.health < 70){
        setTimeout(() => {
          this.actionState = "shoot";
          this.lastShot = millis();
        }, 300);
      }
    }
    
    if (millis() - this.lastRock > this.rockCD){
      this.shootRock();
      this.lastRock = millis();
    }
  }
}

class Pillars{
  constructor(x, y){
    this.img = "pillarImg";
    this.hitboxes = [0, 0, 0, 75, 75, 60, 30, 20, 0]; //numbers from testing
    this.x = x;
    this.y = y;
    this.sizeX = 100;
    this.sizeY = 100;
    this.imageScale = 3;
    this.actionState = "ability";
    this.currentFrame = 0;
    this.active = true;

    this.sprites = {
      ability: {
        sheet: this.img,
        totalFrames: 9,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 3,
        oneTime: true
      },
    };
  }

  update(){
    this.display();
    this.applyHit();
  }

  display() {
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = (column + anim.startFrame) * this.frameWidth;

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
      if (freezeFrames === 0){
        this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {
        entities = entities.filter(entity => entity !== this);
      }
    }

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale,
      this.frameHeight * this.imageScale,
      this.xCrop,
      this.yCrop,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
  }

  applyHit() {
    if (!this.active || millis() - player.lastHitTaken < player.hitCD) {
      return;
    }

    //Player hit on touch (if not dodging)
    if (this.checkCollision(player)) {
      //Dont damage when dodging
      if (player.actionState === "rolling") {
        player.didDodge();
        return;
      }

      player.gotHit();

      player.yVel = -8;

      screenShake = 4;
    }
  }

  checkCollision(item) {
    if (!this.active) {
      return;
    }

    //Proper collisions
    let sizeY = this.hitboxes[this.currentFrame]; //This will make more sense if you look at the sprite sheet. Essentially just getting the appropriate hitbox for how tall the pillar currently is

    let hitboxCenterY = this.y + (this.sizeY/2 - sizeY/2); //We want hitboxes to sprout from the bottom from the bottom of the img rather than the middle
    let overlapX = (item.sizeX + this.sizeX) / 2 - Math.abs(item.x - this.x);
    let overlapY = (item.sizeY + sizeY) / 2 - Math.abs(item.y - hitboxCenterY);

    if (overlapX > 0 && overlapY > 0) {
      return true;
    }
  }

  //This is just here so the updateAll function doesn't bug out tryna call a nonexistent function
  applyForces(){
  }

  onHit(){

  }
}

class PillarWarning{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.sizeX = 150;
    this.sizeY = 8;
    this.creationTime = millis();
    this.duration = 800;
  }

  update(){
    this.display();

    if (millis() - this.creationTime > this.duration){
      entities = entities.filter(entity => entity !== this);
    }
  }

  display(){
    let progress = (millis() - this.creationTime) / this.duration;
    let size = sin(progress * 180) * this.sizeX; //goes to its peak then returns to 0, since sin(90) is the largest it can get
    let alpha = (1 - progress) * 200; //1 is at full progress, 200 is random offset
    
    push();
    drawingContext.shadowBlur = size * 0.2;
    drawingContext.shadowColor = "red";
    fill(255, 0, 0, alpha);
    noStroke();
    rect(this.x, this.y, this.sizeX, this.sizeY);
    drawingContext.shadowBlur = 0;
    pop();
  }

  //Dummy functions
  applyForces(){

  }
  checkCollision(){

  }
  onHit(){

  }
}

class GiantRock extends Pebble{
  constructor(x, y, moveDir, directionFacing, xVel, yVel){
    super(x, y, moveDir, directionFacing, xVel, yVel);
    this.imageScale = 4;
    this.sizeX = 24;
    this.sizeY = 24;
    this.moveSpeed = 6;
  }

  applyHit() {
    //Player dodges it if mushroom is currently attacking and player is rolling
    if (!this.active || this.actionState === "stun") {
      return;
    }

    //Player hit on touch
    if (this.checkCollision(player)) {
      if (millis() - player.lastHitTaken < player.hitCD) {
        return;
      }

      //If player is blocking get stunned
      if (player.actionState === "blocking" && this.directionFacing !== player.directionFacing) {
        freezeFrames = 5;
        screenShake = 4;
        this.moveDir *= -1;
        this.xVel = player.x < this.x ? this.xVel + 12 : this.xVel - 12;
        this.sizeX = this.normalSize;
        player.didBlock();
        return;
      }

      //Dont damage when dodging
      if (player.actionState === "rolling") {
        player.didDodge();
        return;
      }

      player.gotHit();
      this.onHit();

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
}

class FallingRock extends GiantRock{
  //Literally just a giant rock but with no AI
  constructor(x, y, lookDir, facing){
    super(x, y, 0, facing, 0, 0);
    this.attacked = true;
  }
  runAI(){
    //Nothing
  }
}
class ShockWave{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.sizeX = 100;
    this.sizeY = 10;
    this.startSizeX = 100;
    this.startSizeY = 10;
    this.maxSizeX = 250; //this is just the stage width
    this.maxSizeY = 10;
    this.imageScale = 4;
    this.creation = millis();
    this.duration = 120;
    this.active = true;
    this.img = "shockWaveImg";
    this.actionState = "ability";
    this.currentFrame = 0;


    this.sprites = {
      ability: {
        sheet: this.img,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 8,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 3,
        oneTime: true
      },
    };
  }

  update(){
    let progress = (millis() - this.creation) / this.duration;

    if (progress >= 1){
      entities = entities.filter(e => e !== this);
      return;
    }

    this.sizeX = map(progress, 0, 1, this.startSizeX, this.maxSizeX);
    this.sizeY = map(progress, 0, 1, this.startSizeY, this.maxSizeY);

    this.display();
    this.applyHit();
  }

  display(){
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = (column + anim.startFrame) * this.frameWidth;

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
      if (freezeFrames === 0){
        this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {
        entities = entities.filter(entity => entity !== this);
      }
    }

    let progress = (millis() - this.creation) / this.duration;
    let alpha = map(progress, 0, 1, 255, 0);
    tint(255, alpha);

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale,
      this.frameHeight * this.imageScale,
      this.xCrop,
      this.yCrop,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
    // rect(this.x, (this.y + 48), this.sizeX, this.sizeY)
  }

  applyHit() {
    if (!this.active || millis() - player.lastHitTaken < player.hitCD) {
      return;
    }

    //Player hit on touch (if not dodging)
    if (this.checkCollision(player)) {
      //Dont damage when dodging
      if (player.actionState === "rolling") {
        player.didDodge();
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

      screenShake = 4;
    }
  }

  checkCollision(item) {
    if (!this.active) {
      return;
    }

    //Proper collisions
    let overlapX = (item.sizeX + this.sizeX) / 2 - Math.abs(item.x - this.x);
    let overlapY = (item.sizeY + this.sizeY) / 2 - Math.abs(item.y - (this.y + 48));

    if (overlapX > 0 && overlapY > 0) {
      return true;
    }
  }

  //dummy functions
  applyForces(){

  }

  onHit(){};
}

class Projectile{
  constructor(x, y, moveDir, parent){
    this.img = "projectileImg";
    this.x = x;
    this.y = y;
    this.sizeX = 48;
    this.sizeY = 48;
    this.imageScale = 3;
    this.actionState = "ability";
    this.currentFrame = 0;
    this.active = true;
    this.moveDir = moveDir;
    this.directionFacing = moveDir === 1 ? "left" : "right";
    this.moveSpeed = 6;
    this.creation = millis();
    this.duration = 2000;
    this.reflected = false;
    this.parent = parent;
    this.hit = false;

    this.sprites = {
      ability: {
        sheet: this.img,
        totalFrames: 3,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        breakPoint: 2,
        shouldLoop: true,
      },
    };
  }

  update(){
    this.display();
    this.applyHit();

    this.x += this.moveDir * this.moveSpeed;

    if (millis() - this.creation > this.duration){
      entities = entities.filter(entity => entity !== this);
    }
  }

  display() {
    
    //Identify current anim and define variables
    let anim = this.sprites[this.actionState];
    let column = this.currentFrame;

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;

    if (anim.breakPoint){
      column = this.currentFrame % anim.breakPoint;
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint);
      this.yCrop = 64 * currentRow;
    }
    else{
      this.yCrop = 0;
    }

    this.xCrop = (column + anim.startFrame) * this.frameWidth;

    this.currentSheet = anim.sheet;
    this.totalImage = anim.totalFrames;

    //Make origin at Mushrooms"s current position to flip player image when neccesary
    push();
    translate(this.x, this.y);

    if (this.directionFacing === "right"){
      scale(-1, 1);
    }

    //If it is the correct frame to advance frames advance
    if (frameCount % anim.spriteSpeed === 0) {
      let lastFrame = this.currentFrame;
      if (freezeFrames === 0){
        this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      if (this.currentFrame === 0 && anim.shouldLoop) {
        this.currentFrame = 0;
      }
    }

    image(
      imageArray[this.currentSheet],
      0,
      0,
      this.frameWidth * this.imageScale,
      this.frameHeight * this.imageScale,
      this.xCrop,
      this.yCrop,
      this.frameWidth,
      anim.charHeight
    );
    
    //Reset
    pop();
    fill(255);
    // rect(this.x, this.y, this.sizeX, this.sizeY);
  }

  applyHit() {
    if (!this.active || millis() - player.lastHitTaken < player.hitCD || this.hit) {
      return;
    }

    //Player hit on touch (if not dodging)
    if (!this.reflected){
      if (this.checkCollision(player)) {
      //Dont damage when dodging
        if (player.actionState === "rolling") {
          player.didDodge();
          return;
        }

        if (player.actionState === "blocking" && this.directionFacing === player.directionFacing){
          {
            this.moveDir *= -1;
            this.directionFacing = this.directionFacing === "left" ? "right" : "left";
            this.reflected = true;
            this.creation = millis();
            player.didBlock();
            return;
          }
        }

        this.hit = true;
        player.gotHit();
        screenShake = 4;
      }
    }
    else{
      if (this.checkCollision(this.parent)){
        this.parent.onHit(15);
        laserImpactFx.play();
        this.hit = true;
      }
    }
    
  }

  checkCollision(item) {
    if (!this.active) {
      return;
    }

    //Proper collisions
    let overlapX = (item.sizeX + this.sizeX) / 2 - Math.abs(item.x - this.x);
    let overlapY = (item.sizeY + this.sizeY) / 2 - Math.abs(item.y - this.y);

    if (overlapX > 0 && overlapY > 0) {
      return true;
    }
  }

  onHit(){}

  //This is just here so the updateAll function doesn't bug out tryna call a nonexistent function
  applyForces(){
  }
}