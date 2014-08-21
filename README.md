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
By adding the class *zigfy* to the gallery containers (probably divs), and having them contain all the images you want (as `<img src="path" />` HTML nodes of course).

Simply, *zigfy* runs by default the Javascript code above for all elements selected by `$('.zigfy')`. That's it, nothing miracular here.

Options
=======
Here are the options you can pass to *zigfy* (with their default value):
  * **resize**: `false` - whether to respond to resize events automatically
  * **layout**: `'maximize'` - the layout to use
    * *maximize* stretches the image so that it cover the whole container
    * *full* puts the whole image in the container, whatever its size
  * **align**: `'center'` - the alignment, one from:
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
  * **navFunc**: `null` - navigation function `function(lastIndex, currentIndex, imageCount, dir)` returning the new index where
    * `lastIndex` is the last navigated index (`-1` at the beginning)
    * `currentIndex` is the current index
    * `imageCount` is the number of images in the gallery
    * `dir` is the direction of navigation (`+1` or `-1`)
    * `this` is referring to the current zigfy object (to use data if needed)
  * **autoNav**: `false` - whether to automatically navigate with `next()` after a given time
  * **autoNavDuration**: `12000` - the duration between auto navigation calls in milliseconds
  * **padding**: `10` - the overall padding for images in layout *full*, it makes sure that there is this amount of available, taking CSS borders into account
  * **mapMode**: `true` -  whether to enable the *map* mode, i.e. clicking to grab and see more, only for the *maximize* layout
  * **imgSelector**: `null` - the image selector to use instead of the element's images
  * **noClass**: `false` - disable the automatic `zigfy` CSS class added to the base element
  * **eventNamespace**: `null` - set the zigfy event namespace (used by `clear()`), by default `.zigfy-{Math.random()}`

All the *boolean*, *string* and *number* options (of name `XXX`) can be passed via HTML using data paremeters `data-zigfy`.

For example:
  * To disable `showNav`, add `data-zigfy-showNav="false"`.
  * To use the full layout, add `data-zigfy-layout="full"`.
  * To use a 20px padding, add `data-zigfy-padding="20"`.
  * To use a specific set of images, add for example `data-zigfy-imgSelector="#imgContainer > div > img"`.

Actions
=======
Whereas options are passed under the form of an object such as:
```javascript
$('.zigfy').zigfy({opt1: val1, opt2: val2 ... });
```

Actions are called by:
```javascript
$('.zigfy').zigfy('action1').zigfy('action2')...;
```

Actions are method calls of Zigfy javascript objects. To have the list of all possible methods, you should look at `jquery.zigfy.js`.
Here follow the most important ones:
  * **clear**: remove all listeners which have been attached to that specific zigfy object
  * **prev**, **next**: manually switch to the prev, or next image
  * **select**: manually switch to an image given by its index
  * **layout**: request layout of the current picture
  * **toggleNavigation**: manually toggle the navigation of pictures (`mapMode=true` is required)
  * **switchLayout**: manually request a change of layout type

You can pass arguments after the action name. For example, to switch the layout for a specific one (and not the original one):
```javascript
$('.zigfy').zigfy('switchLayout', 'full');
// or even
$('.zigfy').zigfy('switchLayout', myGreatLayoutFunction);
```

Classes
=======
Several elements are used by *zigfy*, you can customize their look using CSS and their corresponding classes:
  * `.zigfy` is added by default to the base element (unless `noClass=true`)
  * `.zigfy-prev` and `.zigfy-next` are the UI elements
  * `.zigfy-loading` is set on the base element while images are loading, but see also `.zigfy-loaded`
  * `.zigfy-loaded` is set definitely on the base element after the first element has been laid out
  * `.zigfy-maps` is the cover for *mapMode* navigation (see zigfy.css)
  * `.zigfy-maximize`, `.zigfy-full` or `.zigfy-custom` (custom function) are classes of the container set by layouts

TODO
====

  1. Debug full layout (some cases seem wrong)
  2. Better image loading (now, navigation seems to reload pictures, not from cache!)

Timeline
========

**0.3.1** - switchLayout action added, possibility to pass arguments to actions, CSS layout classes, as of last commit

**0.3** - autoNav has been added (no timing-bar yet), as of commit 3d7e9532a29aa078dffa94167d27e0a7dd590f72

**0.2** - customization, parameters and configuration, as of commit bd0540406b5664f81c14568fa3251e52042699bf

**0.1** - base code for zigfy, as of commit f0891e67b4e206ee6861a218be95d6edfddd76f7

Future things
=============
  * Mapping click to switchLayout, and mouseover/down to maps navigation
  * Switch to **full** layout by default
  * Maybe add a timing bar for autoNav
  * Maybe a navigation button for layouts
  * Maybe overview with thumbnails
  * Maybe a link to the original image (or a corresponding image)

And of course, debugging is important.

License
=======
The code is released under the MIT license, as is.

Others
======
If you have questions, request or saw issues, don't hesitate.
