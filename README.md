# Deep Immutable

A composable set of tools for deeply updating immutable state objects.

## Summary

 - **declarative** - describe how you want to update your state.
 - **simple** - not a lot of methods to learn.
 - **composable** - combine these tiny state update methods to make clean and concise methods.

## Install

TBD

## Usage

```javascript
import update, { selectAll, replace, map } from 'deepImmutable';

const myState = {
  some: { state: { with: { deep: { properties: false } } } },
  and: { arrays: [1, 2, 3, 4] },
};

const immutableCopyOfState = update(myState, selectAll({
  'some.state.with.deep.properties': replace(old => !old),
  'and.arrays': map(value => value * 3),
}));

console.log(immutableCopyOfState);

/*
{
  some: { state: { with: { deep: { properties: true } } } },
  and: { arrays: [3, 6, 9, 12] },
}
*/
```

## All methods:

 - Entry points:
   - `update`
 - Actions:
   - `merge`
   - `concat`
   - `setIn`
   - `replace`
   - `select`
   - `selectAll`
   - `collect`
   - `map`


### update

This is the default export.

```javascript
import update, { replace } from 'deepImmutable';

const immutableCopyOfStateWithUpdates = update(
  yourState,
  replace({ hello: 'world' }),
);
```

The update method is the part that takes in your original state,
and returns a new copy of it with the immutable changes you describe.

### replace

```javascript
import update, { replace } from 'deepImmutable';

// Usage #1 - replace with a completely different value

console.log(update('hello', replace('goodbye'))); // goodbye
console.log(update(123, replace(false))); // false

// Usage #2 - replace with a callback; use previous value to create new value

console.log(update(1, replace(old => old + 5))); // 6
console.log(update(true, replace(old => !old))); // false
```

Replace is meant to replace the value of the current state context.

### merge

```javascript
import update, { merge } from 'deepImmutable';

console.log(update({ foo: 'bar' }, merge({ fizz: 'buzz' }))); // { foo: 'bar', fizz: 'buzz' }
```

Merge will spread a new object into and over the current state context.
The object inside `merge` takes prescendence over the original.

### concat

```javascript
import update, { concat } from 'deepImmutable';

console.log(update([1, 2], concat([3, 4]))); // [1, 2, 3, 4]
```

Concat will append the current state context array with the array value inside concat.

### setIn

```javascript
import update, { setIn } from 'deepImmutable';

console.log(update({ hello: 'friend' }, setIn('hello', 'world'))); // { hello: 'world' }
console.log(update([12, 13, 99, 15], setIn(2, 14)))); // [12, 13, 14, 15]
```

SetIn lets you update a single child value of the current state context, without changing the context.
This is useful for updating single values inside objects or arrays without extra spreads. 
If you have multiple child updates to do on an object, consider using `merge`.
If you have multiple child updates to do on an array, consider using `map`.

### select

```javascript
import update, { select, replace } from 'deepImmutable';

console.log(update({ hello: 'friend' }, select('hello', replace('world')))); // { hello: 'world' }
console.log(update({ { a: [{ b: true }] }, select('a.0.b', replace(old => !old)))); // { a: [{ b: false }] }
```

Select allows you to dig into your state to perform updates.
You can specify a deep path using `'.'` as a delimiter for properties of your objects.
Selecting a deep path creates a state context, and it allows you to perform other immutable operations within the current context.

### selectAll

```javascript
import update, { selectAll, replace } from 'deepImmutable';

const initialState = {
  greeting: 'Hi',
  user: {
    name: 'Anonymous',
  },
};

console.log(update(initialState, selectAll({
  'greeting': replace('Hello'),
  'user.name': replace('mrozbarry'),
}))); // { greeting: 'Hello', user: { name: 'mrozbarry' } }
```

SelectAll works much like select, but gives you the ability to do multiple deep operations on a single state context.

### collect

```javascript
import update, { collect, replace, concat } from 'deepImmutable';

const userState = {
  picture: null,
  details: {
    name: null,
  },
};

console.log(update(userState, collect([
  setIn('picture', replace('https://placehold.it/64x64')),
  select('details.name', replace('mrozbarry')),
]))); // [16, 32]
```

Collect lets you do multiple immutable updates within the same state context.

### map

```javascript
import update, { map, replace } from 'deepImmutable';

const initialState = [{ id: null, name: null }, { id: null, name: null }];

console.log(update(initialState, map((user, index) => collect([
  setIn('id', Math.ceil(Math.random() * 999)),
  replace((user) => merge({ name: `AnonymousUser_${user.id}` })),
])))); // [{ id: 123, name: 'AnonymousUser_123' }, { id: 2, name: 'AnonymousUser_2' }]
```

Map allows you to iterate over a state context array, and immutably update each item.
You can, of course, chain in more deepImmutable methods to do even more complex updates.
