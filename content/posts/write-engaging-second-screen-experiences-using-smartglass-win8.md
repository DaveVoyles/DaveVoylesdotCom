+++
title = "How to write engaging second screen experiences, using SmartGlass or Win8"
date = "2014-02-07T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Uncategorized"]
tags = ["JavaScript", "Programming", "SmartGlass", "Windows 8", "Windows Phone 8", "Xbox"]
topics = ["Gaming", "Tech"]
+++



This ties into my previous post, where I spoke about **[how to get your game or app on Xbox One.](http://davevoyles.azurewebsites.net/get-game-app-xbox-one/)**

Microsoft unveiled quiet a bit of information regarding SmartGlass during BUILD 2012, and much of it is available **[via this Power Point presentation.](http://video.ch9.ms/sessions/build/2012/2-028.pptx)**Ignore most of the C++ in there; I never had to touch any of that. All of my work was done via JavaScript and it worked fine.

I also spoke about SmartGlass development on [this week’s Hanselminutes podcast.](http://hanselminutes.com/410/xbox-one-developer-with-dave-voyles-formerly-of-comcast)

### Xbox SmartGlass SDK

The SDK exposes a number of APIs and native device controls via JavaScript. For example, I could tie into the mobile device’s accelerometer or gyro, which then sends the information back to the Xbox via JSON.

#### **Application-level APIs**

•Send/receive message functions and events

•Connect/disconnect functions

•Client changed event

•Title and media state events

•Service proxy function

#### **Device capabilities**

•Accelerometer

•Gyroscope

•Haptic

•Information

•Input

•Touch

While you won’t be able to do much without the SmartGlass SDK or an Xbox One, you can get started with Windows 8. Before I wrote my SmartGlass to Xbox One application, I first wrote it in Windows 8, and used another Windows 8 device (a tablet, in this example) in place of SmartGlass, and used WebSockets. Later, when my dev kit and SmartGlass SDK arrived, I was able to easily port it over.

WebSockets

For an excellent example of how you could use WebSockets to create a fun second screen experience, [**Google has created a bowling game**](http://thenextweb.com/google/2013/05/28/google-debuts-chrome-games-roll-it-and-racer-to-show-off-the-browsers-cross-platform-syncing-via-websockets/#!uFPCB) that uses your mobile device and talks to your desktop browser to deliver a bowling experience. This is what sparked my interest in web sockets and second screen experiences.

**[Here is a Windows 8.1 sample](http://code.msdn.microsoft.com/windowsapps/Connecting-with-WebSockets-643b10ab)** on how to connect devices via WebSockets. I learned this on my own in two days, without any prior WebSockets knowledge. If I can do it, then you surely can.

What it comes down to is this: You want to pass a JSON object back and forth between one device and another. The device that receives the JSON object can then parse it, and extract any information relative to it, whether it is info about a character, a button press, or pointing the second screen towards a URL so that it can play a movie. **I would suggest using the JavaScript sample though, as SmartGlass is written in JavaScript as well.**

### Practical Example

For a practical example on how to take advantage of a second screen experience, [take a look at how the devs at *in8bit*](http://in8bitblog.wordpress.com/2013/12/06/super-truckin-smartphone-second-screen-gameplay/) integrated a second screen for their upcoming Unity title, *Super Truckin’*.



### How to get started

Don’t have any hardware? Not a problem. If you’re in the US, I can pair you up with another Tech Evangelist in your area who can get you hardware (tablets or phones) and perhaps even some software to get you started. [**This site can help pair you up as well**.](http://tech-advisors.msdn.microsoft.com/#fbid=tQs35pNbLLX) Reach out to them!

Use WebSockets to have your second screen device communicate with your Windows 8 machine. Nearly everything you can do with SmartGlass, you can do on Win8 with WebSockets!

**[[VIDEO] Building real time web apps using  HTML5 Web Sockets](http://channel9.msdn.com/Events/Build/BUILD2011/PLAT-373C)**
