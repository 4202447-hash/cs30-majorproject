//This is the code regarding drawing a mini map
function drawMiniMap(){
  if (gameMode !== "playing" || !mapOpen){
    return
  }

  let mmWidth = width
  let mmHeight = height
  let mmTrueX = 0
  let mmTrueY = 0

  let scaleX = mmWidth / totalCols;
  let scaleY = mmHeight / totalRows;
  let trueScale = Math.min(scaleX, scaleY)  //Use a uniform scale cuz before it was making it a rectangle and squishing blocks

  push();

  //These resets all our edits to the scale such as mapScale or translate
  resetMatrix();
  let furthestLeft = 0;
  let furthestRight = 0;
  let top = 0;
  let bottom = 0;

  textSize(30)
  text(continuedStage, width/2, height/2);

  rectMode(CORNER)

  background(242, 227, 198)

  //Loop through the current stage and make the map
  for (let x = 0; x < totalRows; x++){
    for (let y = 0; y< totalCols; y++){
      let item = mapGrid[x][y];

      if (!item){
        continue
      }

      if (item instanceof Platform){
        fill(60, 45, 30)
        stroke(60, 45, 30)
      }

      if (item instanceof Gate){
        fill(50, 50, 255)
        stroke(50, 50, 255)
      }

      let posX = mmTrueX + x * trueScale + width / 3; //Sort of a magic number. Idk why its just the offset that gets it to the centero f my screen
      let posY = mmTrueY + y * trueScale + 100;
      
      rect(posX, posY, trueScale);

      furthestLeft = Math.min(x, furthestLeft)
      furthestRight = Math.max(x, furthestRight);
      top = Math.min(y, top);
      bottom = Math.max(y, bottom);
    }
  }

  //Add the player and other entities with each having their own unique colors
  for (let entity of entities){
    if (entity instanceof Player){
      fill(255, 255, 0)
      stroke(255, 255, 0)
    }

    else if (entity instanceof Mushroom){
      fill(255, 50, 50)
      stroke(255, 50, 50)
    }

    else if (entity instanceof Bat){
      fill(150, 100, 255)
      stroke(150, 100, 255)
    }

    else if (entity instanceof Golem){
      fill(150)
      stroke(150)
    }

    let trueX = mmTrueX + (entity.x / cellSize) * trueScale + width / 3;
    let trueY = mmTrueY + (entity.y / cellSize) * trueScale + 100

    if (entity instanceof Player){
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = "yellow";
      circle(trueX, trueY, trueScale * 3)
    }else{
      rect(trueX, trueY, trueScale)
    }

    drawingContext.shadowBlur = 0;
  }

  strokeWeight(6);
  stroke(101, 67, 33)
  noFill();

  rectMode(CENTER)

  let sizeX = (furthestRight - furthestLeft) * trueScale;
  let sizeY = (bottom - top) * trueScale
  let xPos = ((furthestLeft + furthestRight) / 2) * trueScale + width/3
  let yPos = ((bottom + top) / 2) * trueScale + 100

  rect(xPos, yPos, sizeX, sizeY)

  //Border for visuals
  stroke(220, 200, 165)
  rect(xPos, yPos, sizeX - 9, sizeY - 9)

  
  //Stagename
  fill(101, 67, 33);
  noStroke();
  textAlign(CENTER);
  textSize(55);
  text(continuedStage, xPos, height * 0.1)

  pop();
}