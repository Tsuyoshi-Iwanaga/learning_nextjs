---
title: 'TypeScript'
date: '2021-10-18'
---

## TypeScriptの概要

AltJSと呼ばれる言語の一種
JavaScritのスーパーセットと言われている

MicroSoftが開発しており、VSCodeでのサポートが進んでいる
また公式サイトのplaygroundを使っても簡単に試すことができる
https://www.typescriptlang.org/play

```shell
npm install -g typescript
```

```shell
tsc hello.ts
```

tscコマンドを使うこともできるが、**tsconfig.json**を設定ファイルとして配置することで可読性を高く保つことができる

## 変数/データ型

### let命令

TypeScriptではJavaScriptと異なり未宣言の変数に対して値を代入することができない
指定できる型にはいくつかあり、まず以下は**基本型(プリミティブ型)**と言われる

```typescript
let name: string = 'hello' //文字列型
let num: number = 123 //数値型(整数/浮動小数点数)
let boo: boolean = false //真偽型(true/false)
let symbol1: symbol = Symbol(); //シンボル型
```

その他は**オブジェクト型**として分類され、**配列型、タプル型、クラス型、インターフェース型、関数型**などがある
またなんでもありの**any型**というものもある

### 基本的な宣言

```typescript
let data: string = 'hoge'
data = 'foo'
data = 100 //エラー
```

### 暗黙的な宣言

型の指定が省略された場合、代入された初期値から型を推論する(型推論)

```typescript
let data = 100 //ここでdataは数値型に推論される
data = 150
data = 'hoge'//数値型なのでエラー
```

### any型

anyを型にすると全ての型のデータを代入することができる
ただしTypeScriptのメリットが失われるのであまり使わない方が良い

```typescript
let data: any = 100;
data = 150
data = 'hoge'
```

型と初期値を両方省略するとその変数はany型になる
ただし上記の理由もありletでは**常に初期値を設定する**のがベストプラクティス

```typescript
let data
data = 150
data = 'hoge'
```

### 初期値がnull/undefinedである場合

初期値としてnullやundefinedを指定した場合、undefinedやnull型ではなくany型になる

```typescript
let data = undefined
data = 150 //エラーにならない
data = 'hoge' //エラーにならない
```

ただしany型ではあるが、**noImplicitAny**オプションが有効な場合は後から代入された型で推論される
それによって後から代入してもNumber型やString型のメソッドを呼ぶことができる

```typescript
let data
data = 10.5
console.log(data.toFixed(0))
data = 'hoge'
console.log(data.charAt(0))
```

### リテラル表現

#### 数値リテラル

```typescript
let num = 123
let num2 = 0.55
let num3 = 100_000_000
let num4 = 0xFF
let num5 = 0o666
let num6 = 0b1110001
let num7 = 3.5e5
```

#### 文字列リテラル

```typescript
let mail: string = 'hoge'
let mail = "hoge"
let mail = `hoge ${hoge}`//テンプレート文字列
```

### 型アサーション(キャスト)

互換性のある型であれば**<型>**という記述を変数/リテラルの前に付与すると型を明示的に変換できる
もしくは**as 型名**でも同じようにできる

```typescript
function show(result: string) {
  return `result is ${result}`
}
console.log(show(<any>100))
console.log(show(100 as any))
```

### var命令

letとは別にvar命令もある
ただしこれはJavaScriptとの互換性を担保するためのもので**一般的にletを使うべき**

varはブロックスコープを認識しないのでforやifブロック外でもアクセスできる

```typescript
if(true) {
  var i: number = 1
}
console.log(i)//アクセスできる(letで宣言すると未定義エラーになる)
```

letは同じスコープ内では重複した変数宣言を認めない

```typescript
let x: number = 1
let x: number = 10 //エラー(varではエラーにならない)
```

### const命令

一度格納したら後から変更できない定数を宣言する、よって宣言時に初期値を必ず代入する必要がある
letと同じくブロックスコープを認識する

```typescript
const DATA: number = 100
DATA = 108 //エラー
```

ただし、定数とはいえ再代入できないのであり、変更できないわけではない
つまり定数の中身が配列などであれば配列の要素は問題なく変更することができてしまう
（この事情はオブジェクトのプロパティの変更なども同様）

```typescript
const DATA = [1, 2, 3]
DATA = [10, 2, 3] //これはエラー
```

```typescript
const DATA = [1, 2, 3]
DATA[0] = 10
console.log(DATA) //エラーにならず[10, 2, 3]
```

## 配列/連想配列/列挙型/タプル

複数の値をまとめて扱う場合に使えるデータ型がいくつか存在する
なおこれらの型は全てオブジェクト型に分類される

### 配列型

```typescript
let data: string[] = ['Java', 'Python', 'PHP', 'JavaScript']
console.log(data[0])//Java
```

ジェネリックを使って書くこともできる

```typescript
let data: Array<string> = ['Java', 'Python', 'PHP', 'JavaScript']
console.log(data[0])//Java
```

多次元配列はこのようにする

```typescript
let data: number[][] = [[10, 20], [30, 40]]
console.log(data[0][1])//20
```

読み取り専用の配列を**readonly**で定義することもできる

```typescript
let data: readonly string[] = ['Java', 'Python', 'PHP', 'JavaScript']
data[0] = 'Ruby'//エラー
```

ただしreadonlyでは一次元までしかチェックされない

```typescript
let data: readonly number[][] = [[10, 20], [30, 40]]
data[0][1] = 200
console.log(data)//[[10, 200], [30, 40]] 
```

###  連想配列

一般的な配列は数値キーで要素を管理するのに対し、文字列などの意味があるキーで管理するのが連想配列
JavaScriptではハッシュともいう

```typescript
let obj: { [index: string]: string } = { //インデックスシグネチャ(indexの部分は任意)
  'hoge': 'ほげ',
  'foo': 'ふぅ',
  'bar': 'ばぁ',
}
console.log(obj.hoge)//ほげ
console.log(obj['hoge'])//ほげ
```

ただし型を明示的に指定しない場合は**連想配列ではなくオブジェクトの型として推論**される
(つまりhoge/foo/barという文字列型のプロパティを持ったオブジェクト型となるので以下のように新しいプロパティを追加しようとした時はエラーになる)

```typescript
let obj = {
  'hoge': 'ほげ',
  'foo': 'ふぅ',
  'bar': 'ばぁ',
}
obj.piyo = 'ぴよ' //エラー
```

JavaScript(TypeScript)は連想配列とオブジェクトとの厳密な区別がないためこのような問題が起きる
連想配列を使うときはインデックスシグネチャによる型宣言が必須になると覚えておく

### 列挙型

列挙型に属する定数を**列挙子**といい、規定では0, 1, 2...と数値が振り分けられる

```typescript
enum Sex {
  MALE,
  FEMALE,
  UNKNOWN,
}
let m: Sex = Sex.MALE
let mi: string = Sex[0]
console.log(m) // 0
console.log(mi) // MALE
console.log(Sex[Sex.MALE]) // MALE
```

列挙子に任意の値を割り当てるにはこうする

```typescript
enum Sex {
  MALE = 1,
  FEMALE = 2,
  UNKNOWN = 4,
}

enum Sex {
  MALE = "male",
  FEMALE = "female",
  UNKNOWN = "unknown",
}
```

### タプル型

タプルとは複数の異なる型の集合を表現するデータ型
配列リテラルのように[type1, type2 ... ]と指定する

```typescript
let data: [string, number, boolean] = ['hoge', 10.355, false]
console.log(data[0].substring(2))//ge
console.log(data[1].toFixed(1))//10.4
console.log(data[2] === false)//true
```

タプルは濫用しないのが賢明で、一般的にはクラス/インターフェースを利用した方が良い
(例えばshiftメソッドなどで要素が削除されてもデータ型には反映されない)

ちなみにタプルもreadonlyで読み取り専用にできる

```typescript
let data: readonly [string, number, boolean] = ['hoge', 10.355, false]
```

## 関数

JavaScript(TypeScript)では関数の定義方法は大きく3つある

* function命令
* 関数リテラル
* アロー関数

```typescript
function triangle(base: number, height: number): number {
  return base * height / 2
}
console.log(triangle(10, 5)) //25
```

以下では関数リテラルによってtriangle変数に代入している
ここでは2つの数値型の引数を受け取り数値型のデータを返すfunction型と推論される

```typescript
let triangle = function(base: number, height: number): number {
  return base * height / 2
}
console.log(triangle(10, 5)) //25
```

明示的に型を記載するとすればこうなる (param: ptype, ...) => rtype

```typescript
let triangle: (base: number, height: number) => number = function(base: number, height: number): number {
  return base * height / 2
}
```

アロー関数はこのように記載する

```typescript
let triangle = (base: number, height: number): number => base * height / 2
```

アロー関数ではthisが束縛されるが、これに関連してnoImplicitThisオプションが有効になっている場合、any型thisを許容しない。そこで引数リストの先頭で明示的にany型のthisを宣言する方法がある

```typescript
let Counter = function(this: any) {
  this.count = 0
  setInterval(() => { this.count++ }, 1000)
}
```

### void

値がないことを意味する型、関数が戻り値を返さないときにそれを表現するために使用する

```typescript
function greet(name: string): void {
  console.log(`Hello ${name}`)
}
```

### never

決して関数の終端に辿り着かないことを表現する型
値を返さない(void)ではなく関数が常に例外を発生させる、無限ループになるなどが該当する場面

```typescript
function hoge(): never {
  throw new Error('Error is occured')
}
function eternal(): never {
  while(true) {...}
}
```

