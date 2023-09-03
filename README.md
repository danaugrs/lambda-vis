# Visualization of λ-Calculi Expressions

This project visualizes λ-calculi expressions as graphs.

### Usage

Start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.

### About the λ-calculi parser

The λ-calculi parser in `lib/parser.gen.ts` was generated using [tsPEG](https://www.npmjs.com/package/tspeg) (3.2.2) based on the grammar in `lib/lambda.grammar`.

```
npm install -g tspeg
tspeg lib/lambda.grammar lib/parser.gen.ts
```
