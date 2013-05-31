MIDNIGHT THERAPY
====================

CLIENT-SIDE PATHING
--------------------

Check this out:

![client side pathing](images/show-values-off.png)

You can have something which updates your score as you place blocks!
The score is shown next to the speed dropdown.  Remember, the score IS NOT SUBMITTED FOR YOU.

If you press "show values", you'll see block values for every block.  However, this will feel laggy and is not recommended for play.

![client side pathing](images/show-values-on.png)

INSTRUCTIONS FOR USE
--------------------

This code is meant to be an interface between the Pathery website and a server.  
Besides interacting with the server, the client (browser) does things like client-side pathing and display, and in the future, load/save of solutions, 
However, for those of us who aren't tech savvy, or don't want to run a server, I've provided an in-browser "server".

This works best with pure black blocks.  (I'll make the font color better/customizable in the future.)

### SIMPLE:


1. Go to Pathery
2. Paste:

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

into the Javascript console.

### OUTSOURCING COMPUTATION TO A SERVER (recommended if using "show values"):


1. Clone this repo and cd into it
2. Run locally:

`node pathery-server.js`

3. Go to Pathery
4. Paste

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js')`

into the Javascript console

KNOWN ISSUES:
--------------------

- Doesn't deal with multiple INs

FUTURE WORK:
--------------------

- An API to support solvers that actually suggest (potentially major) changes, takes suggestions, etc. (and an accompanying prototype)
- Saving and loading different solutions
- Undo
- Make shit faster

Feel free to contribute, of course :)
