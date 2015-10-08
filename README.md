# filepicker-js
Filepicker javascript client library. 

## Usage

In order to use filepicker javascript library in your project, you need to include the following script in your HTML:

```
<script type="text/javascript" src="//api.filepicker.io/v2/filepicker.js"></script>
```

If you want to load the javascript in a non-blocking fashion, you can use this instead:
```
<script type="text/javascript">
(function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v2/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document);
</script>
```
Script above is latest library release hosted on filepicker servers. 


Filepicker library is avaliable via bower [Bower friendly repositorium](https://github.com/krystiangw/filepicker-js-bower)

```
$ bower install filepicker-js --save
```

And via npm + browserify
```
$ npm install filepicker-js --save
```

To use it with browseify place in your code:
```
var filepickerLibrary = require('filepicker-js');
```

Library provide ```window.filepicker``` with methods:
 ```setKey, pick, pickFolder, pickMultiple, pickAndStore, read, write, writeUrl, export, processImage, store, storeUrl, stat, metadata, remove, convert, constructWidget, makeDropPane```. See detailed [docs](https://www.filepicker.com/documentation/file_ingestion/javascript_api/pick?v=v2).

Next thing to do is setting apikey. If you dont have one - register free account [here](https://www.filepicker.com/register/free). Setting key is possible in 2 ways:

* use ```filepicker.setKey('yourApiKey')```  method.
* as widget attribute ```data-fp-apikey="yourApiKey"```


## Contributing
Contributing welcomed. First install npm dependencies.
``` 
npm install
``` 
To watch changes and build script run:
``` 
npm run watch
``` 
With jshint:
``` 
npm run watch-linter
``` 
