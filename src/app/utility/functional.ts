import { Option, isSome, map, chain } from "fp-ts/lib/Option";

export function block_old<T, W>(
  value?: T
): { let: (func: (value: T) => W, _else?: () => W) => W } {
  return {
    let:
      value !== null && value !== undefined
        ? (func: (value: T) => W, _else?: () => W) => func(value)
        : (func: (value: T) => W, _else?: () => W) => {
            return _else !== null ? _else() : (() => null as W)();
          },
  };
}

export function ifblock_old<W>(
  condition: boolean
): { let: (_do: () => W, _else: () => W) => W } {
  return {
    let:
      condition === true
        ? (_do: () => W, _else: () => W) => _do()
        : (_do: () => W, _else?: () => W) => {
            return _else();
          },
  };
}

export const mapNotNone = <T, W>(
  func: (T) => Option<W>
): ((array: Array<T>) => Array<W>) => {
  return (array: Array<T>) => {
    const retArray: Array<W> = [];
    array.forEach((elem) => {
      map((x: W) => {
        retArray.push(x);
      })(func(elem));
    });
    return retArray;
  };
};

export const block = <T, W>(
  func: (value: T) => W,
  _else?: () => W
): ((value?: T) => W) => {
  return (value?: T) => {
    return value !== null && value !== undefined
      ? func(value)
      : _else !== null
      ? _else()
      : null;
  };
};

export const ifblock = <W>(
  _do: () => W,
  _else?: () => W
): ((condition: boolean) => W) => {
  return (condition: boolean) => {
    return condition
      ? _do()
      : _else !== null
      ? _else()
      : null;
  };
};

export const accumulateOption = <W>(arr: Array<Option<W>>): Option<Array<W>> => {
  const array = Array.from(arr);
  const recursive = (array: Array<Option<W>>): Option<Array<W>> => {
    if(array.length > 1){
      const elem: Option<W> = array.pop();
      return chain<W, W[]>((elem: W) => 
        map((arr: Array<W>) => {
          arr.push(elem);
          return arr;
        })(recursive(array))
      )(elem);
    }
    return map((a: W) => [a])(array.pop());
  }
  return recursive(array);
} 
