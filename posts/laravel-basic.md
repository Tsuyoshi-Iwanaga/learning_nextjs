---
title: 'Laravelの基本'
date: '2021-09-29'
---

## 公式ドキュメントURL
https://laravel.com/docs/

## インストール
Laravel Sailを使うと簡単

```shell
curl -s "https://laravel.build/example-app" | bash
```

```shell
cd example-app
./vendor/bin/sail up
```

## ルーティング

/routes/web.php

view関数を使い/resources/views/welcome.blade.phpが読み込まれている

```php
Route::get('/', function() {
  return view('welcome')
});
```

HTML文字列をそのまま返しても良い

```php
Route::get('/', function() {
  return '<html><body><h1>Hello</h1></body></html>';
});
```

必須のパラメータを設定する

```php
Route::get('/hoge/{param}', function($param) {
  return '<html><body><h1>{$param}</h1></body></html>';
})
```

任意のパラメータを設定する(デフォルト値を設定すること)

```php
Route::get('/hoge/{param?}', function($param='default') {
  return '<html><body><h1>{$param}</h1></body></html>';
})
```

コントローラーのアクションを起動する

```php
Route::get('/hoge', 'HelloController@index');
```

## コントローラー

```php
<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class HelloController extends Controller
{
  public function index() {
    return '<html><body><h1>Hello</h1></body></html>';
  }
}
```

シングルアクションコントローラー
(※この場合、routesでは@アクション名を省略し、コントローラー名だけを設定する)

```php
class HelloController extends controller
{
  public function __invoke() {}
}
```

リクエストとレスポンス

```php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HelloController extends Controller
{
  public function index(Request $req, Response $res) {
    $html = "<html><body>{$req}</body></html>";
    $res->setContent($html)
    return $res;
  }
}

$req->url();
$req->fullUrl();
$req->path();

$res->status();
$res->content();
$res->setContent();

```




## artisanコマンド

各種ファイルの作成
* auth
* channel
* command
* controller
* event
* exception
* factory
* job
* listener
* mail
* middleware
* migration
* model
* notification
* observer
* policy
* provider
* request
* resource
* rule
* seeder
* test

```shell
artisan make:controller HelloController
```


