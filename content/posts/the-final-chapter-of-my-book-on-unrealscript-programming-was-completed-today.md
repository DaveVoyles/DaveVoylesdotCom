+++
title = "The final chapter of my book on UnrealScript Programming was completed today"
date = "2012-12-21T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Game Dev", "Programming", "UDK", "UnrealScript"]
tags = ["Postmortem", "Programming", "UnrealScript"]
topics = ["Gaming", "Tech"]
+++

[![UnrealScript HUD](http://davidvoyles.files.wordpress.com/2012/12/556ot_07_08.png)](http://davidvoyles.files.wordpress.com/2012/12/556ot_07_08.png)

Earlier today I completed the final chapter of my book *The Advancaed UnealScript Programming Cookbook*. The book covers a number of topics ranging from creating custom weapons, advanced AI for navigating tight paths and following pawns, drawing a HUD without the use of [ScaleForm](http://gameware.autodesk.com/scaleform), and adjusting crosshairs based on the actor your pawn’s eyes are tracing.

It was an interesting experience, to say the least. Initially I wasn’t completely confident that I could complete the book within the restrictions of such a tight deadline (less than 3 months), especially when I hadn’t used the language or Unreal Development kit in almost a year. I had previously been focusing my efforts on C#, XNA, and Unity.

Then Hurricane Sandy came and destroyed my home on Long Island. That certainly set me back a bit, but fortunately I’m surrounded

![Box around pawns](http://davidvoyles.files.wordpress.com/2012/12/566ot_08_07.png)

by supportive people who made the experience far easier than it could have been. I’ve moved since then, but it did tie up a bit of my writing time. Along the way I’ve come to realized what I enjoy most about programming a game and what I like the least.

#### What I enjoyed the least

Doing any kind of HUD work is just not my forte. There is entirely too much math involved, you’re dealing with floating numbers, and having to compensate for 100 different resolutions out there.  Grabbing properties from other classes (ie. weapon ammo, pawn health) makes things easy, but adjusting for the resolutions proved difficult. It’s something that I’d rather not have to do again.

#### What I enjoyed the most

Surprisingly, I found that creating AI and pathfinding for pawns was the most interesting aspect of the project. I really had much exposure to this previously, so I learned a lot along the way. The initial process was daunting, but once I understood a number of the classes the helpers the API provided, it became much easier.

[![566OT_08_02](http://davidvoyles.files.wordpress.com/2012/12/566ot_08_02.png?w=300)](http://davidvoyles.files.wordpress.com/2012/12/566ot_08_02.png)It’s incredible to see the AI you’re writing come to life and interact with one another. Everything from the pawns running to a ledge, refusing to go over it, then turn around and run toward another set direction is a pretty neat thing to experience.  Unreal make this easy through their use of events and states. Events are basically listeners in C#, so as a speciific events occurs, such as a pawn being hit, the engine calls the function within the event.

States allow me to use the same function over and over, but call a different version of said function. For example, if my pawn is attacking an enemy then its mesh could be set to red, to show anger, while if it was fleeing from an opponent the mesh could turn green.  After working with Unreal’s heavy use of states, it would be difficult to go back to using anything else.

#### Conclusion

That’s all I have to say about this for now, but I’m sure that I’ll have a more detailed postmortem as things conclude and the book is release. Look for it within the next 2-3 months, as it is in the editing and technical reviewing phase right now. It is being published by Pakt Publishing, and if you’d like to see similar titles, they offer quite a plethora of them on [their site here.](http://www.packtpub.com/)
