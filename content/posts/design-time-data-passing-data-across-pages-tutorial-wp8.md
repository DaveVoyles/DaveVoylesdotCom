+++
title = "[Tutorial] Design Time Data + Passing Data Across Pages  (WP8)"
date = "2013-02-08T00:00:00"
draft = false
author = "Dave Voyles"
categories = ["C#", "Game Dev", "Programming", "Windows 8", "Windows Phone 8"]
tags = ["C#", "Programming", "Win8", "Windows 8", "Windows Phone 8", "XAML"]
topics = ["Gaming", "Tech"]
+++

The most difficult part of this project thus far has been understanding the idea behind MVVM, or Model-View-View Model. Wikipedia defines it as:

“MVVM facilitates a clear separation of the development of the [graphical user interface](http://en.wikipedia.org/wiki/Graphical_user_interface "Graphical user interface") (either as [markup language](http://en.wikipedia.org/wiki/Markup_language "Markup language") or GUI code) from the development of the [business logic](http://en.wikipedia.org/wiki/Business_logic "Business logic") or [back end](http://en.wikipedia.org/wiki/Back_end "Back end") logic known as the model (also known as the data model to distinguish it from the view model). The view model of MVVM is a value converter, meaning that the view model is responsible for exposing the data objects from the model in such a way that those objects are easily managed and consumed”

#### –Design Time Data–

I’ve looked up a number of tutorials behind this, but it wasn’t until I ran into Iris Classon’s excellent tutorial on the subject when I finally grasped it.  
I used her example and wrote one of my own. With a solid understanding of one of the many ways to bind a model to a view model I was now ready to progress to the next step.

I wrote a version of my app using her outline, which worked great for design time data. I could now make changes to the page layout and see the results in real time. Some designers prefer to work within Blend, but I found that for the most part manipulating the code within Visual Studio just seemd to work easier for me. Still, I would keep both apps open an switch back and forth between the two. Expression Blend certainly offers quite a bit of power over Visual Studio in terms of adding colors and  detail to your page, which would otherwise prove difficult if relying only on code.



The design time data was written an ObeservableCollection of type AItems (alphabet items):

```
ObservableCollection<AItem> LoadFakeItems()
 {
     return new ObservableCollection<AItem>
     {
        new AItem {Name = "Apple", Image = "/Assets/Apple.jpg", Description = "This fruit is a delicious addition to your diet. Eating one each
                   day keeps the doctor away!"},
        new AItem {Name = "Banana", Image = "/Assets/Banana.jpg", Description = "Monkeys are known to eat this fruit, after they peel it, of
                   course"},
        new AItem {Name = "Carrot", Image = "/Assets/Carrot.jpg", Description = "This vegatable can help to improve your eye sight!"},
        new AItem {Name = "Dog", Image = "/Assets/Dog.jpg", Description = "This four legged friend is also called 'Man's best friend'"}
     };
}
```

This was loaded when the DesignTimeData page was initializsed, and stored as AItemsListView.

```
public ObservableCollection<AItem> AItemsListView { get; set; }

 public DesignTimeData()
 {
     AItemsListView = LoadFakeItems();
 }
```

#### –Binding through XAML–

I’ve got my model done, but now I need a way to get the data on screen. At the top of my MainPage.Xaml page I added the following:

```
xmlns:local="clr-namespace:PhoneApp2" DataContext="{Binding RelativeSource={RelativeSource Self}}"
 d:DataContext="{Binding Source={d:DesignInstance Type=local:DesignTimeData, IsDesignTimeCreatable=True}}"
 mc:Ignorable="d"
```

This declares:

1. The namespace (It is imperative that you use “clr-” as the prefix, otherwise you’ll get an error!)
2. The DataContext (this can also be done through the C# class with the code-behind, so MainPage.Xaml.CS in this example)
3. Setting the DataContext to “d”, and telling it to be a DesignInstance
4. Ignoring the design data if we are compiling the app

Since I already had a rough outline of what my pages would look like by implementing design time data, it was now time to figure out how to implement my new-found  understanding of data binding. I opened the DataBoundApp template and began to implement my own code. My modele only consists of three properties, all of which were strings:  *Name, ImageURI,* and *Description.*

The Name is the word used to define that letter of the alphabet, such as Apple for A, as mentioned above. Image URI is the relative path for where the image  corresponding to the Aitem would be stored, and finally the Description was brief synopsis on the object. I kept a friendly and childish tone when referring to the objects of course,  and would use lines like “One a day keeps the doctor away!” when describing the apple.

#### –The Content Panel–

A content panel is where you’d place all of the content applicable to this particular page. Often this is the only thing that gets changed from page to page on apps, as you’d generally want to keep the header consistent across the entire life of the application.

```
<!--ContentPanel - Grid defintions-->
  <Grid x:Name="ContentPanel" Grid.Row="1" Margin="10,10,14,-10">
   <Grid.ColumnDefinitions>
    <ColumnDefinition Width="455"/>
    <ColumnDefinition Width="3"/>
   <ColumnDefinition Width="0*"/>
  </Grid.ColumnDefinitions>

<!--Data source, Images & Text-->
 <ListBox x:Name="AlphaItemBox" ItemsSource="{Binding AItemsListView}" Margin="0,0,38,0" ScrollViewer.HorizontalScrollBarVisibility="Visible" Padding="0" VerticalContentAlignment="Top" SelectionChanged="AlphaItemBox_SelectionChanged">
   <ListBox.ItemTemplate>
    <DataTemplate>
     <StackPanel Grid.Column="1" VerticalAlignment="Top" Margin="10,0,0,0">
      <TextBlock Text="{Binding Name}" FontSize="36"/> <Image Source="{Binding Image}" Stretch="UniformToFill" Width="408" Tap="Image_Tap_1"/>
     </StackPanel>
    </DataTemplate>
   </ListBox.ItemTemplate>
  </ListBox>
</Grid>
```

Above, you’ll notice that I’ve set my ItemsSource in my AlphaBetItemBox to be bound to AItemsListView, which we created in our previous step. What this does is take all of the data we’ve created in that list, and display it on this template.Rather than write the same code 26 times (once for each letter of the alphabet), I can write it once and all of  the objects on screen (The name of the object and imageURI) are each laid out in the same manner. That’s part of the beauty of databinding: I only have to write the code once!  
The other attractive part of MVVM is that my data (model) is completely separate from my view (essentially, the UI) and I can easily swap these two things in and out, thereby making my code reusable and modular in most respects.

That’s all for now, as I didn’t want this to get too far in depth on the first tutorial, but I’ll have the second part up tomorrow, where I’ll also include the source code.

#### –Additional Resources–

<http://www.chaitanyavenneti.com/topics/wp7-databound-app-intro/>  
<http://www.irisclasson.com/2013/02/03/a-simple-design-time-data-example-with-windows-store-applications-for-beginners/>  
<http://www.codeproject.com/Articles/100175/Model-View-ViewModel-MVVM-Explained>
