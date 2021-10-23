---
title: 'DB(SQL/DB設計)'
date: '2021-10-22'
---

## SQL

データベースを操作するための言語

### オブジェクト

データを格納するための**テーブル**やデータの見せ方を定義した**ビュー**などSQLの捜査対象となるものをオブジェクトという

### SQLの分類

* DDL(データ定義言語): Data Definition Language) / CREATE, DROP, ALTER, TRUNCATE
* DML(データ操作言語): Data Munipulation Language) / SELECT, INSERT, UPDATE, DELETE
* DCL(データ制御言語): Data Control Language) / データベースの権限やトランザクションなど

### テスト用データの作成

script.sql

```sql
-- スキーマ作成
CREATE SCHEMA `test`;

-- テーブル作成
CREATE TABLE test.t_actual_detail(
	YM varchar(6) NOT NULL,
	item_cd varchar(7) NOT NULL,
	customer_cd varchar(7) NOT NULL,
	quant int(10) NOT NULL DEFAULT 0
);

CREATE TABLE test.m_item(
	item_cd varchar(7) NOT NULL,
	dept_cd varchar(7) NOT NULL,
	item_name varchar(50),
	unit_price int(10) NOT NULL DEFAULT 0,
	PRIMARY KEY (item_cd)
);

CREATE TABLE test.m dept(
	dept_cd varchar(7) NOT NULL,
	dept_name varchar(50),
	PRIMARY KEY (dept_cd)
);
```

上記のスクリプトを実行

```shell
sudo mysql -u root
> source /var/tmp/sql-lesson/script.sql
```

### SELECT

test.t_actualのYM=201703の全ての列を取得

```mysql
SELECT * FROM test.t_actual_detail WHERE YM=`201703`;
```

test.t_actual_detailのYM=201703のYM列のみを取得

```sql
SELECT YM FROM test.t_actual_detail WHERE YM=`201703`
```

Test.t_actual_detailのYM=201703のYM列、QUANT列

```mysql
SELECT YM, quant FROM test.t_actual_detail WHERE YM=`201703`;
```

#### WHERE

* 列名 = A
* 列名 != A (列名 <> A でも可)
* 列名 > A
* 列名 >= A
* 列名 LIKE 'B%' (前方一致)
* 列名 LIKE '%B%' (部分一致)
* 列名 LIKE '%B' (後方一致)
* 列名1 = A **AND** 列名2 = B
* 列名1 = A **OR** 列名2 = B
* 列名 **IN**(A, B, C, D) どれかに該当する

```sql
SELECT * FROM test.m_dept WHERE dept_name LIKE '%事業%';
```

```sql
SELECT * FROM test.t_actual_detail WHERE YM <> '201703';
```

```sql
SELECT * FROM test.t_actual_detail WHERE YM > '201703';
```

```sql
SELECT * FROM test.t_actual_detail WHERE dept_name LIKE '%事業%';
```

```sql
SELECT * FROM test.t_actual_detail WHERE dept_name IN('青果事業部', '文具事業部');
```

#### ソート

```sql
SELECT * FROM test.t_actual_detail ORDER BY YM //YMで並び替え(昇順)
```

```sql
SELECT * FROM test.t_actual_detail ORDER BY YM DESC //YMで並び替え(降順)
```

#### 集計

集計関数というものを使うと合計や平均などを求めることができる
また**GROUP BY**を用いると特定の列に対してグループ化した状態で結果を得ることができる

* SUM(列名)
* AVG(列名)
* COUNT(列名)
* COUNT(DISTINCT 列名) ※重複を除く
* MAX(列名)
* MIN(列名)

```sql
SELECT YM, SUM(quant) as quant FROM test.t_actual_detail GROUP BY YM;
```

```sql
SELECT * FROM test.t_actual_detail WHERE YM = 201703 ORDER BY quant DESC
```

```sql
SELECT YM, item_cd, SUM(quant) as q FROM test.t_actual_detail
	GROUP BY YM, item_cd
	ORDER BY YM, item_cd
```

```sql
SELECT YM, item_cd, SUM(quant) as q FROM test.t_actual_detail
	GROUP BY YM, item_cd
	# HAVINGを使うと集計後の結果に対して絞り込みできる、WHEREでは集計前のデータだけが対象となる
	HAVING SUM(quant) > 2000
	ORDER BY YM, item_cd
```

#### 演算 / 関数

* 列名A + 列名B
* 列名A - 列名B
* 列名A * 列名B
* 列名A / 列名B

* 文字列の結合 : CONCAT(列名A, 列名B)
* 文字列の切り出し : SUBSTR(列名A, 開始位置, 終了位置)
* 文字列の長さ : LENGTH(列名)
* 置換 : REPLACE(列名A, 変更前の文字, 変更後の文字)

* 値の分岐 : CASE WHEN 条件式1 THEN 値1 WHEN 条件式2 THEN 値2 END
* NULLの時だけ置換 : IFNULL(値1, 値2) **※NULLは列名 IS NULL, IS NOT NULLで比較**

```sql
SELECT quant, quant + 100 AS quant2 FROM test.t_actual_detail;
```

```sql
SELECT CONCAT(item_cd, '_' ,suctomer_cd) AS tmp_name FROM test.t_actual_detail;
```

```sql
SELECT quant,
	CASE
		WHEN quant > 700 THEN 1
		WHEN quant > 500 THEN 2
		ELSE 3
	END as quant_div
FROM test.t_actual_detail;
```

#### JOIN(表の結合)

test.t_actual_detailとtest.m_itemを結合する(それぞれitem_cdで紐づける)

```sql
SELECT t.YM, t.item_cd, t.customer_cd, t.quant, t.dept_cd, m.item_name, m.unit_price
	FROM test.t_actual_detail AS t
	LEFT OUTER JOIN test.m_item AS m ON t.item_cd = m.item_cd
```

**内部結合**
双方のテーブルに存在する(キーが一致する)データのみを抽出

**外部結合**
左外部結合 : 一致しなくても左のテーブル(FROM句で指定したテーブル)のデータは全て抽出
右外部結合 : 一致しなくても右のテーブル(ON句で指定したテーブル)のデータは全て抽出
完全外部結合 : 一致しなくても両方のデータを全て抽出

※外部結合の場合、テーブルに値が存在しない場合は**NULL**になる

```sql
SELECT t.*, m.item_name
	FROM test.t_actual_detail AS t INNER JOIN test.m_item AS m ON t.item_id = m.item_id
	WHERE t.YM = 201703;
```

```sql
SELECT t.*, d.dept_name
	FROM test.t_actual_detail AS t
	LEFT OUTER JOIN test.m_item AS i ON t.item_cd = i.item_cd
	LEFT OUTER JOIN test.m_dept AS d ON i.dept_cd = d.dept_cd
	WHERE t.YM = 201703;
```

### サブクエリ(副問い合わせ)

SELECTの結果をSELECTの中で入れ子にして使う機能
例えば下記は集計後のテーブルを元のテーブルに結合し、quant列の構成比をshareとして表示している

```sql
SELECT t.YM, i.item_cd, t.customer_cd, t.quant, s.quant_sum, t.quant/s.quant_sum AS share
	FROM test.t_actual_detail AS t
	INNER JOIN (
    SELECT YM, SUM(quant) AS quant_sum FROM test.t_actual_detail
    GROUP BY YM
  ) AS s ON t.YM = s.YM
```

```sql
SELECT t.*, s.sum_quant
	FROM test.t_actual_detail AS t
	INNER JOIN (
  	SELECT item_cd, SUM(quant) as sum_quant
		FROM test.t_actual_detail
		GROUP BY item_cd
	) AS s ON t.item_cd = s.item_cd
WHERE t.YM = 201703
```

### トランザクション管理

データベースにて整合性が取れた状態でデータを管理するには下記の性質が求められる

* **原子性** : タスクが全て実行もしくは全て実行されない(中途半端なところで終了しない)
* **一貫性** : あらかじめ与えられた整合性を全て満たす
* **独立性** : タスクの実行結果はタスクが全て完了するまで他の操作からは隠蔽される
* **耐久性** : タスクの実行結果は障害が発生しても失われてはいけない

**トランザクション** = 一連のデータの変更処理の単位、変更処理を始めたところから明示的に完了するまでの範囲
■ COMMIT : 変更後の状態をデータベースに反映させる
■ ROLLBACK : 変更前の状態に戻す

※変更をまさに実施しているトランザクション以外のトランザクションからは**コミットが完了するまでは変更前の状態が維持されている**(独立性)

### テーブルの制約

データベースのテーブルの列に特定の制約をかけておくもの

* NOT NULL制約 : NULLを許容しない
* 一意制約 : 同じテーブル内に重複を許さない
* 主キー制約 : 一意制約 + NOT NULL制約

### INSERT

```sql
INSERT INTO test.t_actual_detail (YM, item_cd, customer_cd, quant)
VALUES (201703, 9999999, 2000001, 999);
```

### UPDATE

```sql
UPDATE test.m_customer SET customer_name = CONCAT(customer_name, '_変更後'), customer_dev = 2
WHERE customer_cd = 20000001;
```

### DELETE

```sql
DELETE FROM test.m_customer WHERE customer_cd = 20000001;	
```

### プロシージャ

プロシージャとはINSERT / UPDATE / DELETEを組み合わせてプログラム化したもの
変数や条件分岐、繰り返しなどを使うことができる

MySQLの場合は最初に区切り文字を変更しておく(プログラム内で;で区切るため)
CREATE PROCEDURE ●●●●でプロシージャを定義する
変数を定義するときはDECLAREを使い、値を入れるときはSETを使う

```sql
DELIMITER //
CREATE PROCEDURE test.sample(IN v_dept_cd VARCHAR(10), IN v_dept_name VARCHAR(50))
BEGIN
	UPDATE test.m_dept
		SET dept_name = v_dept_name
	WHERE dept_cdd = v_dept_cd
	;
	COMMIT;
END
//
DELIMITER ;
```

```sql
call test.sample('3100001', '青果事業部') # 実行
```

## データベース設計

### DBオブジェクトの種類

* Schema : 色々なオブジェクトが格納される箱
* Table : テーブル、データを行列で保管する表、行と列で構成される
* View : ビュー、データの見方を保存したもの(SELECT文)
* Procedure : プロシージャ、処理の手順をまとめたもの、DBで実行できるバッチプログラム
* Index : インデックス、高速にデータ検索するための索引
* Trigger : プロシージャなどの処理を起動するトリガー、データの追加/更新時など
* Sequence : シーケンス、連番、コード採番時などに利用
* Synonim : シノニム、別名の定義

### テーブル定義

テーブルを定義する時にはどのような**列(カラム)**を保持するか検討する必要がある
またカラムには**型**と**桁**がある

型 : どのようなデータを格納できるか定義した情報(VARCHAR、INT、FLOAT、DATE、DATETIMEなど)
桁 : 最大何桁、何文字まで格納できるかの定義

またデータベースには**制約**という概念もある
そのカラムに格納する値が制約に違反しているとエラーとなり追加や更新/削除はなされない

* NOT NULL制約
* UNIQUE制約
* 主キー制約(プライマリーキーPK)
* 参照整合性制約、外部キー制約

### ビュー

次のようなケースで利用できる

* ビジネスユーザが使う場合 : 複雑なクエリを書かなくてもデータを抽出できる、秘匿性やシステム用途の項目隠蔽
* 他DBを参照している場合 : 指定を簡略化するためにViewにまとめてしまう
* I/F用のデータ準備 : 他のシステムに渡すようなデータを簡易的に準備する

### データの種類(マスタとトラン)

マスタ : 業務を遂行するための基礎データ、取引先マスタや品目マスタ、従業員マスタなど**対象の全量**を表す
トランジション : 手続きや取引、**業務によって発生した内容**を記録するデータ、受注データ、売り上げデータなど

### データの種類(構造化データと非構造化データ)

構造化データ : 行と列で表現できる
非構造化データ : 動画や音声、画像といった行列では管理できないデータ

### 目的に応じたデータベース構造

管理・業務系 : 正規化したDBを設計することが多い、効率的な更新や整合性を重視する
分析・レポーティング : 分析しやすいように加工、**スタースキーマ**や**スノーフレーク**など

※分析・レポーティングではマスタを**ディメンジョン**、トランを**ファクト**と呼ぶことがある
またこのようなデータベースを**DWH(データウェアハウス)**と呼ぶこともある

### 正規化

データを扱いやすい形式にして矛盾なく整合性を保った状態で蓄積や管理をするための方法

#### ①非正規形 → 第一正規形

行の結合や繰り返し(内容が同じものが別々のカラムで管理されているなど)を削除する

#### ②第一正規形 → 第二正規形

第一正規形ではカラム列の更新時に全ての該当する行を変更する必要があるため、第二正規形へ変化させる
関数従属と部分関数従属を用いる

**関数従属**
主キーが決まれば他の値が特定できる状態
つまりあるテーブルで主キーを元にそれに紐づく項目を取得できるような状態

**部分関数従属**
部分的に関数従属している状態
つまりあるテーブルで主キーを含めた他のいくつかのIDを使って項目を取得できるような状態

ここの変換においては部分関数従属を削除していく
言い換えると主キーの一部が決まれば値が特定できるようなものは別テーブルに切り出す

#### ③第二正規形 → 第三正規形

第二正規形の中で主キー以外の項目に関数従属している項目が残っていればこれを排除する
つまり新しく項目に対するIDを項目内容を紐付けたテーブルを切り出し、IDを元に参照する形にする

### DWHの設計方法

正規化とはまた異なった概念でデータを保持する
正規化ではデータの蓄積や管理が目的だったがDWHではデータの抽出をいかに簡単に素早くできるかが肝になる
よって正規化から外れていたとしても分析のしやすさを優先した設計にすることがある

#### スタースキーマ

1つのファクト(トラン)に1階層のディメンジョン(マスタ)を複数結合する方式
ファクトが中心にあり、それを囲むディメンジョンの形がスターに似ている
クエリが単純になりやすく、抽出の用意さや速度向上が目的

#### スノーフレーク

1つのファクトに複数階層のディメンジョンを結合する方式
雪の結晶のように枝分かれしていく見た目からこのように呼ばれる
スタースキーマよりも抽出時の複雑さや抽出時間は増加する傾向にある

あくまでDWHの目的を考えると極力スタースキーマにするのがベスト

### 分析/レポーティングに使うDBの用語

* Staging / データレイク : ソースシステムから連携したままのデータを格納する
* DWH : 重要指標(KGIやKPI)や汎用的な集計を保持、データ抽出しやすく加工したデータを保存するデータベース
* Datamart / データマート : 特定の目的(レポートなど)に特化して集計されたデータ

### 物理削除と論理削除

物理削除 : 実際にデータをDELETEで削除する
論理削除 : 実際にはデータは残すが、削除フラグを立てるなどして削除とみなす

管理やデータの蓄積を目的としたテーブルの場合は**ほとんど論理削除が採用される**

一方でレポーティング系のデータベースの場合は**洗い替え**といい全件削除してからデータ追加を行うことも多い

### データの保持と退避

保持期間が長すぎると1つのテーブルに大量のデータが保持されることになりパフォーマンスに影響が出てくる
よって適宜**退避テーブル**を作成する、**ファイルにエクスポートする**などの回避策が取られる

ただし一般的に退避テーブルは1つにしておくことが望ましい
(後から抽出更新するときに非常に複雑になってしまうため)

### データベース設計の大まかな流れ

1. ER図 : エンティティ(テーブル)を洗いだし、その関係性を設計する
2. ドメイン定義 : テーブルの各列に適用するドメイン(定義域)を定義する
3. 列定義 : ドメインを用いて各テーブルのカラムを定義
4. インデックス : インデックス定義

### ER図

ER図とはEntity-Relationship-Diagramのこと
エンティティ(テーブル)の関係性を視覚化した図

最低限主キーや外部キー、1対多などのエンティティ同士の関連性がわかるようにしておく

### ドメイン

ドメインとはDBの世界では概ね以下のような項目をまとめたものを指す

* 論理名 : 列につけるあだ名のようなもの、日本語が多い
* 物理名 : 実際にデータベースで使用する名前、英語が多い
* 型 : VARCHARなど列に入る値の型
* 桁 : 列に入る値の桁数
* NOT NULL制約の有無
* デフォルト値
* コメント

### テーブル設計

必要なドメインの定義が終わったらテーブルの設計を行う
テーブルごとにテーブル単位で設定する内容(物理名や論理名、コメントなど)や列ごとに設定する内容(列の論理名や物理名)を記載していく

最終的にマクロなどで記載した内容をDDL出力できるようにしておくと効率的

### インデックス設計

インデックスとはクエリやバッチ処理などのデータ操作の際に高速に動作させるためのDBオブジェクト
しかし適切に設定しないとインデックス自体が利用されなかったり逆に遅くなったりする

一般には結合条件や抽出条件によく利用されている項目をピックアップしてインデックスを設定することが多い

テーブルのデータに変化が生じるとインデックスの更新も実行されるため、インデックスが多くなると処理速度が遅くなる、また**主キーや外部キーに関しては制約を作成するのと同時にインデックスも作成される**

### アンチパターン

#### 項目にカンマなどの区切り文字を使う

項目内にカンマなどの区切り文字があると列を長くしなければいけなかったり、外部テーブルに切り出せないなどの弊害がある

よってこれは別の行としてそれぞれ分けた方が良い

#### とりあえずIDを主キー設定する

データの内容で主キーを設定しているものを**自然キー(ナチュラルキー)**といい、IDを付番してそれを主キーとしたものを**代替キー(サロゲートキー)**という

自然キーが使える場合はこれを使い、フレームワークの都合や煩雑な場合に代替キーを使うようにする
