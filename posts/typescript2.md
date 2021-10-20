---
title: 'TypeScript(発展)'
date: '2021-10-19'
---

## 型注釈としてインターフェイス

TypeScriptではインターフェイスを型注釈として利用することができる

```typescript
interface Car {
  type: string //プロパティシグネチャ
  run(): void //メソッドシグネチャ
}

let c: Car = {
  type: 'トラック',
  run() {
    console.log(`${this.type}が走る`)
  }
}

c.run() //トラックが走る
```

### オブジェクト型リテラル

インターフェイスを定義するまでもないが、型情報だけ明示しておきたいときはオブジェクト型リテラルを利用することができる

```typescript
let c1: {
  type: string
  weight: number
} = {
  type: '軽トラック',
  weight: 750
}
```

### プロパティシグニチャ

?とreadonlyを使うと省略可能なプロパティと読み取り専用プロパティを表すことができる

```typescript
interface Person {
  readonly name: string
  age?: number
}

let p: Person = { name: '田中太郎' } //ageは省略できる
p.name = '鈴木三郎' //読み取り専用プロパティへは代入できない
```

### コールシグネチャ

関数型を宣言する

```typescript
interface Calculate {
  (x: number, y: number): number
}

let add: Calculate = function(a: number, b: number): number {
  return a + b
}
```

### メソッドシグネチャ

メソッドの型を宣言するためのシグネチャ

```typescript
interface Calculate {
  add(x: number, y: number): number
}

let obj: Calculate = {
  add(a: number, b: number):number {
    return a + b
  }
}
```

※ メソッドは本質的には関数型のプロパティなのでこう書いてもいい

```typescript
interface Calculate {
  add: (x: number, y: number) => number
}
```

### インデックスシグネチャ

ブラケット構文での型を表す、連想配列での宣言は冗長になりがちなのでインターフェイスとして宣言しておくことがおすすめ

```typescript
interface NumberAssoc {
  [index: string]: number
}

let list: NumberAssoc = {
  'nundred': 100,
  'thounsand': 1000
}
```

### コンストラクターシグネチャ

newキーワードを使うとコンストラクターの型を定義できる

```typescript
interface Figure {
  new(width: number, height: number): Triangle
}

class Triangle {
  constructor(private width: number, private height: number) {}
}

let Tri: Figure = Triangle //new Triなどとできる
```

### 型の互換性

#### 関数の互換性

HogeはFooよりも制約が厳しいのでHoge型はFoo型の変数に代入できる(Hoge<Fooの互換性がある)
この状況において引数でHoge型を受け取る関数はFoo型を受け取る関数よりも制約が緩くなるはず

```typescript
interface Hoge {
  x: number
  y: number
}

interface Foo {
  x: number
}

let func1: (obj: Hoge) => void = (x: Foo) => {} //OK
let func2: (obj: Foo) => void = (x: Hoge) => {} //NG
```

```typescript
let func1: (str: string) => void = (x: string) = {}
let func2: (str: string, flag: boolean) => void = func1;
```

```typescript
list.forEach(function(value) { ... })
list.forEach(function(value, index, array) { ... })
```

#### オブジェクトリテラルでの互換性

以下の例ではPersonにてgenderプロパティは存在しない
ただしp1はname, ageを持っているので構造的部分型により問題ない

ただし、同じオブジェクトリテラルの場合はエラーになる
（TypeScriptから見るとオブジェクトリテラルはその場でしか使わないはずなのにPerson型で定義されていないgenderプロパティがあるのは間違いではないか？と判断されてしまう）

```typescript
interface Person {
  name: string
  age: number
}

function greet(p: Person): void {
  console.log(`Hello ${p.name}.`)
}

let p1 = {
  name: 'Jhon',
  age: 2,
  gender: 'female',
}

greet(p1) //これはOK
greet({ name: 'Jhon', age: 2, gender: 'female'}) //これはNGになる...
```

これを回避するには明示的に型アサーションで変換してあげる必要がある

```typescript
greet({ name: 'Jhon', age: 2, gender: 'female'} as Person) //これならOK
```

もしくはinterface側であらかじめ任意のプロパティを持つ可能性を持たせておく

```typescript
interface Person {
  name: string
  age: number
  [key: string]: any //何かしら任意のプロパティを持つ
}
```

### Weak Typeでの型チェック

全てのプロパティが省略可能(〜?)である型をWeak Typeと呼ぶ
メソッドの挙動を表すオプション情報としてよく利用されている

```typescript
interface MyOption {
  name?: string
  timeout?: number
}
```

通常の型とは異なる型チェックが施される点に気をつける
構造的部分型の考え方だとc1はOKのようにも思えるが、Weak Typeにおいてはプロパティが一つも一致しない場合を許容しては型チェックの意味がなくなるので**最低ひとつは一致すること**を条件にしている
(ただし全てのプロパティを省略したケースは許容する)

```typescript
let obj1 = { hoge: "TEST" }
let obj2 = {}
let obj3 = { name: "MyApp", hoge: "TEST" }

let c1: MyOption = obj1 //エラー
let c2: MyOption = obj2 //OK
let c3: MyOption = obj3 //OK
```

### keyofとLookup Typesによる型の切り出し

keyofやLookup Typesというのを使うと既存のある型から型情報を取り出すことができる

#### keyof

既存の型からプロパティ名の集合を取り出し、文字列リテラルとして返す

```typescript
interface Product {
  name: string
  price: number
}

type ProductKeys = keyof Product // "name"|"price"となる
```

```typescript
function getProp(obj: Product, name: keyof Product) {
  return obj[name]
} //nameにはProduct型のプロパティ名しか指定できなくなる
```

#### Lookup Types

特定の型から配下のプロパティ型を抜き出す
T[K]で**T型に属するKプロパティの型を取得**することができる

```typescript
interface Product {
  name: string
  price: number
}
type NameType = Product['name'] //string
type NamePriceType = Product['name'|'price'] //string|number
type HogeType = Product['hoge'] //プロパティがなければエラー
```

```typescript
function getProp<T, K extends keyof T>(obj: T, name: K) {
  return obj[name]
}

let p = { name:'お弁当', price: 500 }
console.log(getProp(p, 'name')) //お弁当
console.log(getProp(p, 'price')) //500
```

### Mapped Types

既存の型を変換するための仕組み、これにより既存の型を元に新しい型を定義できる

```typescript
interface Product {
  name: string
  price: number
}

type ReadonlyProduct = {
  readonly [K in keyof Product]: Product[K]
}
// こうなる
// type ReadonlyProduct = {
//   readonly name: string,
//   readonly price: number,
// }
```

```typescript
type OptionProduct = {
  [K in typeof Product]? : Product[K] //全てのプロパティをオプションにする
}
```

```typescript
type RemoveReadOnlyProduct = {
  -readonly [K in keyof ReadonlyProduct]: ReadonlyProduct[K] //全てのプロパティのreadonlyを外す
}
```

```typescript
type RemoveOptionProcut = {
  [K in keyof OptionProduct]-?: OptionProduct[K]
}
```

### Conditional Types

与えられた条件を満たすかどうかでX, Yいずれかの型を選択するというもの
**T extends U ? X : Y**のような記法で表す
(型Tが型Uに代入できる場合は型X, そうでなければ型Yという意味になる)

```typescript
type Intersection<T, U> = T extends U ? T : never

type CommonType = Intersection<string | boolean | number, boolean | string[] | string>
```

上記の一行目ではTがUに代入できればT型を、できなければnever型を返すと宣言している
共用型の場合は判定の際に分解されるので最終的にstring | boolean | never、すなわちstring | boolean型と判定される

#### inferによる型のマッチング

型マッチングを表現するためにはinferキーワードを使用する

```typescript
type ReturnedType<T> = T extends (...args: any[]) => infer R ? R : T
```

inferはextendsの条件句内でマッチした型を**一時的に保存しておき**、後に続く結果句で使用できる(ここではR)
つまり上記は型Tが関数型であればその戻り値の型を、そうでなければ元の型Tを返すという意味になる

### ユーティリティ型

Mapped Types / Conditional Typesは型を再定義するのに強力な仕組みではあるが、何しろ可読性が悪くなる
TypeScriptではよくある型定義を簡単に使うことができるようにユーティリティ型(Utility Types)と呼ばれる型を提供している（別名では**型関数**とも呼ばれている）

#### Partial

```typescript
interface MyConfig {
  title: number
  debug: boolean
}
type MyConfigOption = Partial<MyConfig> //前プロパティを任意型に(~?)
```

#### Required

```typescript
type myConfigRequired = Required<MyConfig>
```

#### Readonly

```typescript
interface Article {
  url: string
}
let a: Readonly<Article> = {
  url: "https://hogehoge.com/"
}
```

#### Record

```typescript
interface ContentInfo {
  url: string
  title: string
  count: number
}
//Record<K, T>でK型で指定されたプロパティをもち、かつそのプロパティがT型になるような型を作る
let mySite: Record<'top' | 'content' | 'about', ContentInfo> = {
  top: { url: 'index.php', title: 'トップ', count: 100 },
  content: { url: 'mail.php', title: '問い合わせ', count: 105 },
  about: { url: 'me.php', title: '概要', count: 108 },
}
```

#### Pick / Omit

```typescript
interface Book {
  isbn: string
  title: string
  price: number
  published: Date
}
// Pick<T, K>でT型から指定のプロパティ群Kだけを抜き出す
type SubBook = Pick<Book, 'title'|'price'>
// Omit<T, K>でT型から指定のプロパティ群Kを除く
type SubBook2 = Omit<Book, 'isbn'|'published'>
```

#### Exclude / Extract

```typescript
type Type1 = string | number | boolean
type NewType1 = Exclude<Type1, string | boolean> //Exclude<T, U>Tから指定の型Uを除外
type NewType2 = Extract<Type1, string | object> //Extract<T, U>TとUに共通する型を抽出
```

#### NonNullable

```typescript
typeType2 = string | number | undefined | null
typeNonNullableType2 = NonNullable<typeType2> //string | number
```

#### Parameters / ReturnType / ConstructorParameters

```typescript
function hoge(arg1: string, arg2?: boolean): string | number { ... }

//Parameter<T> 与えられた関数型の引数を元にタプル型を作って返す
type TypeP = Parameters<typeof hoge>

//ReturnType<T> 関数型の戻り値の型を新しい型として返す
type TypeR = ReturnType<typeof hoge>

//ConstructorParameters<T> コンストラクターの引数を元にタプル型を返す
class MyClass {
  constructor(arg1: string, arg2?: boolean) { ... } 
}
type TypeC = ConstructorParameters<typeof MyClass>
```

