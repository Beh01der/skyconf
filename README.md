# skyconf

## Overview

Simple REST-full FS-backed document storage.\
It utilises REST, JSON-patch and JSONpath for data manipulation and querying.\
Uses local file system (json files) for persistence.

## Installation

### Local / development

Clone repo

```bash
git clone https://github.com/Beh01der/skyconf.git
```

Build

```bash
cd skyconf
yarn
yarn build
```

Start

```bash
node dist/index.js
```

### Docker

```bash
docker run -d --name my-skyconf -p 3000:3000 beh01der/skyconf
```

Map local data directory for persistence

```bash
docker run -d --name my-skyconf -p 3000:3000 -v ~/Tmp/my-skyconf:/app/data beh01der/skyconf
```

## Configuration

Configuration can be done by environment variables.

- **SKYCONF_PORT** = `3000` - port to run service on
- **SKYCONF_DATA_DIR** = `./data` - data directory for stored documents
- **SKYCONF_UNSAFE_REMOVE_DIR** = `false` - when set to `true` will use `rm -rf` - like method when removing non-empty directories (will remove such directories with their content)

## API

### Read documents

**GET `/api/v1/storage[resource path]`** - returns a single document or list of documents depending on the resource.\
Parameters:

- **jsonpath** - (optional) - jsonpath query selector. Example: `$.name`
  \
  More details on jsonpath can be found here https://github.com/JSONPath-Plus/JSONPath

_Example 1 - document :_

```bash
curl -vg  http://localhost:3000/api/v1/storage/my-first-item.json
```

returns

```json
{ "result": "success", "doc": { "id": 1, "name": "Item 1" } }
```

_Example 2 - document with jsonpath query :_

```bash
curl -vg  http://localhost:3000/api/v1/storage/my-first-item.json?jsonpath=$.name
```

returns

```json
{ "result": "success", "doc": ["Item 1"] }
```

_Example 3 - directory:_

```bash
curl -vg  http://localhost:3000/api/v1/storage
```

returns

```json
{
  "result": "success",
  "isDirectory": true,
  "docs": [{ "name": "my-first-item.json" }]
}
```

_Example 4 - error:_

```bash
curl -vg  http://localhost:3000/api/v1/storage/items
```

returns

```json
{
  "result": "error",
  "message": "Entity not found",
  "path": "/api/v1/storage/items"
}
```

### Create / replace document

**POST `/api/v1/storage[resource path]`** - creates new document or replaces existing one. Will create missing directories if needed.

_Example 1:_

```bash
curl -v -XPOST -H 'Content-Type: application/json' -d '{"id": 1, "name":"Item 1"}' http://localhost:3000/api/v1/storage/my-first-item.json
```

returns

```json
{ "result": "success", "doc": { "id": 1, "name": "Item 1" } }
```

### Update / patch documents

**PATCH `/api/v1/storage[resource path]`** - updates existing document and returns result.\
More details on "json-patch" format here https://github.com/Starcounter-Jack/JSON-Patch and https://datatracker.ietf.org/doc/html/rfc6902

Parameters:

- **format** - (optional - default = json) - `json|json-patch` defines format of the patch

_Example 1 - using json (default) format:_

```bash
curl -vg  curl -v -XPATCH -H 'Content-Type: application/json' -d '{"sub-items":[]}' http://localhost:3000/api/v1/storage/my-first-item.json
```

returns

```json
{ "result": "success", "doc": { "id": 1, "name": "Item 1", "sub-items": [] } }
```

_Example 2 using json-patch format:_

```bash
curl -v -XPATCH -H 'Content-Type: application/json' \
  -d '[{"op":"add","path":"/sub-items/-","value":"one"},{"op":"add","path":"/description","value":"Item 1 description"}]' \
  http://localhost:3000/api/v1/storage/my-first-item.json?format=json-patch
```

returns

```json
{
  "result": "success",
  "doc": {
    "id": 1,
    "name": "Item 1",
    "sub-items": ["one"],
    "description": "Item 1 description"
  }
}
```

### Removes document / directory

**DELETE `/api/v1/storage[resource path]`** - removes specified document or directory.

_Example 1:_

```bash
curl -v -XDELETE http://localhost:3000/api/v1/storage/my-first-item.json
```

returns

```json
{ "result": "success" }
```

## External resources

- https://github.com/JSONPath-Plus/JSONPath
- https://github.com/Starcounter-Jack/JSON-Patch
- https://datatracker.ietf.org/doc/html/rfc6902
