## Changelog

### 2.4.16 (29.07.2016)
- Bugfix for `logout()` method

### 2.4.15 (28.07.2016)
- Added `logout()` method [#41](https://github.com/filepicker/filepicker-js/pull/41)

### 2.4.13 & 2.4.14 (30.06.2016)
- Fixed issue [#21](https://github.com/filepicker/filepicker-js/issues/21)

### 2.4.12 (24.06.2016)
- [Blobs](https://developer.mozilla.org/en-US/docs/Web/API/Blob) support in `filepicker.store()` method. [#37](https://github.com/filepicker/filepicker-js/pull/37)

### 2.4.11 (19.05.2016)
- Pass `converted` property to blob in onSuccess callback

### 2.4.10 (05.05.2016)
- Replace cdn urls for preview widget [#34](https://github.com/filepicker/filepicker-js/pull/34)

### 2.4.9 (04.05.2016)
- Passing crop and rotation data to blob [#33](https://github.com/filepicker/filepicker-js/pull/33)

### 2.4.8 (25.04.2016)
- Handle HTTP server errors [#32](https://github.com/filepicker/filepicker-js/pull/32)

### 2.4.7 (07.04.2016)
- Extensions are case insensitive now [#31](https://github.com/filepicker/filepicker-js/pull/31)

### 2.4.5 (25.02.2016)
- Widget button rebranded to FileStack [#29](https://github.com/filepicker/filepicker-js/pull/29)

### 2.4.4 (16.02.2016)
- Add filtering support to audio client [#28](https://github.com/filepicker/filepicker-js/pull/28)

### 2.4.3 (09.02.2016)
- Add storeRegion option to the picker. [#19](https://github.com/filepicker/filepicker-js/pull/19)
- Added option for setting video & webcam resolution [#20](https://github.com/filepicker/filepicker-js/pull/20)

### 2.4.2 (08.02.2016)
- Responsive images lookup can be triggered at any time. [#23](https://github.com/filepicker/filepicker-js/pull/23)
- Fix typo in ```data-fp-custom-source-conatiner``` attribute name. [#27](https://github.com/filepicker/filepicker-js/pull/27)

### 2.4.1 (05.02.2016)
- Allow every image to be processed. [#25](https://github.com/filepicker/filepicker-js/pull/25)

### 2.3.8 (22.01.2016)
- Handle safari standalone mode [#11](https://github.com/filepicker/filepicker-js/pull/11)

### 2.3.7 (20.01.2016)
- Parse options.noFileReader parameter for server vars [#17](https://github.com/filepicker/filepicker-js/pull/17)

### 2.3.6 (15.01.2016)
- Bugfix for dialog close method.

### 2.3.5 (15.01.2016)
- Add ability to close opened dialog from JavaScript. [#15](https://github.com/filepicker/filepicker-js/pull/15)
- Reckognize .vob file extension. [#16](https://github.com/filepicker/filepicker-js/pull/16)

### 2.3.4 (12.01.2016)
- Add custom source container and path options for html widgets attributes list. [#13](https://github.com/filepicker/filepicker-js/pull/13)

### 2.3.3 (16.12.2015)
- Hotfix. Missing slash in processing base url.

### 2.3.2 (16.12.2015)
- Set dynamicly domain for processing.

### 2.3.1 (23.11.2015)
- Add custom source path as a picker option [#7](https://github.com/filepicker/filepicker-js/pull/7)

### 2.3.0 (18.11.2015)
- Add custom source bucket name as a picker option [#5](https://github.com/filepicker/filepicker-js/pull/5)
- Add custom css url option for viewer [#6](https://github.com/filepicker/filepicker-js/pull/6)

### 2.2.1 (5.11.2015)
- Add custom text option to the widget options. [#4](https://github.com/filepicker/filepicker-js/pull/4)

### 2.2.0 (3.11.2015)
- Add responsive images feature. [#1](https://github.com/filepicker/filepicker-js/pull/1)

### 2.1.3 (15.10.2015)
- Add prepublish action. Make sure to build dist version before publishing to npm.

### 2.1.2 (15.10.2015)
- Fix. Filtering allowed conversions. Use hasOwnProperty method.

### 2.1.1 (09.10.2015)
- Do not use Array.filter and Array.indexOf methods. Support IE8.

### 2.1.0 (06.10.2015)
- Add filepicker debug script.
- Add client value to response object.

### 2.0.0 (28.09.2015)
- init filepicker-js repository as separate module
