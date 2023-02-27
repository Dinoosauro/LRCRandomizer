# LRCRandomizer
Randomize of a few milliseconds the timestamp of LRC files. 
## How to use it
This website is deployed using GitHub Pages. You can click [here](https://dinoosauro.github.io/LRCRandomizer/) to use this webside.
## What does this website
This website does randomize for a few milliseoconds the timestamp of a .LRC file. You can also choose the second, if subtract or add (or both) and the export file.
### Why this website
I got curious one day and I looked up which was the mininum delay the human ear could hear. However, different people gave different answers, and no one found a common solution [[1]](https://sound.stackexchange.com/questions/28163/whats-the-shortest-sound-perceptible-to-the-human-ear#:~:text=The%20shortest%20detectable%20tone%2C%20identifiable%20as%20a%20tone%2C%20would%20be%20on%20the%20order%20of%20100%20ms.%20It%20might%20be%20shorter%20for%20tones%20of%20high%20pitch.)[[2]](https://stackoverflow.com/questions/6880856/whats-the-minimum-lag-detectable-by-a-human#:~:text=For%20this%20reason%2C%20a%208%2D16%20ms%20value%20should%20indeed%20be%20aimed%20for%2C%20since%20it%20will%20result%20in%20the%20same%20effect%20one%20sees%20in%20movies.%20In%20other%20words%2C%20the%20user%20will%20have%20no%20perception%20of%20delay%20for%20such%20values.)[[3]](https://www.reddit.com/r/audiophilemusic/comments/oyghrs/the_human_ear_detects_half_a_millisecond_delay_in/).

So, I decided to try if I could be able to tell the difference on my favourite song. I created a small C# script that randomized from 1 to 15 milliseconds the timestamp of a LRC file, and then I looked if I could notice any delay in the synced lyrics. Later, just for fun, I decided to readapt the script, make it work in JavaScript and build a decent-looking (at least, I hope so) website for this.

Yeah, basically this website is kinda useless. But it was a fun project to do, so I decided to publish it.
