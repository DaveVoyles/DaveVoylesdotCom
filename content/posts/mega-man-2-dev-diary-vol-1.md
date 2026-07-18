+++
title = "Mega Man 2 Dev Diary: Vol 1"
date = "2012-01-30T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["MM2 Dev Diary", "UDK"]
tags = ["Dev Diary", "Mega Man 2", "UDK"]
topics = ["Gaming"]
+++

[![](http://davidvoyles.files.wordpress.com/2012/01/sss_mm2_ea.jpg "SSS_MM2_EA")](http://davidvoyles.files.wordpress.com/2012/01/sss_mm2_ea.jpg)

Some of the environment art for Bubble Man's stage

**Inspired by Ben Kane’s excellent *[The Great Porting Adventure](http://benkane.wordpress.com/)* series where he illustrates the life of a full time independent developer porting an XBLIG title to other platforms, I’ve decided to keep a development diary of my own. Oh what’s that, you haven’t taken a gander at his? Well if you’re looking for the inside scoops from someone who actually knows what he’s doing, and has released games before, then it’s probably the place to be. If you’d rather see the comically sad experience of a first time developer as he makes every mistake though, then this is probably the place to be.**

**I maintain a full time job, and do development on the side, in a poor excuse of an attempt to gradually transition towards a career, regardless of how messy it gets along the way. I plan on updating this frequently, perhaps once or twice each week, and jotting down every embarrassingly simple mistake. I knew nothing about making games two year ago however, so at least I’ve made some progress.**

**At the moment, I’m remaking Bubble Man’s stage from one of my favorite games of all time, Mega Man 2. Obviously I can’t sell this product since I don’t own the IP, but I felt it was an excellent way to learn the ins-and-outs of development, and a large part of what I’m doing will be used as the prototype for my own game, once I complete this. Therefore, none of my time or experiences are really wasted, as I can always reuse many of the assets (animations, environment art, programming, UI), while making one time use of others (SFX, music, characters).**

**Ideally, I’d love to have this Mega Man project finished by August, but we’ll see how that goes.  At the moment I’m finishing up most of the art work, while running into a number of problems along the way. Fortunately I’ve been able to resolve all of them, but not without wasting quite a bit of time. Hopefully you’ll be able to take a few lessons from this and be able to apply it to your own tool belt of knowledge. If you find that I’m doing something in an odd way, or could be doing it more efficiently, then please feel free to get in touch with me – every bit helps!**

**So with that out of the way, let’s jump in! Click through to see the first part of my story.**

[I’ve done the camera work](http://davidvoyles.wordpress.com/udk-title/setting-up-mega-man-2-camera-and-control-system/) [and blocked out the entire stage using BSP](http://davidvoyles.wordpress.com/udk-title/mega-man-2-remake/blocking-out-bubble-mans-level/) in UDK already, so lately I’ve been working on the environment art, and plan to drop it in place in the near future. The hardest part of that was learning a 3D modeling program. For some reason I started with 3DS MAX, and just stayed with that, although looking back it seems that Maya would have been a wiser decision, for a number of reasons. I have Maya as well, but found it difficult to make the transition from one program to the other, especially after getting so accustomed to the shortcuts and tool locations/names. Fortunately, the 2012 release of MAX has implemented huge improvements over its predecessors, so I can do away with quite a few plugins. One of which was [TexTools](http://www.renderhjs.net/textools/), which I found to be extremely useful for laying out UVs and then painting in Photoshop. The UV interface and tools for MAX were a huge improvement, but I’d still like to see even simple features, such as the stacking of identical UVs included, as I find myself requiring that on almost a daily basis. Regardless, I still have TexTools installed for a few of its features and Photoshop-like interface.

[![](http://davidvoyles.files.wordpress.com/2012/01/textools_4-10_splash.jpg "texTools_4.10_splash")](http://davidvoyles.files.wordpress.com/2012/01/textools_4-10_splash.jpg)

TexTools - a pretty invaluable tool

I’ve also been trying to optimize my workflow along the way, as well as require as little gpu overhead as possible to run the game, because I’d love to be able to port it to mobile devices at some point. Therefore, I’ve placed all of my environment art for this stage on one 2048×2048 texture sheet to reduce the number of draw calls required. I’ve been using .png, with the diffuse and occlusion maps baked onto one sheet, then specular and bump maps on their own sheets. Each corner of the sheet is dedicated to a 1024×1024 texture which I generally use for a number of static meshes. To create all of these sheets I’ve been using the excellent program [CrazyBump](http://www.crazybump.com/), which is affordable and greatly decreases the time required to make each map separately, as well as negate my need to model everything as high poly. This is doable, but time consuming.

It took me forever to figure out how to quickly layout UVs, but with the help of a few guys ([@ScottTykoski](http://www.twitter.com/ScottTykoski) & @[FirebaseIND](http://www.twitter.com/FirebaseIND)) I was able to get the hang of it. The fact that I viewed nearly every tutorial on YouTube may have contributed to that as well. In addition, I stumbled across the site [DigitalTutors.com](http://www.digitaltutors.com/) and found that to be by far the greatest resource of knowledge for 3D, animation, or gaming applications. Initially I signed up for 1 one month membership at $50, and instantly found it to be work every penny, so once that expired I continued with a 6 month membership. If you’re new to development, or even want to hone your skills then I’d highly suggest you check it out.

[![](http://davidvoyles.files.wordpress.com/2012/01/ea_bubbleman_2048_color_occ.gif "EA_BubbleMan_2048_COLOR_OCC")](http://davidvoyles.files.wordpress.com/2012/01/ea_bubbleman_2048_color_occ.gif)

The texture sheet of trouble

When importing the environment art I ran into issue after issue. The September build of UDK allows for importing from a 3D application using .FBX, which keeps the materials intact and brings them all over in one shot, in addition to generating a material based on the textures you use on the mesh in MAX. Previously, I had to import models as an ASCII, then each of the textures, then create the material in UDK and apply it to the static mesh: A monotonous and time consuming venture, to say the least.

Upgrading to the latest version of UDK (December ’11), I then began to import my meshes. The problem I was running into though involved my normal maps. They weren’t displaying correctly for some reason. On some models the normal maps weren’t coming out strong, and on others it looked as though my materials were applied backwards. I thought it could have been inverted normals, so I used the Photostop [normal map plugin](http://developer.nvidia.com/nvidia-texture-tools-adobe-photoshop) made by Nvidia to invert the Y, but to no avail. I resolved this by selecting “2-sided” within the material properties within MAX. There is also a way to force 2-sided within UDK, but I didn’t want to select that for each model, so I just took care of it in the 3D editing program.

I troubleshot for hours, before finally coming to the conclusion that I was using the wrong compression settings for my normal map. I also tried multiplying a constant and the normal map in UDK to increase the effect of the bump, but that didn’t do the trick either. I did discover though that by using a Constant3Vector and increasing the value in the G layer I could increase the strength of the normal map, but only after I got it working in the first place.

By importing the normal map on its own, I was able to select “Normal Map No Compression” which obviously costs a bit in terms of performance, but the visual results were well worth it. Previously the map was nearly unseen.

With that behind me, issues arose when importing two static meshes of white and green piping used on the level. They took me a while to make, as it is essentially a square with a hose in the center, but when I intersected the piping at the corners it came out horribly. I decided it was best to slice along the poly, intersect the pipes, and then weld the vertices. This turned out to look fine when rendered, but underneath it all it was a mess.

When importing, it would constantly bring in new textures into UDK, and create another material which looked identical to the others. I couldn’t figure out why it kept making this new material though, as I used the same textures for all of my models in MAX. From within the static meshes properties I could not apply the original material in UDK which worked fine on every other mesh, as it would give me an error. I could however; drag the unpainted mesh into my scene and drop the material right on top of it and it would apply perfectly. Odd, no?

[![](http://davidvoyles.files.wordpress.com/2012/01/piping1.jpg "piping")](http://davidvoyles.files.wordpress.com/2012/01/piping1.jpg)

It was only after some forum lurking did I find that the problem was stemming from a bad model. When exporting from MAX I would receive the error “There are turned edges on this editable poly, It will be converted to a mesh instead,” which I commonly discarded. I discovered the *STL Check* modifier in said forum, and quickly discovered it to be an invaluable tool. When applied to an editable poly it will determine if there are any errors, such as vertices which aren’t welded together. With this applied I determined I was just better off starting from scratch and making a new static mesh.

So that’s my story so far! Feel free to leave some comments let me know how bad I’m butchering this thing.
