+++
title = "Hacking jQuery to work in Windows 8"
date = "2013-09-23T00:00:00"
draft = true
stale_reason = "dead-tech keywords (Windows Phone 8, Windows Phone, Windows 8, Win8); 12.8 years old; broken outbound reference(s): link https://dl.dropboxusercontent.com/u/3152642/jquery-2.0.2.js (HTTP 404)"
author = "Dave Voyles"
categories = ["Javascript / HTML5", "Programming", "Windows 8", "Windows Phone 8"]
tags = ["jQuery", "Programming", "Windows 8"]
+++

For some time now I’ve been building HTML5 apps for Windows 8. I had previously done work in C# and XAML (*Spell and Speak*, *Pizong,* and two Unity games), but prefer HTML5 and JavaScript for a number of reasons. First and foremost, it allows me to build apps for multiple platforms while only having to make marginal tweaks for each one.  Naturally, each platform comes with its own ups and downs, but I haven’t really had any issues with Windows 8 until I started integrating jQuery.

For the first few months, jQuery did not work at all. How Microsoft planned to get web developers on board without one of, if not the, most popular JavaScript library is beyond me. For months developers met on Stack Exchange to hack apart jQuery and see how they could it to work in their Win8 apps. Well, with the 2.0 update of jQuery most of the problems have been fixed.

Still, I’ve run into some issues of my own. But alas, I’ve also come up with solutions!

#### Problem 1:

When attempting to dynamically insert a div, Windows 8 throws an error. Specifically, it’s when trying to use something like:

```
div.innerHTML = "A string of some stuff"
HTML1701: Unable to add dynamic content ' a' A script attempted to inject dynamic content, or elements previously modified dynamically, that might be unsafe. For example, using the innerHTML property to add script or malformed HTML will generate this exception. Use the toStaticHTML method to filter dynamic content, or explicitly create elements and attributes with a method such as createElement. For more information, see http://go.microsoft.com/fwlink/?LinkID=
```

#### Reason:

The reasoning behind all of these problems is the same, so I’ll just state it here once for the sake of brevity. `Microsoft fears that the string can be intercepted somewhere along the line, and malicious content can be added to the values of your string.

#### Work Around:

The big issue with this method is that you’re trying to use *innerHtml*. Instead, use *.append*.  
That still won’t work if you just try to pass in a string, however. What you need to do is set your string to a variable, then pass in that variable. If you do not create an object (that is, setting the string to a variable) then this will not work. If you just try to use a string, then you’ll see nothing but text where the div should be.

Here’s a single line example:

```
$panel.append('<'img src="' + item.thumbImageUrl +'" >');
```

If you try to pass that in, Windows 8 will throw the error seen above.  Even if I wrap that in *MSApp.execUnsafeLocalFunction()*I will still see an error.

The workaround is as follow:

```
var appendString = '<'img src="' + item.thumbImageUrl '" >';
$panel.append(appendString);
```

Because I’m now taking that string and setting it to a variable (thereby turning it into an object), Windows 8 will allow me to pass in that object and create dynamic content.

Even then, it will occasionally throw the error above. HOWEVER, if you were to wrap that object in *MSApp.execUnsafeLocalFunction(),*you would then be in the clear.  WinJS offers a function to wrap your own functions in, which allows you to basically say “I take responsibility for this function, and I assure you it’s safe.” That function is called: *MSApp.execUnsafeLocalFunction().*

So the final solution looks like this:

```
var appendString = '<'img src="' + item.thumbImageUrl '" >';
 MSApp.execUnsafeLocalFunction(function() {
     $panel.append(appendString);
});
```

[You can read more about this issue here.](http://stackoverflow.com/questions/10859523/using-jquery-with-windows-8-metro-javascript-app-causes-security-error)

#### Problem 2:

This is the one that took me the longest to figure out, as there wasn’t much covered about it on the internet. When attempting to use .*append* or *.appendChild*, Windows 8 throws the same error.

#### Work Around:

Sadly, the method listed above is not the silver bullet for Windows 8 and jQuery. Alas, not all is lost. You can hack apart jQuery in some spots (namely wherever *.append* or *.appendChild* is called).

[I’ve modified jQuery myself, and you can find a version of it here](https://dl.dropboxusercontent.com/u/3152642/jquery-2.0.2.js). It’s a modified version of 2.0.3.

With these two work arounds I’ve managed to get all of my HTML5 and jQuery code to work without error on various Windows 8 devices. I’d love to hear about what you think!

#### Further Reading:

* [execUnsafeLocalFunction from MSDN](http://msdn.microsoft.com/en-us/library/windows/apps/hh767331.aspx)
* [TutsPlus tutorial on jQuery and Win8](http://net.tutsplus.com/tutorials/javascript-ajax/building-windows-store-applications-with-jquery-2-0/)
