+++
title = "Object pooling optimizations – not so much [yet]"
date = "2013-04-11T00:00:00"
draft = true
stale_reason = "dead-tech keywords (Windows 8); 13.3 years old; broken outbound reference(s): link https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/game/entities/bulletNoPooling.js (HTTP 404); link https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/plugins/pool.js (HTTP 404)"
author = "Dave Voyles"
categories = ["Game Dev", "Javascript / HTML5", "Programming", "Windows 8"]
tags = ["Game Dev", "ImpactJS", "JavaScript", "Programming"]
+++

[UPDATE] Clarified that I have two classes for my bullet. One which uses pooling, and [another that does not use pooling](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/game/entities/bulletNoPooling.js).

So my object pooling optimizations don’t seem to be working.

I thought I would have seen some improvements in terms of my performance, but I’m just not seeing it. I think one issue is due to the fact that with more objects lying around, the garbage collector takes longer to run. Essentially, the pooling reduces how often the collector runs, but makes those runs more noticeable.

This is clear when viewing the debug screen within the game. Above, you’ll find a video that I recorded with my performance monitor running. The first clip illustrates the poor performance with pooling, and the second clip is without pooling, where I just instantiate the entities (bullets) and kill them as needed.

You can find my [GitHub account here,](https://github.com/DaveVoyles/SuperRawrType) and the applicable files here are for [“bullet”](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/game/entities/bullet.js) and “[pool](https://github.com/DaveVoyles/SuperRawrType/blob/master/lib/plugins/pool.js)“.
