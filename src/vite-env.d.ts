/// <reference types="vite/client" />

declare namespace UTIL {
  /** 判断是否为 never 类型 */
  type IsNever<T> = [T] extends [never] ? true : false;

  /** 判断两个类型是否相同 */
  type IsSameType<TA, TB> = TA extends TB
    ? TB extends TA
      ? true
      : false
    : false;

  /** 判断是否为 number 字面量类型 */
  type isLiteralNumber<N> = IsNever<N> extends true
    ? false
    : IsSameType<number, N> extends true
    ? false
    : true;

  type FixedArray<
    T = any,
    Len extends number = 6,
    List extends Array<T> = []
  > = isLiteralNumber<Len> extends false
    ? List
    : List["length"] extends Len // 判断 `List['length']` 是否等于 `Len`
    ? List // 是就返回 List 本身
    : FixedArray<T, Len, [...List, T]>; // 不是就递归，注意传入的数组添加了新的元素 T
}
