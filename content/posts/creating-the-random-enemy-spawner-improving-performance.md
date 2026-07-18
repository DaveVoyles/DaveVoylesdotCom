+++
title = "Creating the random enemy spawner, improving performance"
date = "2013-04-12T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Game Dev", "Javascript / HTML5", "Programming", "Windows 8"]
tags = ["Game Dev", "HTML5", "JavaScript", "Programming", "Win8"]
topics = ["Gaming", "Tech"]
+++

When building my Win8 port of *Super Rawr-Type*, I ran into all sorts of performance issues, due to lack of optimization. This was to be expected, as I on gave myself 1 month to complete the base game, then I would take the second and final month to port it to different platforms and worry about optimization.

The design of my levels is where most of my issues came from. [I explain it pretty well in this post here.](http://davidvoyles.wordpress.com/2013/04/10/performance-improvements-and-porting-super-rawr-type-to-win8/) The gist of it is this: When the map loads, it is filled with ~150 enemies, which are constantly being updated. Obviously this comes with quite a bit of overhead. The browser version played well, but on a dedicated OS it chugs.

#### Removing all enemies

I went back to the drawing board and redesigned the way I spawn enemies now. The first thing I did was remove all entities (enemies) from the level.

I looked at a number of different ways for spawning enemies for shmup and bullet hell. Matt and Jason Doucette at Xona games do it in an interesting way for their upcoming title [*Duality-ZF*](http://dualityzf.com/): They store all of the enemies in an excel spreadsheet, which is then parsed by their game engine and appropriately draws the entities on screen.

Then again, they are using C# and running on the Xbox, whereas I’m running JavaScript on a PC, so JSON may be a more appropriate format here, if I were to take this approach. I don’t even think the Xbox has a way of parsing JSON; I know that Visual Studio just adopted JSON.NET, so it’s doubtful that the 8 year old Xbox has the ability to do the same.

#### Creating the Random Enemy Spawner

I found that my best approach was to create an entity, Random Enemy Spawner which sits just off the right side of the screen, and is always aligned on the Y-axis with the player. For debug purposes, I threw in placeholder art which is a copy of the player’s ship, and had it sit on the edge of the screen so that I could see not only where my enemies spawn, but also how frequently.



As you can see here, the enemies and spawner are all aligned on the X-axis. This may appear as though the enemies come in flat waves, but to counter that I have them all spawning on a timer. Three timers, actually.

I broke the enemy ships into three groups, and one example is illustrated below:

```
/******************************************
 * randomFromTo
 * Random number generator
 * Courtesy of Liza Shulyayeva's flea project
 ******************************************/
 randomFromTo: function (from, to) {
     return Math.floor(Math.random() * (to - from + 1) + from);
 },

 /******************************************
 * spawnEnemyGrpA
 * Spawns 1 of 2 types of enemies at random intervals
 ******************************************/
 spawnEnemyGrpA: function () {
     // Resets random number
     var rndNum = null;
         // Rolls a random number
         rndNum = this.randomFromTo(1, 10);

     // Spawns enemies within the Y bounds of the screen
     this.randomSpawnLocY = this.randomFromTo(ig.system.height - 20, ig.system.height / 20);

     // determines which enemy type will spawn
     if (rndNum > 5){
         ig.game.spawnEntity(EntityEnemyShip01, this.pos.x, this.randomSpawnLocY);
     }
     if (rndNum < 5){
         ig.game.spawnEntity(EntityEnemyOrb, this.pos.x, this.randomSpawnLocY);
     }
     // Resets timer
     this.spawnTimerGrpA.reset();
 },
```

I use spawnEnemyGrpB and C to spawn different types of enemies. They are set on timers like this:

```
/******************************************
 * init
 * Handles initialization
 ******************************************/
init: function (x, y, settings) {
    ...

     // Spawning timers for enemy ships
     this.spawnTimerGrpA = new ig.Timer(this.randomFromTo(3, 9));
     this.spawnTimerGrpB = new ig.Timer(this.randomFromTo(3, 8));
     this.spawnTimerGrpC = new ig.Timer(this.randomFromTo(4, 9));
 }
```

These timers are responsible for triggering enemy spawns at random times, which is what allows for a staggered appearance on screen.

I’ve noticed an incredible performance improvement from this, although it has been tricky to balance the difficulty. What I really need to do is create a variable that affects how frequently enemies are spawned, and that variable will adjust based on the chosen difficulty level of the game. A higher difficulty will obviously spawn more enemies at once.

[The EnemySpawner.js class can be found in its entirety on my GitHub.](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/game/entities/EnemySpawner.js)
