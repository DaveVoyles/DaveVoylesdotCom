+++
title = "Finishing the Web App template"
date = "2014-05-16T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Javascript / HTML5", "Programming", "Students", "Web Dev", "Windows 8"]
tags = ["HTML5", "Programming", "Students"]
+++

[![Screen 3](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/05/Screen-3-1024x575.png)](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/05/Screen-3.png)**[You can download the app from the Windows 8 Store, for free.](http://apps.microsoft.com/windows/en-us/app/dave-voyles-web-app-template/f8afe265-c9e4-4d42-b6b9-8762869380c9)**

[In my last post,](http://davevoyles.azurewebsites.net/intro-web-app-template/) I mentioned that I began using Microsoft’s new Web App Template, to quickly and easily create an app out of my website, while using very little code. Now that my app is finished, I wanted to walk you through the steps, so that you can do the same. In total, it only took me about 2 hours to have my app created from scratch, and in the store!

## Making the App Yours

I wanted to keep my app simple, since my website already had a ton of information and functionality to begin with. My goal here was to neatly organize content for students, in one easy-to-find solution. I started by adding links to the top of my app.  
When the user right clicks, the header pops down from the top of the screen, and offers nested links for the user to click through. I wanted to share the work of my fellow evangelists, so the first set of nested links was all for them.

## Content That Is Right for Your Audience

Since this app is geared towards the students I work with, I wanted to share resources that they would commonly ask about or use. Therefore, under the “Students” tab, I have links to DreamSpark, BizSpark, the Imagine Fund, and any posts of mine which I had categorized under “students”. The code for that is as follows:

```
 {
 "label": "Students",
 "icon": "library",
 "action": "nested",
 "children": [
 {
 "label": "Dreamspark",
 "icon": "library",
 "action": "https://build.windowsstore.com/DreamSpark/#fbid=_rym5eCW63n"
 },
 {
 "label": "BizSpark",
 "icon": "library",
 "action": "http://wootstudio.ca/startups/bizspark.aspx"
 },
 {
 "label": "Imagine Fund",
 "icon": "library",
 "action": "http://www.microsoftimaginefund.com/"
 },
 {
 "label": "Posts for students",
 "icon": "library",
 "action": "http://davevoyles.azurewebsites.net/category/students/"
 }
 ]
 },
```

I continued to add more content, which I felt would be relevant, including a pull down for Unity, HTML5, Win Phone, and drag-and-drop tools.

You my notice that there is an “icon” label in the text above. You can add any icon to your link, by searching through [this page](http://msdn.microsoft.com/en-us/library/windows/apps/xaml/jj841127.aspx), which lays out all of the icons available to you.

## Privacy

Every Windows 8 app needs to have a [privacy statement,](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=3&ved=0CD8QFjAC&url=http%3A%2F%2Fjessefreeman.com%2Farticles%2Fwindows-store-privacy-statement%2F&ei=LRF1U6L6KePQsQT86oCACg&usg=AFQjCNGJDv2lAyWvPit-4BEZ_-iMup2G1w&sig2=r8X4fjIaVeU98MfaJHxe0A&bvm=bv.66917471,d.cWc&cad=rja) notifying the users about permissions you will be using (internet connection, location, etc.) and a way to get in touch with you. Usually, you can store the privacy statement within an application, but the WAT does not allow this. Therefore, I had to make a [simple privacy statement](http://phlcollective.azurewebsites.net/privacy.html) page on another site, and just link to it.

## Passing Certification

To pass the app certification tests, you’ll need to use images from your app for your splash screen, logo, and start menu. To simplify and speed up the process, I use the [Windows Store Image Generator](http://wat-docs.azurewebsites.net/Tools), and simply give it one image, and it quickly makes all of the images that I need to pass certification. For my logo and tile image, I just grabbed a screen shot of my website. I added all of the images except for the badge, because that seemed to have an error with the WAT.

Here is what it looks like in the config.js file:

```
 "settings": {
 "enabled": true,
 "privacyUrl": "http://phlcollective.azurewebsites.net/privacy.html",
 "items": [
 {
 "title": "About Dave",
 "page": "http://davevoyles.azurewebsites.net/bio/",
 "loadInApp": true
 }
 ]
 },
```

I’ve also added a page where users can find out more about me (it links directly to my “about me” page on my site).  
When I finished creating my app, I ran it through the [Windows App Certification Kit](http://msdn.microsoft.com/en-us/library/windows/apps/hh694081.aspx), which ran a series of tests to determine if my app would work in the store. This saves you the time of having to upload your app to the store for submission, and later discovering that it was denied for something trivial like forgetting a logo image.

Best of all, you don’t even need to change the package.appxmanifest for this change either! Just drag-and-drop your new images into your “images” folder in Visual Studio, and you’re good to go!

Other than that, out of the box your app should work perfectly fine. The team at Microsoft has done a fantastic job of making this tool as easy as possible to work with.  
Resources

As always, you can find the latest code updates to this project [on my GitHub.](https://github.com/DaveVoyles/Windows-App-Template) I’ll add the entire project as a .zip file in here soon, too.
