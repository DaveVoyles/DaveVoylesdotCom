+++
title = "prime[31] Azure plugin for Win8 Unity games (Part 2)"
date = "2014-08-14T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["Programming", "Unity", "Windows 8"]
tags = ["C#", "Game Dev", "Programming", "Unity", "Windows 8"]
topics = ["Gaming", "Tech"]
+++



**RESOURCES:** [You can find the source for this project on my GitHub.](https://github.com/DaveVoyles/prime31-azure)

[In part 1 of my tutorial,](http://davevoyles.azurewebsites.net/prime31-azure-plugin-win8-wp8-unity-games/) I showed you how you how to set up the initial project with prime[31]. Now that we have it built, I’m going to walk you through the code, as well as how it all works.

Now that we have the project built, let’s open it up the metro folder, and launch the *Prime31* Visual Studio solution.



Your folder structure should look like this

## Launching from Visual Studio

Something that threw me in a loop initially, was the fact that the project wants to deploy to an ARM device immediately. If you hit debug *“Local Machine”* it will throw an error about your machine not being an ARM tablet. The solution:

Go to **Configuration Manager** and change the **Active Solution Platform** to **X86**.



You can now run your projects and deploy them via Visual Studio. Do that, and you will be greeted with this screen:

Perfect! We’re up and running!

> **NOTE:**On occasion, I’ll get an error, as seen in the text below. I’m not sure of what causes this, but when I switch my deployment from whatever it is currently on (for example, **Debug**) to **Release** or **Master**, it suddenly builds fine. I can then go back to Debug, and use that if I’d like.

```
Error 1 The command "echo UnityInstallationDir 'C:Program Files (x86)UnityEditor'
echo UnityProjectDir 'C:UsersDaveVoylesDesktopAdamPrime31'
echo Copying assemblies...
copy /Y "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31Unprocessed*" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31"
copy /Y "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp.dll" "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp.dll"
copy /Y "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp-firstpass.dll" "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp-firstpass.dll"
if exist "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp.pdb" copy /Y "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp.pdb" "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp.pdb"
if exist "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp-firstpass.pdb" copy /Y "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterUnprocessedAssembly-CSharp-firstpass.pdb" "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp-firstpass.pdb"
echo Running AssemblyConverter...
"C:Program Files (x86)UnityEditorDataPlaybackEnginesMetroSupportToolsAssemblyConverter.exe" -platform=wsa81 "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp.dll" "C:UsersDaveVoylesDesktopAdamPrime31binStore 8.1x86MasterAssembly-CSharp-firstpass.dll" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31\P31MetroAzure.dll" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31\P31MetroHelpers.dll" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31\P31RestKit.dll" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31\UnityEngine.dll" "C:UsersDaveVoylesDesktopAdamPrime31BuildsWin81Prime31\WinRTLegacy.dll"
echo AssemblyConverter done.
" exited with code 1. Prime31
```

## *MetroAzureDemoUI.cs*

Open the *MetroAzureDemoUi.cs* file, and take a look at the sample I put together.



It may look overwhelming at first, but I’ve commented everything in there. In terms of variables, I’ve added a *\_leaderboardItem*, which is exactly what it sounds like — a container for the things you insert into your leaderboard. It simply holds a name, score, and unique ID for each object you insert into the board.



Following that, we have the list itself, which is just a collection of *\_leaderBoardItem*(s).

> **NOTE:**  username and score MUST be lowercase

The *\_minScoreToReturn* is used during our query below, where we will ONLY want to return leaderboard items with a score which is less than or equal to (x). In this case, I’ve set it to 200, so we will ONLY return objects which have 200 points or less.

## Endpoint and Application Key

You’ll also notice:

```
 [SerializeField]
 private string _azureEndPoint = "<your leaderboard service>";
 [SerializeField]
 private string _applicationKey = "<your application key>";
```

You COULD hard code your end point and app key here, but I chose to just leave this string in. Instead, I’ve added the end point and app key within the Unity Editor.



If you write text in the editor on the right hand side, it should propagate the empty fields inside of the gameplay screen.

I’ve chosen to hardcode all of the buttons in the scene, to avoid having to use the heirarchy. I wanted everything to be seen within the code itself, for simplicity’s sake.

Look at the endpoint as an address, or door that you need to reach. That’s where we are going to store our leaderboard information. The application key is exactly that; a key to the door, to gain access to the leaderboard. We have a key in place, to prevent anyone from coming in and manipulating our leaderboard.

Moreover, you can set permissions to your Azure Mobile Service, which would only allow individuals who have authenticated with a service (Facebook, Azure Active Directory, etc.) to gain access to the leaderboard. For the sake of brevity, I haven’t done that in this tutorial.

## OnGui

Beneath that, the *OnGui()* function is where all of our drawing occurs, for the buttons, text, and input fields.



I did it this way because I wanted to break the GUI functions into smaller functions so that they were easier to digest, and wanted to break them into columns on the screen so that they were easier to read. Take some time to read what each of the buttons do.It may seem overwhelming at first, but I broke them down into a logical order, and they are all laid out in the order that they appear on screen. I’ve still got some sorting to do, but hey, it works for now.

## Update and Delete

The two key functions you’ll likely use more than any other in this sample are the Insert and Delete ones. Insert allows you to pass in a new **\_leaderBoardItem**, which will contain a **username** and **score**. Don’t worry about the ID, that gets generated for you automatically.

> **NOTE:** All of the functions in this sample require you to be connected to Azure before you do anything. You must hit the *“Connect Azure Service”* before anything can take place.

To **update** or **Delete**an item in the leaderboard, we need to perform a few steps:

1. Connect to the Azure Mobile Service
2. Retrieve results from the leaderboard
3. The **Update** &**Delete** buttons will now appear on screen, beneath the newly returned results.
4. Grab the latest results from the array in the leaderboard

We can now edit a value for that item in the leaderboard, whether it is the **score**, or the u**sername**.In this example, I’m going to edit the username.

You can see that block of code here:

```
 // UPDATE the first (latest) thing in the leaderboard
 if (GUILayout.Button("Update latest Item"))
 {
      // Grab the first item in the leaderboard list
      var leaderToUpdate = _leadersList[0];

      // Set the item's username to what we entered in the username input field
      leaderToUpdate.username = GUILayout.TextField(_leaderBoardItem.username);

      // Update the item in the leaderboard
      Azure.update(leaderToUpdate, () => Debug.Log("Updated leaderboard item:" + " " + leaderToUpdate.username));
 }
```

We are going to set the value of the**username**from the latest item in the leaderboard to whatever it is that we type in the username input field.



So after we’ve returned our results, and  the update button appears do the following:

1. Enter a new name (for example, *Johnny Quest*)
2. Hit the **“Update Latest Item”** button

Now you’ll see top item in the leaderboard list says *Johnny Quest*. Head to your Azure portal just to verify, and you’ll see that it works!

## Johnny-Quest

## To Be Continued…

[Find the final part of the tutorial, part 3, here.](http://davevoyles.azurewebsites.net/prime31-azure-plugin-win8-wp8-unity-games-part-3/)

**RESOURCES:** [You can find the source for this project on my GitHub.](https://github.com/DaveVoyles/prime31-azure)
