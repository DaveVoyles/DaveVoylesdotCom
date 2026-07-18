+++
title = "Adding touch controls for Windows 8"
date = "2013-05-09T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Game Dev", "Javascript / HTML5", "Programming", "Windows 8"]
+++

[![Loading Super Rawr-Type within the Win8 touch simulator](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/win8-emulator-1.jpg?w=652)](http://davidvoyles.wordpress.com/2013/05/09/adding-touch-controls-for-windows-8/)

Loading Super Rawr-Type within the Win8 touch simulator

For the last two weeks or so I’ve been working out bugs in *Super Rawr-Type* and integrating touch controls for the Windows 8 port. This is the first time I’ve ever created touch controls, so it took a bit to understand how they work, specifically with toggling the joystick for movement and stationary buttons for shooting, switching weapons, and activating powerups.

What proved most difficult for me really was not having a machine to test my controls on. I’ve had to rely on the simulator thus far, which basically runs a virtual machine on your desktop, wrapped a shell that appears like a Win8 tablet. The buttons on the right hand side emulate figure gestures, so you can view and understand how your own touches will affect the game.

[![Active touch inputs, using the Win8 simulator](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/playing-super-rawr-type-on-touch.jpg?w=652)](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/playing-super-rawr-type-on-touch.jpg)

Active touch inputs, using the Win8 simulator

You can do in Visual Studio 2012 by selecting “**simulator**”from the debug ribbon. Shortly after, the simulator will appear. From there I load another instance of Visual Studio from within the simulator, but this time I click on “**local machine**” from the debug ribbon so that I can run *Super Rawr-Type* from within that instance of the simulator. This is where all of my testing for touch inputs occurs.

#### The Joystick  and Hit-Area Classes

[Jesse Freeman](http://www.twitter.com/jessefreeman) wrote a great Joystick class in his [Windows 8 Boostrap kit for ImpactJS](http://jessefreeman.com/game-dev/the-6-minute-impact-starter-kit-for-windows-8-web/). I highly suggest you look through everything offered in that package, as it greatly streamlines the process of porting your impactJS project and implements a number of great plugins that I continue to use throughout this project.

[The GitHub for the joystick can be found here.](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/bootstrap/plugins/touch-joystick.js) It’s pretty straight forward, and the way you implement it into your game is what’s really important though. The joystick works by drawing itself beneath where your mouse pointer is clicked, then can be rotated a fixed distance around the circumference of your digital joystick.

Those limits are set with this function:

```
 limit: function(x1, y1, x2, y2, radius) {

                // the vector between the two points
                var dx = x2 - x1,
                    dy = y2 - y1,
                    distanceSquared = (dx * dx) + (dy * dy);
                if (distanceSquared <= radius * radius) {
                    return { x: x2, y: y2, dist: radius };
                } else {
                    var distance = Math.sqrt(distanceSquared),
                        ratio = radius / distance;

                    return {
                        x: (dx * ratio) + x1,
                        y: (dy * ratio) + y1,
                        dist: radius
                    };
                }
            }
```

[My player class can be seen here](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/game/entities/player.js), and illustrates how I use the joystick within my game. I start by initializing the joystick when the player loads, and also adding the touch controls buttons:

```
        EntityPlayer = EntityBaseActor.extend(
        {
            ....
            /* Touch Controls */
            aButton: { name: "a button", label: "A", x: 0, y: 0, width: 0, height: 0 },
            bButton: { name: "b button", label: "B", x: 0, y: 0, width: 0, height: 0 },
            cButton: { name: "c button", label: "C", x: 0, y: 0, width: 0, height: 0 },
            toggleButton: { name: "toggle button", label: "Toggle", x: 0, y: 0, width: 0, height: 0 },
            joystick: null,
            ....

     init: function(x, y, settings) {
                this.parent(x, y, settings);
                ....
                // Joystiq and touch controls
                this.joystick = new TouchJoystick();
                ig.game.clearHitAreas();
                ....
            },
```

#### Drawing the buttons

[![Screen without buttons](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/without-touch-buttons.jpg?w=652)](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/without-touch-buttons.jpg)

Screen without buttons

I need to draw the joystick as well, so I do that in my draw function, but only if the joystick and touch controls are active. Otherwise they remain invisible.

```
            /*******************************************
            * Draw
            ******************************************/
            draw: function () {
                if (this.invincible) {
                    this.currentAnim.alpha = this.invincibleTimer.delta() / this.invincibleDelay * 1;
                }
                this.drawUI();
                this.drawExitText();
                this.drawBulletTimeText();
                if (ig.game.bActivateTouchControls) {
                    this.drawButtons();
                }
                if (this.joystick && ig.game.bActivateTouchControls) {
                    if (this.joystick.mouseDown) {
                        if (this.joystick.mouseDownPoint) {
                            // Offsets are necessary b/c I am using a smaller joystick than Jesse's Bootstrap starter kit used
                            this.textures.drawFrame("touch-point-small.png", (this.joystick.mouseDownPoint.x + 56) - this.joystick.radius, (this.joystick.mouseDownPoint.y + 58) - this.joystick.radius);
                            this.textures.drawFrame("touch-point-large.png", (this.joystick.currentMousePoint.x + 47) - this.joystick.radius, (this.joystick.currentMousePoint.y +47) - this.joystick.radius);
                        }
                    }
                }
                this.drawTouchToggle();
                this.parent();
            },
```

That’s our player’s draw loop, but inside that you’ll see we have functions for drawing the joystick and button. The joystick is only visible if both the touch controls are active AND joystick is true. Joystick is only true if the player’s finger is against the screen. This prevents us from having a joystick cluttering up the screen at all times.

```
            /******************************************
            * drawButtons
            * Draws buttons for Win8 controls
            * Registers hit areas for inputs to detect
            ******************************************/
            drawButtons: function () {
                this.xOffset = ig.system.width / 2;
                this.yOffset = ig.system.height / 2;
                var buttonWidth = 45,
                    buttonHeight = 41;

                // A button
                this.textures.drawFrame("touch-point-small-A.png", this.xOffset + 50, this.yOffset + 80);
                ig.game.registerHitArea(this.aButton.name, this.xOffset + 50, this.yOffset + 80, buttonWidth, buttonHeight);

                // B button
                this.textures.drawFrame("touch-point-small-B.png", this.xOffset + 100, this.yOffset + 90);
                ig.game.registerHitArea(this.bButton.name, this.xOffset + 100, this.yOffset + 90, buttonWidth, buttonHeight);

                // C button
                this.textures.drawFrame("touch-point-small-C.png", this.xOffset + 150, this.yOffset + 100);
                ig.game.registerHitArea(this.cButton.name, this.xOffset + 150, this.yOffset + 100, buttonWidth, buttonHeight);
            },

            /******************************************
            * drawTouchToggle
            * If true, Joystick and buttons are displayed
            ******************************************/
            drawTouchToggle: function() {
                this.xOffset = ig.system.width / 2;
                this.yOffset = ig.system.height / 2;
                var buttonWidth = 44,
                    buttonHeight = 23;

                // Button to trigger touch controls on / off
                this.textures.drawFrame("joystick-toggle.png", this.xOffset - 231, this.yOffset - 100);
                ig.game.registerHitArea(this.toggleButton.name, this.xOffset - 231, this.yOffset - 100, buttonWidth, buttonHeight);

            },
```

The function *ig.game.registerHitArea* comes from [Jesse’s hit-area plugin](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/bootstrap/plugins/hit-area.js), which injects some functionality into the game class from within the plugin. You can [read more about injection here](http://impactjs.com/documentation/class-reference/class), and quite simply it adds functionality to a class (in this case, source code) in instances where you do not have access to the source code.

Rather than make any changes from within the game class itself, we can add functions and variables from another class, and tie it into game. It is useful in certain situations, although I find that it often leads to confusing code, as you may not always be aware of where the injected code is coming from.

So in one function we are drawing the buttons on screen, in addition to registering the hit areas. Notice that the hit areas are the same size as the button textures?

#### Updating the  joystick to respond to our touch

[![Touch instructions before the game starts](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/instructions-screen.jpg?w=652)](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/instructions-screen.jpg)

Touch instructions before the game starts

With that out of the way, we can focus on the final part, and that’s updating the joystick and hit areas to respond to our touch. I tried separating my update loop into smaller, manageable functions, but it’s turned out to be a mess because of how tightly coupled everything is. My animations are tied to the speed of my player, my inputs are tied directly to the speed, and my weapon firing and switching are also tied directly to my inputs.

Despite my lack of modularity in my current code, it should still give you a great idea of how touch controls work with Win8 and JavaScript. I probably should go back and refactor much of this, but that’s time consuming, and I’m simply using my brief time with this project as a learning experience.

My update loop looks like this (missing content is denoted with “….” for brevity):

```
            /******************************************
            * Update - handles input, weapons, anims
            ******************************************/
            update: function() {
                var idleSpeed = 120;
                    fastSpeed = 150;
                    backSpeed = 80;

                /*=====================================
                Joystick controls
                =====================================*/
                if (this.joystick) {
                    // Activates joystick if mouse click is detected & touch controls are toggled on
                    if (ig.input.pressed('click') && ig.game.bActivateTouchControls) {
                        // I use +47 to align the touch point with the center of the mouse point. Odd bug perhaps?
                        this.joystick.activate(ig.input.mouse.x, ig.input.mouse.y);
                    } else if (ig.input.released('click')) {
                        this.joystick.deactivate();
                    }
                    // Updates joystick based on mouse location
                    this.joystick.update(ig.input.mouse.x, ig.input.mouse.y);

                    // Mouse Control Logic
                    if (this.joystick.mouseDown) {
                        this.mouseDownPoint = this.joystick.mouseDownPoint;
                        this.currentMousePoint = this.joystick.currentMousePoint;

                        // If mouse is down and moved a certain distance, then begin to detect and perform checks
                        if (this.currentMousePoint.y < this.mouseDownPoint.y -15) {                             // Moving Up                             this.vel.y = -idleSpeed;                             this.accel.x = this.speed;                         } else if (this.currentMousePoint.y > this.mouseDownPoint.y +15) {
                            // Moving down
                            this.vel.y = idleSpeed;
                            this.accel.x = this.speed;
                        } else {
                            this.vel.x = idleSpeed;
                            this.vel.y = 0;
                        }
                        if (this.currentMousePoint.x > this.mouseDownPoint.x +15) {
                            // Moving Right
                            this.vel.x = fastSpeed;
                        } else if (this.currentMousePoint.x < this.mouseDownPoint.x -15) {
                            // Moving Left
                            this.vel.x = backSpeed;
                        } else {
                            // Idle speed
                            this.vel.x = idleSpeed;
                        }
                        this.currentMousePoint = null;
                    }
                }
                // Updates touch button inputs
                if (ig.input.pressed('rightClick') && ig.game.bActivateTouchControls) {
                    // Scan all hit areas and detect a key press
                    var hits = ig.game.testHitAreas(ig.input.mouse.x, ig.input.mouse.y);
                    if (!ig.ua.mobile) {
                        if (hits.indexOf("a button") != -1) {
                            this.bIsShooting = true;
                        }
                        if (hits.indexOf("b button") != -1) {
                            this.bSwitchingWeapons = true;
                        }
                        if (hits.indexOf("c button") != -1) {
                            this.bSlowingTime = true;
                        }
                    }
                }
                // When the button is released....
                else if (ig.input.released('rightClick')) {
                    this.bIsShooting = false;
                    this.bSwitchingWeapons = false;
                    this.bSlowingTime = false;
                }

                // Toggles touch inputs on/off
                if (ig.input.pressed('rightClick') || ig.input.pressed('click')) {
                    // Scan all hit areas and detect a key press
                    var hits = ig.game.testHitAreas(ig.input.mouse.x, ig.input.mouse.y);
                    if (!ig.ua.mobile) {
                        if (hits.indexOf("toggle button") != -1) {
                            ig.game.bActivateTouchControls = !ig.game.bActivateTouchControls;
                        }
                    }
                }
```

I’ve gone ahead and commented all of the code, so it should be incredibly easy to read. I do this for myself, as I can quickly scan through the code and understand what the purpose of each block or line of code is for. This also allows others to view the code and say “Hey, your comment doesn’t match up with the task that this block is performing”, and therefore makes troubleshooting and collaboration far easier.

The first thing I have in my update loop there are checks.

```
                if (this.joystick) {
                    // Activates joystick if mouse click is detected & touch controls are toggled on
                    if (ig.input.pressed('click') && ig.game.bActivateTouchControls) {
```

Without these the joystick would also be drawn on screen and updated each time the mouse is moved, regardless of whether or not it is clicked For ship movements with the joystick you’ll see that I also have *+15* tacked onto the end of  many of my if statements.

```
  if (this.currentMousePoint.y < this.mouseDownPoint.y -15) {
           // Moving Up
           this.vel.y = -idleSpeed;
```

This is a small buffer that allows for a “dead zone” in the center of the joystick. If the player is touching the joystick, but hasn’t moved 15 pixels from the center of the joystick’s radius in any direction,  then the ship will remain stationary. Without this, the ship would begin to fly up the moment joystick was pressed up, regardless of where the player’s finger was in relation to the joystick.

That’s all there really is to the joystick. Take a look at Jesse’s code to get a better idea of how he uses it for his project, and you see spot some of our key differences. Additionally, he uses a slightly larger joystick than I do, so I had to compensate for that difference due to my lower screen resolution.

This can be seen in the draw loop for my joystick. Without the numbers added to my *mouseDownPoint* function, my joystick would appear up and to the left from my actual mouse down point:

```
  if (this.joystick.mouseDownPoint) {
                            // Offsets are necessary b/c I am using a smaller joystick than Jesse's Bootstrap starter kit used
                            this.textures.drawFrame("touch-point-small.png", (this.joystick.mouseDownPoint.x + 56) - this.joystick.radius, (this.joystick.mouseDownPoint.y + 58) - this.joystick.radius);
                            this.textures.drawFrame("touch-point-large.png", (this.joystick.currentMousePoint.x + 47) - this.joystick.radius, (this.joystick.currentMousePoint.y +47) - this.joystick.radius);
                        }
```

#### Updating the buttons to respond to our touch

The first thing I needed to do here was create a toggle so that the touch buttons are not always drawn on screen. What if the user is playing on a machine that doesn’t have touch? Why draw the buttons then? There is no way that I’m aware of to detect whether or not the user has a touch-capable machine, so I’d rather just give them the option to select it him or herself. That is done with this block in my player’s update loop:

```
// Toggles touch inputs on/off
                if (ig.input.pressed('rightClick') || ig.input.pressed('click')) {
                    // Scan all hit areas and detect a key press
                    var hits = ig.game.testHitAreas(ig.input.mouse.x, ig.input.mouse.y);
                    if (!ig.ua.mobile) {
                        if (hits.indexOf("toggle button") != -1) {
                            ig.game.bActivateTouchControls = !ig.game.bActivateTouchControls;
                        }
                    }
                }
```

This button resides in the top left corner of my screen, just beneath the player’s HUD. When touched with either the left or right mouse button, it will trigger the buttons to be drawn on screen. Otherwise, all of the button logic resides in this block of code, also found in the player’s update loop:

```
                // Updates touch button inputs
                if (ig.input.pressed('rightClick') && ig.game.bActivateTouchControls) {
                    // Scan all hit areas and detect a key press
                    var hits = ig.game.testHitAreas(ig.input.mouse.x, ig.input.mouse.y);
                    if (!ig.ua.mobile) {
                        if (hits.indexOf("a button") != -1) {
                            this.bIsShooting = true;
                        }
                        if (hits.indexOf("b button") != -1) {
                            this.bSwitchingWeapons = true;
                        }
                        if (hits.indexOf("c button") != -1) {
                            this.bSlowingTime = true;
                        }
                    }
                }
                // When the button is released....
                else if (ig.input.released('rightClick')) {
                    this.bIsShooting = false;
                    this.bSwitchingWeapons = false;
                    this.bSlowingTime = false;
                }
```

If the player right clicks (or touches) the a button, then the player will begin firing, as determined by the boolean *this.bIsShooting = true;*. This is tied directly into my player’s firing function at the top of the update loop:

```
               /*======================================
                Weapons
                ======================================*/
                var isShooting = ig.input.state('shoot');
                if (this.bIsShooting && this.lastShootTimer.delta() > 0 || isShooting && this.lastShootTimer.delta() > 0) {
                    switch (this.activeWeapon) {
                    case ("EntityBullet"):
                        this.equipedWeap = ig.game.getEntityByName('bullet');
                        this.lastShootTimer.set(this.equipedWeap.fireRateWeak);
                        ig.game.bulletGen.useBullet(EntityBullet, this, null, +10, +2);
                        this.hit01_sfx.play();
                        break;
```

Now I have the option of pressing the shoot button (tied to “C” on the keyboard) or the shoot button on the touch interface. The final key part to the button logic is the *else if* statement. Without this, the player would continue to perform the given task (ie. shooting, switching weapons, activating slow mo).

```
                // When the button is released....
                else if (ig.input.released('rightClick')) {
                    this.bIsShooting = false;
                    this.bSwitchingWeapons = false;
                    this.bSlowingTime = false;
                }
```

#### Conclusion

[![Support for Win8 Snap View](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/win-8-sidebar-supprt.jpg?w=652)](http://davevoyles.azurewebsites.net/wp-content/uploads/2013/05/win-8-sidebar-supprt.jpg)

Support for Win8 Snap View

Well that’s all there is to it! It may seem far more complicated than it is, but if I can figure out touch controls and implement them in one day, then surely you can as well. Again, I urge you to take a look at that bootstrap starter kit, as it provides tons of functionality to get your game working on Windows 8 and other devices.

My game is completed now, and I’m handing it out to testers before submitting it to the Win8 store later this week. The web build is complete as well, but I ran into some sort of build error, where it seems to be missing a “;” termination statement somewhere. I’ll sift through it when I have more time.

Up next? WebGL support! If you have any questions about this project or need help integrating certain features into your own Impact project, feel free to get in touch with me!
