# LRCRandomizer

LRCRandomizer allows you to change the timestamp of the .LRC files of a few
milliseconds, by randomizing that value.

Try it: https://dinoosauro.github.io/LRCRandomizer/

Looking for the old, vanilla JS version?
[Click here](https://github.com/Dinoosauro/LRCRandomizer/tree/old-js-version).

## Usage

![The UI of LRCRandomizer](./readmeAssets/Screenshot%202024-06-17%20alle%2021.18.17.jpg)

### File opening

At the left, you can choose if a folder should be selected or not (in that case,
multiple file selection will be enabled). If your browser supports it, you can
also use the File System API for a native-like experience. You can also choose
to save everything in a .zip file, and to read only the files that ends with
".lrc"

### Settings

At the right, you can find the option for the current converision. Each edit
will be automatically saved in the LocalStorage.

#### Changing the file name

You can change the output file name/path. There are three variables that you can
use in the string:

- `${DirectoryName}`: the path of the current file (or the name if not
  available)
- `${FileName}`: the file name
- `${Dollar}`: for adding a dollar sign, without triggering the two other
  variables

#### Addition and subtraction

Here you can specify if you want to add, subtract or both. You can also choose
specific range of hundredths of seconds for each value.

## Installation

You don't need to install anything to use LRCRandomizer. Everything is done
locally on your device, and the only connection made is to Google Fonts to fetch
the font used. Nothing is sent to an external server.

**However,** installing the Progressive Web App will permit you to a) use
LRCRandomizer offline; and b) open `.lrc` files directly from your system's File
Picker.

Also, if your browser still does not support Progressive Web Apps
(unfortunately, at the time of writing, Firefox on desktop), you can download
this page as a single HTML file. All the necessary styles and JavaScript code
are embedded on the HTML file. However, you won't get that beautiful background
_(it was possible to import in the HTML that too, but I preferred to have
something not too big in terms of file size)_
