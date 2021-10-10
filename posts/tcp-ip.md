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

まず3つのNSを作成

```shell
sudo ip netns add ns1
sudo ip netns add ns2
sudo ip netns add router
```

それぞれのNSを繋ぐvethを作成

```shell
sudo ip link add ns1-veth0 type veth peer name gw-veth0
sudo ip link add ns2-veth0 type veth peer name gw-veth1
```

vethをそれぞれのNSに配置

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set gw-veth0 netns router
```

```shell
sudo ip link set ns2-veth0 netns ns2
sudo ip link set gw-veth1 netns router
```

それぞれのvethインターフェースをUPの状態にする

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec router ip link set gw-veth0 up
```

```shell
sudo ip netns exec ns2 ip link set ns2-veth0 up
sudo ip netns exec router ip link set gw-veth1 up
```

IPアドレスを設定する(ns1とns2は別のセグメントに所属させる)

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec router ip address add 192.0.2.254/24 dev gw-veth0
```

```shell
sudo ip netns exec ns2 ip address add 198.51.100.1/24 dev ns2-veth0
sudo ip netns exec router ip address add 198.51.100.254/24 dev gw-veth1
```

ルータに設定するIPアドレスは特に制限はないが、一般的にはセグメントの先頭もしくは末尾のIPアドレスを使うことが多い。ちなみに.255のアドレスは**ブロードキャストアドレス**といってホストアドレスとしては使用できない。
ブロードキャストアドレスはそのセグメントに所属するすべてのノードに対して通信したいときに使う

またホスト部のビットがすべて0の時は**ネットワークアドレス**となるためこれもホストアドレスとしは使用できない

通信の確認のためまずはnsとrouterが疎通できるか確認

```shell
sudo ip netns exec ns1 ping -c 3 192.0.2.254 #ns1からrouter 問題なし
sudo ip netns exec router ping -c 3 192.0.2.1 #routerからns1 問題なし
```

```shell
sudo ip netns exec ns2 ping -c 3 198.51.100.254 #ns2からrouter 問題なし
sudo ip netns exec router ping -c 3 198.51.100.1 #routerからns2 問題なし
```

次にrouter越しにns1からns2に通信できるか確認

```shell
sudo ip netns exec ns1 ping -c 3 198.51.100.1 #ns1からns2 エラーとなる
```

エラーとなってしまう理由はルーティングの設定がルーティングテーブルに記載されていないため
現在のルーティングテーブルの設定を確認してみる

```shell
sudo ip netns exec ns1 ip route show
# 192.0.2.0/24 dev ns1-veth0 proto kernel scope link src 192.0.2.1 
```

つまり現状ではns1から198.51.100.1への通信が発生した際に、どこへパケットを渡せばいいのかわからない状態になっている。そこでデフォルトルートを設定し、ルーターに向くように設定する

```shell
sudo ip netns exec ns1 ip route add default via 192.0.2.254
```

ns2にも同じように設定する

```shell
sudo ip netns exec ns2 ip route add default via 198.51.100.254
```

最後にrouterにて下記の設定をおこなう
sysctlはカーネルの設定を変更するコマンドで、**プロトコルスタック**と呼ばれるパケットを処理する領域もここに含まれている。
net.ipv4.ip_forwardのパラメータを1にして有効化するとLinuxにおいてIPv4のルータとして動作するようになる

```shell
sudo ip netns exec router sysctl net.ipv4.ip_forward=1
```

ns1とns2で無事疎通が確認できればOK

```shell
sudo ip netns exec ns1 ping -c 3 198.51.100.1
sudo ip netns exec ns2 ping -c 3 192.0.2.1
```

### ルータを増やしてみる(目的地までに複数のルータを介する場合)

```shell
sudo ip netns add ns1
sudo ip netns add ns2
sudo ip netns add router1
sudo ip netns add router2
```

```shell
sudo ip link add ns1-veth0 type veth peer name gw1-veth0
sudo ip link add gw1-veth1 type veth peer name gw2-veth0
sudo ip link add gw2-veth1 type veth peer name ns2-veth0
```

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set gw1-veth0 netns router1
sudo ip link set gw1-veth1 netns router1
sudo ip link set gw2-veth0 netns router2
sudo ip link set gw2-veth1 netns router2
sudo ip link set ns2-veth0 netns ns2
```

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec router1 ip link set gw1-veth0 up
sudo ip netns exec router1 ip link set gw1-veth1 up
sudo ip netns exec router2 ip link set gw2-veth0 up
sudo ip netns exec router2 ip link set gw2-veth1 up
sudo ip netns exec ns2 ip link set ns2-veth0 up
```

IPアドレスの付与を以下のように行う(ns1とns2の間に2台のルータが存在する)

* ns1とrouter1は同じセグメント(192.0.2.0/24)
* router1とrouter2は同じセグメント(203.0.113.0/24)
* router2とns2は同じセグメント(198.51.100.0/24)

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec router1 ip address add 192.0.2.254/24 dev gw1-veth0
sudo ip netns exec router1 ip address add 203.0.113.1/24 dev gw1-veth1
sudo ip netns exec router2 ip address add 203.0.113.2/24 dev gw2-veth0
sudo ip netns exec router2 ip address add 198.51.100.254/24 dev gw2-veth1
sudo ip netns exec ns2 ip address add 198.51.100.1/24 dev ns2-veth0
```

ns1とns2にはデフォルトルートとして各セグメントのルータのIPアドレスを設定

```shell
sudo ip netns exec ns1 ip route add default via 192.0.2.254
sudo ip netns exec ns2 ip route add default via 198.51.100.254
```

ルータのカーネルパラメータを変更

```shell
sudo ip netns exec router1 sysctl net.ipv4.ip_forward=1
sudo ip netns exec router2 sysctl net.ipv4.ip_forward=1
```

この状態で試しにpingを打つ

```shell
sudo ip netns exec ns1 ping -c 3 198.51.100.1
# From 192.0.2.254 icmp_seq=1 Destination Net Unreachable
```

192.0.2.254とはrouter1のNSとなっている、つまり198.51.100.1に宛てたパケットをルータが受け取ったが、それを次にどこへ渡したらよいのかわからなかったということをいっている

これを解決するためにはルータにもルーティングテーブルにてルーティングエントリを追加する必要がある

```shell
sudo ip netns exec router1 ip route add 198.51.100.0/24 via 203.0.113.2
sudo ip netns exec router2 ip route add 192.0.2.0/24 via 203.0.113.1
```

再びpingを打つとns1とns2で相互に通信ができていることがわかる

```shell
sudo ip netns exec ns1 ping -c 3 198.51.100.1 #OK
sudo ip netns exec ns2 ping -c 3 192.0.2.1 #OK
```

今回のように直接繋がっていないセグメントの情報はノードに対して何らかの方法で教えてあげる必要がある
手作業でルーティングエントリを追加する方法は**スタティックルーティング**(静的経路制御)という

他にはルータ同士が自律的に自身の知っているルーティング情報を教え合う方法もある
これは**ダイナミックルーティング**(動的経路制御)といい、BGP(Border Gateway Protcol)やOSPF(Open Shortest Path First)といった専用のプロトコルが用いられルーティングプロトコルと呼ばれる

## ④イーサネット

OSI参照モデルの物理層とデータリンク層に位置するプロトコルを含んだ規格
現在の家庭やオフィスなどではほとんどイーサネットが用いられている

### フレーム

イーサネットでデータを送る単位を**フレーム**という
IPのパケットは異なるフレームに積みかえられながら最終目的地まで届くようになっている

### MACアドレス

フレームごとにデータの送信元と送信先を管理する必要があるが、そこで**MACアドレス**(Media Access Control address)が使用される。別名ハードウェアアドレスとも呼ばれ、イーサネットのフレームを送受信するネットワーク機器ごとに付与される

MACアドレスは48ビットの空間を持つ正の整数で、ネットワーク機器ごとに一意になるようになっている
よって同じMACアドレスを持った製品は全世界で1つだけになることが期待されている
(※実際には厳密ではなく同時に同じMACアドレスを持つ機器が存在する可能性はゼロではないが、ブロードキャストドメイン内で重複しなければ問題ない)

48ビットの空間において上位24ビットと下位24ビットで意味が分かれている
上位がネットワーク機器を製造するベンダーごとに、下位24ビットはベンダーが機器の識別子が一意となるように割り当てながら製造している
通常は48ビットを8ビットごとに区切った00:00:5E:00:53:01などで表すことが多い

### フレームを観察する

まずは実験用のネットワークを作成(2つのNSを繋ぎIPアドレスを付与)

```shell
sudo ip netns add ns1
sudo ip netns add ns2
```

```shell
sudo ip link add ns1-veth0 type veth peer name ns2-veth0
```

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set ns2-veth0 netns ns2
```

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec ns2 ip link set ns2-veth0 up
```

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec ns2 ip address add 192.0.2.2/24 dev ns2-veth0
```

観察のためにvethインターフェースのMACアドレスを変更してみる(デフォルトではランダム)

```shell
sudo ip netns exec ns1 ip link set dev ns1-veth0 address 00:00:5E:00:53:01
sudo ip netns exec ns2 ip link set dev ns2-veth0 address 00:00:5E:00:53:02
```

確認してみる

```shell
sudo ip netns exec ns1 ip link show | grep link/ether
sudo ip netns exec ns2 ip link show | grep link/ether
```

パケットキャプチャの準備をする

```shell
sudo ip netns exec ns1 tcpdump -tnel -i ns1-veth0 icmp
```

-t 時間の情報を表示しない
-n IPアドレスの逆引きをしない
-e イーサネットのヘッダ情報を表示する
-l NSでtcpdumpコマンドを使用するときにつけておくと表示がスムーズになる

ns1からns2へpingをうつ

```shell
sudo ip netns exec ns1 ping -c 1 192.0.2.2
```

tcpdumpで監視していた方にはこのように表示される

```shell
00:00:5e:00:53:01 > 00:00:5e:00:53:02, ethertype IPv4 (0x0800), length 98: 192.0.2.1 > 192.0.2.2: ICMP echo request, id 62115, seq 1, length 64
00:00:5e:00:53:02 > 00:00:5e:00:53:01, ethertype IPv4 (0x0800), length 98: 192.0.2.2 > 192.0.2.1: ICMP echo reply, id 62115, seq 1, length 64
```

### MACアドレスを知るには

IPアドレスからMACアドレスを取得する際には**ARP**(Address Resolution Protocol)というプロトコルが使われる
tcpdumpにこの情報も出力させて確認してみる

まずはMACアドレスのキャッシュを削除

```shell
sudo ip netns exec ns1 ip neigh flush all
```

tcpdumpにてキャプチャするプロトコルにARPを追加して実行

```shell
sudo ip netns exec ns1 tcpdump -tnel -i ns1-veth0 icmp or arp
```

pingを打つと下記のように出力される

```shell
00:00:5e:00:53:01 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 192.0.2.2 tell 192.0.2.1, length 28

00:00:5e:00:53:02 > 00:00:5e:00:53:01, ethertype ARP (0x0806), length 42: Reply 192.0.2.2 is-at 00:00:5e:00:53:02, length 28

00:00:5e:00:53:01 > 00:00:5e:00:53:02, ethertype IPv4 (0x0800), length 98: 192.0.2.1 > 192.0.2.2: ICMP echo request, id 62149, seq 1, length 64

00:00:5e:00:53:02 > 00:00:5e:00:53:01, ethertype IPv4 (0x0800), length 98: 192.0.2.2 > 192.0.2.1: ICMP echo reply, id 62149, seq 1, length 64

00:00:5e:00:53:02 > 00:00:5e:00:53:01, ethertype ARP (0x0806), length 42: Request who-has 192.0.2.1 tell 192.0.2.2, length 28

00:00:5e:00:53:01 > 00:00:5e:00:53:02, ethertype ARP (0x0806), length 42: Reply 192.0.2.1 is-at 00:00:5e:00:53:01, length 28
```

一番上の通信ではARPにて192.0.2.2のIPアドレスをどの機器が持っているか192.0.0.1に教えてくれるように要求している、これは**ARPリクエスト**と呼ばれる

それに対して二番目の通信で192.0.2.2は00:00:5e:00:53:02が持っていると返答している、これを**ARPリプライ**という

また最初の通信で問い合わせ先がff:ff:ff:ff:ff:ffとなっているが、これはブロードキャストアドレスでフレームが届く範囲内ですべての機器に問い合わせるという意味、このようにブロードキャストアドレスに送信先が指定されたフレームを**ブロードキャストフレーム**、またブロードキャストフレームが届く範囲を**ブロードキャストドメイン**という

### パケットの積み替え

ブロードキャストドメイン内(一般的にはセグメントと同じ)での通信では、一つのフレームでパケットを直接送り届けることができる

パケットが積みかえられる様子を観察するため、セグメントが2つあるネットワークで実験してみる

```shell
sudo ip netns add ns1
sudo ip netns add ns2
sudo ip netns add router
```

```shell
sudo ip link add ns1-veth0 type veth peer name gw-veth0
sudo ip link add ns2-veth0 type veth peer name gw-veth1
```

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set gw-veth0 netns router
sudo ip link set gw-veth1 netns router
sudo ip link set ns2-veth0 netns ns2
```

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec router ip link set gw-veth0 up
sudo ip netns exec router ip link set gw-veth1 up
sudo ip netns exec ns2 ip link set ns2-veth0 up
```

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec router ip address add 192.0.2.254/24 dev gw-veth0
sudo ip netns exec router ip address add 198.51.100.254/24 dev gw-veth1
sudo ip netns exec ns2 ip address add 198.51.100.1/24 dev ns2-veth0
```

```shell
sudo ip netns exec ns1 ip route add default via 192.0.2.254
sudo ip netns exec ns2 ip route add default via 198.51.100.254
```

```shell
sudo ip netns exec router sysctl net.ipv4.ip_forward=1
```

MACアドレスを付与する

```shell
sudo ip netns exec ns1 ip link set dev ns1-veth0 address 00:00:5E:00:53:11
sudo ip netns exec router ip link set dev gw-veth0 address 00:00:5E:00:53:12
sudo ip netns exec router ip link set dev gw-veth1 address 00:00:5E:00:53:21
sudo ip netns exec ns2 ip link set dev ns2-veth0 address 00:00:5E:00:53:22
```

tcpdumpでパケットキャプチャするが、今回はrouterのgw-veth0とgw-veth1を別ウインドウでそれぞれ見てみる

```shell
sudo ip netns exec router tcpdump -tnel -i gw-veth0 icmp or arp
```

```shell
sudo ip netns exec router tcpdump -tnel -i gw-veth1 icmp or arp
```

ns1からns2へpingをうつ

```shell
sudo ip netns exec ns1 ping -c 3 198.51.100.1
```

ns1と繋がっているgw-veth0の出力

```shell
00:00:5e:00:53:11 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 192.0.2.254 tell 192.0.2.1, length 28 #ns1のデフォルトルートによりルータのMACアドレスを問い合わせ
00:00:5e:00:53:12 > 00:00:5e:00:53:11, ethertype ARP (0x0806), length 42: Reply 192.0.2.254 is-at 00:00:5e:00:53:12, length 28 #ルータより00:00:5e:00:53:12というMACアドレスが返される
00:00:5e:00:53:11 > 00:00:5e:00:53:12, ethertype IPv4 (0x0800), length 98: 192.0.2.1 > 198.51.100.1: ICMP echo request, id 62414, seq 1, length 64 #ns1からルータへパケットが送信
```

ns2と繋がっているgw-veth1の出力

```shell
00:00:5e:00:53:21 > ff:ff:ff:ff:ff:ff, ethertype ARP (0x0806), length 42: Request who-has 198.51.100.1 tell 198.51.100.254, length 28 #ルータから198.51.100.254に対応するMACアドレスを探す
00:00:5e:00:53:22 > 00:00:5e:00:53:21, ethertype ARP (0x0806), length 42: Reply 198.51.100.1 is-at 00:00:5e:00:53:22, length 28 #ns2が00:00:5e:00:53:22というMACアドレスを返す
00:00:5e:00:53:21 > 00:00:5e:00:53:22, ethertype IPv4 (0x0800), length 98: 192.0.2.1 > 198.51.100.1: ICMP echo request, id 62414, seq 1, length 64 #ルータからns1へパケットが送信される
```

通信の流れとしては以下のような感じ

* 自分のセグメント内のルーティングテーブルを参照し、どのIPアドレスへパケットを渡すか確認
* ARPによって渡すIPアドレスのMACアドレスを取得してその機器に対してフレームを作成しパケットを送信

### ブリッジ

一般家庭やオフィスでも**スイッチングハブ**といった複数の機器を接続する仕組みが導入されている
これをより一般化した概念が**ブリッジ**というもの
ネットワーク層でパケットを転送するための機器はルータだが、同じくデータリンク層でフレームを転送する機器をブリッジと呼ぶ。これを使うことで同じブロードキャストドメインにたくさんのネットワーク機器を繋げることができるようになる

ブリッジの仕事は**自身のどのポートにどのMACアドレスの機器が接続されているかを管理する**こと
フレームがやってくると送信先のMACアドレスを見て該当機器の繋がったポートへフレームを転送する

ポートとMACアドレスとの管理を行うための台帳は**MACアドレステーブル**という

NetworkNamespaceとvethインターフェースだけでは同じセグメントに2つのNamespaceしか繋げないが(直列)、ブリッジとして振る舞うLinuxの**ネットワークブリッジ**というものを使うと3つ以上のNamespaceを同じセグメントに繋ぐことができる

ここでは3つのNamespaceが接続されたセグメントを作成する

```shell
sudo ip netns add ns1
sudo ip netns add ns2
sudo ip netns add ns3
sudo ip netns add bridge
```

```shell
sudo ip link add ns1-veth0 type veth peer name ns1-br0
sudo ip link add ns2-veth0 type veth peer name ns2-br0
sudo ip link add ns3-veth0 type veth peer name ns3-br0
```

```shell
sudo ip link set ns1-veth0 netns ns1
sudo ip link set ns2-veth0 netns ns2
sudo ip link set ns3-veth0 netns ns3
sudo ip link set ns1-br0 netns bridge
sudo ip link set ns2-br0 netns bridge
sudo ip link set ns3-br0 netns bridge
```

```shell
sudo ip netns exec ns1 ip link set ns1-veth0 up
sudo ip netns exec ns2 ip link set ns2-veth0 up
sudo ip netns exec ns3 ip link set ns3-veth0 up
sudo ip netns exec bridge ip link set ns1-br0 up
sudo ip netns exec bridge ip link set ns2-br0 up
sudo ip netns exec bridge ip link set ns3-br0 up
```

```shell
sudo ip netns exec ns1 ip address add 192.0.2.1/24 dev ns1-veth0
sudo ip netns exec ns2 ip address add 192.0.2.2/24 dev ns2-veth0
sudo ip netns exec ns3 ip address add 192.0.2.3/24 dev ns3-veth0
```

```shell
sudo ip netns exec ns1 ip link set dev ns1-veth0 address 00:00:5E:00:53:01
sudo ip netns exec ns2 ip link set dev ns2-veth0 address 00:00:5E:00:53:02
sudo ip netns exec ns3 ip link set dev ns3-veth0 address 00:00:5E:00:53:03
```

ネットワークブリッジを作る(ネットワークインターフェースの一種なのでUPにしておく)

```shell
sudo ip netns exec bridge ip link add dev br0 type bridge
```

```shell
sudo ip netns exec bridge ip link set br0 up
```

ネットワークブリッジにvethインターフェースの片側を接続する

```shell
sudo ip netns exec bridge ip link set ns1-br0 master br0
sudo ip netns exec bridge ip link set ns2-br0 master br0
sudo ip netns exec bridge ip link set ns3-br0 master br0
```

pingを打ってみる

```shell
sudo ip netns exec ns1 ping -c 3 192.0.2.2 #ns1からns2へ
sudo ip netns exec ns2 ping -c 3 192.0.2.3 #ns2からns3へ
sudo ip netns exec ns3 ping -c 3 192.0.2.1 #ns3からns1へ
```

いずれも正常に疎通できるのでネットワークブリッジを使って3つのNetworkNamespaceを同じセグメントに繋ぐことができた

念の為、MACアドレステーブルを確認してみる

```shell
sudo ip netns exec bridge bridge fdb show br br0 | grep -i 00:00:5e
```

MACアドレステーブルには有効期限があるため、うまくテーブルに出てこない時はpingを打つなどして通信すればネットワークブリッジが自動で登録してくれる

## ⑤トランスポート層のプロトコル

IPやイーサネットによってネットワーク上のホストまでパケットが届く仕組みは理解できた
しかしホストとなるPCでは多くのアプリケーションが動いており、届いたデータがどこで使われるものかわかる必要がある

またパケットが経路上で破棄された場合にそれを検知する仕組みも必要

上記のような課題はIPよりさらに上位のプロトコルで解決する必要がある
(つまりIPのペイロードとして扱われるプロトコル)

トランスポート層のプロトコルとして知られるものはいくつかある

* TCP (Transmission Control Protocol)
* UDP (User Datagram Protocol)
* SCTP (Stream Control Transmission Protocol)
* DCCP (Profile for Datagram Congestion Control Protcol)

### UDP

UDPを使うことでホストに届いたパケットがどのアプリケーションで使用されているかがわかる
ヘッダーには**ポート**というフィールドがあり、16ビットの正の整数が入る
この数字を**ポート番号**ともいう

アプリケーションが通信を開始する際にはマシンの特定ポートを使用し、基本的には他のアプリケーションはそれを同時に使うことはできないようになっている(デフォルトでエラーになる、がLinuxであればSO_REUSEPORTのようなオプションで回避することもできる)

Source Port (16ビット) → 送信元のポート番号
Destination Port (16ビット) → 送信先のポート番号

アプリケーションが通信をする際にポートを決める方法として2通りがある
①外部からの通信を待ち受ける場合、**ウェルノウンポート**が使用される
②自分から通信を始める場合、OSが自動的に割り当てる**エフェメラルポート**が使用される

※ポートは16ビットの正の整数なので0〜65535まで使用できる
その中でも下記のように大きく分類が決まっている

* 0 - 1023 システムポートもしくはウェルノウンポート
* 1024 - 49151 ユーザポートもしくはレジスタードポート
* 49152 - 66535 ダイナミックポート、もしくはプライベートポート

システムポートとユーザポートは**IANA** (Internet Assigned Numbers Authority)という組織が管理している
よって新しい用途で使うのであればダイナミックポートの範囲から選ぶのが望ましい

### ncで通信してみる

ループバックアドレスを使いUDPの54321ポートで通信を待ち受ける

```shell
nc -ulnv 127.0.0.1 54321
```

-u UDPで通信する
-l サーバとして動作させる
-n IPアドレスをDNSで名前解決させない
-v コマンドの表示を詳細にする

続いてクライアントを用意して上記のサーバに接続してみる
このコマンドを打っただけではサーバに接続するのみでまだ通信は行われない

```shell
nc -u 127.0.0.1 54321
```

また別ターミナルでtcpdumpを立ち上げる
ループバックアドレスを使って行われるUDPの54321ポートの通信をキャプチャする
Aオプションはキャプチャした内容をASKII文字列として表示させるオプション

```shell
sudo tcpdump -i lo -tnlA "udp and port 54321"
```

この状態でクライアント側からHello World!とメッセージを入力すると、UDPを使ってサーバへと送られる

```shell
Connection received on 127.0.0.1 47880 #クライアントは47880のエフェメラルポートを使っていることがわかる
HelloWorld!
```

tcpdumpの出力を見るとこのような感じになっている
先ほど入力した文字列が末尾に記載されており、UDPのペイロードとして運ばれていることがわかる

```shell
IP 127.0.0.1.47880 > 127.0.0.1.54321: UDP, length 12
E..(..@.@.K............1...'HelloWorld!
```

UDPは**コネクションレス型**といい、送ったら送りっぱなしのプロトコルになっているため、途中経路でパケットが破棄されていてもなにも関知しない。よってUDPを使って信頼性のある通信を実現させたいときはさらに上位層のプロトコルで対処を行う必要がある

### TCP

TCPはUDPと同じく通信しているアプリケーションをポートで区別することができる
またそれに加えて信頼性のある通信を実現する仕組みが取り入れられており、経路上でパケットが破棄されたとしてもそれをリカバリーする方法が用意されている(**コネクション型**)

パケットが途中で破棄されてしまった場合、同じデータを再び送信する(**再送制御**)
また途中でパケットを送った順番が変わってしまう(**アウトオブオーダー**)場合でもデータの送信順を受け取り側で正しく認識した状態で通信することができる

TCPはHTML(Hypertest Transfer Protocol)やメールを転送するSMTP(Simple Mail Transfer Protocol)で採用されている

**TCPのヘッダ**

* Source Port (16) 送信元のポート
* Destination Port (16) 送信先のポート
* Sequence Number (32)
* Acknowledgement Number (32)
* Data Offset (4)
* Reserved (6)
* Flags (6)
* Window (16)
* Checksum (16)
* Urgent Pointer (16)
* Options (24)
* Padding (8)
* Data...

### nsコマンドを使ってみる

```shell
nc -lnv 127.0.0.1 54321 #サーバ側
```

```shell
sudo tcpdump -i lo -tnlA "tcp and port 54321"
```

※クライアント側を先に立ち上げるとTCPで重要な通信を見逃してしまうため先にtcpdumpを立ち上げる

```shell
nc 127.0.0.1 54321 #クライアント側
```

クライアント側を立ち上げるとUDPとは異なりデータを送信する前に自動的に通信が行われ3つの**セグメント**(TCPでのデータの単位)がtcpdumpの出力にて確認できる

1つ目→クライアントからサーバ
2つ目→サーバからクライアント
3つ目→クライアントからサーバ

```shell
IP 127.0.0.1.46336 > 127.0.0.1.54321: Flags [S], seq 1097950726, win 65495, options [mss 65495,sackOK,TS val 1310398121 ecr 0,nop,wscale 7], length 0
E..<..@.@..%...........1Aqf..........0.........
N...........

IP 127.0.0.1.54321 > 127.0.0.1.46336: Flags [S.], seq 629420098, ack 1097950727, win 65483, options [mss 65495,sackOK,TS val 1310398121 ecr 1310398121,nop,wscale 7], length 0
E..<..@.@.<..........1..%.0BAqf......0.........
N...N.......

IP 127.0.0.1.46336 > 127.0.0.1.54321: Flags [.], ack 1, win 512, options [nop,nop,TS val 1310398121 ecr 1310398121], length 0
E..4..@.@..,...........1Aqf.%.0C.....(.....
N...N...
```

この3つのセグメントのやりとりの目的は通信を始める前に相手とデータを送り合うことを互いに確認すること
この通信を**スリーハンドシェイク**という
これが問題なく完了するとTCPのコネクションが確立したとみなされる

またTCPにおいては**コントロールビット**という概念がある
これはTCPのヘッダに含まれる6ビット分のフラグ(0か1でフラグが立っているか表現)から構成されている

スリーハンドシェイクではコントロールビットのうち**SYN**と**ACK**というフラグが立ったセグメントを送る

1回目 クライアントからサーバへSYN
2回目 サーバからクライアントへSYN/ACK
3回目 クライアントからACK
→問題なければコネクション確立

### SYN

SYN(Synchronize sequence numbers)はこのビットが立ったパケットを送り合うことでお互いに**シーケンス番号**を同期する目的に使われる

シーケンス番号とはTCPがデータの順序を管理するのに使うフィールド(32ビット)で、送信する際にそれぞれのセグメントに連番が振られるようになっている。これによって受け取り側でセグメントがバラバラに届いても元の正しい順序でデータを解釈することができる

※シーケンス番号を1など決まった値からにしない理由はサイバー攻撃などでセッションの乗っ取りを防ぐ意図がある

### ACK

ACK(Acknowledgement field significant)はTCPが信頼できる通信を行うためにデータが届いていることを確認する用途で使用される

とあるセグメントを受信すると受信側はそのセグメントを受け取ったことをACKのフラグが立ったセグメントを送り返すことで示すことができる

送信側は送ったセグメントに対するACKが返ってこない場合は同じセグメントを何度か送り直す
こうして途中経路でパケットが破棄されることに対処している

### nsコマンドで通信をする(続き)

クライアントからサーバ側へ文字列を送ってみるとtcpdumpには下記が表示される

```shell
IP 127.0.0.1.46336 > 127.0.0.1.54321: Flags [P.], seq 1:14, ack 1, win 512, options [nop,nop,TS val 1311571570 ecr 1310398121], length 13
E..A..@.@..............1Aqf.%.0C.....5.....
N,.rN...Hello World!

IP 127.0.0.1.54321 > 127.0.0.1.46336: Flags [.], ack 14, win 512, options [nop,nop,TS val 1311571570 ecr 1311571570], length 0
E..4+.@.@..5.........1..%.0CAqf......(.....
N,.rN,.r
```

1つ目の通信がクライアントからサーバで、末尾に文字列が含まれていることがわかる
またFlagのところを見るとPというコントロールビットのフラグが立っていることがわかる

これは**PSH**(Push Function)でTCPを処理するプロトコルスタックが効率よく処理するためにデータをバッファリングする機能に対してすぐに処理をするように支持するフラグとなっている

2つ目の通信はサーバからクライアントに送られており、データをちゃんと受け取ったことを伝えている
ackの後ろにある数字は不足なく受け取ることができた最後のシーケンス番号(14)が記載されており、どこまでデータが届いているかを送信元に伝えている
※これはセグメントに実際に入っているシーケンス番号ではなく開始時のシーケンス番号からの相対的な値となっているので注意

## ⑥アプリケーション層のプロトコル

前提としてアプリケーション層のプロトコルは無数に存在している
有名なものは以下のようなもの

* HTTP(Hypertext Transfer Protocol)
* DNS(Domain Name System)
* DHCP(Dynamic Host Configuration Protcol)

### HTTP

Webブラウザなどで使われているプロトコル、ここでは基本的なHTTP/1.0とHTTP/1.1を扱う
トランスポート層にTCPを用いるテキストベースのプロトコル(※HTTP/2やHTTP/3では異なる)

まずは動作確認用のディレクトリを作成する

```shell
mkdir -p /var/tmp/http-home
cd /var/tmp/http-home/
```

ここでHTMLファイルを作成

```shell
cat << 'EOF' > index.html
<!doctype html>
<html>
<head>
<title>Hello, World</title>
</head>
<body>
<h1>Hello, World</h1>
</body>
</html>
EOF
```

PythonでWebサーバを立ち上げる

```shell
sudo python3 -m http.server -b 127.0.0.1 80
```

ncでHTTPリクエストを送信してみる(\r\nは改行)

```shell
echo -en "GET / HTTP/1.0\r\n\r\n" | nc 127.0.0.1 80
```

このように表示が返ってくる

```shell
HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.8.10
Date: Thu, 07 Oct 2021 14:35:13 GMT
Content-type: text/html
Content-Length: 111
Last-Modified: Thu, 07 Oct 2021 14:31:27 GMT

<!doctype html>
<html>
<head>
<title>Hello, World</title>
</head>
<body>
<h1>Hello, World</h1>
</body>
</html>
```

curlを使っても同じようになる

```shell
curl -X GET http://127.0.0.1/
```

### DNS

DNS(Domain Name System)を使うことによりドメイン名からIPアドレスを得ることができる
これを一般的に**名前解決**という

ドメイン名はOSの**リゾルバ**(正式にはスタブリゾルバ)というプログラムによって解決される
リゾルバはコンピュータ内にある**hosts**というファイルを参照したり、外部のサーバ(**ネームサーバ**)に問い合わせることで名前解決を行う

例えばUnix系のOSではhostsは**/etc/hosts**にあるのでファイルを見てみるとよく使うループバックアドレスが登録されていることがわかる

```shell
127.0.0.1 localhost

# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
```

hostsを使って名前解決ができない場合、外部のネームサーバ(正確には**フルサービスリゾルバ**もしくは**キャッシュサーバ**)に問い合わせる
※一般的にDNSのネームサーバはプライマリとセカンダリの2つがあり冗長化することで可用性を確保している

tcpdumpでDNSの名前解決を観察してみる(DNSのデフォルトポートは53)

```shell
sudo tcpdump -tnl -i any "udp and port 53"
```

digコマンドを打ってみる

```shell
dig +short @8.8.8.8 example.org A
```

tcpdumpの出力はこのようになる

```shell
IP 172.31.36.34.57451 > 8.8.8.8.53: 44951+ [1au] A? example.org. (52)
IP 8.8.8.8.53 > 172.31.36.34.57451: 44951$ 1/0/1 A 93.184.216.34 (56)
```

環境によってはコンピュータに設定されているネームサーバはブロードバンドルータのIPアドレスになっていることもある
しかしこれはルータがネームサーバになっているわけではなくあくまでルータがコンピュータとネームサーバの間を中継しているだけ(DNSのフォワーダ、プロキシ、リレーなどという)

これによってコンピュータのユーザはルータのIPアドレスだけ知っていれば名前解決ができることやルータの設定変更だけでネームサーバを切り替えられるというメリットがある

### DHCP

DHCP(Dynamic Host Configuration Protocol)はコンピュターがTCP/IPのネットワークを使う際の設定を自動化するために使われる
UDPの67番ポートをデフォルトで使用するバイナリベースのプロトコル

* ネットワークインターフェースにIPアドレスを付与する
* デフォルトルートのルーティングエントリをルーティングテーブルに追加する
* 名前解決に利用するネームサーバを指定する

ネットワークの設定を配布するコンピュターをDHCPサーバという
設定を受け取るコンピュターはDHCPクライアントという
一般的なネットワークではデフォルトルートとなるルータがDHCPサーバの役割を担うことが多い

DHCPサーバにはあらかじめ配布するIPアドレスの範囲やデフォルトルートの情報を指定しておく
各DHCPクライアントはその情報を元にネットワークの設定を行う

### NetworkNamespaceで動かしてみる

```shell
sudo ip netns add server
sudo ip netns add client
```

```shell
sudo ip link add s-veth0 type veth peer name c-veth0
sudo ip link set s-veth0 netns server
sudo ip link set c-veth0 netns client
```

```shell
sudo ip netns exec server ip link set s-veth0 up
sudo ip netns exec client ip link set c-veth0 up
```

IPアドレスはDHCPサーバにのみ設定する

```shell
sudo ip netns exec server ip address add 192.0.2.254/24 dev s-veth0 
```

DHCPサーバ側でdnsmasqコマンドを実行する

```shell
sudo ip netns exec server dnsmasq \
--dhcp-range=192.0.2.100,192.0.2.200,255.255.255.0 \
--interface=s-veth0 \
--port 0 \
--no-resolv \
--no-domain
```

DCHPクライアントを別ターミナルで立ち上げ、dhclientコマンドを実行する

```shell
sudo ip netns exec client dhclient -d c-veth0
```

しばらくするとIPアドレスが自動的に付与される
終わったらdhclientコマンドは終了し、IPアドレスを確認してみる

```shell
sudo ip netns exec client ip address show | grep "inet "
```

ルーティングテーブルも確認してみる

```shell
sudo ip netns exec client ip route show
```

※ ブロードバンドルータのグローバルアドレスはDHCPではないが似たような仕組みを使って、他のところから使用するIPアドレスを割り当ててもらっていることが多い
**PPPoE**(Point-to-Point over Ethernet)というプロトコルでやりとりされるIPCP(Internet Protocol Control Protcol)というプロトコルのオプションでアドレスが配布されている
ちなみに上記はIPv4の話であり、IPv6ではまた事情が異なる

## ⑦NAT

NAT(Network Address Translation)は**IPアドレスの変換**に使われる
パケットのヘッダにおいてIPアドレスの入ったフィールドの値を書き換える操作のこと

IPアドレスは32ビット空間なので総数は43億個になるが、今のインターネットの規模では足りなくなってきている
そこでNAT(の一種である**NAPT** Network Address Port Translation)が使われる

NAPTによって少数のグローバルアドレスを多数のプライベートアドレスで共有することができる
これによりインターネットを利用するホストの台数に比較し、必要なグローバルアドレスを少なくしている

プライベートアドレスとして予約されているのはIPアドレスの下記の範囲

* 10.0.0.0/8
* 172.16.0.0/12
* 192.168.0.0/16

組織内のネットワークを**LAN**といい、上記のアドレス範囲から特定の範囲を切り出してサブネットを形成する
そしてそこからLANにつながるノードのIPアドレスを採番して利用している

NATにはいくつか種類があるが、家庭やオフィスでよく利用されている下記2つを扱う

* Source NAT
* Destination NAT

### Source NAT

パケット送信元のIPアドレス(Source IP Address)を変換する
具体的にはLANでしか通用しないプライベートアドレスをインターネットで使えるグローバルアドレスに書きかえる
一般的には**ルータ**によって送信先がグローバルアドレスかつ送信元がプライベートアドレスとなっているパケットを対象に、自身のインターフェースに付与されているグローバルアドレスに書きかえる
※つまり**内から外**へ出て行くときに使用されるNATともいえる

また戻りの通信の場合は戻り先はLANのホストとなるため再びグローバルアドレスからプライベートアドレスへの変換が必要になる
ただしLANにたくさんのホストがつながっている場合、ルータはどのホストへ通信を戻したらいいのかがわからなくなるためIPアドレスと併せて**トランスポート層のポート番号も同時に書き換え**を行う(NAPT)

NAPTではインターネットに転送するパケットのIPアドレスとポート番号を必要に応じて書きかえるとともに前後の対応関係を記憶しておくようになっている(**セッション**)
これによって送信したパケットが戻ってきたときにLANの中のどのノードにパケットを転送すれば良いかが判断できる

ちなみにNATやNAPTが書きかえるヘッダはIPアドレスやポートだけではない。
例えばIPやTCPでデータのビットに誤りが生じていないか検出するためのチェックサムと呼ばれるヘッダなども修正されている
このようにIPアドレスを書き換えることでなんらかの不整合が起きてしまうヘッダは書きかえの対象になる

### 実際に試してみる

NatworkNamespaceを利用して試してみる

```shell
sudo ip netns add lan
sudo ip netns add router
sudo ip netns add wan
```

```shell
sudo ip link add lan-veth0 type veth peer name gw-veth0
sudo ip link add wan-veth0 type veth peer name gw-veth1
```

```shell
sudo ip link set lan-veth0 netns lan
sudo ip link set gw-veth0 netns router
sudo ip link set gw-veth1 netns router
sudo ip link set wan-veth0 netns wan
```

```shell
sudo ip netns exec lan ip link set lan-veth0 up
sudo ip netns exec router ip link set gw-veth0 up
sudo ip netns exec router ip link set gw-veth1 up
sudo ip netns exec wan ip link set wan-veth0 up
```

```shell
sudo ip netns exec router ip address add 192.0.2.254/24 dev gw-veth0
sudo ip netns exec router ip address add 203.0.113.254/24 dev gw-veth1
sudo ip netns exec router sysctl net.ipv4.ip_forward=1
```

```shell
sudo ip netns exec lan ip address add 192.0.2.1/24 dev lan-veth0
sudo ip netns exec lan ip route add default via 192.0.2.254
```

```shell
sudo ip netns exec wan ip address add 203.0.113.1/24 dev wan-veth0
sudo ip netns exec wan ip route add default via 203.0.113.254
```

これからSource NATを設定していくが、まずは現状のNATの設定を確認してみる

iptablesコマンドを使うとNATの設定やパケットフィルタリングの設定などができる
機能がテーブルで分かれているので-tでnatのテーブルを指定、また-Lオプションで現在の設定を確認する

```shell
sudo ip netns exec router iptables -t nat -L
```

```shell
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination 
```

Chainの後の記載は処理を適用するタイミングを表していて、iptablesではそのタイミングを**チェイン**と呼んでいる
ただし初期状態ではnatテーブルには上記のように何も指定が入っていない

NATのルールを追加してみる

```shell
sudo ip netns exec router iptables -t nat \
-A POSTROUTING \
-s 192.0.2.0/24 \
-o gw-veth1 \
-j MASQUERADE
```

-A : 処理を追加するチェインを指定 POSTROUTINGはルーティングが終わりパケットがインターフェースから出て行く直前を示している
-s : 処理対象となる送信元のIPアドレス範囲
-o : 処理対象とする出力先のネットワークインターフェース
-j : 条件に一致するパケットをどのように処理するかのルール、iptablesでは処理方法のルールをターゲットを呼ぶ、ここで指定したMASQUERADEはパケットに適用するターゲットがSource NATであることを表している

※MASQUERADE(マスカレード)はLinuxにおけるSource NATの実装に付けられた名称
一般的に**IPマスカレード**と呼ばれる

設定するとこうなる

```shell
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
MASQUERADE  all  --  192.0.2.0/24         anywhere 
```

これでlanからwanに向けてPingを打ってみる

```shell
sudo ip netns exec lan ping 203.0.113.1
```

またtcpdumpでlanの通信を確認してみる

```shell
sudo ip natns exec lan tcpdump -tnl -i lan-veth0 icmp
```

このような出力になる
行きの送信元IPと戻りの送信先IPが192.0.2.1になっている(これまでと同じ挙動)

```shell
IP 192.0.2.1 > 203.0.113.1: ICMP echo request, id 3683, seq 71, length 64
IP 203.0.113.1 > 192.0.2.1: ICMP echo reply, id 3683, seq 71, length 64
...
```

一方でwanの通信を確認してみる

```shell
sudo ip netns exec wan tcpdump -tnl -i wan-veth0 icmp
```

このような出力になる
行きの送信元IPと戻りの送信先IPはどちらも203.0.113.254となっている
つまりルータに付与されたgw-veth1インターフェースのIPアドレスに変換されているということ

```shell
IP 203.0.113.254 > 203.0.113.1: ICMP echo request, id 3810, seq 1, length 64
IP 203.0.113.1 > 203.0.113.254: ICMP echo reply, id 3810, seq 1, length 64
```

【補足】なぜPingで使われるICMPはトランスポート層のプロトコルではなくポート番号を管理するヘッダもないのにNAPTが実現できたのか？
→ ICMPのヘッダにあるIdentifierというフィールドがポートの代わりに使われ、NAPTにおいてセッションの管理が行われたから

【補足2】IPv4アドレスの割り当ては**インターネットレジストリ**という組織が管理をしている
**IANA**を頂点とした階層構造の組織で、下位組織から上位組織にIPv4アドレスの割り当てを申請し、受理されると上位組織の在庫から一部を受け取るような仕組みになっている

### Destination NAT

WAN側から特定のLANにあるノードへ通信する場合に使用される
※つまり**外から内**に入ってくる通信

一般的には**ポートを空ける**と表現される操作がDestination NAT

インターネットではプライベートIPアドレスを宛先にしたバケットはルーティングできないため、ルータがそれを受け取り、LAN内の特定のノードに転送する仕組みが必要になってくる
この際に全てのパケットを対象とするのではなく、**送信先のポートが特定の値**になっているTCPやUDPのパケットだけを書きかえてLAN内の特定ノードに転送する
（トランスポート層のプロトコルで事前に特定ポートに関してだけインターネットからの通信を許可しておく）

### 実際に試してみる

先ほど作ったSource NATで構成したネットワークが使えるので流用する
まずはiptablesコマンドを使ってDestination NATのルールを追加する

```shell
sudo ip netns exec router iptables -t nat \
-A PREROUTING \
-p tcp \
--dport 54321 \
-d 203.0.113.254 \
-j DNAT \
--to-destination 192.0.2.1
```

-A : 処理を追加するチェイン PREROUTINGはインターフェースからパケットが入ってきた直後
-p : 処理の対象となるトランスポート層のプロトコルを指定
--dport : 処理の対象となるポート番号
-d : 書き換える前の送信先IPアドレス
-j : 条件に一致したパケットをどう処理するかのルール、DNATはDestination NATを示す
--to-destination : 書きかえた後の送信先IPアドレス

テーブルを確認するとこうなる

```shell
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         
DNAT       tcp  --  anywhere             203.0.113.254        tcp dpt:54321 to:192.0.2.1

Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination         

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
MASQUERADE  all  --  192.0.2.0/24         anywhere 
```

ncコマンドで確認してみる
まずはLAN側のNetworkNamespaceでTCPの54321ポートを待ち受けるサーバを起動する

```shell
sudo ip netns exec lan nc -lnv 54321
```

WAN側から接続してみるが、ここではルータが持っているグローバルアドレスに相当するIPアドレスに通信する

```shell
sudo ip netns exec wan nc 203.0.113.254 54321
```

tcpdumpでまずはWAN側のネットワークインターフェースを監視する

```shell
sudo ip netns exec wan tcpdump -tnl -i wan-veth0 "tcp and port 54321"
```

何かしらWANからメッセージを送信するとこのような出力になる

```shell
IP 203.0.113.1.49130 > 203.0.113.254.54321: Flags [P.], seq 2557685632:2557685647, ack 381876254, win 502, options [nop,nop,TS val 3163989713 ecr 2518331099], length 15

IP 203.0.113.254.54321 > 203.0.113.1.49130: Flags [.], ack 15, win 509, options [nop,nop,TS val 2518552433 ecr 3163989713], length 0
```

続いてLAN側のネットワークインターフェースを監視する

```shell
sudo ip netns exec lan tcpdump -tnl -i lan-veth0 "tcp and port 54321"
```

何かしらWANからメッセージを送信するとこのような出力になる

```shell
IP 203.0.113.1.49130 > 192.0.2.1.54321: Flags [P.], seq 2557685647:2557685663, ack 381876254, win 502, options [nop,nop,TS val 3164176610 ecr 2518552433], length 16

IP 192.0.2.1.54321 > 203.0.113.1.49130: Flags [.], ack 16, win 509, options [nop,nop,TS val 2518739330 ecr 3164176610], length 0
```

無事にLAN側ではDestination NATによってパケットのIPアドレス送信先がLAN内のプライベートアドレスに変更されており、結果としてLAN内にいるホストへの通信が可能になることがわかる

【補足】CGN(Carrier Grade NAT)とは?
IPアドレスの逼迫に伴い普及してきた仕組み、家庭やオフィスだけでなくプロバイダレベルで導入したもの
プロバイダの持つ少数のグローバルアドレスをさらに多くのコンピュータで共有する

CGNにおいてはプロバイダが持つグローバルアドレスと**ISPシェアードアドレス**と呼ばれるアドレスを相互変換する
これはCGNのために予約された**100.64.0.0/10**のレンジにあるIPアドレス

ポートを勝手にユーザ側で空けることができないため、モバイルネットワークなど参加デバイスの数が多いかつインターネットにポートを公開するユースケースが少ないようなケースで用いられる

## ⑧ソケットプログラミング

ネットワークを扱うプログラムを記述することを一般にネットワークプログラミングという
そのためにいくつかのAPIがあるが、Unix系のOSでデファクトスタンダードとなっているのが**ソケット**というAPI

ソケットを使ったネットワークプログラミングをソケットプログラミングと呼ぶ
ソケットはネットワークを抽象化したインターフェースでホスト間の通信やホスト内での通信(IPC : Inter Process Communication)に用いられる

ソケットの使い方は主にサーバとクライアントで分かれている

* サーバ：クライアントからの接続を待ち受ける
* クライアント：サーバへ接続しにいく

### HTTPクライアント

下準備としてHTTPサーバを用意しておく

```shell
mkdir -p /var/tmp/http-home
cd /var/tmp/http-home
```

```shell
cat << 'EOF' > index.html
<!doctype html>
<html>
<head>
<title>Hello, World</title>
</head>
<body>
<h1>Hello, World</h1>
</body>
</html>
EOF
```

```shell
sudo python3 -m http.server -b 127.0.0.1 80
```

下記Pythonスクリプトを作成する

http_client.py

```python
#! /usr/bin/env python3

"""ソケットを使ってHTTPクライアントを実装したスクリプト"""

import socket

def send_msg(sock, msg):
    """ソケットに指定したバイト列を書き込む関数"""

    # これまでに送信できたバイト数
    total_sent_len = 0

    # 送信したいバイト数
    total_msg_len = len(msg)
    
    # まだ送信したいデータが残っているか
    while total_sent_len < total_msg_len:
        
        # ソケットにバイト列を書き込んで書き込めたバイト数を得る
        sent_len = sock.send(msg[total_sent_len:])
        
        # 全く書き込めなかったらソケットの接続は終了している
        if sent_len == 0:
            raise RuntimeError('socket connection broken')

        # 書き込めた分を加算する
        total_sent_len += sent_len

def recv_msg(sock, chunk_len=1024):
    """ソケットから接続が終わるまでバイト列を読み込むジェネレータ関数"""
    while True:
        # ソケットから指定したバイト数を読み込む
        received_chunk = sock.recv(chunk_len)

        # 全く読みめなかったら接続が終了している
        if len(received_chunk) == 0:
            break

        # 受信したバイト列を返す
        yield received_chunk

def main():
    """スクリプトとして実行されたときに呼び出されるメイン関数"""
    # IPv4 / TCP で通信するソケットのインスタンス生成
    # socket.AF_INETはネットワーク層にIPv4を使うという指定
    # socket.SOCK_STREAMはトランスポート層にTCPを使うことを指定
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # ループバックアドレスのTCP/80ポートに接続する
    client_socket.connect(('127.0.0.1', 80))

    # HTTPサーバからドキュメントを取得するためのGETリクエスト
    request_text = 'GET / HTTP/1.0\r\n\r\n'

    # 文字列をバイト列にエンコード
    # ソケットにデータを書き込むには文字列ではなくバイト列が必要
    request_bytes = request_text.encode('ASCII')

    #ソケットにリクエストのバイト列を書き込む
    send_msg(client_socket, request_bytes)

    #ソケットからレスポンスのバイト列を読み込む
    received_bytes = b''.join(recv_msg(client_socket))

    #読み込んだバイト列を文字列にデコードする
    received_text = received_bytes.decode('ASCII')

    #得られた文字列を表示する
    print(received_text)

    #使い終わったソケットを閉じる
    client_socket.close()

if __name__ == '__main__':
    """スクリプトのエントリーポイントとしてメイン関数を実行する"""
    main()
```

```shell
python3 http_client.py #実行

HTTP/1.0 200 OK
Server: SimpleHTTP/0.6 Python/3.8.10
Date: Fri, 08 Oct 2021 14:10:56 GMT
Content-type: text/html
Content-Length: 111
Last-Modified: Thu, 07 Oct 2021 14:31:27 GMT

<!doctype html>
<html>
<head>
<title>Hello, World</title>
</head>
<body>
<h1>Hello, World</h1>
</body>
</html>
```

主なソケットのAPI

* socket() : ソケットでどんな種類の通信をするかを指定
* connect() : 通信したいサーバとポートを指定し接続を開く
* send() / recv() : バイト列を送受信する
* close() : 接続を閉じる

### エコーサーバ

今度はソケットをサーバとして使ってみる
単純に送られてきたメッセージをそのまま送り返すだけのサーバ

下記Pythonスクリプトを作成する

server.py

```python
#!/user/bin/env python3

import socket

def send_msg(sock, msg):
  """ソケットに指定したバイト列を書き込む関数"""
  #これまで送信できたバイト数
  total_sent_len = 0
  #送信したいバイト数
  total_msg_len = len(msg)
  #まだ送信したいデータが残っているか判定
  while total_sent_len < total_msg_len:
    #ソケットにバイト列を書き込んで、書き込めたバイト数を得る
    sent_len = sock.send(msg[total_sent_len:])
    #全く書き込めなかったらソケットの接続は終了している
    if sent_len == 0:
      raise RuntimeError('socket connection broken')
    # 書き込めた分を加算する
    total_sent_len += sent_len
    
def recv_msg(sock, chunk_len=1024):
  """ソケットから接続が終わるまでバイト列を読み込むジェネレータ関数"""
  while True:
    # ソケットから指定したバイト数を読み込む
    received_chunk = sock.recv(chunk_len)
    # 全く読めなかった時は接続が終了している
    if len(received_chunk) == 0:
      break
    # 受信したバイト列を返す
    yield received_chunk
    
def main():
  """スクリプトとして実行されたときに呼び出されるメイン関数"""
  # IPv4 / TCP で使用するソケットを準備する
  server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  # 'Address already in use'の回避策
  server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, True)
  # クライアントから接続を待ち受けるIPアドレスとポートを指定
  server_socket.bind(('127.0.0.1', 54321))
  # 接続の待受を開始
  server_socket.listen()
  # サーバが動作を開始したことを表示する
  print('starting server ...')
  # 接続を処理
  client_socket, (client_address, client_port) = server_socket.accept()
  # 接続してきたクライアント情報を表示
  print(f'accepted from {client_address}:{client_port}')
  # ソケットからバイト列を読み込む
  for received_msg in recv_msg(client_socket):
    # 読み込んだ内容をそのままソケットに書き込む(エコーバック)
    send_msg(client_socket, received_msg)
    # 送受信した内容を出力しておく
    print(f'echo: {received_msg}')
  #使い終わったソケットをクローズする
  client_socket.close()
  server_socket.close()
  
if __name__ == '__main__':
  """スクリプトのエントリーポイントとしてメイン関数を実行する"""
  main()
```

主なソケットのAPI

* socket() ソケットでそんな種類の通信をするか指定する
* bind() 接続を待ち受けるIPアドレスとポート番号を指定する
* listen() 接続の待受を開始する
* accept() 接続してきたクライアントを処理する
* send() / recv() バイト列を送受信する
* close() 接続を閉じる

### ssコマンド

ssコマンドを使うとソケットが待ち受けているIPアドレスがポート番号などを確認できる
試しにTCPで待ち受けているソケットとそれを利用しているプロセスの一覧を表示してみる

```shell
sudo ss -tlnp
```

```shell
State     Recv-Q    Send-Q       Local Address:Port        Peer Address:Port    Process                                                                         
LISTEN    0         5                127.0.0.1:80               0.0.0.0:*        users:(("python3",pid=69963,fd=3))                                             
LISTEN    0         128              127.0.0.1:54321            0.0.0.0:*        users:(("python3",pid=70190,fd=3))                                             
LISTEN    0         4096         127.0.0.53%lo:53               0.0.0.0:*        users:(("systemd-resolve",pid=51250,fd=13))                                    
LISTEN    0         128                0.0.0.0:22               0.0.0.0:*        users:(("sshd",pid=49012,fd=3))                                                
LISTEN    0         128                   [::]:22                  [::]:*        users:(("sshd",pid=49012,fd=4))
```

Pythonのプロセスが127.0.0.1のTCP/54321で待ち受けていることがわかる

### バイナリベースのプロトコル

バイナリベースのプロトコルで気をつけないといけないポイントが**バイトオーダー**または**エディアン**と呼ばれる概念

32ビット(4バイト)で表現された0x12345678という数値で考えてみる
これをメモリで扱う場合は1バイト単位で読み書きされるので試しに1バイトずつに区切ると12,34,56,78となる

まず考えられるのは基準となるメモリアドレスから順番に書き込む方法(12, 34, 56, 78)これが**ビックエディアン**
もう一つは順番を逆にする方法、つまり(78, 56, 34, 12)これが**リトルエディアン**

エディアンはCPUのアーキテクチャによって異なるが、TCP/IPでデータを運ぶ際にはこれは統一されている必要ある

※バイトオーダーの誤りに由来する不具合を**エディアンバグ**という
TCP/IPを扱うソフトウェアではこれが起きやすい傾向がある

TCP/IPの世界ではバイトオーダーを**ビッグエディアン**に統一している
この点からネットワークでのビッグエディアンをネットワークバイトオーダーと呼ぶこともある
対してCPUのアーキテクチャに依存したコンピュータ内部での表現方法はホストバイトオーダーと呼ぶ

つまりバイナリデータをTCP/IPで送信するときはホストバイトオーダーをネットワークバイトオーダーに変換しなければならず、反対に受信時にはネットワークバイトオーダーをホストバイトオーダーに変換する必要がある

### 足し算プロトコル

今回はクライアントから2つの32ビット整数を受け取って、それらを足し合わせて返すプロトコルを実装する

server.py

```python
#!/usr/bin/env python3

import socket
import struct

def send_msg(sock, msg):
    total_sent_len = 0
    total_msg_len = len(msg)

    while total_sent_len < total_msg_len:
        sent_len = sock.send(msg[total_sent_len:])

        if sent_len == 0:
            raise RuntimeError('socket connection broken')

        total_sent_len += sent_len

def recv_msg(sock, total_msg_size):
    total_recv_size = 0

    while total_recv_size < total_msg_size:
        received_chunk = sock.recv(total_msg_size - total_recv_size)

        if len(received_chunk) == 0:
            raise RuntimeError('socket connnection broken')

        yield received_chunk
        
        total_recv_size += len(received_chunk)

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, True)
    server_socket.bind(('127.0.0.1', 54321))
    server_socket.listen()
    
    print('starting server ...')

    client_socket, (client_address, client_port) = server_socket.accept()

    print(f'accepted from {client_address}:{client_port}')

    received_msg = b''.join(recv_msg(client_socket, total_msg_size=8))

    print(f'received: {received_msg}')

    # ネットワークバイトオーダーからホストバイトオーダーへの変換
    (operand1, operand2) = struct.unpack('!ii', received_msg)

    print(f'operand1: {operand1}, operand2: {operand2}')

    result = operand1 + operand2

    print(f'result: {result}')

    # ホストバイトオーダーからネットワークバイトオーダーへの変換
    result_msg = struct.pack('!q', result)

    send_msg(client_socket, result_msg)

    print(f'sent: {result_msg}')

    client_socket.close()
    server_socket.close()

if __name__ == '__main__':
    main()
```

Client.py

```python
#!/usr/bin/env python3

import socket
import struct

def send_msg(sock, msg):
    total_sent_len = 0
    total_msg_len = len(msg)

    while total_sent_len < total_msg_len:
        sent_len = sock.send(msg[total_sent_len:])

        if sent_len == 0:
            raise RuntimeError('socket connnection broken')

        total_sent_len += sent_len

def recv_msg(sock, total_msg_size):
    total_recv_size = 0

    while total_recv_size < total_msg_size:
        received_chunk = sock.recv(total_msg_size, total_recv_size)

        if len(received_chunk) == 0:
            raise RuntimeError('socket connection broken')

        yield received_chunk

        total_recv_size += len(received_chunk)

def main():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('127.0.0.1', 54321))
    operand1, operand2 = 1000, 2000

    print(f'operand1: {operand1}, operand2: {operand2}')

    request_msg = struct.pack('!ii', operand1, operand2)

    send_msg(client_socket, request_msg)

    print(f'sent: {request_msg}')

    received_msg = b''.join(recv_msg(client_socket, 8))

    print(f'received: {received_msg}')

    (added_value, ) = struct.unpack('!q', received_msg)

    print(f'result: {added_value}')

    client_socket.close()

if __name__ == '__main__':
    main()
```

実行した時の出力

サーバ側

```shell
received: b'\x00\x00\x03\xe8\x00\x00\x07\xd0'
operand1: 1000, operand2: 2000
result: 3000
sent: b'\x00\x00\x00\x00\x00\x00\x0b\xb8'
```

クライアント側

```shell
operand1: 1000, operand2: 2000
sent: b'\x00\x00\x03\xe8\x00\x00\x07\xd0'
received: b'\x00\x00\x00\x00\x00\x00\x0b\xb8'
result: 3000
```

