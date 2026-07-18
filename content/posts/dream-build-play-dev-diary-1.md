+++
title = "Dream.Build.Play dev diary 1"
date = "2012-04-19T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["XNA / XBLIG"]
tags = ["Dev Diary", "Dream.Build.Play", "XBLIG", "XNA"]
topics = ["Gaming"]
+++

[![](http://davidvoyles.files.wordpress.com/2012/04/dreambuildplay2012.png "dreambuildplay2012")](http://davidvoyles.files.wordpress.com/2012/04/dreambuildplay2012.png)

I want to chronicle what it’s like to learn how to program. It has always been something that has interested me, and I’m impressed by people who can program. In the game development world programmers are the ones who hold the key to success. A game may be aesthetically pleasing or engross players in a beautiful soundtrack, but those who control how the game actually feels and how it all comes together are the programmers.

Furthermore, I found it intimidating to begin a journey down the path of programming. When I first went back to school for my masters I was doing my MBA, while simultaneously doing another masters in Computer Science. My undergraduate work was in Communications and Advertising, and the fact that I am completely inept in the field of math wasn’t helping out my cause for learning C-sci. I dropped the work in Computer Science after only one semester as I couldn’t handle the math.

Flash forward a few years, and I’m dabbling in game dev as a hobbyist, and [started with the Unreal Engine](http://davidvoyles.wordpress.com/udk-title/) as it was the first thing that caught my eye at my first GDC in 2010. Learning this engine also allowed me to learn a plethora of other tools, including 3DS Max and Maya for modeling, Photoshop for 2D art, and Visual Studio for Unreal’s own programming language, UnrealScript. To further my skills, I figured I would take something I know best from my childhood, and get a current day prototype running, so I started to [remake Mega Man](http://davidvoyles.wordpress.com/udk-title/mega-man-2-remake/) 2 using the Unreal Development Kit.

With most of my art assets done, and a solid understanding of the engine, I knew that my time to learn programming would soon be approaching. I already had some understanding of the language, having worked on two other projects with development teams earlier, but not enough to create a game on my own. Besides, Uscript was a combination of C++ and Java, while XNA uses C#. While they are similar in some ways, it would still take me time to adjust to this change.

With the understanding that I would need to learn programming at some point in the near future I figured that [Dream.Build.Play](https://www.dreambuildplay.com/Main/Default.aspx) would be the perfect catalyst to move me along. It was really a conversation between [George Clingerman](https://twitter.com/#!/clingermangw) , [Michael Neel](https://twitter.com/#!/vinull) , and myself which got me started. By George’s gentle nudge, I entered DBP and told myself that I would have something done in the next 10 weeks, despite how simple it was.  [Ian Stocker](http://www.twitter.com/magicaltimebean) had suggested starting with pong to learn the basics, so I did just that.

#### My first steps

On a Saturday evening I scoured the internet in search for pong tutorials, and went through several so that I could understand the key differences between then, and see which worked best for my needs. I settled on this one from [Ross Warren](http://ross-warren.co.uk/pong-clone-in-xna-4-0-for-windows/), and it’s worked out great for me. For the most part he clearly identifies what he is doing throughout the entire process, and as someone completely new to XNA this kind of babying was certainly welcome.

In addition, I found [James Silva’s XNA 2.0 Book](http://www.amazon.com/Building-XNA-2-0-Games-Professionals/dp/1430209798) to be very useful, despite being somewhat outdated. He also has a pong tutorial, along with source code which came in handy, but his version of Pong was far different in that it generally relied on only one class, where Ross’ used many. Further adding to the complication was the fact that I was now using XNA 4.0, and much of the 2.0 code would need to be changed. Again, this forced me to delve deeper in to the code and allow me to understand some of the differences between the previous versions of XNA.

Soon after I had my Pong game moving along I realized that I would need to improve my C# and XNA skills before I could really make the additions to the game that I was looking for. I decided to take a week or two off from programming and just read and arm myself with as much of an education myself as much as I could.

I ran to Amazon and grabbed all of the books that I could. [XNA 4.0 Game Development](http://www.amazon.com/XNA-4-0-Game-Development-Example/dp/1849690669) was very useful in that it had a number of templates for pre-built games, and despite it being for Visual Basic and not C# (an addition to 4.0) I still learned quite a bit.  [Microsoft XNA Game Studio 3.0 Unleashed](http://www.amazon.com/Microsoft-XNA-Game-Studio-Unleashed/dp/0672330229/ref=sr_1_1?s=books&ie=UTF8&qid=1334715399&sr=1-1) was informative as well, and they also included a few templates for use within games, such as loading bars and how to implement animations.

What I found to be more useful by far however was Rob Miles’ [C# Yellow Book.](http://www.csharpcourse.com/) Not only was it an easy read for a novice, but he provided all of the material as though it were spoken through a casual conversation. I can’t recommend it enough for anyone learning C#.

Armed with my new found knowledge, I felt it was time to begin tweaking the game how I saw it to be fit. I played with the various properties of the ball and bats until they felt right, such as altering the speeds and sizes. Last week I decided to replace the score with a health bar, thereby creating more of a dynamic and interactive challenge as the health bar can be raised and lowered.

#### More next week

This is all I’ve really got time to write about at the moment. Next week I’ll detail more of my code and explain how I’m going about doing things. I’ll also highlight some of the people who have really helped me out along the way and deserve the recognition for doing so.

You can follow along with my progress, as well as that of many other DBP entries at the [XNALastDance.com](http://www.xnalastdance.com) page, as set up by Michael Neel.  It’s a great place to get some motivation whenever you get bogged down by lack of progress!
