# pipe-fun

> Build and compose pipelines with ease

## Install

```sh
npm install -S pipe-fun
```

## Usage

```ts
import {_, pipe} from 'pipe-fun';

const pipeline = pipe(() => ({name: 'John Smith'}), user => user.name);

await pipeline(_);
//=> John Smith
```
