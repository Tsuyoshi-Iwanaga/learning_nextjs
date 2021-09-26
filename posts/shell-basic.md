---
title: 'シェルスクリプトの基本'
date: '2021-09-26'
---

## シェルの種類
* sh(B Shell)
* csh(C Shell)
* bash(Bourne-Again Shell)
* ash
* zsh(Z Shell)
* ksh

## ログインシェル
ログインした際に起動するシェルのこと
Linuxであれば/etc/passwdにユーザアカウントと一緒に記載されている

## シェルスクリプトのメリット
コンパイルが必要ないため手軽かつ最小構成のLinuxでも実行が可能

## 実行方法(デバッグ)

```shell
chmod u+x sample01.sh #実行権を与える
sh -x sample01.sh #デバッグモードで実行
```

##  実行時のシェルを指定

```shell
#! /bin/sh
echo "Hello"
```

ちなみに#! /bin/shと記載してもshではなくbashが立ち上がる
(/bin/shが/bin/bashへのシンボリックリンクになっている)

```shell
ls -la /bin/sh #/bin/sh -> bash
```

## コマンドの実行結果を展開する

```shell
echo "Hello. I am `whoami`." # Hello I am root
```

## " "と' 'の違い

""だと「`」「$」「!」はエスケープされない
''は全てエスケープする

## シェル変数

```shell
set #定義されたシェル変数を確認
val=test01
unset val
```

シェル変数は他のシェルには影響せず、シェルを閉じると消える

## リダイレクト

通常はキーボードが**標準入力**、画面が**標準出力**となっている
これをファイルに切り替えるのがリダイレクトという機能

* ファイルから入力 <
* ファイルへ出力 > 
* ファイルの末尾へ追記 >>

```shell
#!/bin/sh
tr a-z A-Z < infile
```

```shell
#!/bin/sh
dmesg > outfile
```

標準エラー出力の場合は通常は標準出力に混じって表示されるので、
これだけをリダイレクトさせるときは下記のようにする(2をつける)

```shell
cp a b 2> out.txt
```

## リダイレクト時、入力と出力に同じファイルを指定はNG

入力用ファイルと出力用ファイルを同時に開く関係でファイルの中身が消えてしまう

## /dev/null

出力を見る、保存する必要が無い場合は/dev/nullにリダイレクトをするとその内容は捨てられる

## パイプ

標準出力を別のコマンドの標準入力に流し込む仕組み

```shell
ps auxw | grep syslogd
```

## フィルタ

標準入力からのデータを加工して標準出力へ流すプログラムのこと
パイプと併用して使用することが多い

* tee そのまま出力するが、ファイルにも同じ内容を出力する
* sort 入力を行単位でソートして出力する
* uniq 連続する行で同じ内容の行があれば一つに縮めて出力する
* grep それぞれの行を検索し、検索にマッチした行を出力する
* head 先頭から指定した行数だけ出力する
* tail 末尾から指定した行数だけ出力する

## 複数のコマンドを切り替えて実行

コマンドの実行中にCtrl + Zでコマンドをサスペンド(一時停止)させシェルの入力に戻ることができる
また、fgコマンドを使うことで引き続き実行に戻ることもできる

サスペンドしているコマンドは**jobs**コマンドで見ることができる

```shell
sleep 1000 #この後にcontrl + Z でサスペンド
jobs #単独もしくは協調している複数のプロセスを管理する単位(ジョブ)を確認
fg %1 #番号1のジョブをフォアグラウンドで再開
bg %1 #番号1のジョブをバックグラウンドで再開
```

## manコマンド

マニュアルを開いて調べることができる

```shell
man ls
```

コマンドが分からなくても-kオプションをつけると関連するコマンドを検索できる

```shell
man -k directory
```

manコマンドには**セクション**という分類が用意されている
1 **Linuxコマンド** ls catなどの基本コマンド
2 **システムコール(カーネル関数)** openやfork, read, writeなど入出力に関連する関数など
3 **ライブラリコール(システム関数)** printfなどの関数など
4 **スペシャルファイル** デバイスファイルとも呼ばれるデバイスに入出力に関するファイル(/dev配下)
5 **ファイル形式** /etcディレクトリ配下のhostsやpasswd, groupなどの設定ファイル
6 **ゲームやデモ** プリインストールされているゲームやデモ
7 **マクロ** boot(起動シーケンス)などのマクロ(複数のコマンドをまとめて一つにしたようなもの)
8 **システム管理用コマンド** shutdownなどの管理権限で使うコマンド
9 **カーネルルーチン** カーネルルーチン(非標準)

```shell
man 1 passwd #コマンド
man 5 passwd #ファイル
```

## if文

```shell
#!/bin/bash
echo "enter 0(True) or 1(False)"
read answer

if [ $answer = "0" ]; then
  echo "True"
elif [ $answer = "1" ]; then
  echo "False"
else
  echo "NG"
fi

echo `test $answer = "0"`

# 代わりにtestコマンドを使う書き方もある
# if test $answer = "2"; then
#   echo "OK"
# fi
```

シェルスクリプトでは真偽値で**0が真**となる

## And Or

Andは**-a**,Orは**-o**で条件を繋ぐ

```shell
#!/bin/bash
echo input1
read i1

echo input2
read i2

if [ $i1 = "0" -a $i2 = "1" ]; then
  echo "OK!"
else
  echo "NG!"
fi
```

## Case文

```shell
#!/bin/bash
read input1
case $input1 in
	yes )
		echo "OK!"
		;;
	no )
	  echo "NG!"
	  ;;
	* )
		echo "Unknown"
		;;
esac
```

## While文

```shell
#!/bin/bash
cnt=0

while [ $cnt -lt 10 ]
do
  cnt=`expr ${cnt} + 1`
  echo $cnt
done
```

exprはシェルで計算を行うコマンド
また数値比較を行う際に使用できる演算子は以下の通り

* **-eq** 等しい
* **-ne** 等しくない
* **-lt** より小さい
* **-le** 以下
* **-gt** より大きい
* **-ge** 以上

## CSVをリダイレクトで読み込む

```shell
#!/bin/bash
CSVFILE="./src/sample.csv"

while IFS=, read aa bb cc;
do
  aa_arr+=($aa)
  bb_arr+=($bb)
  cc_arr+=($cc)
done < $CSVFILE

arr_max=`expr ${#aa_arr[*]}`

i=0
while [ $i -lt $arr_max ]
do
  echo ${aa_arr[$i]},${bb_arr[$i]},${cc_arr[$i]}
  i=`expr $i + 1`
done
```

## until文

条件が真になるまで実行する

```shell
#!/bin/bash
cnt=0

until [ $cnt -eq 10 ]
do
  cnt=`expr ${cnt} + 1`
  echo $cnt
done
```

## For文

```shell
#!/bin/bash
items=$(ls)

for i in $items; do
  echo $i
done
```

決まった回数を繰り返す時は下記のようにする

```shell
#!/bin/bash
for i in `seq 0 10`
do
  echo $i
done
```

## シェル関数

```shell
#!/bin/bash
f_hello() {
  echo "Hello. I am `whoami`"
}
f_hello
```

引数を取るパターン(引数は$1, $2, $3...などで表される)

```shell
#!/bin/bash
f_param() {
  echo $1
}
f_param abc
```

戻り値

```shell
#!/bin/bash
f_ret() {
  if [ $1 = "y" ]; then
    return 0
  else
    return 1
  fi
}
f_ret y && echo "Success."
f_ret n || echo "Fail."
```

* **コマンド1 && コマンド2** : コマンド1が真ならコマンド2を実行、コマンド1が偽なら実行しない
* **コマンド1 || コマンド2**: コマンド1が偽ならコマンド2を実行、コマンド1が真なら実行しない

※シェルスクリプトでは0が真というところに注意すること
※シェルスクリプトのreturnでは0か0以外かしか指定できない

## sed(セド)

スクリプト型言語の一種、シェルスクリプトの中でパターンに一致した文字列を別の文字列に置き換えるような操作を行うときによく利用される

```shell
#!/bin/bash
read in
echo "$in" | sed 's/abc/123/'
echo "$in" | sed 's/abc/123/g'
```

**sコマンド**
パターンに一致した文字列を別の文字列に置き換える
デフォルトでは最初にマッチした1つだけだが、gをつけると全て置換される

デフォルトの区切り文字「/」は別の文字の置き換えることも可能

```shell
echo "/bin/sh" | sed 's%/bin/sh%/bin/bash%'
```

**後方参照**

```shell
#!/bin/bash
echo "西暦を4桁で入れてください、末尾2桁を表示します"
read in
echo "$in" | sed 's/\([0-9][0-9]\)\([0-9][0-9]\)/\2/g'
```

カッコで囲んだ部分は後から\1, \2...のように使うことができる

## awk(オーク)

awkもsedと同じくシェルスクリプト内でよく使われるスクリプト言語
標準入力から入力された行が指定のパターンと一致した場合だけコマンドを実行し、一致しなければ何もしない

```shell
#!/bin/bash
awk '
  BEGIN { print "Hello"; }
  { print $1; }
  ($1>10) { print "10 greater then"; }
  ($1<3) { print "3 less then"; }
  END { print "Bye"; }
'
```

**定義されている変数**

* **$0** 入力行全体
* **$1** 入力行を単語に分割した時の最初の単語
* **$2** 入力行の2番目の単語($3以降は以下同様)

