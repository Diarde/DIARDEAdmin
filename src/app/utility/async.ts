import { Option, none, fold, some, isSome } from 'fp-ts/lib/Option';

export class Async<T>{

    private _value: Option<T> = none;
    private funcs = [];

    public let(func: (value: T) => any) {
        fold(
            () => { this.funcs.push(func) },
            (value: T) => { func(value); }
        )(this._value);
    }

    set value(value: T) {
        this._value = some(value);
        this.funcs.forEach(func => {
            func(value);
        });
        this.funcs = [];
    }

    get hasValue(): boolean {
        return isSome(this._value);
    }

}