+++
title = "Former 2d shooter sample, now working as a C++ / DirectX 11 sample"
date = "2013-11-12T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["C++ / DirectX 11", "Game Dev", "Programming", "Windows 8"]
tags = ["C#", "DirectX 11", "XNA"]
+++

Charles Humprey ([@NemoKrad](https://twitter.com/NemoKrad)) was kind enough to help me get his 2D side scrolling shooter sample working in C++ / DX 11 this morning. [You can find the source code to the project here.](https://randomchaosdx11engine.codeplex.com/SourceControl/latest) He’s a fellow MVP who has been extremely active in the XNA community, and provided numerous samples in the past. You can find [more of his work here.](http://randomchaosdx11adventures.blogspot.co.uk/)

**Requirements:**

* [DirectX SDK (June 2010)](http://www.microsoft.com/en-gb/download/details.aspx?id=6812)
* [Visual Studio 2013](http://www.microsoft.com/visualstudio/eng/products/2013-editions)

Windows 7 or 8 should work fine. I use Win 8.0 and he uses Windows 7, and the project works fine on both of our machines. I’m not sure if it is compatible with Visual Studio 2012, but I do not believe so. Regardless, the express version of 2013 is free.

1) To get started, download the sample from [CodePlex.](https://randomchaosdx11engine.codeplex.com/SourceControl/latest)

2) Open the solution in Visual Studio 2013. You’ll see a modal appear about Team Foundation Server — ignore it and just click “OK”.

### Random Chaos Library

3) We need to change the **VC++ Directories** for the RandomchaosDX11Library first. Right click on the **RandomchaosDX11Library,**select **Properties** and the Properties Page will appear. 

4) Navigate to **Configuration Properties** -> **VC++ Directories** and look for the **Include Directories** and **Library Directories**.

Both directories should be pointed to the folder where your DirectX SDK is installed.

5) Once you have made that change for the **Include Directory**, be sure to add “Include” at the end. This is important!

[![VC-Dir-1](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-1.gif?resize=700%2C234)](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-1.gif)

6) Once your Include Directory is set, do the same for your **Library Directory**, but add “Libx86” at the end, instead of Include.

This confused me at first, because you can actually just type in the name of the path, instead of having using windows explorer to find the file path.

[![VC-Dir-2](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-2.gif?resize=618%2C378)](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-2.gif)

7) Click “OK” on the dialog, then “Apply” and “Close” and this will save your settings. Right click on the **RandomchaosDX11Lbrary**project and build it. If it doesn’t build correctly, then look at the directories and make sure they are pointed towards the correct path.

### SandBox

8) This is the actual game. Right-click on the **SandBox project** and set it as your startup project.

9) Right-click on **Sandbox project** and open up the properties window, just as we did for the Randomchaos library.

[![VC-Dir-3](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-3.gif?resize=700%2C262)](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-3.gif)  
10) Change your **Include Directory,** as we did before.

11) Also, point towards your newly built RandomchaosDX11 Library. My solution is on my desktop, therefore my path looks like this:  
*C:Usersdvoyle200DesktopRandomchaosDX11LibraryRandomchaosDX11Library*

[![VC-Dir-4](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-4.gif?resize=582%2C348)](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-4.gif)

12) Click on the **Library Directory** and point towards your DirectX SDK, as we did before. Your directories should look similar to mine.

[![VC-Dir-5](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-5.gif?resize=570%2C354)](https://i1.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-5.gif)

13) The final change we need to make is to the **Linker.**Navigate to **Linker** -> **Input.**We need to change our **Additional Dependencies.**

[![VC-Dir-6](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-6.gif?resize=700%2C244)](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-6.gif)

14) You’ll want to make one change here: you want to point to the **RandomChaosDX11Library.lib** within your Debug folder.

*C:Usersdvoyle200DesktopRandomchaosDX11LibraryDebugRandomchaosDX11Library.lib*

[![VC-Dir-7](https://i0.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-7.gif?resize=672%2C378)](https://i0.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-7.gif)15) With that step done, we can now build this project. In the **Solution Explorer**, right-click on the **SandBox** project, and **build it**.

16)  One final step! You’re ready to debug your application! Hit F5 to debug, or click on “Local Windows Debugger” and you’re good to go!

[![VC-Dir-8](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-8.gif?resize=700%2C426)](https://i2.wp.com/davevoyles.azurewebsites.net/wp-content/uploads/2013/11/vc-dir-8.gif)

The former XNA sample is now a working C++ / DirectX 11 sample, working on your machine.
