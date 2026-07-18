+++
title = "Dream.Build.Play dev diary 2"
date = "2012-05-01T00:00:00"
draft = true
stale_reason = "dead-tech keywords (XBLIG, XNA); 14.2 years old; broken outbound reference(s): link http://oneksoftlabs.com/kit/ (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); link http://blog.nickgravelyn.com/2009/08/easystorage-released/ (HTTP 403); link http://forums.create.msdn.com/forums/p/14756/77234.aspx (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); link http://www.twitter.com/Dfrandsen (HTTP 520)"
author = "Dave Voyles"
categories = ["XNA / XBLIG"]
tags = ["C#", "Dev Diary", "Dream.Build.Play", "Game Development", "XBLIG", "XNA"]
+++

[![](http://davidvoyles.files.wordpress.com/2012/05/pong-2012-05-01-06-24-14-40.jpg "Pong 2012-05-01 06-24-14-40")](http://davidvoyles.wordpress.com/2012/05/01/dream-build-play-dev-diary-2/)

Just placeholder art for now

**Update:** I’ve found the thread where in the App Hub where I got the original idea for the powerups. It is now linked.

This is part 2 of my Dream.Build.Play journal, where I outline what it’s like to learn the technical side of XNA and C#. You can find my [first part here.](http://davidvoyles.wordpress.com/2012/04/19/dream-build-play-dev-diary-1/)

As I mentioned in my previous posting, a few members of the XNA community have been key in helping me learn the ins and outs along the way. I was looking for a framework to build my game on top of, and in doing so I came across a few which caught my attention, but Oneksoft’s [Basic Starter Kit](http://oneksoftlabs.com/kit/) really had a lot of features that I was looking for. He frequently updates it, which gives you an added incentive to check out the page often as well. Essentially it is a combination of items from developers within the community, all of which are designed to make the experience of a novice developer easier.

Things such as Game State Management, [Nick Gravelyn’s Easy Storage](http://blog.nickgravelyn.com/2009/08/easystorage-released/), [George Clingerman’s basic sprite animation](http://www.xnadevelopment.com/tutorials.shtml), and customizable HUD components are just a few of the included features. It’s really worth a glance if you are new to developing with XNA.

[![](http://davidvoyles.files.wordpress.com/2012/05/pong-2012-05-01-06-24-32-561.jpg "Pong 2012-05-01 06-24-32-56")](http://davidvoyles.files.wordpress.com/2012/05/pong-2012-05-01-06-24-32-561.jpg)

Unfortunately, when I first tried implemented my game within the system I was still too much of a novice to understand how it all works together. I struggled for a week or two before deciding to remove it and start from scratch again, but this time only add features as needed. I’m still in a bit of a deadline to get my game completed before Dream.Build.Play , so it will have minimal features, but I can always add the additional features I wanted to initially have after the fact. It’s amazing what only a few weeks or reading and working can do, because I now understand most of it very clearly.

I have a working health bar implemented, courtesy of George Clingerman’s *[Not So Healthy](http://www.xnadevelopment.com/tutorials/notsohealthy/NotSoHealthy.shtml)* tutorial. Originally my pong game was using a point system to keep score, and after one side scored 5 times the game was over, but I wanted to add some variety to that, as well as some other ideas which could both be implemented in a brief period and would really allow me to learn another aspect of C#. Therefore I switched to using a health bar, and even implemented a powerup system!

#### Powerups – More work than I initially bargained for

The powerup system is similar to that of Mario Kart’s, wherein players hit a button to receive a random powerup which can be stored for later use. I have the animations in place for this as well, but I will explain that in the next tutorial. I found a thread in the app hub for setting up powerups ~~(which I can’t find at the moment),~~ [now found here,](http://forums.create.msdn.com/forums/p/14756/77234.aspx) but ultimately ran into some difficulties when doing it on my own. I understood what the developer in the forum was trying to do, in that he created one powerupclass which all other  powerups would extend from, but I wasn’t sure of how to roll them randomly, or actually implement it into my game.

[Jim Perry](http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0CDgQFjAA&url=http%3A%2F%2Ftwitter.com%2F%23!%2Fmachxgames&ei=CjafT7LcMaLD6AHe1oShAg&usg=AFQjCNEO69xqmGBKEzvxFVM6hYomeXRGaQ&sig2=A_MtCYQmoDZj9pQ8uIzzLQ), an XNA MVP, has been one of the most helpful and patient people involved in my learning process. Always quick to answer one of my forum posts, he has been a great help with implementing these powerups. He suggested setting them up as events, which was (and very much still is) a completely new concept to me. I’m learning quite a bit though, so even If I don’t get them working in that manner it was still worth it in the end. My issue at this point is that I have my powerups working, but it is selecting a bunch of them at random, rather than one at a time. I’d like to have that resolved by the next post or two. I use that the issue stems from failing to unsubscribe to the powerups after they have been rolled at random.

For the most part, the ones I wanted working do work fine, granted at the same time. My bat grows 2x the original size, my opponent shrinks ½ size, I have a health powerup in place, as well as regenerative health, which recovers 2hp/ / tick, over a 10 tick period. I did that because I wanted to add excitement to the game as players were nearing the end, selected regen, and hoped that it would fully recover their hp before their opponent scored again.

Additionally, I have a powerup to triple the speed of the ball, as well as one which causes the ball to split into 3 when hit. I’d like to adjust that one though, so that it cannot damage the player whose powerup caused that to happen. You’ll see in the screenshots that I still have a few debug features in place, such as the text on screen telling me when a powerup as been activated. I still can’t figure out how to get a log on the screen, such as the way I do in the Unreal Engine, so that it notifies me of each key press and what is happening each tick.

#### Adding some turbo to add some excitement

With the understanding that pong is a relatively boring game, I wanted to increase the speed of it somewhat, as well as include a bit of anxiety. Therefore I’ve included a turbo button that allows the player to make a last-moment save and quickly maneuver their paddle across the screen. The catch though is that it only lasts for 2 seconds, is extremely fast, and has a 5 second cooldown. I didn’t want to include a cooldown bar because I always want players to track in the back of their mind the last time they pressed the turbo key. The focus here was to have them constantly worrying if their cooldown was finished so that they wouldn’t always be able to rely on that save.

[Daniel Frandsen](http://www.twitter.com/Dfrandsen) helped me get that into place one evening, so I’d like to thank him for that.

In my next post I plan on covering how I implemented a HUD, learned how to animate the powerups as they randomly roll (Ex: Mario Kart style), and added controller support. Perhaps next week?
