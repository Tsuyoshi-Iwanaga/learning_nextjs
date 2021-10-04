---
title: 'TCP/IP'
date: '2021-10-03'
---

## はじめに

### TCP/IPとは

異なるシステム同士を繋ぐための仕組み(プロトコル)

### Network Namespaceとは

Dockerでも使用されているLinuxの機能、システムからネットワークとして独立したVMを作成できる

### 動作環境

Ubuntu 20.04 LTS

## TCP/IP

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
	netcat-openbsd python3 curl wget iptables grocps isc-dhcp-client
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

