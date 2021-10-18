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

### 省略可能な引数

基本的にはTypeScriptは宣言された引数は全て必須(JavaScriptでは全てが省略可能)
よって引数を省略したい場合は仮引数の後方に?を付与する

```typescript
function showTime(time?: Date): string {
  if(time === undefined) {
    return new Date().toLocaleString()
  } else {
    return time.toLocaleString()
  }
}
console.log(showTime())
```

### 引数に規定値を設定する

引数が省略される場合は関数内で分岐するよりもこちらの方がシンプル

```typescript
function showTime(time: Date = new Date()): string {
  return time.toLocaleString()
}
console.log(showTime())
```

* 任意引数の後ろに必須引数を置くことはできない
* 規定値には式も指定可能
* 引数にundefinedを指定して関数を呼び出すと、明示的に引数を省略したとみなされる
* 引数にnullを指定して関数を呼び出すと、規定値は適用されない（nullは値がないという状態を示す）

### 可変長引数

仮引数の前に...をつけることで可変長引数となる
任意の個数の引数を配列としてまとめて受け取ることができる機能

```typescript
function sum(...values: number[]) {
  let result = 0
  for (let value of values) {
    result += value
  }
  return result
}
console.log(sum(1, 5, -8, 10))//8
```

### 関数のオーバーロード

オーバーロードとは同じ名前でありながら、引数リストや戻り値の型が異なる関数を定義すること

シグニチャを指定することで型チェックが行われ、例えば下記の文字列を引数に渡して関数を実行しようとすると静的エラーとして検出できるようになる(anyだけだとこの場合はエラーにならない)

```typescript
function show(value: number): void
function show(value: boolean): void
function show(value: any): void {
  if (typeof value === 'number') {
    console.log(value.toFixed(0))
  } else {
    console.log(value ? '真' : '偽')
  }
}
show(10.387)
show(false)
show('ほげ')
```

## 高度な型

### 共用型(Union Types)

複数の型のうちのどれか、を表す型

```typescript
let data: string | boolean
data = 'hoge'
data = false
data = 1 //エラー
```

下記は計算の結果、正の数なら数値型を、負の数ならfalse(真偽値型)を返却する関数

```typescript
function square(value: number): number | boolean {
  if (value < 0) {
    return false
  } else {
    return Math.sqrt(value)
  }
}
console.log(square(9)) //3
console.log(square(-9)) //false
```

オーバーロードの使用する場合もこの共用型を使うとシンプルに記載することができる場合がある

### 型ガード

型ガード(Type Guards)とは変数の型を判定することで、対象となった変数の型を特定する機能

```typescript
function process(value: string | number) {
  return value.toUpperCase() //number型にないメソッドなのでエラー
}
```

```typescript
function process(value: string | number) {
  if(typeof value === 'string') {
    return value.toUpperCase()
  }
  //値を返さない場合があるとしてエラーになる(numberの時)
}
```

```typescript
function process(value: string | number) {
  if(typeof value === 'string') {
    return value.toUpperCase()
  } else {
    return value.toFixed(1)
  }
}
```

### instanceof / in 演算子

typeof演算子はプリミティブ型の判定にしか使えない
クラス型の判定にはinstanceof演算子を使う

```typescript
if(obj instanceof Person) { ... } //objはPerson型であるかどうか
```

またin演算子で特定のメンバーが存在するかを判定し、型ガードとすることも可能

```typescript
if('name' in obj) { ... } //objがnameプロパティを持っているかどうか
```

### ユーザ定義の型ガード関数

型判定のための関数を型ガードとして利用することもできる

```typescript
function isBook(inf: Book | Magazine) : inf is Book { //返り値を「引数 is 型名」にする
  return (inf as Book).isbn !== undefined
}

let i = getInfo()　//BookかMagazineのインスタンスが返されるとする

if(isBook(i)) {
  console.log(i.isbn)
} else {
  console.log(i.mcode)
}
```

TypeScriptで型ガード関数として使用するための条件は戻り値を**引数 is 型名**にする

### unknown型

unknown型はいわゆるなんでもありの型(中身が何かわからないのでなんでも受け入れる)

```typescript
let data: unknown = 10
data = 'Hoge'
data = [true, false, true]
```

any型と似ているが、下記はエラーになる

```typescript
let str: unknown = 'Hoge'
console.log(str.trim())
```

any型はなんでもありなので変数に値を入れた後どんな操作をしても無制限に許容してしまう
一方unknown型は「何かわからない = なんでもありうる」という意味なのでメソッドや演算子の呼び出しを許容しない

よってunknown型に格納したデータは型ガードを使って型を特定した後でなければ使用することはできない
この仕組みによりunknown型は型安全なany型と言える

```typescript
let str: unknown = 'Hoge'
if(typeof str === 'string') {
  console.log(str.trim())
}
```

### null非許容型

TypeScriptでは規定では全ての型に対してnull/undefinedを代入することができるが、tsconfig.jsonの設定にて**strictNullChecks**をtrueにすると全ての型でnull/undefinedを禁止することができる(null非許容型)

この状態でnull/undefinedを受け付けるためには下記のように共用型を使用する必要がある

```typescript
let data1: string | undefined = undefined
let data2: string | null = null
```

また上記のようなnull許容型のメンバーを扱う際に便利な演算子が存在する
例えば以下のように型チェックをしているコードがあるとする
（nullもしくはundefinedでない場合にだけそのメンバーにアクセスし、そうでなければundefinedを返す）

```typescript
let hoge: string | null | undefined
let result = (hoge === null || hoge === undefined) ? undefined : hoge.trim()
```

**?演算子**を使うとこのようにシンプルに記載できる

```typescript
let result = hoge?.trim()
```

またundefinedやnullの場合に規定の値を返すような場合には**??演算子**を使うことができる

```typescript
console.log(hoge??'x') //hogeがあればhoge、undefined/nullなら’x’を返す
```

### 型エイリアス

特定の型に対して別名を設定するための仕組み
主にタプル型や共用型に短い名前をつける目的で使用される

```typescript
type FooType = [ string, number, boolean ]
let data: FooType = ['abc', 123, true]
```

### 文字列リテラル型

文字列リテラル(特定の文字列)をそのまま型として利用できる
これを使うと特定の文字列のみを受け入れる変数を宣言できる

```typescript
type Season = 'spring' | 'summer' | 'autumn' | 'winter'
function getSeason(s: Season) { ... }

getSeason('spling')
getSeason('fall') //エラー
```

### その他のリテラル型

文字列に限らずnumber, boolean, enumなどでもリテラル型が使用できる

```typescript
type FalsyType = '' | 0 | false | null | undefined
```

```typescript
type DiceType = 1 | 2 | 3 | 4 | 5 | 6
```

```typescript
enum Subject { JAPANESE, MATH, SCIENCE, SOCIAL_STUDY, ENGLISH }
type SciencePart = Subject.MATH | Subject.SCIENCE //理系科目だけの型
```

### リテラル型と型推論

letとconstでは型推論のときにどのような型が割り当てられるかが異なる
letは後から変更される可能性があるため下記では一般的なnumber型で推論される(型のwidening)

```typescript
const a = 10 //a: 10
let b = 53 //b: number
```

## オブジェクト指向構文

以前より進化しているとはいえJavaScriptにおけるオブジェクト指向の言語仕様はまだまだ十分とはいえない
（アクセス修飾子、インターフェース、ジェネリックなど）

TypeScriptではそういった足りないと思われる機能を実装している

### class命令

```typescript
class Person {
  name: string
  age: number
  
  constructor(name: string, age: number) { //constructorはvoid含め型を指定してはいけない
    this.name = name
    this.age = age
  }
  
  show(): string {
    return `${this.name} is ${this.age} years old.`
  }
}

let person = new Person('Bob', 20)
person.show() //Bob is 20 years old.
```

### アクセス修飾子

* public : クラスの外からも自由にアクセスできる
* protected : 同じクラスもしくは派生クラスのメンバーからのみアクセス可
* private : 同じクラスからのみアクセス可

```typescript
class Person {
  private name: string
  private age: string
  ...
}
console.log(person.name) //エラー
```

※補足
TypeScript3.8以降では先頭子**#**でプライベートフィールドを表せるようになった
(ECMAScriptで標準化が目指されている表記)

```typescript
class MyClass {
  #data: number = 10
  data2: number = 20
}
```

### コンストラクタとプロパティ設定

コンストラクタはクラスが初期化される際に呼ばれる
この仕様上、インスタンスプロパティを初期化する用途によく使われる

ちなみにTypeScriptでは**strictPropertyInitialization**の設定がtrueの時は初期化していないプロパティが存在するとエラーとなる

たまに後からプロパティを初期化したいという場合もあるが、その場合はプロパティ末尾に**!**を付与する
こうすると初期化のチェックを一時的に回避することができる

```typescript
class MyClass {
  age!: number
  ...
}
```

### コンストラクタの省略表記

こうするとプロパティの定義から代入までのコードを代用できる

```typescript
class Person {
  constructor(private name: string, private age: number) {}
}
```

### getter/setterアクセサ

いわゆるプライベートなプロパティにアクセスするために用意された特別なメソッド

```typescript
class Person {
  private _age!: number
  
  //getter
  get age(): number {
    return this._age
  }

  //setter
  set age(value: number) {
    if(value < 0) {
      throw new RuntimeError('ageは正の数で指定してください')
    }
    this._age = value
  }
}

let p = new Person()
p.age = 10
console.log(p.age) //10
```

getterとsetterを利用することで以下のメリットがある

* 読み書きの制御 : setを省略すると読み書き専用、getを省略すると書き込み専用のプロパティを表現できる
* 値チェック/加工 : 値の参照/更新時に追加の処理を差し込むことができる

### 静的メンバー

**static修飾子**を用いることで静的メンバ(静的メソッド/プロパティ)を定義できる

```typescript
class Figure {
  public static PI: number = 3.146549
  
  public static circle(radius: number): number {
    return radius * radius * this.PI //クラス内部で静的メンバにアクセスするときもthisが必要
  }
}
console.log(Figure.PI) //3.146549
console.log(Figure.circle(5)) //78.53975
```

### 継承

元になるクラスの機能(メンバ)を引き継ぎつつ、新しい機能を追加したり元の機能の一部だけ修正したりすること
継承元はスーパークラス、親クラス、基底クラス、継承の結果できたクラスはサブクラス、子クラス、派生クラス

```typescript
class Person {
  constructor(
    protected name: string,
    protected age: number
  ) {}
  
  show(): string {
    return `${this.name} is ${this.age} years old.`
  }
}

class BusinessPerson extends Person { //extendsで継承
  work(): string {
    return `${this.name} works hard.`
  }
}

let p = new BusinessPerson('Bob', 30)
console.log(p.show())
console.log(p.work())
```

### オーバーライド

基底クラスで定義済みのメソッド/コンストラクタを派生クラスで上書きすること
親クラスの処理を呼ぶときは**super.メソッド名**で呼び出す(コンストラクタならsuper())

```typescript
class BusinessPerson extends Person {
  protected clazz: string
  
  constructor(name: string, age: number, clazz:string) {
    super(name, age)
    this.clazz = clazz
  }
  
  show(): string {
    return super.show() + `${this.clazz}.`
  }
}
```

### 抽象メソッド

派生クラスで**必ず機能を上書きしなければいけない**と指定するのが抽象メソッド/抽象プロパティの仕組み
**abstruct修飾子**を使う

共通の処理だけを親クラスにまとめておき、個々の機能は派生クラスに委ねることで見通しが良くなる

```typescript
abstract class Figure {//抽象クラス
  constructor(protected width: number, protected height: number) {}
  
  abstract getArea(): number //抽象メソッド
}

class Triangle extends Figure {
  getArea(): number { //抽象メソッドをオーバライドする
    return this.width * this.height / 2
  }
}

let t = new Triangle(10, 5)
console.log(t.getArea())
```

### インターフェース

TypeScriptは1つのクラスは一度に1つのクラスしか継承できない(**単一継承**)

例えば派生クラスに対して複数のメソッドをオーバライドして欲しいが、全てのメソッドが派生クラスに必要なわけではない...という状況でも継承を使うと必要がないメソッドも引き継がれてしまう

インターフェースは**全てのメソッドが抽象メソッドである特別なクラス**かつ**複数のインターフェースを同時に継承することができる**という特徴がある

インターフェイスを実装する場合は継承のextendsではなく**implements**を利用する

```typescript
interface Figure { //インターフェースを宣言
  getArea(): number
}

class Triangle implements Figure { //implementsで
  constructor(private width: number, protected height: number) {}
  getArea(): number {
    return this.width * this.height / 2
  }
}

let t = new Triangle(10, 5)
console.log(t.getArea())
```

インターフェイスは次のような制限がある

* メソッドは全て抽象メソッドでなければいけない(abstractは不要というか指定してはいけない)
* アクセス修飾子も指定できない(全てのメンバはpublicであることが明らか)
* 静的メンバも宣言できない

### インターフェースの継承

インターフェイスを継承して新しくインターフェイスを宣言することもできる

```typescript
interface Hoge extends Foo, Bar { ... }
```

またインターフェイスがクラスを継承することもできる(他言語ではできないことが多い)
下記の場合はMyClassの実装は無視され、シグニチャだけが継承される

```typescript
class MyClass {
  show() { ... }
}
interface Hoge extends MyClass { ... }
```

### 構造的部分型

TypeScriptにおいては型の互換性(=何が派生クラスなのか)を判断するのに構造的部分型(Structual Subtyping)を採用している。一言で言うと型の構造にフォーカスし、それが互換性がある型かどうかを判定する方式

```typescript
interface Figure {
  getArea(): number
}

class Triangle { //getAreaメソッドを持つが、Figureインターフェイスを明示的に実装はしていない
  constructor(private width: number, protected height: number) {}
  getArea(): number {
    return this.width * this.height / 2
  }
}

let t: Figure = new Triangle(10, 5)
console.log(t.getArea())
```

上記のポイントはTriangleクラスが明示的にFigureインターフェイスを実装していないにも関わらず、Figure型の変数に対してTriangleのインスタンスを代入できている点

このように明示的に特定のクラスやインターフェイスを継承/実装していなくても互換性があれば問題なしとみなす
(※ C#やJavaなどは明示的に継承/実装しない限りは型に互換性があるとは判断されず、**公称的部分型**(Nominal Subtyping)と呼ぶ)

### 型としてのthis

this(クラス内において現在のインスタンスを指す)を型として扱う方法もある
戻り値をthisとするとメソッドの結果からさらに別のメソッドを呼ぶような**メソッドチェーン**が実現できる

```typescript
class MyClass {
  constructor(private _value: number) {}
  
  get value(): number {
    return this._value
  }
  
  plus(value: number): this { //戻り値はthis
    this._value += value
    return this
  }

  minus(value: number): this { //戻り値はthis
    this._value -= value
    return this
  }
}

let clazz = new MyClass(10)
console.log(clazz.plus(10).minus(5).value) //15
```

