---
title: 'DB(SQL/DB設計)'
date: '2021-10-22'
---

## SQLとは

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



