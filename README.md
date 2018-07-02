<h1 align="center"><strong>Label Editor for MJ Traceability Software</strong></h1>

<br />

<div align="center">This editor allows printing of inventory data taken from a URL query string.</div>

## Requirements
You'll need to first install prisma and pm2
```
npm install -g prisma
npm install -g pm2
```

## Getting started

```sh
# 1. Clone repo
$ git clone https://github.com/kybak/label-editor.git && cd label-editor

# 2. Install dependencies and start process
$ npm install && pm2 start --name "client" npm -- start

# 3. Navigate into the `server` directory, initialize and start server
$ cd server && npm install && prisma deploy
$ pm2 start --name "server" npm -- start
# or yarn dev which starts a GraphQL Playground at localhost:4000:playground
$ yarn dev
```