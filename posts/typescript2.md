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

