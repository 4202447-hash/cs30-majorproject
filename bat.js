//This is the code which regards the bat enemy 
class Bat extends Humanoid{
  constructor(x, y){
    super(x, y);

    //Configs
    this.imageScale = 1.5;
    this.sizeX = 12 * this.imageScale;
    this.sizeY = 12 * this.imageScale;
    this.moveSpeed = 1.5;
    this.maxSpeed = 5;
    this.minSpeed = 2;
    this.time - 0;

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
        sheet: this.idle,
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
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: false,
        oneTime: true
      },

      death: {
        sheet: this.death,
        totalFrames: 5,
        imageWidth: 64,
        imageHeight: 64,
        spriteSpeed: 6,
        yOffset: 0,
        charHeight: 64,
        startFrame: 0,
        shouldLoop: false,
      },
    }
  }

  applyForces(){
    if (this.moveDir !== 0 && this.moveSpeed !== 0) {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "right" ? -1 : 1;

      this.xVel = this.moveDir * accel;

      //While it may seem counter intuitive we apply gravity to the bat at a lower level, to mimic the bat actually flapping its wings to go up
      this.yVel += Math.min(2, GRAVITATIONALFORCE);
    }
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

    if (this.directionFacing === "left") {
      scale(-1, 1); // Flip horizontally
    }

    if (this.actionState === "idle"){
      //Flight only runs whenever the wings flap to mimic how they are in real life
      this.y += Math.random(this.minSpeed, this.maxSpeed);
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

        //If we are in the attack wind stage, go to attack, and launch
        if (this.actionState === "attack") {
          this.actionState = "attack";
          this.xVel = this.directionFacing === "right" ? -4 : 4;
          this.maxSpeed = 0;
          this.lastAttack = millis();
          this.sizeX = this.attackSize;
        }

        else if (this.actionState === "stun") {
          this.moveSpeed = 2;
          this.actionState = "idle";
        }

        //Whenever we get hit, check if we are still alive
        else if (this.actionState === "gotHit") {
          if (this.health <= 0) {
            this.actionState = "dead";
            this.active = false;
          }
          else {
            this.actionState = "idle";
          }
        }
        
        //Return to idle if no conditions met
        else{
          this.lastActionState = this.actionState;
          this.actionState = "idle";
        }
      }
    }
}

  applyForces() {
    //Movement

    //If there is nothing ahead of us turn around
    let lookAhead = this.directionFacing === "right" ? -25 : 25;
    let floorCheckX = this.x + lookAhead;
    let floorCheckY = this.bottom + 10;

    //Check if there is a valid path in front of you
    if (!checkIfPath(floorCheckX, floorCheckY) && this.grounded) {
      let oppositeX = this.x - lookAhead;

      //if there is a valid path in the opposite side turn around
      if (checkIfPath(oppositeX, floorCheckY)) {
        this.directionFacing = this.directionFacing === "left" ? "right" : "left";
        this.moveDir *= -1;
      }
    }

    if (this.moveDir !== 0 && this.moveSpeed !== 0) {
      this.speed = this.moveSpeed;
      let accel = this.speed;

      this.moveDir = this.directionFacing === "right" ? -1 : 1;

      this.xVel = this.moveDir * accel;
    }
    
    //Apply gravity
    if (!this.grounded && this.actionState) {
      this.yVel += GRAVITATIONALFORCE;
    }

    this.y += this.yVel;
    this.x = this.x + this.xVel;

    //Apply friction if not rolling, 1/4 in air
    if ((this.moveDir === 0 || this.moveSpeed === 0) && this.actionState !== "rolling") {
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

    this.frameWidth = this.sprites[this.actionState].imageWidth;
    this.frameHeight = this.sprites[this.actionState].imageHeight;
    this.xCrop = (this.currentFrame + anim.startFrame) * this.frameWidth;
    this.currentSheet = anim.sheet;
    this.totalImage = anim.totalFrames;

    //Make origin at Mushrooms"s current position to flip player image when neccesary
    push();
    translate(this.x, this.y);

    if (this.directionFacing === "left") {
      scale(-1, 1); // Flip horizontally
    }

    //If it is the correct frame to advance frames advance
    if (frameCount % anim.spriteSpeed === 0) {
      let lastFrame = this.currentFrame;
      this.currentFrame = (this.currentFrame + 1) % anim.totalFrames;

      if (this.actionState === "attack" && this.currentFrame === 0) {
        setTimeout(() => {
          if (this.actionState === "attack") {
            this.actionState = "attackRecover";
          }
            
        }, 250);
      }

      //If animation shouldn"t loop, and isn"t one time, hold last frame
      if (this.currentFrame === 0 && !anim.shouldLoop && !anim.oneTime) {
        this.currentFrame = lastFrame;
      }

      //If animation is onetime, return to idle after finished, also deal with attack stages
      else if (this.currentFrame === 0 && !anim.shouldLoop && anim.oneTime) {

        //If we are in the attack wind stage, go to attack, and launch
        if (this.actionState === "attackWind") {
          this.actionState = "attack";
          this.xVel = this.directionFacing === "right" ? -7 : 7;
          this.yVel = -3;
          this.lastAttack = millis();
          this.sizeX = this.attackSize;
        }

        //if we are in the recovery stage of the attack, return to idle and reset settings
        else if (this.actionState === "attackRecover") {
          this.sizeX = this.normalSize;
          setTimeout(() => {
            this.moveSpeed = 2;
          }, 500);
          this.actionState = "idle";
        }

        else if (this.actionState === "stun") {
          this.moveSpeed = 2;
          this.actionState = "idle";
        }

        //Whenever we get hit, check if we are still alive
        else if (this.actionState === "gotHit") {
          if (this.health <= 0) {
            this.actionState = "dead";
            this.active = false;
          }
          else {
            this.actionState = "idle";
          }
        }
        
        //Return to idle if no conditions met
        else{
          this.lastActionState = this.actionState;
          this.actionState = "idle";
        }

        
      }
    }

    //Vertical offset which adjusts to the different animations (avoid changing)
    let verticalOffset = anim.charHeight * this.imageScale * this.yScale / 2;

    if (this.actionState === "attack") {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255,0 ,0);
    }

    image(
      imageTable[this.currentSheet],
      this.actionState === "attack" ? 25 : 0,
      -verticalOffset + this.sizeY / 2,
      this.frameWidth * this.imageScale * this.xScale,
      this.frameHeight * this.imageScale * this.yScale,
      this.xCrop,
      anim.yOffset,
      this.frameWidth,
      anim.charHeight
    );
    

    //Reset
    pop();
  }

  handleState() {
    //Skip if currently in an action state
    if (
      this.actionState === "attack" || 
      this.actionState === "gotHit" ||
      this.actionState === "attackWind" ||
      this.actionState === "attackRecover" ||
      this.actionState === "stun" || !this.active
    ) {
      return;
    }
    if (abs(this.xVel) > 0.1) {
      this.actionState = "running" ;
      
    }
    else if (this.actionState === "running") {
      this.actionState = "idle";
    }
  }

  //Update mushroom
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
    }
  }

  //What to do when hit
  onHit() {
    this.currentFrame = 0;
    this.actionState = "gotHit";
    this.moveSpeed = 0;
    this.health -= 1;
    this.sizeX = this.normalSize;
    this.xVel = player.x < this.x ? this.xVel + 3 : this.xVel - 3;
  }

  checkCollision(item) {
    if (!this.active) {
      return;
    }

    //For collisions
    this.top = this.y - this.sizeY / 2;
    this.bottom = this.y + this.sizeY / 2;
    this.left = this.x - this.sizeX / 2;
    this.right = this.x + this.sizeX / 2;

    let itemBottom = item.y + item.sizeY / 2;
    let itemLeft = item.x - item.sizeX / 2;
    let itemRight = item.x + item.sizeX / 2;
    let itemTop = item.y - item.sizeY / 2;

    if (
      itemRight > this.left  &&
      itemLeft < this.right &&
      itemBottom >= this.top &&
      itemBottom <= this.top + max(5, item.yVel + 2)
    ) {
      return true;
    }

    if (
      itemBottom > this.top + FOOTOFFSET &&
      itemTop < this.bottom - FOOTOFFSET
    ) {
      //If item runs into left of object
      if (
        itemRight > this.left &&
        itemLeft < this.left 
      ) {
        return true;
      }

      //If item runs into right of object
      if (
        itemLeft < this.right &&
        itemRight > this.right 
      ) {
        return true;
      }

      //If item headbumps object
      if (
        !this.oneWay &&
        itemRight > this.left &&
        itemLeft < this.right &&
        itemTop <= this.bottom &&
        itemTop >= this.top
      ) {
        return true;
      }
    }
  }

  applyHit() {
    //Player dodges it if mushroom is currently attacking and player is rolling
    if (!this.active || player.actionState === "rolling" && this.actionState === "attack") {
      console.log("returned");
      return;
    }

    //If player is blocking get stunned
    if (player.actionState === "blocking" && this.directionFacing === player.directionFacing && this.actionState === "attack") {
      this.actionState = "stun";
      this.moveSpeed = 0;
      this.xVel = player.x < this.x ? this.xVel + 12 : this.xVel - 12;
      this.sizeX = this.normalSize;
    }

    //Dont damage when stunned
    if (this.actionState === "stun") {
      return;
    }

    //Player hit on touch
    if (this.checkCollision(player)) {
      if (millis() - player.lastHitTaken < 1000) {
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
      screenShake = 8;
    }
  }

  runAI(){
    //If being hit return
    if (this.actionState === "gotHit" ||
      this.actionState === "stunned" ||
      this.actionState === "attackWind" ||
      this.actionState === "attack" ||
      this.actionState === "attackRecover" ||
      !this.active) {
      return;
    }

    //First check if the player is directly in front or behind, and if they are attack them
    if (abs(this.x - player.x) < 100 && player.y + player.sizeY/2 > this.y - this.sizeY/2  ) {
      if (millis() - this.lastAttack < 1500) {
        return;
      }

      this.moveSpeed = 0;

      //If player is behind mushroom
      if (player.x > this.x) {
        this.directionFacing = "left";
        this.moveDir = -1;
      }
      else if (player.x < this.x ) {
        this.directionFacing = "right";
        this.moveDir = 1;
      }

      this.actionState = "attackWind";
    }
  }
}