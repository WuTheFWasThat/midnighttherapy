# MIDNIGHT THERAPY #

<!--
## TABLE OF CONTENTS ##
* [OVERVIEW]
* [FEATURES]
* [INSTRUCTIONS]
* [KNOWN ISSUES]
* [FUTURE WORK]
-->

## OVERVIEW ##

This project is an extension to the Pathery website (www.pathery.com).  It does two main things:

1. Extend the client (browser) to do things like show block values and save/load of solutions.
2. Lets the website interact with a personal server (running a solver), to facilitate human-computer interaction.  

## FEATURES ##

### CLIENT-SIDE PATHING ###

Check this out:

![client side pathing](images/show-values-off.png)

You can have something which updates your score as you place blocks!
The score is shown next to the speed dropdown.  Remember, the score IS NOT SUBMITTED FOR YOU.

If you press "show values", you'll see block values for every block.  
However, this may feel laggy if you're letting the browser do the computation.

![client side pathing](images/show-values-on.png)

### SOLUTION LOAD AND SAVE ###

Simply enter a name and press "Save solution" (or use the hotkey S) to save a solution under some name.  
If no name is entered, a default name is chosen based on the score of the solution.
You'll then see the name appear in a list, where you can Load or Delete it.

![save solutions](images/save-solutions.png)

If you want your solution saving to persist, you'll need a browser that supports HTML5 storage!  
If your browser doesn't support HTML5 local storage, you really should upgrade it...

### HOTKEYS ###

I provide a number of hotkeys to make playing easier and faster:

| Hotkey        | Action              |
| ------------- |:------------------- |
| 1-5           | Switch between maps |
| G             | Go!                 |
| R             | Reset               |
| L             | Load best solution  |
| S             | Save solution       |
| M             | Toggle mute         |
| V             | Toggle values       |
| W             | Wall (paint)        |
| E             | Erase (paint)       |
| X             | Toggle block        |
| Z             | Undo                |
| Y             | Redo                |

### CUSTOM BLOCK IMAGES ###

As you might have noticed, you can customize your block images.  Just tell me your Pathery user id and an image!

## INSTRUCTIONS ##


### SIMPLE: ###

1. Go to Pathery
2. Paste:

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

into the Javascript console.

There are a few options to make this even easier:

1. (RECOMMENDED:) Use Tampermonkey (Chrome) or Greasemonkey (Firefox) so that it will load automatically when you visit the site.

2. Make it a bookmarklet.  That is, create a bookmark with the address:

`javascript: $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

You can then just visit this bookmark while you're at Pathery.


Unfortunately, "show values" is noticeably slow this way.  Thus, the following method is recommended instead

### WITH A SERVER ###

First you'll need a server running.  I've provided one that you can use (maybe as a starting point for an AI).  To get it,

1. Clone this repo and cd into it
2. Run locally:

`node pathery-server.js` (or just `npm start`, if you have npm)

Next, add my client to the browser window.

1. Go to Pathery
2. Paste

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js')`

into the Javascript console.  Again, you can make this easier using something like Tampermonkey/Greasemonkey, or a bookmarklet.

<!--
### SERVER API ###

I'll get to this sometime...
-->

## KNOWN ISSUES: ##

- Undo/redo doesn't work well with load best (it works with manual loading from the side though)

- With the painters + undo/redo, it's possible to delete pre-placed walls, checkpoints, etc. (b/c i add something to the history, and do trigger unclicked)

<!--
None, at the moment.  Let me know if you find any! 
-->

<!--
## MINOR NOTES: ##

The values on the blocks is currently white, so it works best with darker blocks.  (I'll make the font color better/customizable in the future.)
-->

## FUTURE WORK: ##

Suggestions and feedback welcome.  Email me at [github-username]@gmail.com, or maybe catch me in the Pathery chat.

- Cleanup of old solutions

- Make it so you can upload your own image URL

- Block-placing tools
  - shift click draws walls from last click (two clicks to make a diagonal, n+1 clicks to make a structure with n parts)

- Chat in the main page

- An API to support solvers that actually suggest (potentially major) changes, takes suggestions, etc. (and an accompanying prototype)

Ongoing:

- Make the [dumb] thing faster (currently does ~1000 full UC calculations per second on my Macbook Air, in Node.js (which is single threaded))

Feel free to contribute, of course :)
