# Integration tests

Drive the real built cloud (`assets/pp-cloud.js`) in headless Chromium on a phone and a desktop viewport.

    pip install pytest playwright && playwright install chromium
    python -m pytest tests/integ

They run on software GL, so they are slow (a few minutes) but need no GPU. What they pin down:

- the shop wall only turns on an arrow or a swipe, never by itself
- the filter & sort button is a plum stitched pill (phone) and opens a cloud pop-up with no flat box behind it
- on desktop the options themselves show (no button), sit just below the header and never overlap the pictures
- clicking a picture opens a cloud-like product page filling nearly the whole screen, hides the filter bar, and closing restores the address
- the floor is prepared while idle, so the first scroll down never stalls
- the phone background runs under the top and bottom bars
- the first-visit pop-up: 10% off, email validation in white, Escape dismisses
- no uncaught page errors in any of the above
