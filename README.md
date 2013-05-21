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

### SIMPLE:


1. Go to Pathery
2. Paste:

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js')`

into the Javascript console.

### OUTSOURCING COMPUTATION TO A SERVER (recommended if using "show values"):


1. Clone this repo and cd into it
2. Run locally:
node pathery-server.js
3. Go to Pathery
4. Paste

`$.getScript('https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js')`

into the Javascript console

KNOWN ISSUES:
--------------------

- Pather doesn't deal with red start arrows and specialized blocker blocks (dualing paths/reverse order/32)
- Pather doesn't deal with multiple INs or multiple OUTs
- Slow

FUTURE WORK:
--------------------

1. An API to support solvers that actually suggest (potentially major) changes, takes suggestions, etc. (and an accompanying prototype)
2. Saving different solutions
3. Undo

Feel free to contribute, of course :)
