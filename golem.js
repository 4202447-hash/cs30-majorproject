class Golem extends Humanoid{
  constructor(x, y){
    super(x, y);

    //Configs
    this.type = "golem"
    this.mode = "A";
    this.startingX = this.x;
    this.startingY = this.y;
    this.active = true;
    this.imageScale = 1.5;
    this.sizeY = 30 * this.imageScale;
    this.sizeX = 16 * this.imageScale;
    this.moveSpeed = 2.5;
    this.health = 13;
    this.atkACD = 5000;
    this.atkCCD = 7500;
    this.atkADistance = 330;
    this.attackCCnt = 0;
    this.atkCDistance = 125;
    this.lookDistance = 350;
    this.lookHeight = 64;
    this.hasTarget = false;
    this.moveDir = 0;
    this.actionState = "idleA"
    this.timeSinceIdle = 0;
    this.heightDiff = 64;
    this.lastModeSwitch = 0;

    //Set to negative 5000 to match the atkACD meaning he can attack as soon as he spawns
    this.lastAttackA = -5000;
    this.lastAttackC = -7500;

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
    this.stun = "golemStun"

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
        spriteSpeed: 6,
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
        breakPoint: 4
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
        spriteSpeed: 6,
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
    }
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
    if (!this.grounded && this.actionState) {
      this.yVel += GRAVITATIONALFORCE;
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Apply friction, 1/4 in air
    if ((this.moveDir === 0 || this.moveSpeed === 0)) {
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
      column = this.currentFrame % anim.breakPoint
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint)
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

        //Hit stun
        if (this.actionState.startsWith("hit")) {
          this.moveSpeed = 2.5;
          this.actionState = "idle" + this.mode;
          
        }
        

        //After attack A keep us held still to give player an opening
        else if (this.actionState === "attackA") {
          this.moveSpeed = 0;
          this.actionState = "idleA"
          this.mode = "A"
          this.madePebble = false;
        }

        //Set mode to B after golem resets
        else if (this.actionState === "reset") {
          this.mode = "B"
          this.actionState = "idleB"
        }

        else if (this.actionState === "attackC" && this.attackCCnt !== 3) {
          this.xVel = 0;
          this.screenShake += 3;
          this.directionFacing = this.directionFacing === "left" ? "right" : "left"
          this.attackC();
        }

        else if (this.actionState === "attackC" && this.attackCCnt === 3) {
          this.xVel = 0;
          this.actionState = "idleA"
        }

        //Whenever we get hit, check if we are still alive
        else if (this.actionState === "hit" && this.health <= 0) {
          this.actionState = "death" + this.mode;
          this.active = false;
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
      imageTable[this.currentSheet],
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
      this.actionState.startsWith("hit") || this.actionState.startsWith("death") ||
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
  onHit() {
    if (this.actionState === "attackC"){
      return;
    }

    this.windingUp = false;

    this.currentFrame = 0;
    this.moveSpeed = 0;
    this.health -= 1;
    this.xVel = 0;

    if (this.health > 0){
      this.actionState = "hit" + this.mode
    } else{
      this.actionState = "death" + this.mode
      this.active = false;
    }

    if (this.health % 5 === 0){
      this.attackA();
    }

    if (this.health === 8){
      this.attackC();
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
      if (millis() - player.lastHitTaken < this.hitCD) {
        return;
      }

      //If player is blocking get stunned
      if (player.actionState === "blocking" && this.directionFacing !== player.directionFacing && this.actionState === "attackC") {
        this.actionState = "stun";
        this.attackCCnt = 0;
        console.log("stunned")
        freezeFrames = 10;
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
      this.actionState.startsWith("attack") || this.actionState.startsWith("death") || this.actionState === "reset" || 
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

      //Reset mode if we are in true idle with player not around
      if (this.mode === "A" && this.actionState === "idleA" && !this.hasTarget){
          this.actionState = "reset"
          this.moveSpeed = 0;
          return
        }

      this.hasTarget = true;

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
    }

    //Mode reset to B so we can run attack A again
    if (millis() - this.lastAttackA > this.atkACD && this.mode === "A"){
      this.actionState = "reset"
    }

    //Attack A
    
    if (abs(distSquared) < this.atkADistance * this.atkADistance && heightDiff < this.lookHeight && millis() - this.lastAttackA > this.atkACD) {
      this.attackA(distSquared);
    }
  }

  attackA(distSquared){
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

      //If we are within the range of attack c we are too close for a ranged attack and thus we will release a burst instead
      if (abs(distSquared) < this.atkCDistance * this.atkCDistance){
        console.log("Burst")
        setTimeout(() => {
        {
          if (!this.active || this.actionState.startsWith("death")){
            return;
          }
          this.actionState = "attackA";
          this.lastAttackA = millis();
          this.moveSpeed = 0;
          this.windingUp = false;

          if (!this.madePebble){
            this.madePebble = true;
            screenShake = 4;
            let pebble1 = new Pebble(this.x - 8, this.bottom, -1, "right", 6, 0);
            let pebble2 = new Pebble(this.x + 8, this.bottom, 1, "left", 6, 0);
            let pebble3 = new Pebble(this.x - 8, this.bottom, -1, "right", 0, -7);
            let pebble4 = new Pebble(this.x + 8, this.bottom, 1, "left", 0, -7);
            let pebble5 = new Pebble(this.x - 8, this.bottom, -1, "right", 0, -4);
            let pebble6 = new Pebble(this.x + 8, this.bottom, 1, "left", 0, -4);

            entities.push(pebble1, pebble2, pebble3, pebble4, pebble5, pebble6);
          }
        }  
      }, 250);
      } else{
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
          }
        }  
      }, 250);
      }
  }

  attackC(){
    if (this.attackCCnt === 3){
      this.attackCCnt = 0;
      return
    }

    this.windingUp = true;
    this.xVel = 0;
    this.attackCCnt += 1;
    this.lastAttackC = millis();

      setTimeout(() => {
        {
          if (!this.active || this.actionState.startsWith("death")){
            return;
          }
          this.windingUp = false;
          this.actionState = "attackC";

          let dir = this.directionFacing === "left" ? -1 : 1;
          this.xVel = 5 * this.attackCCnt * dir * 2;
        }  
      }, 250);
  }
}


class Pebble extends Humanoid{
  constructor(x, y, moveDir, lookDir, xVel, yVel){
    super(x, y);

    //Configs
    this.type = "pebble"
    this.startingX = this.x;
    this.startingY = this.y;
    this.active = true;
    this.imageScale = 1.5;
    this.sizeY = 12 * this.imageScale;
    this.sizeX = 12 * this.imageScale;
    this.moveSpeed = 5;
    this.lookDistance = 200;
    this.attackCD = 100000
    this.lookHeight = 64;
    this.attackDistance = 200;
    this.hasTarget = false;
    this.directionFacing = lookDir
    this.moveDir = moveDir;
    this.actionState = "idle"
    this.heightDiff = 64;
    this.attacked = false;
    this.creationTime = millis();
    this.xVel = xVel * this.moveDir
    this.yVel = yVel;

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
    }
  }

  //This will handle the golems gravity and movement
  applyForces(){
    //Movement

    //If there is nothing ahead of us return to idle as the player has gotten away
    let lookAhead = this.directionFacing === "right" ? 25 : -25;
    let floorCheckX = this.x + lookAhead;
    let floorCheckY = this.bottom + 5;

    if (this.moveDir !== 0 && this.moveSpeed !== 0) {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "right" ? 1 : -1;

      this.xVel = this.moveDir * accel;
    }

    //Apply gravity
    if (!this.grounded && this.actionState) {
      this.yVel += GRAVITATIONALFORCE;
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Apply friction, 1/4 in air
    if ((this.moveDir === 0 || this.moveSpeed === 0)) {
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
      column = this.currentFrame % anim.breakPoint
      let currentRow = Math.floor(this.currentFrame / anim.breakPoint)
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
          this.actionState = "death" + this.mode;
          this.active = false;
          entities = entities.filter(item => item !== this)
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
      imageTable[this.currentSheet],
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
      return
    }
    //Skip if currently in an action state
    if (abs(this.xVel) > 0.1) {
      this.actionState = "running" ;
    }
    else if (this.actionState === "running") {
      this.actionState = "idle"
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
        this.timeSinceIdle = mills();
      }
    }
  }

  //What to do when hit
  onHit() {
    this.health = 0;
    this.actionState = "death"
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
      if (millis() - player.lastHitTaken < this.hitCD) {
        return;
      }

      //If player is blocking get stunned
      if (player.actionState === "blocking" && this.directionFacing !== player.directionFacing) {
        freezeFrames = 10;
        screenShake = 4;
        this.moveSpeed = 0;
        this.xVel = player.x < this.x ? this.xVel + 12 : this.xVel - 12;
        this.sizeX = this.normalSize;
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
          this.moveSpeed = 5
          if (this.grounded){
          this.yVel =- 4;
          }

          this.windingUp = false;
        }  
      }, 250);
    }
  }
}