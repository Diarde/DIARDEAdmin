import {Option, some, none} from 'fp-ts/lib/Option';

export class OptionMap<T, W> {

  private _map: Map<T, W> = new Map();

  constructor() {

  }

  public set(key: T, value: W): OptionMap<T, W> {
    this._map.set(key, value);
    return this;
  }

  public get(key: T): Option<W> {
    const value = this._map.get(key);
    return value ? some(value) : none;
  }

  public delete(key: T): boolean {
    return this._map.delete(key);
  }

  public forEach(func: (value: W, key: T) => void) {
    this._map.forEach(func);
  }

  public clear() {
    this._map.clear();
  }

  public has(key: T): boolean {
    return this._map.has(key);
  }

}

export const  mapToOptionMap = <T, K, V>(func: (T) => [K, V]): ((array: Array<T>) => OptionMap<K, V>)  => {
    return (array: Array<T>) => {
    const retMap = new OptionMap<K, V>();
    array.forEach(elem => {
      const [key, value] = func(elem);
      retMap.set(key, value);
    });
    return retMap;}
  }
  
