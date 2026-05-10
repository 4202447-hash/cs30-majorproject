//This is the code regarding the lighting system for cave and dark situations
function drawLighting(){
  lightBuffer.clear();
  lightBuffer.background(10, 10, 25, 255)

  //Set draw mode to erase (makes it so whatever we draw next is like an erase)
  lightBuffer.erase();

  let screenX = width/2
  let screenY = height/2

  drawRadial(lightBuffer, screenX, screenY, 600)
  lightBuffer.noErase();

  image(lightBuffer, 0, 0)//draw overlay on our actual canvas
}

//Here we are essentially drawing a bunch of circles with shrinking size and opacity
function drawRadial(buffer, x, y, size){
  for (let i = size; i > 0; i -= 30){
    let alpha = map(i, size, 0, 0, 255) //turn the size into a equivelent alpha

    buffer.fill(255, alpha) //Sets the erase strength
    buffer.noStroke();
    buffer.circle(x + width/2 / mapScale, y + height/2 / mapScale, i); 
  }
}