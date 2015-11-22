/**
 * Created by Duzhong on 2015/11/22.
 */

export class Event<modelType, argsType>{
    name: string;
    private _list: Array<(models: modelType, args: argsType) => void>;
    constructor(name: string) {
        this.name = name;
    }

    on(callback: (model: modelType, args: argsType) => void ) {
        this._list.push(callback);
    }

    bind(callback: (models: modelType, args: argsType) => void) {
        this.on(callback);
    }

    trigger(models: modelType, args: argsType) {
        for (var i: number = 0; i < this._list.length; i++) {
            this._list[i](models, args);
        }
    }

}

export interface Attritube {
    [index: string]: any;
}

var id_count: number = 1;

function generateId(): number {
    return id_count++;
}

export class Model {
    cid: number;
    event_changed: Event<Model, any>;
    // event_request: Event<Model, any>;
    // event_sync: Event<Model, any>;
    event_error: Event<Model, any>;
    event_invalid: Event<Model, any>;

    constructor() {
        this.cid = generateId();

        this.event_changed = new Event<Model, any>("changed");
        // this.event_request = new Event<Model, any>("request");
        // this.event_sync = new Event<Model, any>("sync");
        this.event_error = new Event<Model, any>("error");
        this.event_invalid = new Event<Model, any>("invalid");
    }
}

export interface AddOption {
    at?: number;
    merge?: boolean;
}

export class Collection<T extends Model> {

    private _list: T[];

    event_add: Event<Collection<T>, any>;
    event_remove: Event<Collection<T>, any>;
    event_update: Event<Collection<T>, any>;
    event_sort: Event<Collection<T>, any>;

    constructor(obj_list?: T[]) {
        if (obj_list) this._list = obj_list;
        else this._list = new Array<T>();

        this.event_add = new Event<Collection<T>, any>("add");
        this.event_remove = new Event<Collection<T>, any>("remove");
        this.event_update = new Event<Collection<T>, any>("update");
        this.event_sort = new Event<Collection<T>, any>("sort");
    }

    add(obj: T, options?: AddOption): void {
        var insert_index: number = 0;
        if (options) {
            if (options.merge) {
                throw new Error("not implementd of merge option");
            }
            if (options.at) {
                insert_index = options.at;
            }
        }
        for (var i: number = 0; i < this._list.length; i++) {
            if (this._list[i].cid === obj.cid) return;
        }
        this._list.splice(insert_index, 0, obj);
        this.event_add.trigger(this, {newValue: obj});
        this.event_update.trigger(this, {newValue: obj});
    }

    /*
     add(obj_list: T[], option?: AddOption) {
     obj_list = _.uniq(obj_list);
     for(var i: number = 0; i < obj_list.length; i++) {
     this.add(obj_list[i], option);
     }
     }
     */
    each(callback: (obj: T) => void) {
        for (var i: number = 0; i < this._list.length; i++) {
            callback(this._list[i]);
        }
    }

    map(callback: (obj: T) => any): any[] {
        var result: any[] = new Array<any>();
        for (var i: number = 0; i < this._list.length; i++) {
            var r: any = callback(this._list[i]);
            result.push(r);
        }
        return result;
    }

    reduce(func: (previous: any, now: T, index: number) => void): any {
        var previous: any = null;
        for (var i: number = 0; i < this._list.length; i++) {
            previous = func(previous, this._list[i], i);
        }
        return previous;
    }

    max(comparator: (a: T, b: T) => number): T {
        if (this.length > 1) {
            var max:T = this._list[0];
            for (var i: number = 1; i < this._list.length; i++) {
                if (comparator(this._list[i], max) > 0) max = this._list[i];
            }
            return max;
        }
        else return this._list[0];
    }

    min(comparator: (a: T, b: T) => number): T {
        if (this.length > 1) {
            var min: T = this._list[0];
            for (var i: number = 1; i < this._list.length; i++) {
                if (comparator(this._list[i], min) < 0) min = this._list[i];
            }
        }
        else return this._list[0];
    }


    push(obj: T): void {
        for (var i: number = 0; i < this.length; i++) {
            if (this._list[i].cid === obj.cid) {
                return;
            }
        }
        this._list.push(obj);
        this.event_add.trigger(this, {newValue: obj});
    }

    pop(): T {
        var obj: T = this._list.pop();
        this.event_remove.trigger(this, {removedValue: obj});
        return obj;
    }

    shift(): T {
        if (this._list.length > 0) {
            var obj: T = this._list[0];
            this._list = this._list.slice(1);
            this.event_remove.trigger(this, {removedValue: obj});
            return obj;
        } else {
            return null;
        }
    }

    at(index: number): T {
        /*
         do not check if the index is in range
         the user should check it
         */
        return this._list[index];
    }

    remove(obj: T): void {
        var isRemoved: boolean = false;
        for (var i: number = 0; i < this._list.length; i++) {
            if (this._list[i].cid == obj.cid) {
                var removedValue: T = this._list[i];
                var front: T[] = this._list.slice(0, i);
                var back: T[] = this._list.slice(i+1);
                this._list = front.concat(back);
                isRemoved = true;
                this.event_remove.trigger(this, {removedValue: removedValue});
                break;
            }
        }
        if (isRemoved) this.event_update.trigger(this, null);
    }

    /*
    where(attritube: Attritube): T[] {
        var result_list: T[] = new Array<T>();
        for (var i: number = 0; i < this._list.length; i++) {
            var isit: boolean = true;
            for (var att in attritube) {
                var key: string = att;
                var t: Attritube = <Attritube>this._list[i];
                if (t[key] !== attritube[key]) {
                    isit = false;
                    break;
                }
            }
            if (isit) result_list.push(this._list[i]);
        }
        if (result_list.length === 0) return null;
        else return result_list;
    }

    findWhere(attritube: Attritube): T {
        for (var i: number = 0; i < this._list.length; i++) {
            var isit: boolean = true;
            var t: Attritube = <Attritube>this._list[i]
            for (var att in attritube) {
                if (t[att] !== attritube[att]) {
                    isit = false;
                    break;
                }
            }
            if (isit) return this._list[i];
        }
    }

*/
    getById(cid: number): T {
        for (var i: number = 0; i < this._list.length; i++) {
            if (this._list[i].cid === cid) {
                return this._list[i];
            }
        }
        return null;
    }

    sort(comparator?: (a: T, b: T) => number) {
        this._list.sort(comparator);
        this.event_sort.trigger(this, null);
    }

    get length(): number {
        return this._list.length;
    }
}
