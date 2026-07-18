+++
title = "prime[31] Azure plugin for Win8 Unity games (Part 3)"
date = "2014-08-26T00:00:00"
draft = true
stale_reason = "dead-tech keywords (Windows Phone 8, WP8, Windows Phone, Windows 8, Win8, Azure Portal); 11.9 years old; broken outbound reference(s): image http://davevoyles.azurewebsites.net/wp-content/uploads/2014/07/Prime31.png (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); link http://davevoyles.azurewebsites.net/prime31-azure-plugin-win8-wp8-unity-games-part-2/ (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); image http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst.gif (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); image http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst-Debug-1024x287.gif (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>); image http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst-Debug.gif (connection error: <urlopen error [Errno 8] nodename nor servname provided, or not known>) (+2 more)"
author = "Dave Voyles"
categories = ["C#", "Game Dev", "Mobile", "Programming", "Unity", "Windows 8", "Windows Phone 8"]
tags = ["C#", "Game Dev", "Programming", "Windows 8", "Windows Phone 8"]
+++

[![Prime31](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/07/Prime31.png)](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/07/Prime31.png)

**RESOURCES:**

* [You can find the source for this project on my GitHub.](https://github.com/DaveVoyles/prime31-azure)
* [Power point slides](http://www.slideshare.net/DaveVoyles/using-prime31-to-connect-your-unity-game-to-azure-mobile-services)
* Video Walkthrough
* Get this working on Windows Phone

[In part 2 of my tutorial](http://davevoyles.azurewebsites.net/prime31-azure-plugin-win8-wp8-unity-games-part-2/),  I showed you how you how to set up the initial project with prime[31]. Now that we have it built, I’m going to walk you through the code, as well as how it all works.

## Insert

Let’s test this out by running the project from Visual Studi and inserting a new object into our leaderboard. Deploy the sample, connect to the Azure service, then insert a new username and score.

[![Unity-Tutorial-TEst](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst.gif)](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst.gif)

You can see that I’ve entered “Unity Tutorial Test” as the user name and “70” as the score. Hit “Insert To Leaderboard” AFTER you connect, and you’ll be good to go.

Not sure if it went through? Well let’s check the console.

[![Unity-Tutorial-TEst-Debug](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst-Debug-1024x287.gif)](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Unity-Tutorial-TEst-Debug.gif)

Successfully inserted!

That’s our callback function, which is executed on a successful insertion. If it didn’t work, we would’t see anything at all! Here’s the code for that, where we use a lambda function:

```
 if (GUILayout.Button("Insert To Leaderboard"))
 {
      Azure.insert(_leaderBoardItem, () => Debug.Log("inserted" + " " + _leaderBoardItem.username + " " + "to leaderboard"));
 }
```

Still don’t believe me that ‘s actually in our board? Well let’s go take a look at our Azure Portal and see  for ourselves.

[![Azure-Insertion](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Azure-Insertion-1024x620.gif)](http://davevoyles.azurewebsites.net/wp-content/uploads/2014/08/Azure-Insertion.gif)

In your portal, go back to Azure Mobile Services, click on the name of your service (**UnityWin8Test** in my case), and that will load the main options screen. You can hit the **“Data”** tab on the top of the screen to see your leaderboards. Click on **“leaderboard”**from there, and you can see everything we’ve inserted! B*oomshakala!*

## Query the leaderboard

We can update, delete, and insert things into our leaderboard, but before we can update or delete anything, we need to return some leaderboard results. To pull in our scores, we need to use the **Azure.Where()** function. The syntax may look kind of funky, but bear with me:

```
 // Grab all scores in our leaderboard which are <= _minScoreToReturn
 Azure.where<LeaderBoard>(i => i.score <= _minScoreToReturn, itemsInTheLeaderboard =>
 {
      Debug.Log("queried all scores <= 100 has completed with _leadersList count: " + " " + itemsInTheLeaderboard.Count);
      _leadersList = itemsInTheLeaderboard;

      // Loop through each item in the leaderboard list, and draw it to the log
      foreach (var item in itemsInTheLeaderboard)
      {
           GUILayout.Label("Name:" + " " + item.username + " " + "Score" + " " + item.score);
      }
 });
```

We use a lambda function as the first parameter, which serves as an anonymous (unnamed) function.  *i* is as each object in our leaderboard list, and we are looking to pull out the scores, so the argument within this lambda function is *i.score*.

We take that argument, which will return a score for an item in the leaderboard, and compare it against our minimum score to return, which I defined at the top of the class.  In this sample, I only want to return leaderboard items with a score of 100 or less – everything else will be ignored.

```
 Azure.where<LeaderBoard>(i => i.score <= _minScoreToReturn,
```

The next parameter in our Azure.Where() function is *itemsInTheLeaderBoard* . You know those items we just returned from our leaderboard? Well they all get stored in this variable, which serves as list that we can now manipulate.

```
 itemsInTheLeaderboard =>
```

I’m not quite sure if I’ve been able to return anything at this point though, so why not draw it to our log, just to be sure? First we take the itemsInTheLeaderboard, and use the count() function (given to us by the fact that this is of type List), and verify that we have some things being returned.

```
 Debug.Log("queried all scores <= 100 has completed with _leadersList count: " + " " + itemsInTheLeaderboard.Count);
```

We’ve got something in there, perfect! Take our public \_leadersList variable, which we declared at the top of the class, and set its value to the equal our local variable, *itemsInTheLeaderBoard.*

```
      _leadersList = itemsInTheLeaderboard;
```

Next, we need to loop through each leaderboard item in this list and draw it to the screen, because what’s the point of having a leaderboard if folks can’t see how they compare to everyone else, right?

Using a foreach loop, we iterate through each item in the leaderboard ad draw it to the screen, including the username and score.

```
      // Loop through each item in the leaderboard list, and draw it to the log
      foreach (var item in itemsInTheLeaderboard)
      {
           GUILayout.Label("Name:" + " " + item.username + " " + "Score" + " " + item.score);
      }
```

I ran into an issue with this during my first go, so here it is:

> You **MUST** define your username and score keys using lowercase characters. Look at the leaderboard.cs file to get an idea of what I mean. That’s because the node.js backend we are using on our Azure leaderboard is expecting lowercase keys. For example:**i.username vs i.Username**

## Pulling in everything

What if I want to return everything from my leaderboard, though? That’s simple too:

```
// Get all of the items currently stored on the leaderboard
Azure.where<LeaderBoard>(i => i.username != null, itemsInTheLeaderboard =>
{
    Debug.Log("queried ALL scores, completed with _leadersList count:" + " " + itemsInTheLeaderboard.Count);
    _leadersList = itemsInTheLeaderboard;

    // Loop through each item in the leaderboard list, and draw it to the log
    foreach (var item in itemsInTheLeaderboard){
        Debug.Log("Item in the leaderboard:" + " " + item);
    }
 });
```

Only minor differences here, as I’m checking for a username instead of a score, and making sure that it is not null.

## Wrapping things up

Not so bad, right? If we put this all together, we have a simple leaderboard using Azure as our backend. This currently works for Windows 8, and prime[31] is working with the Unity team to get it working on Windows Phone in the very near future. Check back here for updates, and as always, you can find the source code for this [project here.](https://github.com/DaveVoyles/prime31-azure)
