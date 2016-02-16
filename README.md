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
Script above use latest library release. Assets are compressed (gzipped) and served via CDN.
You can also link to specific version.

[https://api.filepicker.io/v2/filepicker-2.1.3.js](https://api.filepicker.io/v2/filepicker-2.1.3.js)
[https://api.filepicker.io/v2/filepicker-2.1.3.min.js](https://api.filepicker.io/v2/filepicker-2.1.3.min.js)

See [Changelog](CHANGELOG.md)

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


## Releasing
1. When updating version be sure to update it in all files:

```
./VERSION
./package.json
./src/library/lib.js
```

2. Set git tag with current version.

3. Be sure to update [npm package version](https://www.npmjs.com/package/filepicker-js) :
```
npm publish
```

4. And [Bower-friendly version of filepicker-js](https://github.com/filepicker/filepicker-js-bower)


## Deployment
### Filepicker

Use ansible script to deploy current version for filepicker.

```
source ../vagrant/aws/new && ansible-playbook -i env/production/inventory filepicker_api/deploy_js_library_v2.yml
```

* optionally to deploy from branch othter than master
```
-e emergency_deploy="yes"
```

* optionally not to overwrite edge version
```
-e edge_version="no"
```

It overwrites [filepicker.js](https://api.filepicker.io/v2/filepicker.js) with current version. It creates versioned files, eg for v2.4.0:

*  [filepicker-2.4.0.js](https://api.filepicker.io/v2/filepicker-2.4.0.js)
*  [filepicker-2.4.0.min.js](https://api.filepicker.io/v2/filepicker-2.4.0.min.js)
*  [filepicker_debug-2.4.0.js](https://api.filepicker.io/v2/filepicker_debug-2.4.0.js)

### Filestack

```
source ~/.filepicker/aws_new && ansible-playbook -i env/production filestack_api/build_js.yml
```

Its working basically the same. The only diffrents is domain and file name it creates.
[https://api.filestackapi.com/filestack.js](https://api.filestackapi.com/filestack.js)
