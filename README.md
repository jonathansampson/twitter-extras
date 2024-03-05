# Twitter Extras

## Version 3.0

Adds support for inline code wrapping. This option will replace portions of Tweets wrapped in a single set of backticks (i.e. the ` character) with code tags. Further, the resulting text will be more easily distinguishable from surrounding text in size, font, and color.

### Version 3.1

Adds support for downloading voice tweets. Click the … at the top-right of a voice Tweet, and select "Download Voice Tweet" from the menu.

### Version 3.2

Adds support for dynamic timecodes in Tweets with media.

#### Version 3.2.1

Fixed styling issue with dynamic timecode links.

#### Version 3.2.2

Adds support for dynamic timecodes posted as an immediate reply to a Tweet with media.

#### Version 3.2.3

Moved to a single mutation observer pattern. Previously each of the features may have created their own mutation observer. This was unnecessary, since they were only interested in examining added nodes. The extension now creates a single mutation observer, and notifies each of the interested features when new nodes have been added to the DOM. This results in leaner, more optimized code.

This update also fixed an issue where Voice ~~Tweets~~ _Posts_ (e.g., <https://twitter.com/ehikian/status/1659670588598923265>) were no longer downloadable from their respective menu dropdown.

#### Version 3.2.4

Adds support for draggable post box. This enables the author to move their _New Post_ box around while authoring a new post. This could be helpful if you're attempting to read a post to which you are replying, but find that it is partially obstructed by the post box itself.

### Version 3.3

Removes *Dynamic Timecode* support (introduced in updates 3.2, 3.2.1, and 3.2.2) as this feature is now natively supported on X/Twitter.

## Version 2.0

Adds support for ultra-wide Twitter. This option removes the sidebar column, which typically contains the *What's Happening* and *Who to Follow* sections. The resulting space is filled by the primary column, creating a considerably wider timeline.

### Version 2.1

Fixed issue where multiple download/pip buttons would be displayed.

### Version 2.2

Removed "ultra-wide" option, replacing instead with options for disabling "What's Happening" and "Who to Follow" components in the sidebar. The ultra-wide option wasn't much of an improvement, in my opinion. In fact, it yielded an even worse experience. Lines of text became considerably longer, media elements (whith a 1x1 ratio, for example) were often much too tall.

## Version 1.0

Enables extra features on Twitter (e.g. savings videos, and picture-in-picture).
