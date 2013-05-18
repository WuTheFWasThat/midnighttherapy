----------------
CLIENT-SIDE PATHING
----------------

Check this out:

![client side pathing](show-values-off.png)

You can have something which updates your score as you place blocks!
The score is shown next to the speed dropdown.  Remember, the score IS NOT SUBMITTED FOR YOU.

If you press "show values", you'll see block values for every block.  However, this will feel laggy and is not recommended for play.

![client side pathing](show-values-on.png)

----------------
INSTRUCTIONS FOR USE
----------------

SIMPLE:

1. Go to Pathery
2. Copy the contents of
https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-full.js
into the Javascript console

BETTER PERFORMANCE (recommended if using "show values"):

1. Download
https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-server.js
2. Run locally:
node pathery-server.js
3. Go to Pathery
4. Copy the contents of
https://raw.github.com/WuTheFWasThat/midnighttherapy/master/pathery-client.js
into the Javascript console

----------------
KNOWN ISSUES:
----------------

- Pather doesn't deal with dualing paths (red start arrows)
- Pather doesn't deal with multiple INs or multiple OUTs
- Slow

----------------
POTENTIAL THINGS TO WORK ON:
----------------

1. An AI that actually suggests (potentially major) changes
2. Saving different solutions
3. Undo

Feel free to contribute, of course :)
