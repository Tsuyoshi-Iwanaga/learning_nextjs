---
title: 'TCP/IP'
date: '2021-10-03'
---

## ①はじめに

### TCP/IPとは

異なるシステム同士を繋ぐための仕組み(プロトコル)

### Network Namespaceとは

Dockerでも使用されているLinuxの機能、システムからネットワークとして独立したVMを作成できる

### 動作環境

Ubuntu 20.04 LTS

## ②TCP/IP

TCP (Transmission Control Protocol)
IP (Internet Protocol)

### プロトコルの階層

**OSI参照モデル**

* アプリケーション層
* プレゼンテーション層
* セッション層
* トランスポート層 (TCP)
* ネットワーク層 (IP)
* データリンク層 (イーサネット)
* 物理層 (ケーブルや端子など)

※ TCP/IPはOSI参照モデルから独立した階層構造を自分たちで定義している

※プロトコルは**IETF**(Internet Engineering Task Force)が中心になってRFC(Request for Comment)を発行し標準化を進めている。階層が低いレイヤー(データリンク層と物理層)については実際の製品やハードの側面が大きいので**IEEE**(The Institute of Electrical and Electronics Engineers, Inc)という組織で標準化を進めている

### モジュールインストール

必要なパッケージをインストール

```shell
sudo apt-get update
sudo apt-get -y install \
	bash coreutils grep iproute2 iputils-ping traceroute tcpdump bind9-dnsutils dnsmasq-base \
	netcat-openbsd python3 curl wget iptables procps isc-dhcp-client
```

### ping

ネットワークで疎通を確認するのに使われる

**ICMP**(Internet Control Message Protocol)というプロトコルが内部では使われている
ICMPのエコーリクエストとエコーリプライというメッセージをやりとりする

ICMPはIPのプロトコルで運ばれるため、pingコマンドではIPとICMPを組み合わせて使うことになる

```shell
ping -c 3 8.8.8.8
```

Google(8.8.8.8)の公開DNSサーバに対して3回送信を行うというコマンド

### ヘッダ

通信を成立させるために必要な情報が含まれる
TCP/IPに限らず各プロトコルごとに様々なヘッダが存在する

またヘッダーを構成する一つ一つの要素をフィールドという
例えばIPプロトコルのヘッダにはIPアドレスを記載するフィールドが存在するなど

### IPのヘッダ(数字はビット数)

IP(IPv4)プロトコルのフォーマット

Version 4
IHL 4
Type of Service 8
TotalLength 16
Iidentification 16
Flags 3
Fragment Offset 13
Time to Live 8
Protcol 8
Header Checksums 16
Source Address 32
**Destination Address** 32 ※送り先のIPアドレス(8.8.8.8とか)
Options 24
Padding 8
Payload 32...

### ICMPのヘッダ(数字はビット数)

Type 8
Code 8
Checksum 16
Identifier 16
Sequence Number 16
Data ... 32

### IPとICMPのプロトコルを組み合わせる

IPヘッダの末尾(Payload)にICMPのヘッダが入る
どこからがICMPのヘッダなのかはIPのヘッダであるProtcolフィールドを参照する
(例えば後続のPayloadに格納されるのがICMPのデータであればここには1がセットされる)

### 自分のIPアドレスを調べてみる

```shell
ip address show
```

inetと記載されている横にあるのがIPアドレス

lo: や enp0s3: などはネットワークインターフェースという
(※ざっくりいうとLANケーブルを差すNICや無線LANアダプタなどを表す)

lo: には127.0.0.1というIPアドレス(ループバックアドレス)が付与されている
enp0s3: には例えば10.0.2.15というIPアドレスが付与されている

### パケットキャプチャ

```shell
sudo tcpdump -tn -i any icmp 
```

-t : 時刻に関する情報を出力しない
-n : IPアドレスを逆引きせずそのまま表示する
-i : パケットキャプチャするネットワークインターフェースを指定、anyなので全てが対象になる

上記の状態でpingを8.8.8.8に対して打つと下記のような表示がされる

```shell
IP 172.17.0.2 > 8.8.8.8: ICMP echo request, id 3676, seq 1, length 64
IP 8.8.8.8 > 172.17.0.2: ICMP echo reply, id 3676, seq 1, length 64
```

### ルータ

ルータの役割は別ルータまたはホストから送られてきたパケットを次のルータもしくはホストへ送ること
一般的に家庭に置いてあるルータはブロードバンドルータと呼ばれている

IPアドレスを持ってネットワークにつながる機器のうち、ルータでないものを**ホスト**という
また、ルータもホストも区別せずネットワークに接続されたコンピュータの総称を**ノード**という

### 通信経路の確認 trace route

パケットがどのような道順を通って目的地まで到達したかを確認するコマンド
具体的には通過するルータごとに1行で表示される

よって途中に表示されるのはルータの持つIPアドレス
また通過するルータの台数のことを**ホップ数**という

```shell
traceroute -n 8.8.8.8
```

tracerouteコマンドはIPヘッダの**TTL(Time to Live)**というフィールドを活用する
TTLは本来は届く範囲を制限したり、ループしたネットワークでパケットが滞留しないように利用される

TTLのフィールドには0〜255までの値が入る
パケットを作成し送り出すときにノードが初期値を設定し、ルータを通過するたびに1ずつ増えていく
経路上で値が0になるとパケットはルータによって破棄され、破棄したルータはICMPで時間切れ(Time Exceeded)のメッセージをパケット送信元に送る

tracerouteではあえてTTLに小さな値を設定したパケットを送り、経路上でパケットの破棄を発生させる
具体的には1から順番に数字を増やしたパケットを送り、それぞれのルータから送られてくる時間切れのメッセージを受け取ることでパケットの経路を調べることができるという仕組み

ただし、ルータの設定によっては時間切れのメッセージを送らないこともある
その場合はtracerouteでの表示は*となってしまう
※場合によっては**-I**オプションをつけると返してくれることもある

### ルーティングテーブル(経路表)

インターネットにつながるノードはそれぞれルーティングテーブルを持っており
下記のコマンドで確認することができる

```shell
ip route show
```

```shell
default via 172.17.0.1 dev eth0 
172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.2
```

ルーティングテーブルは複数のルーティングエントリによって構成されている
ルーティングエントリは大きく分けて**宛先**と**次にパケットを渡す相手(ネクストホップ)**を表している
defaultは他のどのルーティングエントリにも該当しないときに使われる(デフォルトルート)

defaultはここでは172.17.0.1(おそらくルーター)に転送する設定になっている
また172.17.0.0/16についてはeth0のネットワークインターフェイスを使って通信する設定になっている
（自分自身が所属しているネットワークなのでそれを使うという意味）

※ devと表示がなっていてもトンネリングなどの技術を用いているネットワークの場合は直接通信できないこともある
(論理的には直接ネットワークに参加しているようでも物理的には複数のルータを経由することがあるため)

### ルーティングの手順

* 他のノードからパケットが送られてくる
* 受け取ったパケットのヘッダにある送信先のIPアドレスを調べる
* 手元のルーティングテーブルから送信先IPアドレスが当てはまる宛先を探す
* 一致した宛先に対応するネクストホップを取得する
* ネクストホップに対してパケットを渡す(**フォワーディング**ともいう)

### IPv4とIPv6

様々な方法がありはするが基本的には互換性はなくそれぞれのインターネット用にIPアドレスが必要
(※NAT64/DNS64など異なるアドレス体系のインターネットへ間接的にアクセスする技術もある)

Ip address showコマンドでinet6となっている項目はIPv6のIPアドレス
IPv4は32ビット、IPv6は128ビットでアドレスを表現する

## ③ Network Namespace

Dockerなどを構成するLinuxの機能

```shell
sudo ip netns add helloworld #作成
```

```shell
ip netns list #一覧表示
```

```shell
sudo ip netns exec helloworld ip address show #NN上でコマンドを実行
```

```shell
sudo ip netns exec helloworld bash #NN上でシェルを起動
```

```shell
sudo ip netns delete helloworld #削除
```

NetworkNamespaceを作成した直後はenp0s3などのネットワークインターフェースが存在しない
またルートテーブルを確認しようとするとエラーになる(ルーティングエントリを登録していないため)

NetworkNamespaceはdeleteコマンドで明示的に削除することもできるが、そのままだと永続化されないのでLinuxを再起動することによっても削除することができる

### 2つのNetworkNamespaceを繋いでみる

2つのNetworkNamespaceを作成し接続していく

まずは2つNetworkNamespaceを作る

```shell
sudo ip netns add ns1
sudo ip netns add ns2
```

次に**veth**(Virtual Ethernet Device)という仮想的なネットワークインターフェースを使用する
下記のコマンドで作成する

作成したvethインターフェースは2つのネットワークがペアになって機能する
片方のネットワークインターフェースにパケットが入るともう片方から出てくるようなイメージ
(1本のLANケーブルで繋がった2枚のNICのようなもの)

```shell
sudo ip link add ns1-veth0 type veth peer name ns2-veth0
```

```shell
ip link show #確認
```

ちなみに作成しただけだとシステムの領域に存在し、NSでは使えるようになっていない
よってNSの領域にこのvethを移す必要があるので下記のコマンドを使う

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set ns2-veth0 netns ns2
```

```shell
ip link show #コマンド実行後は先程のvethが見えなくなっている
```

これで2つのネットワーク(ns1とns2)がvethによって接続された(ns1-veth0とns2-veth0)
続けて通信ができるようにネットワークの設定を行う

まずはIPアドレスをvethに対して付与する

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec ns2 ip address add 192.0.2.2/24 dev ns2-veth0
```

さらにvethのstateという項目がDOWNになっているのでUPに変更する
(NICにケーブルを接続するようなイメージ)

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec ns2 ip link set ns2-veth0 up
```

これで準備は完了、ns1とns2で双方にPingを送り合ってみる

```shell
sudo ip netns exec ns1 ping -c 3 192.0.2.2
sudo ip netns exec ns2 ping -c 3 192.0.2.1
```

### セグメントとは

同じネットワークのセグメントに所属するIPアドレス同士は、基本的にルータがなくても通信が可能
先の例だとvethがどちらも同じネットワークセグメントのIPアドレスだったのでルータなしで通信ができた
※セグメントは「ネットワーク」「サブネットワーク」など別の呼ばれ方をすることも多い

よってルータが必要になるのは基本的に異なるセグメントの相手と通信をしたいときということになる
異なるセグメントを接続するのがルータの役割

### CIDR(Classless Inter-Domain Routing)

IPv4では32ビットで、8ビットごとに区切った空間を**オクテット(Octet)**と呼ぶ
またIPアドレスは**ネットワーク部**と**ホスト部**に分かれている

このIPアドレスのネットワーク部こそセグメントを表現している
ここが同じIPアドレスは同じセグメントに所属すると言える

ただし具体的にどこのビットまでがネットワーク部で、どこからがホスト部かどうかを知る必要があり、
それを表現するためにCIDR表記が用いられる

192.0.2.1/24 ⇨ 192.0.2.0がネットワーク部、0.0.0.1がホスト部
※ビットの境目までの長さを**プレフィックス長**という

### サブネットマスク

ネットワーク部とホスト部の境目を表現するためのCIDRとは別の表記方法
ネットワーク部だけを1に、ホスト部を0にした32ビットの整数

例 255.255.255.0 ⇨ /24と同じ

これをIPアドレスのビット列とAND演算するとネットワークアドレスを求めることができる

### ルータを入れてみる

