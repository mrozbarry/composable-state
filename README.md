# Compose State

A composable set of tools for deeply updating immutable state objects.

## What's it for?

The best usage for `compose-state` is when you have large and deeply nested state objects that you are treating as immutable.
This could be your application's state, or maybe a json response from an API call.
Wherever you get your data from, if you want to keep the original immutable, use `compose-state` to make new/updated copies.

## Tell me more

 - **declarative** - describe how you want to update your state.
 - **simple** - not a lot of methods to learn.
 - **composable** - combine these tiny state update methods to make clean and concise methods.

## Install

```bash
npm install --save compose-state

# or

yarn add compose-state
```

## Usage

```javascript
import { compose, selectAll, replace, map } from 'compose-state';

const myState = {
  some: { state: { with: { deep: { properties: false } } } },
  and: { arrays: [1, 2, 3, 4] },
};

const immutableCopyOfState = compose(myState, selectAll({
  'some.state.with.deep.properties': replace(old => !old),
  'and.arrays': map(value => value * 3),
}));
/*
result:

{
  some: { state: { with: { deep: { properties: true } } } },
  and: { arrays: [3, 6, 9, 12] },
}

*/
```

## All methods:

 - Entry points:
   - `compose`
 - Actions:
   - `merge`
   - `concat`
   - `setIn`
   - `replace`
   - `select`
   - `selectAll`
   - `collect`
   - `map`
   - `range`

### compose

```javascript
import { compose, replace } from 'compose-state';

const immutableCopyOfStateWithUpdates = compose(
  yourState,
  replace({ hello: 'world' }),
);
```

The compose method is the part that takes in your original state, and returns a new copy of it with the immutable changes you describe in the second parameter.

### replace

```javascript
import { compose, replace } from 'compose-state';

// Usage #1 - replace with a completely different value

compose('hello', replace('goodbye')); // goodbye
compose(123, replace(false)); // false

// Usage #2 - replace with a callback; use previous value to create new value

compose(1, replace(old => old + 5)); // 6
compose(true, replace(old => !old)); // false
```

Replace is meant to replace the value of the current state context.

### merge

```javascript
import { compose, merge } from 'compose-state';

compose({ foo: 'bar' }, merge({ fizz: 'buzz' })); // { foo: 'bar', fizz: 'buzz' }
```

Merge will spread a new object into and over the current state context.
The object inside `merge` takes prescendence over the original.

### concat

```javascript
import { compose, concat } from 'compose-state';

compose([1, 2], concat([3, 4])); // [1, 2, 3, 4]
```

Concat will append the current state context array with the array value inside concat.

### setIn

```javascript
import { compose, setIn } from 'compose-state';

compose({ hello: 'friend' }, setIn('hello', 'world')); // { hello: 'world' }
compose([12, 13, 99, 15], setIn(2, 14)); // [12, 13, 14, 15]
```

SetIn lets you update a single child value of the current state context, without changing the context.
This is useful for updating single values inside objects or arrays without extra spreads. 
If you have multiple child updates to do on an object, consider using `merge`.
If you have multiple child updates to do on an array, consider using `map` and/or `range`.

### select

```javascript
import { compose, select, replace } from 'compose-state';

compose({ hello: 'friend' }, select('hello', replace('world'))); // { hello: 'world' }
compose({ { a: [{ b: true }] }, select('a.0.b', replace(old => !old))); // { a: [{ b: false }] }
```

Select allows you to dig into your state to perform updates.
You can specify a deep path using `'.'` as a delimiter for properties of your objects.
Selecting a deep path creates a state context, and it allows you to perform other immutable operations within the current context.

### selectAll

```javascript
import { compose, selectAll, replace } from 'compose-state';

const initialState = {
  greeting: 'Hi',
  user: {
    name: 'Anonymous',
  },
};

compose(initialState, selectAll({
  'greeting': replace('Hello'),
  'user.name': replace('mrozbarry'),
})); // { greeting: 'Hello', user: { name: 'mrozbarry' } }
```

SelectAll works much like select, but gives you the ability to do multiple deep operations on a single state context.

### collect

```javascript
import { compose, collect, replace, concat } from 'compose-state';

const userState = {
  picture: null,
  details: {
    name: null,
  },
};

compose(userState, collect([
  setIn('picture', replace('https://placehold.it/64x64')),
  select('details.name', replace('mrozbarry')),
])); // [16, 32]
```

Collect lets you do multiple immutable updates within the same state context.

### map

```javascript
import { compose, map, replace } from 'compose-state';

const initialState = [{ id: null, name: null }, { id: null, name: null }];

compose(initialState, map((user, index) => collect([
  setIn('id', Math.ceil(Math.random() * 999)),
  replace((user) => merge({ name: `AnonymousUser_${user.id}` })),
]))); // [{ id: 123, name: 'AnonymousUser_123' }, { id: 2, name: 'AnonymousUser_2' }]
```

Map allows you to iterate over a state context array, and immutably update each item.
You can, of course, chain in more compose-state methods to do even more complex updates.

### range

```javascript
import { compose, range } from 'compose-state';

// Can insert items into the middle of an array
compose([1, 2, 5, 6], range(2, 0, replace([3, 4]))); // [1, 2, 3, 4, 5, 6]

// Can remove items from the middle of an array
compose([1, 2, 99, 100, 3, 4], range(2, 2, replace([]))); // [1, 2, 3, 4]

// Can update items
compose([1, 2, 3, 4], range(0, 3, map(value => value * 5)); // [5, 10, 15, 4]
```

Range gives you the ability to operate on a subsection of an array.
You specify the startIndex, length, and action to run on those items.
