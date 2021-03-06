APX Helper CRUD
============

## Kado

STOP AND READ THIS

APX or Apex is no longer maintained and is superseded by Kado.

A new package is available to handle all your JavaScript needs.
See [kado.org](https://kado.org) for details.

## Summary

CRUD (Create Read Update Delete) helper for APX API server actions

Requires Mongoose Models and the [mongoose-list](https://github.com/snailjs/mongoose-list) and [mongoose-merge plugin](https://github.com/eherve/mongoose-merge-plugin) plugins.

## Usage

Simply require the helper within your actions

```
$ npm install apx-helper-crud --save
```

```js
var Crud = require('apx-helper-crud')
  , Model = require('./models/test').model

//will populate all the following crud functions
// * find
// * findOne
// * list (which required the model to use the mongoose-list plugin)
// * save
// * remove
module.exports = new Crud(Model,'test','Test Module')
```

## Route Helper

Helper CRUD will also help populate route methods to cut down on repetition.

**config.js**
```js
var crud = require('apx-helper-crud')

module.exports = {
  express: {
    routes: [
      {get: {path: '/myAction', file: 'actions/myAction.js', methods: crud.methods()}}
    ]
  }
}
```

You can also supply additional routes to the methods helper.

**config.js**
```js
var crud = require('apx-helper-crud')

module.exports = {
  express: {
    routes: [
      {get: {path: '/myAction', file: 'actions/myAction.js', methods: crud.methods(['extraAction','extraAction2'])}}
    ]
  }
}
```

Alternatively a string may be passed that will be added as a single method. Also a function may be passed that returns
either a string or an array of methods.

## Constructor

The constructor only takes the following arguments.
* Model -- The model to operate on
* Name -- Name of the module
* Description -- Description the module

```js
var Crud = require('apx-helper-crud')
  , Model = require('./models/test').model
  , crud = new Crud(Model,'test','Test Module')
```

## Methods

All of the Crud methods are APX actions so they accept request data directly and return APX responses.

### Find

Find records by the criteria in the data object.

Takes a Mongoose query object as the only argument.

```js
{name: 'test doc'}
```

Returns an object of results.

```js
{results: [{name: 'test doc'}]}
```

### Find One

Find a single record by the criteriea in the data object.
Useful for finding items by ObjectID

Takes a mongoose query object as the only argument.

```js
{name: 'test doc'}
```

Returns an object of results.

```js
{result: {name: 'test doc'}}
```

### List

Utilizes the [mongoose-list](https://github.com/snailjs/mongoose-list) plugin
to iterate records in a collection.

Takes a mongoose-list arugment object.

```js
{start: 0, limit: 10, find: 'foo', sort: 'bar'}
```

Returns a results object

```js
{count: 10, results: [{name: 'test doc'}]}
```

### Save

Save one or many documents.

**IMPORTANT** requires the
[mongoose-merge plugin](https://github.com/eherve/mongoose-merge-plugin)
to be loaded in the model.

Accepts a document or an array of documents.

```js
[{name: 'test doc'}]
```

Returns a result object

```js
{results: [{name: 'test doc'}]}
```

### Remove

Remove one or many documents.

Accepts a query object or an array of query objects.

```js
[{name: 'test doc'}]
```

Returns success or error only.

## Roles

If [apx-roles](https://github.com/snailjs/apx-roles) is loaded at initialization they will be implemented by the crud
helper unless explicitly disabled.

The use of roles also requires [apx-session](https://github.com/snailjs/apx-session) to be loaded as it will look for
`apx.session.get('profile')` to test against and will default to the profile `guest`.

Take a look at the following example
```js
module.exports = new Crud(Model,'foo','my crud action')
```

This will expose the following roles.
* foo.find
* foo.save
* foo.remove

`find`, `findOne`, and `list` are all considered part of the `find` permission.

To disable roles even with the module loaded, try the following
```js
module.exports = new Crud(Model,'foo','my crud action',{useRoles: false})
```

## Changelog

### 0.2.5
* Updated to implement `'use strict';` in all files
* Implemented apx-roles support to check permissions when available
* Updated jshintrc to newest standards with other apx projects

### 0.2.4
* Fixed small issue with save trying to read the property `items` in the request
* Added testing against erroneous input for `save`, `remove` and `findOne`
* Fixed issues with error handling on `save`, `remove` and `findOne`

### 0.2.3
* Upgraded to apx 0.7.1 and apx-mongoose 0.5.1

### 0.2.2
* Added methods helper to populate routes

### 0.2.1
* Crud helper now fills name and description along with default run task
* Updated usage statement

### 0.2.0
* Completely re-imagined interface that can just extend methods of an action.
* Simplified return formats to be more predictable
* All methods are now APX actions

### 0.1.3
* Better error handling on un-sanitized input

### 0.1.2
* Fixed responses needing to be passed to `doc.toJSON({virtuals: true})`
* Updated to apx 0.3.0

### 0.1.1
* Added missing dependencies

### 0.1.0
* Initial release
