zigfy
=====

Z Image Gallery JQuery extension

What you need
=============
`zigfy` is a JQuery plugin. Thus you obviously want to have JQuery (and you should include it before including *zigfy*).
You need to include the CSS and Javascript files (as well as image resources if you want to use the same):
  * `jquery.zigfy.js` - the actual Javascript extension
  * `zigfy.css` - the basic style for *zigfy*

And that's it!

How to use it
=============
There are two different ways to use `zigfy`:

1. The Javascript Way
=====================
By calling it in your Javascript code (when the DOM is ready of course):

```javascript
$(function(){
  $('.mycontainer').zigfy({ /* my options */ });
});
```

Thus you can set parameters and configure each instance you want to create separately.

2. The HTML Way
===============
By adding the class *zigfy* to the gallery containers (probably divs), and having them contain all the images you want (as `<img src=*path* />` HTML nodes of course).

Simply, *zigfy* runs by default the Javascript code above for all elements selected by `$('.zigfy')`. That's it, nothing miracular here.

Options
=======
Here are the options you can pass to *zigfy* (with their default value):
  * **resize**: `true` - whether to respond to resize events automatically
  * **layout**: `'maximize'` - the layout to use
    * *maximize* stretches the image so that it cover the whole container
    * *full* puts the whole image in the container, whatever its size
  * **align*: `'center'` - the alignment, one from:
    * *topleft*, 
    * *top*,
    * *topright*,
    * *left*,
    * *center*,
    * *right*,
    * *bottomleft*,
    * *bottom*,
    * *bottomright*
  * **transition**: `'fade'` - the transition to use when navigating between images, one from:
    * *fade*,
    * *flash*,
    * or an object with the three following function: `{init, before, after}`, see jquery.zigfy.js implementation of *fade* and *flash* to make your own
  * **showNav**: `true` - whether to show the left / right navigation buttons
  * **padding**: `10` - the overall padding for images in layout *full*, it makes sure that there is this amount of available, taking CSS borders into account
  * **mapMode**: `true` -  whether to enable the *map* mode, i.e. clicking to grab and see more, only for the *maximize* layout
  * **imgSelector**: `null` - the image selector to use instead of the element's images

Examples
========
That's ... soon coming!

Future things
=============
I am thinking of adding an auto-navigation (like gallery auto-play) mode, with possibly a bar showing the timing.
This would be the next feature.

But of course, bugs are important.

License
=======
The code is released under the MIT license, as is.

Others
======
If you have questions, request or saw issues, don't hesitate.
