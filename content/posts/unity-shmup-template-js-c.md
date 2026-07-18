+++
title = "Unity shmup template (JS and C#)"
date = "2014-03-15T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["C#", "Game Dev", "Javascript / HTML5", "Programming", "Students", "Unity"]
tags = ["open source", "Shmup", "Unity"]
+++



I’ve been a huge fan of shmups for as long as I can remember. If it’s good, I’ve played it (and it’s probably Japanese). I [wrote my last one in JavaScript](http://replay.drexel.edu/research.html) using the Impact.js framework, but this time around I wanted to do it in Unity and really test the performance of the engine.

When looking for Unity shmup templates, I came across [this great set of posts](http://www.shmup-dev.com/?cat=8) on the Shmup-dev website. One post includes an excellent talk on unity shmup development, [with slides and source code](http://www.shmup-dev.com/?p=138) to go along with it. It really touches on some of the basics and key points for creating a shmup, including performance considerations. Object pooling is absolutely necessary when creating a high performance game, and the author *monoRAIL* explains it very neatly for readers.

He’s also gone ahead and created a [template for a 3D shmup done in JavaScript.](http://shmup-dev.com/files/unity_shmup_template.zip)

I’m a fan of JavaScript myself, but I wanted to get back into C# development, so [took the liberty of converting his template to C#](https://onedrive.live.com/redir?resid=51CCFDB424CB429E!73870&authkey=!ACdu-NZFoS6Nlyk&ithint=folder%2c.gitattributes). You can find updates for it on my GutHub, [here.](https://github.com/DaveVoyles/Unity-csharp-shmup-template) I’ve also cleaned it up a bit, by changing some variable names and making it more easy to read.

[JavaScript template](http://shmup-dev.com/files/unity_shmup_template.zip) (monoRAILS)

[C# template](https://onedrive.live.com/redir?resid=51CCFDB424CB429E!73870&authkey=!ACdu-NZFoS6Nlyk&ithint=folder%2c.gitattributes) (mine)
