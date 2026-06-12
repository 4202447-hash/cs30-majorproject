## What advice would I have given myself
I was pretty happy with how I managed this project. If I could give any advice I might have prioritized my needs to have before my nice to haves more. I may have toned down content and focused more on making the existing content more fluid.

## Were my needs to have completed
All my needs to have were completed. The wants were sort of ambitous so most of them didn't get completed.

## Hardest part
There were many challenges in making this project. The two hardest ones were making the mobs, and managing the performance. Making each individual mob took me a long time a they all had unique ways of movement, and had unique attacks/attack patterns. Making mobs turn around, and detect empty slots in the grid was also a challenge. In terms of performance the game experienced extreme lag as the 2D grid of the map is 200 x 150.To fix this I had to only render the blocks currently in the screen, and only check collisions for the blocks within a set radius of mobs / players. 

## Problems I couldn't solve
The biggest problem I couldn't solve was the breaking of the audio. Since I needed each individual audio to play amongst multiple items and stop for multiple items simulatenously (eg: footsteps playing for mobs and player), I needed to instance audios in the constructor of mobs. I believe this is the reason the audio would stop playing beyond a certain point. I tried to solve this issue in the load stage function by clearing the p5.soundOut.soundArray item but this only increased general performance and not audio function. 