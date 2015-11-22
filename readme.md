# Banana Collection

Banana Collection is a collection written in Typescript of data structures for web development.

BC is typed. It should be used in Typescript. BC tries to implement
some functions in Backbone

# Usage

## Event

### class Event<modelType, argsType>

```
var evt: BC.Event<string, any> = new BC.event<string, any>;
```

### Event::on( (modelType, argsType) => void )

Event::on is equal to Event::bind

```
evt.on((m: string, args: any) => {
    console.log(m);
    console.log(args.time);
});
```

### Event::trigger(modelType, argsType)
```
console.log(new Date());

setTimeout( () =>{ evt.trigger("times up", {time: new Date()}) }, 3);
```

## Model

### class Model

here is an example

```
class User extends Model {
    event_sync: Event<User, any>;
    private _name: string

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
        this.event_changed.trigger(this, {
            changedKey: "name",
            changedValue: newName
        });
    }

    sync(): {
        // do something to sync
        this.event_synv.trigger(this, null);
    }
}
```

I recommend that the name of event property of subclass of Model
should start with `event_`.

### Embedded property

 - cid: number
 - event_changed: Event<Model, any>
 - event_error: Event<Model, any>
 - event_invalid: Event<Model, any>


## Collection

### class Collection<T extends Model>

There are some embedded properties

 - event_add: Event<Collection<T>, any>;
 - event_remove: Event<Collection<T>, any>;
 - event_update: Event<Collection<T>, any>;
 - event_sort: Event<Collection<T>, any>;

### Collection::add(T, AddOption?): void

`options` takes two property.

when options.at is set, the object whould be inserted at the position.
when options.merge is set, the object would be merged to the original object
in the collection with the same cid

### Collection::each((obj: T) => void)

iterate each object in the collection.

### Collection::max((a: T, b: T) => number): T

return the max item in the collection according to the comparator.

A comparator is passed to the function.

if a > b, the comparator should return a number > 0.

if a == b, the comparator should return a number == 0.

if a < b, the comparator should return a number <0.

### Collection::min((a: T, b: T) => number): T

return the min item in the collection according to the comparator.

### Collection::push(T): void

push an item to the end of the collection.

### Collection::pop(): T

return and remove the last item of the collection.

### Collection::shift(): T

return and remove the first item of the collection.

### Collection::at(number): T

return the item of the collection by the index is given.

### Collection::remove(T)

remove the item in the collection which has the same cid of the object is given

### Collection::getById(number)

return the item has the cid which is given.

### Collection::length

a property return the length of the collection.
