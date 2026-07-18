+++
title = "Intro to the Web App Template"
date = "2014-05-07T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Javascript / HTML5", "Programming", "Students", "Web Dev", "Windows 8", "Windows Phone 8"]
tags = ["HTML5", "Web App Template", "Windows 8"]
topics = ["Tech", "Career and Students"]
+++

*You can find Part 2 of this tutorial, [here.](http://davevoyles.azurewebsites.net/finishing-web-app-template/) I’ve also compiled a list of [great apps published with the WAT.](http://davevoyles.azurewebsites.net/examples-apps-published-web-app-template/)*

On Venture Capitalist Chris Dixon’s blog, he recently highlighted [the decline of the mobile web.](http://cdixon.org/2014/04/07/the-decline-of-the-mobile-web/)

> *“People are spending more time on mobile vs desktop, and more of their mobile time using apps, not the web This is a worrisome trend for the web. Mobile is the future. What wins mobile, wins the Internet. Right now, apps are winning and the web is losing.*
>
> *Moreover, there are signs that it will only get worse. Ask any web company and they will tell you that they value app users more than web users. This is why you see so many popups and banners on mobile websites that try to get you to download apps. It is also why so many mobile websites are [broken](http://brokenmobile.tumblr.com/?utm_content=buffer010a0&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer). Resources are going to app development over web development. As the mobile web UX further deteriorates, the momentum toward apps will only increase.”*



http://cdixon.org/



http://cdixon.org/

**UPDATE**: *7/18/14 – I’ve recently learned that this also works for [Windows Phone 8 as well,](http://wat.codeplex.com/releases/view/120339%20) with a new version of WAT supporting universal apps coming soon too.*

I’ve been an advocate for HTML5 applications for some time now. In the past, I’ve [given talks on cross platform HTML5 development](http://www.slideshare.net/DaveVoyles/building-html5-apps-for-cross-platform-mobile), because I realize how valuable it can be to have your applications working on every platform, and built quickly. With that in mind, I’ve recently started working with Microsoft’s [Web Application Template](http://wat-docs.azurewebsites.net/) which is a “quick easy way to bring web content to native Windows 8 apps.”

I started tinkering with it the other night, and immediately saw how valuable it is. By changing one string, I was able to have my entire site, which you are reading now, wrapped inside of a Windows 8 application, with full support for native functionality. I could easily share all of my pages via the charms bar, to social networks like Facebook, Twitter, and Mail.

The beauty behind the Web App Template is that a majority of the appearance for your site can be done by tinkering with a simple configuration file.

### Getting Started

The template docs include an excellent [getting started page](http://wat-docs.azurewebsites.net/GetStarted), which I recommend as your first stop when building this application.

Once I finished those instructions, I created a new projected called WAT-Sample. In the **config** folder I opened the **config.json** file, and immediately saw *“homeURL:”* at the top of the page. By switching that URL to my own, davevoyles.azurewebsites.net, I was able to have my website wrapped as a Windows 8 app. Press the debug button (F5, or the green triangle that says “Local Machine”) and you can see exactly what it looks like.



Editing the Config.JSON file, to change which site the app points at

With that done, I had my app up and running, and the ability to share natively with the charms bar.



I can easily share pages within my app, all with Win8’s charms bar

### Adding More Features

The app doesn’t do much now, but if I *right-click*, I’m able to see a pull down menu with the links that I want to the user to be able to navigate to.



The header links aren’t what I want them to be yet

This is where I’d like to change the links that I want the user to see. Right now, they are the default links for the WAT docs, but I want each link to point toward a different topic for the student. This can be done in the **config.json** file again, under the section marked **“navBar:”**

Changing “label:” adjusts the text for what thee users sees. (ie – *home, JSON Reference, About WAT*). The “icon:” obviously changes the icon,  and a list of available icons is at [dev.windows.com](http://msdn.microsoft.com/en-us/library/windows/apps/hh770557.aspx). Leave this blank to omit the icon. Finally, change the “action:” so that it points toward the URL you want the user to navigate to when the button is clicked.

I plan on adjusting these so that they read: “Unity” “Talks” “HTML5” and “Resources” in the near future.



### Practical Uses

If you are just going to wrap your website using the template, and not add any new functionality or way or organizing your content, then this tool is probably not very useful for your customer. I took a step back, considered who I work with the most, figured how this could be useful for them. In my case, it is students. I’m always fielding requests for how to find tutorials on Unity, or Unreal, or HTML5 development, so I thought “why not put together a simple app that organizes all of my web content, in one easy to find location?”

Sure, my whole site is wrapped, but the links in my header are removed, and instead are replaced with content which is only relevant to the students. DreamSpark, Unity tutorials, and entry level programming tips. Simplicity is key, when putting together content that a large number of people will ingest. The more options I give them to navigate, the less likely that they are to ever find what they are looking for.

Now, when I give a talk at a school, I can point them towards my Windows 8 app, which aggregates all of the content on my site, relevant to exactly what they are looking for, while removing any of the fluff that they would not find useful.

## Additional Resources

* [Channel 9: Windows 8 apps w/ HTML5 and the Web App Template](http://channel9.msdn.com/Shows/Web+Camps+TV/Building-Windows-8-Applications-with-HTML5-and-Web-App-Template)
* [CodePlex: Web App Template](http://wat.codeplex.com/)
* [Web App Template Docs](http://wat-docs.azurewebsites.net/)
