+++
title = "How do I get my game on Xbox One?"
date = "2014-02-07T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["C++ / DirectX 11", "Game Dev", "Javascript / HTML5", "Programming", "Unreal Engine", "Windows 8"]
tags = ["Game Dev", "MonoGame", "Programming", "Unity", "Unreal Engine", "UWP", "Windows 10", "Windows 8", "Xbox One"]
+++



**Update 3/29/16**

*With today’s announcements at //BUILD, some of this information will be out of date. I will make changes in the very near future.*  
Updated, **9/24/15**  
**TLDR**: *Middleware engines work great and support for Xbox one is continuing to grow within new tools each day. I have a more recent post with more information following Microsoft’s presence at GDC 2015. [Here is the latest.](http://www.davevoyles.com/gdc-xbox-live-and-xbox-one-will-be-open-to-many-more-developers-now/)*

For developers to focus on building for the UWP. Building UWP apps today is the best way to make sure apps will work on the Xbox when UWP is available on the Xbox. Similarly how different device families have specific APIs (GPIO, Hardware buttons, etc), Xbox will have a set of APIs that developer can use to extend experience to match the Xbox One, and those APIs will be used on top of the core UWP functionality that developers are building today.

Everything listed below is publicly available information, so you’re not going to find anything new here; I simply organize it for you.

## What are the specs available to me?

If you are making a dedicated application for Xbox One, you’ll have full access to everything that the Xbox offers, so the resources above do not apply to you. *Those resources above are strictly for apps running on the  **(Universal Windows Platform) UWP** , which scales to all of our platforms utilizing Windows 10.*

## Sign up process

Xbox LIVE will be made available to developers using the UWP (Universal Windows Platform) in the near future. You need to register for the ID@Xbox program at the dev center ([Xbox.com/dev](http://www.xbox.com/dev)) to gain access to this. There will be a new form to fill out, which will read something along the lines of:

***Are you signing up to write for Xbox One, Win 10 w/ LIVE, or both?***

The site will have a redesign shortly. Unity will continue to work just fine, as will DirectX, so feel free to write your apps using either of those. More middleware will be announced in the future.

Even if you already have an Xbox One development kit, this will be a separate process to apply for LIVE services on Windows 10, so you’ll need to fill out another form. We’ll have more information in the future about specifically which parts of LIVE are coming over. [You can get started with Windows 10 development today.](https://dev.windows.com/en-us/windows-10-for-developers)

## When will my retail console be turned into a development kit?

Microsoft hasn’t made an announcement with a public date for this yet. In the mean time, building UWP apps today is the best way to make sure apps will work on the Xbox when UWP is available on the Xbox.

## How much will it cost to make a game?

[This blog post from Happion Labs,](http://www.gamedevblog.com/2014/07/making-a-shoestring-budget-game-for-the-xbox-one.html) who release Sixty Second Shooter in 2014 breaks down the cost in great detail.

## How much will development kits cost? Do I get any right away?

Two (2) free Xbox One developement kits are provided for active developers in the program. Reach out to your contact at the ID@Xbox program afterwards to request more consoles if necessary.

## Which tools can I use to create a game?

### Unity

Microsoft has partnered with Unity to make the process for going from Windows 8 to Xbox One as seamless as possible, as stated by this [official announcement from the ID@Xbox team.](http://news.xbox.com/2013/11/xbox-one-unity-id)

> “To us, ID@Xbox is about providing a level playing field for all developers. So, we worked with Unity and we’re pleased to announce that, when released in 2014, the Xbox One add-on for Unity will be available at no cost to all developers in the ID@Xbox program, as will special Xbox One-only Unity Pro seat licenses for Xbox One developers in the ID@Xbox program.”    – Chris Charla, Director, ID@Xbox

Rather than wait for Microsoft to unlock Xbox One units and turn them into dev kits, just get started on making a Windows 8 game in Unity. **Think about it:**Your game is immediately more attractive to Microsoft the moment you use an engine that can be ported to three of their platforms: *Windows 8, Windows Phone*, and *Xbox One*.

Need a hand? [Get in touch with me](mailto:Dvoyles@microsoft.com) — **It’s my job to help!**

### Havok (Vision Engine)

> Havok Vision Engine is a cross-platform game engine that provides a powerful and versatile multi-platform runtime technology ideally suited for all types of games and capable of rendering extremely complex scenes at smooth frame rates. Providing a well-designed, clean and object-oriented C++ API, the technology includes a variety of features to help developers break through technical barriers, opening up a wide range of possibilities for game development.
>
> Havok Vision Engine is multi-threaded and optimized for Windows (DX 9, DX 11), Windows 8, Xbox360®, PlayStation®3, Nintendo Wii™, Wii U™, PlayStation Vita®, iOS and Android. It is also an ideal solution for online distribution via XBLA™, PSN™, and WiiWare™.  
> [– Havok.com](http://www.havok.com/news-and-press/releases/havok%E2%84%A2-announces-support-xbox-one-suite-award-winning-middleware)

### Unreal Engine 4

> Now, ID@Xbox developers, like all developers on Xbox One, can begin utilizing Unreal Engine 4 for their Xbox One game development. Epic Games first [unveiled](http://epicgames.com/news/epic-games-releases-unreal-engine-4-for-all/) their new subscription model at GDC in March, enabling developer access to leading-edge tools, features, and complete C++ source code for FREE.  
>  [– Xbox News Blog](http://news.xbox.com/2014/04/games-unreal-engine-id-xbox)

### CryENGINE 3

> Crytek recently became an officially licensed provider of middleware and tools for Xbox One, and will support the platform as well as equipping CryENGINE 3 licensees with the advanced toolset required to achieve their own games for the system.  
>  [-Crytek.com](http://www.crytek.com/news/crytek--s-cryengine--3-already-primed-for-xbox-one-development)

### GameMaker

> Since the announcement of our partnership with Microsoft in August, we have been working hard and we are thrilled to – announce that the Xbox One Export Module is now in Beta. This is available to all Microsoft’s licensed Xbox developers.
>
> [– YoyoGames.com](http://www.yoyogames.com/news/238)

### Cocos2D-x

> Our first title: [Candies VS Hypnodeer](http://apps.microsoft.com/windows/en-gb/app/candies-vs-hypnodeer/3e44a4cb-51dc-4cad-94f3-ab9e70f8d3cd) ([video](http://www.youtube.com/watch?v=irH87kkc1Gg)), a casual match-three puzzle game, has been released on nine platforms including: Windows Phone, Windows 8, XBOX, Symbian, Meego, Bada, Android, BB10 and Blackberry Playbook, while also being scheduled for release on iOS soon. We connect all the platforms with a single global highscore system, enabling cross-platform competition.  
> – [Microsoft developer blog](http://www.microsoft.com/en-GB/developers/articles/our-success-with-cocos2d-x-and-windows-8)

### HTML5

Now we’re talking my language! Alternatively, you could use HTML5 for **apps**. (Notice how I didn’t say anything about games in there?) From a [Gamasutra article in September 2013](http://www.gamasutra.com/view/news/199486/HTML5_games_on_Xbox_One_Microsoft_eyes_crossplatform_development.php), Microsoft’s EVP of operating systems Terry Myerson stated:

> “We want to offer [developers] the opportunity to build either HTML5 applications, or native applications that span all of those devices, enabling them to reach segments of users on those devices, users on a gaming console, and provide them with very unique opportunities to monetize their application investments,” he explained as part of today’s Microsoft Nokia Transaction Conference Call. And this includes allowing for HTML5 and native applications across all the company’s devices, including smartphones, tablets, and the upcoming Xbox One.                                                 – Mike Rose, Gamasutra

### C++ / DirectX 11

Maybe C++ is your thing. In that case, you can use the C++ / DirectX Stack to get your game on Xbox One. Chuck Walbourn and Shawn Hargreaves have been doing a phenomonal job of updating this code base each week, and you can [download it right now to get started.](https://directxtk.codeplex.com/) This is basically the C++ version of XNA, so if you are familiar with XNA, you’ll find that it’s very similar.  
What do you know: I even put together a Power Point presentation that I share with schools, to get students on board as well. Here is a link to that. I update it from time to time as well, so check back on occasion.  [**View the presentation here.**](https://speakerdeck.com/davevoyles/building-indie-games-for-xbox-consoles)

### MonoGame (Open source XNA)

[More info on this here,](http://www.davevoyles.com/monogame-3-4-is-out-has-support-for-windows-10-and-that-will-include-xbox-one/) along with an hour long presentation during //Build 2015, illustrating this in action.

![MonoGame 3-4 release](/images/i1.wp.com_www.davevoyles.com_wp-content_uploads_2015_04_MonoGame-3-4-release.jpg.jpg)

MonoGame 3.4 also wincludes a flurry of updates, but most importantly, support for [Windows 10 Universal Apps](http://blogs.windows.com/buildingapps/2015/03/02/a-first-look-at-the-windows-10-universal-app-platform/) and was timed to coordinate with the [Build 2015 conference going on right now](http://www.buildwindows.com/). I wrote more about [what’s coming to Xbox One and Windows 10 for game developers here,](http://www.davevoyles.com/gdc-xbox-live-and-xbox-one-will-be-open-to-many-more-developers-now/) following GDC.

## BizSpark

In the mean time, I’d encourage you to look into [Microsoft’s BizSpark program](http://www.davevoyles.com/bizspark-free-software-cloud-services-o/). Feel ree to [reach out to me](mailto:dvoyles@microsoft.com) if you decide to apply, and I may be able to expedite the process.

## Who qualifies?

* Actively **engaged in development of a software-based app, product, or service** that will form a core piece of your current or intended business.  (NOTE: you must be building a product!  Startups providing consulting services are not eligible.)
* Your company is privately held, and in business for **less than 5 years.**
* **Makes less than US $1 million** in annual revenue

Whether you are a **stude**nt, **startup**, or an **indie game developer**, Microsoft views you as a welcome addition to our startup program.

## Icing on the cake

Think of new and innovative ways to take advantage of the tech that Windows 8 and Xbox One offer. What about creating a second screen experience? Something where you take the role of a Dungeon Master in in Dungeons and Dragons using SmartGlass, and your friends are using gamepads on the main screen to control their characters. What if the second screen device was an alternative controller for selecting media and playing it on the Win8 / Xbox device? *Think outside of the box and it it will grab Microsoft’s attention.*

I’ll also be on Scott Hanselman’s [**Hanselminutes**](http://hanselminutes.com/) podcast tomorrow, where I’ll be talking more in depth about Xbox One development, so be sure to follow along there as well.

Microsoft continues to add support for more middleware partners over time, so check back often for updates to the list.

### Additional Resources

* [How to write engaging second screen experiences using SmartGlass or Windows 8](http://davevoyles.azurewebsites.net/write-engaging-second-screen-experiences-using-smartglass-win8/)
* [Hanselminutes podcast](http://hanselminutes.com/410/xbox-one-developer-with-dave-voyles-formerly-of-comcast) –  I talk about Xbox One and SmartGlass development
* [Wake Up And Code](http://wakeupandcode.com/xb1/) – The most comprehensive list of Xbox One related information out there
* [ID@Xbox Facebook Group](https://www.facebook.com/groups/XboxOneIndieDevs/) – Unofficial, but the most active conversation around the platform
* [Simon Jackson’s ID page](http://darkgenesis.zenithmoon.com/start-building-for-xbox-one-now/) –  Great place to find more info on getting started with Xbox One
