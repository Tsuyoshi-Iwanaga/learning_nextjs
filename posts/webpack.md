---
title: 'webpack'
date: '2021-10-16'
---

## 動作環境

```
Node.js v14.15.4
npm v6.14.10
webpack v5.30.0
webpack-cli v4.6.0
```

## webpackの概要

フロントエンド開発用の**モジュールバンドラ**
複数のJSファイル(モジュール)の依存性を解決し、一つにまとめてくれるツール

また**ローダー**や**プラグイン**といった仕組みを用いることで、上記以外の色々な処理を挟むことができる

webpackでよく使われる用語は次の通り

* モジュール : webpackでまとめる元となるファイル(JS以外にもCSSや画像もモジュールとして扱える)
* エントリーポイント : webpackがファイルをまとめる際に最初に解析を始めるファイル
* バンドル : webpackでまとめられたファイル
* ビルド : バンドルを生成するまでの一連の処理

### package.jsonの生成

```shell
cd webpack-sample
npm init -y #-yをつけるとデフォルトの雛形を使ってpackage.jsonが生成される
```

```json
{
  "name": "learning_webpack",
  "version": "1.0.0",
  "description": "## 動作環境",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Tsuyoshi-Iwanaga/learning_webpack.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/Tsuyoshi-Iwanaga/learning_webpack/issues"
  },
  "homepage": "https://github.com/Tsuyoshi-Iwanaga/learning_webpack#readme"
}
```

不要な記述は削除して問題なし

```json
{
  "name": "learning_webpack",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### webpackのインストール

```shell
npm install --save-dev webpack@5.30.0 webpack-cli@4.6.0
```

```json
{
  "name": "learning_webpack",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "devDependencies": {
    "webpack": "^5.30.0",
    "webpack-cli": "^4.6.0"
  }
}
```

### 試しにjqueryをインストールしてみる

```shell
npm install --save jquery@3.6.0
```

```json
{
  "name": "learning_webpack",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "devDependencies": {
    "webpack": "^5.30.0",
    "webpack-cli": "^4.6.0"
  },
  "dependencies": {
    "jquery": "^3.6.0"
  }
}
```

### devDependenciesとdependenciesの違いについて

簡単に言うとバンドルを生成するために必要なモジュールはdevDependencies、出力されるバンドル自体に含めたいモジュールはdependenciesに指定しておく
そうして分類しておくと例えば本番環境ではdevDependenciesはインストールしないみたいな運用も可能になる

モジュールのインストール時に--save-devをつけるとdevDependencies、--saveをつけるとdependenciesになる

### npmスクリプトへの登録

webpackは以下のコマンドで実行することが可能

```shell
node_modules/.bin/webpack
```

ただし通常はnpm scriptsというものを経由して実行する
package.jsonを下記のように更新する

```json
  "scripts": {
    "build": "webpack"
  },
```

```shell
npm run build
```

npm scripts経由で実行することでプロジェクト内でよく使われるコマンドを明示することができる
これにより新しい開発メンバーが入ってきた場合にもどのようなコマンドを使ってビルドすれば良いのか分かりやすくなる

### webpack.config.js(設定ファイル)を作成する

プロジェクト直下に下記のようなファイルを作成する

```js
const path = require("path")

module.export = {
  mode: 'development', //develop production none
  entry: './src/js/app.js', //エントリーポイント
  output: {
    //絶対パスを指定、OSにより指定が異なるのでpathモジュールを使う
    path: path.resoleve(__dirname, 'public'), 
    filename: 'js/bundle.js',
  }
}
```

modeは必須、developmentを指定するとソースマップが出力されるなど開発に便利なバンドルを生成する
一方productionでは圧縮やモジュールの最適化など本番で使うのに適したバンドルを生成する

### モジュールを作成してみる

src/js/modules/math.js

```js
export function add(num1, num2) {
  return num1 + num2
}

export function subtract(num1, num2) {
  return num1 - num2
}
```

### エントリーポイントを作成する

src/js/app.js

```js
import $ from 'jquery'
import { add, subtract } from './modules/math'

const item1Price = 400
const item2Price = 600
const coupon = 300
const totalPrice = add(item1Price, item2Price)
const priceAfterApplyCoupon = subtract(totalPrice, coupon)

$('body').text(priceAfterApplyCoupon)
```

### exportとimportについて

ES Modulesという仕様での書き方、現在はこの書き方でモジュールを扱うのが一般的

例えばこのようなモジュールがあったとする

```js
export const add = (n, n2) => n + n2
export const sub = (n, n2) => n - n2
```

以下のように読み込み先ではいろんな記述ができる

```js
//addだけを読み込む(subは読み込まれない)
import { add } from './math.js'

//addとsubを読み込む、subはSubとして別名をつける
import { add, sub as Sub } from './math.js'

//エクスポートされたものをまとめて読み込む、math.addやmath.subのように使える
import * as math from './math.js'
```

また読み込み元でデフォルトエクスポートを指定することも可能

```js
const add = (n, n2) => n + n2
const sub = (n, n2) => n - n2
export default { add, sub }
```

```js
import math from './math.js'//math.addやmath.subのように使える
```

デフォルトとそれ以外のエクスポートが混在していても以下のように別々に読み込める

```js
export const add = (n, n2) => n + n2
const sub = (n, n2) => n - n2
export default sub
```

```js
import sub, { add } form './math.js'
```

### バンドラを生成しHTMLに読み込ませてみる

```shell
npm run build
```

public/index.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>getting started webpack</title>
</head>
<body>
<script src="js/bundle.js"></script>
</body>
</html>
```

## ローダー

ローダーは**色々な形式のファイルをバンドルできるように変換する**プログラム
例えばCSSや画像などはそのままだとバンドルに含めることはできないのでwebpackでバンドルする前に一度ローダーでファイルを変換する必要がある

### babel-loader

ES6以降のコードをES5のコードに変換する

```shell
npm install --save-dev babel-loader@8.2.2 @babel/core@7.13.10 @babel/preset-env@7.13.12
```

* @babel/core : Babelの本体
* @babel/preset-env : Babelの変換処理を実行する際に使うプラグイン
* babel-loader :  webpackにてbabelを使うためのローダー

webpack.config.js

```js
module.exports = {
  mode: 'development', //develop production none
  entry: './src/js/app.js', //エントリーポイント
  output: {
    //絶対パスを指定、OSにより指定が異なるのでpathモジュールを使う
    path: path.resolve(__dirname, 'public'), 
    filename: 'js/bundle.js',
  },
  modules: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),//ローダーの変換対象となるディレクトリ
        use: 'babel-loader',
      }
    ]
  }
}
```

babel.config.js (Babelの設定ファイル、webpack.config.jsにも書けるが可読性のためにファイルを分ける)

```js
module.exports = {
  presets: ['@babel/preset-env']
}
```

### sass-loader / css-loader / style-loader

Sassのファイルをバンドルに含めて出力する

```shell
npm install --save-dev sass@1.32.8 sass-loader@11.0.1 css-loader@5.2.0 style-loader@2.0.0
```

* sass : Sassをコンパイルするモジュール
* sass-loader : Sassモジュールへ変換するローダー
* css-loader : CSSをモジュールへ変換するローダー
* style-loader : バンドルしたCSSをHTML内に挿入するローダー

※ sassは以前はdart-sassと呼ばれていたモジュール、以前はnode-sassというモジュールを用いることもあったが、現在ではnode-sassは非推奨となっている

src/js/app.js

```js
import '../scss/style.scss'
```

src/scss/_variables.scss

```scss
$black: #000;
$white: #fff;
```

src/scss/style.scss

```scss
@import './_variables';
body {
  background: $black;
  color: $white;
}
```

webpack.config.js

```shell
const path = require("path")

module.exports = {
  mode: 'development', //develop production none
  entry: './src/js/app.js', //エントリーポイント
  output: {
    //絶対パスを指定、OSにより指定が異なるのでpathモジュールを使う
    path: path.resolve(__dirname, 'public'), 
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'src/scss'),
        //複数のローダーがある場合は配列で記載する、ローダーは記載順とは逆から読み込まれるので注意
        use: [ 'style-loader', 'css-loader', 'sass-loader' ],
      }
    ]
  }
}
```

これでビルドするとhead内にstyleタグが挿入され、スタイルが反映される

### post-css-loader

PostCSSはJavaScriptでCSSを変換するためのプラグインを作成するためのツール
CSSにベンダープレフィックスを自動挿入したり、CSSの圧縮ができたりする

ここでは有名なAutoprefixerを用いてベンダープレフィックスを自動でつけるようにしてみる

```shell
npm install --save-dev postcss-loader@5.2.0 postcss@8.2.8 autoprefixer@10.2.5
```

* postcss : 本体
* post-css-loader : CSS変換をwebpackで行うためのローダー
* autoprefixer : プレフィックスを自動付与するプラグイン

style.scss

```scss
@import './_variables';
body {
  background: $black;
  color: $white;
  user-select: none;
}
```

webpack.config.js

```js
{
  test: /\.scss$/,
    include: path.resolve(__dirname, 'src/scss'),
      //複数のローダーがある場合は配列で記載する、ローダーは記載順とは逆から読み込まれるので注意
      use: [ 'style-loader', 'css-loader', 'postcss-loader', 'sass-loader' ],
}
```

postcss用の設定ファイルをpostcss.config.jsというファイル名で作成

```js
module.exports = {
  plugins: [require('autoprefixer')]
}
```

これでビルドするとbodyタグにつけたuser-selectのCSSルールに対して自動でプレフィックスが付与される

## プラグイン

プラグインはwebpackを拡張させるためのプログラム
これを利用することでバンドル実行時に追加の処理を挟み込むことができる

バンドルの開始から完了までは様々なプロセスがあり、どこのタイミングに処理を挟み込むかはプラグインごとに異なっている

### web pack-merge

webpackの設定をマージするためのプラグイン
これを利用することで開発用/本番用で共通の設定は一つのファイルで管理しつつ、差分がある部分は別の設定ファイルで管理することができるようになる

```shell
npm install --save-dev webpack-merge@5.7.3 terser-webpack-plugin@5.1.1
```

* webpack-merge : 設定ファイルをマージするためのプラグイン
* terser-webpack-plugin : webpackがproductionモードで実行された時にJSを圧縮するために使われるプラグイン、設定ファイルに記述を加えることでデフォルトの設定を上書きできる。
  デフォルトだとJS内のconsole.logが削除されないのでこの設定を変更してみる
  またjqueryなど外部モジュールのライセンス情報などがデフォルトだと抽出されるが、これも今回削除してみる

package.json

```json
"scripts": {
  "dev": "webpack --config webpack.dev.js",
  "build": "webpack --config webpack.prod.js"
}
```

src/app.js

```js
console.log(priceAfterApplyCoupon) //console.logの記述を追加
```

webpack.common.js (共通の設定用)
これはここまで使っていたwebpack.config.jsのmodeのところだけ削除してリネームする

```js
// mode: 'development', この記述を削除
```

webpack.dev.js(開発用)

```js
const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
})
```

webpack.prod.js(本番用)

```js
const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const commonConfig = require('./webpack.common')

module.exports = merge(commonConfig, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        //ライブラリのライセンスコメントを抽出したファイルを生成しない
        extractComments: false,
        terserOptions: {
          compress: {
            //consoleの記述を削除する
            drop_console: true,
          }
        }
      })
    ]
  }
})
```

開発用のビルド

```shell
npm run dev
```

本番用のビルド

```shell
npm run build
```

### mini-css-extract-plugin

バンドルされるCSSを個別のCSSファイルに抽出するプラグイン
style-loaderを使うとstyleタグで出力されるが、この場合バンドルが大きくなったりCSSをキャッシュできないなどの問題点がある

```shell
npm install --save-dev mini-css-extract-plugin@1.4.0
```

webpack.common.js

```js
const path = require("path")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: './src/js/app.js', //エントリーポイント
  output: {
    //絶対パスを指定、OSにより指定が異なるのでpathモジュールを使う
    path: path.resolve(__dirname, 'public'), 
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, 'src/scss'),
        //複数のローダーがある場合は配列で記載する、ローダーは記載順とは逆から読み込まれるので注意
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      //output.pathを起点にCSSが出力される
      filename: './css/style.css'
    })
  ]
}
```

この状態でビルドを実行するとpublic/css/style.cssが生成される
またstyle-loaderをコメントアウトしているためバンドルには含まれなくなる

### webpack-bundle-analyzer

バンドルに含まれるモジュールおよびそのサイズを確認できるプラグイン

```shell
npm install --save-dev webpack-bundle-analyzer@4.4.0
```

webpack.common.js

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
...
module.exports = {
  ...
  plugins: [new BundleAnalyzerPlugin]
}
```

実行するとブラウザでhttp://127.0.0.1:8888が立ち上がり、バンドルの内訳が確認できるようになる

## webpackの様々な機能

### 複数のエントリーポイントからバンドルを出力する

/src/js/search.js

```js
import $ from 'jquery'
import '../scss/style.scss'

$('body').text('Serarch'
```

/public/search.html (すでにあるindex.htmlもJSの読み込み箇所を修正)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="./css/style.css">
<title>search</title>
</head>
<body>
<script src="js/search.bundle.js"></script>
</body>
</html>
```

webpack.common.js

```js
module.exports = {
  ...
  entry: {
    app: './src/js/app.js',
    search: './src/js/search.js',
    ...
    filename: 'js/[name].bundle.js',
  }
}
```

これで実行すると/public/js/配下にapp.bundle.jsとsearch.bundle.jsが出力される
複数のエンドポイントを作成することができた

### watchモード

watchモードを有効化するとバンドル対象のファイルに変更が入った時に自動でビルドを動かすことができる

webpack.common.js

```js
module.exports = {
  watch: true,
  ...
}
```

またwebpackの実行時に--watchオプションをつけることでも有効にできる

```shell
npx webpack --watch
```

### Asset Moduleで画像をバンドルする

webpack5ではAsset Modulesというアセットファイル(画像やフォントなど)を扱う機能が導入された
今回はSassファイルから読み込んでいる画像をDataURLに変換しバンドルに含めて出力してみる

※webpack4まではurl-loaderが必要だったが、webpack5からいらなくなった

webpack.common.js

```js
  module: {
    rules: [
      ...
      {
        test: /\.(jpe?g|gif|png|svg)$/,
        type: 'asset/inline' //Asset Modulesのタイプ、url-loaderと同じことをやりたければasset/inline
      }
    ],
```

CSSはstyle-loaderを使ってhtml内部に展開されるようにする
こうするとCSS内部のurlで読み込んだ画像はDataURLに変換されてバンドルに含まれるようになる

### Asset Moduleで画像を出力する

DataURLに変換すると元の画像よりもファイルサイズが大きくなったりJSの実行に時間がかかるようになるため、場合によってはバンドルに含めずにそのまま指定ディレクトリに出力したいこともある

またこの際にはscss側のファイルパスを指定ディレクトリに書き換える必要がある点にも気を付ける

※webpack4まではfile-loaderが必要だったが、webpack5ではいらなくなった

webpack.common.js

```js
  module: {
    rules: [
...
      {
        test: /\.(jpe?g|gif|png|svg)$/,
        type: 'asset/resource', //Asset Modulesのタイプ、file-loaderと同じことをやりたければasset/resourceを指定
        generator: {
          filename: 'images/[name][ext]', //nameにはファイル名、extには拡張子
          publicPath: './', //出力されるCSSなどに指定される画像のパス
        }
      }
    ],
  },
```

今度はDataURLに変換されず、./images/profile.pngのように外部ファイルを参照するようになる

### Asset Moduleでファイルサイズに応じてバンドルに含めるかどうかを判断する

例えば4KB未満の画像はDataURLに変換してバンドル、それ以上はバンドルせずに出力する

webpack.common.js

```javascript
  module: {
    rules: [
...      
     {
        test: /\.(jpe?g|gif|png|svg)$/,
        type: 'asset', //Asset Modulesのタイプ
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024, //4KB
          }
        },
        generator: {
          filename: 'images/[name][ext]',
          publicPath: './',
        }
      }
    ],
  },
```

### 出力先をクリーンアップしてからファイルを出力する

webpack5ではoutput.pathに指定したディレクトリ内のファイルを削除した後でバンドルされたファイルを出力することができる。outputの設定の箇所にclearn: trueをつけるだけ

※ webpack4まではclean-webpack-pluginなどのプラグインが必要だったが、webpack5でいらなくなった

webpack.common.js

```javascript
module.exports = {
  ...
  output: {
    path: path.resolve(__dirname, 'public'), 
    filename: 'js/[name].bundle.js',
    clean: true, //output.pathのフォルダをバンドル前に削除する
  },
  ...
}
```

### 開発用サーバ

```shell
npm install --save-dev webpack-dev-server@3.11.2
```

```json
  "scripts": {
    "start": "webpack serve",//package.jsonにサーバ起動用コマンドを追加
    ...
  },
```

webpack.common.js

```js
  devServer: {
    open: true,
    port: 9000,
    contentBase: './public',
  },
```

### ソースマップ

webpack.common.js

```js
  devtool: 'eval-cheap-module-source-map',
```

ソースマップの種類を変更することもできる（公式を確認のこと)
しっかりしたソースマップであればビルド速度は遅くなるのでおすすめは上記の設定

上記はローダーで変換された後のコードなので、デバッグがしづらければevel-cheap-module-source-mapもしくはeval-source-mapを指定するとよい

### HTMLの自動生成

```shell
npm install --save-dev html-webpack-plugin
```

webpack.common.js

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
...
  plugins: [
    ...
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/ejs/index.ejs',
      chunks: [ 'app' ],
    }),
    new HtmlWebpackPlugin({
      filename: 'search.html',
      template: './src/ejs/search.ejs',
      chunks: [ 'search' ],
    }),
  ]
```

## 最適化

### Tree Shaking

TreeShakingはデッドコード(使われていない不要なコード)を除去する機能
ES Modules形式のモジュールであれば条件を満たした時に自動で適用される

※productionモードでバンドルした時にTree Shakingが有効になる

以下はライブラリから必要な関数だけをimportしている例
この場合はライブラリの余分なコードはTree Shakingによって除去される

```js
import { upperCase } from 'lodash-es'
const text = upperCase("hello webpack app")
```

以下のようにライブラリ全体をimportしてしまうとTree Shakingされない

```js
import _ from 'lodash_es'
const text = _.upperCase('hello webpack app')
```

### SplitChunksPlugin

チャンクを分割したファイルを出力するためのプラグイン
チャンクとはバンドルを構成するコードおよびファイルのことを指す

SplitChunksPluginを使うと複数のエントリーポイントにて共有されるチャンクを分割して出力することができる

* 通常の出力 : 共通のチャンクがあってもそれぞれのエントリーポイント毎に重複してバンドルされる
* SplitChunksPlugin利用 : 共通のチャンクは別ファイルとして出力される、キャッシュされる

webpack.common.js

```js
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: { //ここではvendorだが任意のものを設定できる
          chunks: 'initial', // initial: 静的にインポート, async: ダイナミックインポート, all: 全て
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor'
        }
      }
    },
    ...
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/ejs/index.ejs',
      chunks: [ 'app', 'vendor' ], //HTMLに読み込ませるためvendorを追加
    }),
    new HtmlWebpackPlugin({
      filename: 'search.html',
      template: './src/ejs/search.ejs',
      chunks: [ 'search', 'vendor'], //HTMLに読み込ませるためvendorを追加
    }),
  ]
  },
```

このようにするとpublic/js/vendor.bundle.jsというファイルが別途出力されるので、これをHTMLから別途読み込むことで共通化することができる

ちなみに何が共通利用されるチャンクなのかはwebpackが自動で判別してくれる
