//This is the code which regards the bat enemy 
class Bat extends Humanoid{
  constructor(x, y){
    super(x, y);

    //Configs
    this.imageScale = 1.5;
    this.sizeX = 12 * this.imageScale;
    this.sizeY = 12 * this.imageScale;
    this.moveSpeed = 1.5;


    //Animations
    this.idle = "batIdle";
    this.death = "batDeath";
    this.attack = "batAttack";
    this.hit = "batHit";

    //
  }
}