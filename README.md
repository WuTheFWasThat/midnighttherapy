# MIDNIGHT THERAPY #

## OVERVIEW ##

This code is meant to be an interface between the Pathery website (www.pathery.com) and a server.  
With a human interacting with the browser, it effectively facilitates human-computer interaction.  
Besides interacting with the server, the client (browser) does things like client-side pathing and display and save/load of solutions.
For those of us who aren't tech savvy, or don't want to run a server, I've provided an in-browser "server".

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

It's often frustrating that you can only load your best solution, on maps with many viable but different placings. 
Ultra Complex is especially bad - it's devastating when I'm working on a new idea, and I accidentally load my best solution.  
Thus I added the ability to save and load solutions.  Simply enter a name, and press Save, to save the current solution.
You'll then see the name appear in a list, where you can Load or Delete it.

![save solutions](images/save-solutions.png)

If you want your solution saving to persist, you'll need a browser that supports HTML5 storage!  
If your browser doesn't support it, you really should upgrade it anyways.  

### HOTKEYS ###

I provide several hotkeys to make playing easier and faster:

| Hotkey        | Action              |
| ------------- |:------------------- |
| 1-5           | Switch between maps |
| g             | Go!                 |
| r             | Reset               |
| l             | Load best solution  |
| s             | Save solution       |
| v             | Toggle values       |
| z             | Undo                |
| y             | Redo                |

## INSTRUCTIONS FOR USE ##


### SIMPLE: ###

1. Go to Pathery
2. Paste:

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

into the Javascript console.

To make this even easier, make it a bookmarklet.  That is, create a bookmark with the address:

`javascript: $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

You can then just visit this bookmark while you're at Pathery.


Unfortunately, "show values" is noticeably slow this way.  Thus, the following method is recommended instead

### WITH A SERVER ###

First you'll need a server running.  I've provided one that you can use (maybe as a starting point for an AI).  To get it,

1. Clone this repo and cd into it
2. Run locally:

`node pathery-server.js`

Next, add my client to the browser window.

1. Go to Pathery
2. Paste

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js')`

into the Javascript console.  Again, you can make this easier for yourself by saving bookmark with address:

`javascript: $.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js')`

<!--
### SERVER API ###

I'll get to this sometime...
-->

## KNOWN ISSUES: ##

- Undo and redo don't work with save/load/reset properly 

<!--
None, at the moment.  Let me know if you find any! 
-->

<!--
## MINOR NOTES: ##

The values on the blocks is currently white, so it works best with darker blocks.  (I'll make the font color better/customizable in the future.)
-->

## FUTURE WORK: ##

Suggestions and feedback welcome.  Email me at [github-username]@gmail.com, or maybe catch me in the Pathery chat.

- Block-placing tools
  - placing blocks
  - shift click draws walls from last click (two clicks to make a diagonal, n+1 clicks to make a structure with n parts)
  - undo, redo
  - block "paintbrush" and eraser (click and drag)
  - keyboard shortcuts/modifiers for all the above, plus:
    - placing wall relative to last thing placed
    - clearing the board
    - save and load

- An API to support solvers that actually suggest (potentially major) changes, takes suggestions, etc. (and an accompanying prototype)

- Make the [dumb] thing faster (currently does 400 full UC calculations per second... )

Feel free to contribute, of course :)
