+++
title = "Super Rawr-Type Redux is released for the browser"
date = "2013-11-03T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Game Dev", "Javascript / HTML5"]
tags = ["Game Dev", "Gaming", "HTML5", "ImpactJS", "JavaScript", "Programming"]
+++



#### **[Click here to play Super Rawr-Type Redux](http://super-rawr-type.azurewebsites.net)**

****Source Code:**  <https://github.com/DaveVoyles/Super-Rawr-Type-Redux>**

I’ve spent the last 3 months working on the follow up to my previous game, *Super Rawr-Type*. It was a simple side scrolling 2D shmup, which I wrote in JavaScript and also ported to Windows 8. One bug prevents me from getting it into the store, and I’m not able to replicate it, so who knows if it will ever be released there.

*Super Rawr-Type Redux* is finally finished, or at least to the point where I’m satisfied with it. It’s a single stage, vertical slice of something I’d like to potentially continue on in the future, but I have other things I’d like to pursue at the moment, such as a C++ / DirectX11 game, which I’ll begin working on with 3 friends starting November 1st.

You can play the game from here. There are a few occasional bugs that I’m aware of, and others which I can’t reproduce, but I’m leaving this project “as-is” to begin work on other things.  The loading time is horrendous (thanks DropBox), but until I find an alternative or faster hosting solution, it is what it is. It works in all major browsers, and although it works on several mobile browsers (Safari, for example), I haven’t implemented touch controls, so you won’t be able to move anywhere.



Although the game retains much of the difficulty I  loved from arcade shooters of the 80s and 90s, I’ve found that using all of the tools you have at your disposal greatly help lower the difficulty curve. There are homing missiles, slow motion, and turrets for a reason. Use them!  My goal was to make a game which is initially difficult, but can be mastered without requiring trial-and-error playthroughs.

[As always, the source code for *Super Rawr-Type Redux* is open source,](https://github.com/DaveVoyles/Super-Rawr-Type-Redux) so feel free to make use of it as you see fit. If you did happen to find something of use in there, let me know! I’d love to understand how it helped you out. The music is done in the 8-bit style of the older Mega Man games, and belongs to Kevin Phetsomphou. You can find more of his excellent work on [his youtube channel here.](http://www.youtube.com/user/Kevvviiinnn?feature=watch)

I enjoy working on smaller, 1-3 month projects, and for a number of reasons.  It affords me the following opportunities:

1)   Fail fast

2)   Learn quickly

3)   Build on what I’ve already done

4)   Prevent feature creep

5)   Ship titles!

What’s not to like? Sure, I never afford myself the opportunity to build something large, but at the same time, is it even reasonable to assume that a single developer can always produce a shippable AAA quality title and not get burnt out? I’d rather have 10 smaller projects under my belt than 1 large one.

### Improvements

This  time around I built on much of what I created in the original *Super Rawr-Type* game , but I started from scratch. There is no longer a camera, but instead the player remains within the screens bounds at all time, and the parallax stars are what lead you to believe that there is actually horizontal movement. In reality, the game screen never extends past width / height of the screen.

Furthermore, enemies are all spawned off screen from a class called *entitySpawner.js,* which resets a timer each time enemies spawn on screen, and then checks if it can continue to spawn enemies. This offered a considerable performance improvement, as previously I created all of the enemies during initialization and had them on the map as the game started.

There is now a sound manager, which offers a central resource for all of my sound effects and music tracks, in addition to a music fader, which affords me the ability to segue between tracks.

Tweening has seen multiple improvements, and each menu on screen is an entity, which can be tweened on and off screen in 1 of 20 ways. This really helped to give the game more of a polished feel from what I had before.

The enemy boss took me about 3 weeks to write, because I had never taken the time to create one before. It’s more work than I had anticipated, but I learned quite a bit from it in the end. Creating enemies which would spawn off of it wasn’t difficult, but creating ports which served as the boss’ weak point was a fun lesson, and creates a bit of a challenge for players.

Much of this game is inspired by StarFox, hence the boss having the ability to suck the player towards it’s hull, similar to Andross pulling Fox McCloud into his mouth during the final scene on Venom.

Numerous performance optimizations have been made, including object pooling and a new particle engine, courtesy of Vincent Piel, at <http://gamealchemist.wordpress.com/>. He is an incredible resource of knowledge, and those of you looking to make performance optimizations for your JavaScript work should definitely give his site a look. I wrote more about my experiences with [object pooling in JavaScript here.](http://davidvoyles.wordpress.com/2013/09/19/a-better-way-of-object-pooling-with-impact-js-html5/)

All bullets on screen are pooled, in addition to the particles and parallax starfield. Moreover, the framerate never drops below 30fps, even while under the heaviest load. I’ve found that it stays at 60 fps nearly the entire time, which has been a goal all along.

We’ll see where my next project takes me, but for now this chapter is closed, and perhaps I’ll pick it up again at some other point.  That’s the beauty of HTML5 and JavaScript – portability!
