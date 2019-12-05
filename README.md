## Setup
```npm i```

## To execute
```npm run build && node ./src/<day>/<day>.js```

ex: ```npm run build && node ./src/02/02.js```

For some puzzles you might need to increase the heap size:

```npm run build && node --max-old-space-size=4096 ./src/03/03.js```
