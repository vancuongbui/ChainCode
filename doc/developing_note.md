# Ethereum project note

## Tools installation

### Ethereum Client (Go-Ethereum and Cpp-Ethereum)

#### go implementation

Refer to [GETH & ETH Command line tools for the Ethereum Network][11].

Install go and go-ethereum clients via mac port

```shell
sudo port install go
sudo port install go-ethereum
```

To check the installation: `geth version`

Then install npm console for ethereum:

```shell
CXX=clang++ npm install -g ethereum-console
```

#### cpp implementation

This section instruct how to build **cpp-ethereum** from source code, refer to [Building on Mac OS][13].

```shell
sudo port install boost +universal -no_static # this takes a while
sudo port install cmake qt5 libcryptopp miniupnpc leveldb gmp libmicrohttpd
```

Make sure the **macdeployqt** can be found. Ethereum expects it to be in */usr/local/opt/qt5/bin/macdeployqt* so symlink it if it's not:

```shell
sudo ln -s /opt/local/libexec/qt5/bin/macdeployqt /usr/local/opt/qt5/bin/macdeployqt
```

To install cpp-ethereum from source code, first clone source repo and create bild folder.

```shell
git clone https://github.com/ethereum/cpp-ethereum.git
git submodule update --init
cd cpp-ethereum
mkdir -p build # create build folder ('build' ignored by git)
```

Then compile and install.

```shell
cd build
cmake ..
make -j6 <-- this number actually depends on your cpu core number
sudo make install
```

This will install **aleth** and other binary files into the system.

### Solidity compiler (Solc and Solcjs)

Refer to [Installing the Solidity Compiler][12].

Remix and Truffle both use **solcjs** as compiler, which is not fully funcitonal compared to **solc**. It is easy to install:

```shell
npm install -g solc
```

Note its command line executable is named **solcjs**.

**solc** is available from homebrew, as I dont use homebrew I tried to compile from source code.

```shell
git clone --recursive https://github.com/ethereum/solidity.git
cd solidity
git submodule update --init --recursive
```

Review *./scripts/install_deps.sh*, we need to install **boost**, **cmake** and **cpp-ethereum** first.

Then we could compile:

```shell
git checkout v0.4.19
./scripts/build.sh
```

During compiling I got following error:

```txt
[ 49%] Building CXX object libsolidity/CMakeFiles/solidity.dir/inlineasm/AsmParser.cpp.o
/Users/Lin/case/solidity/libsolidity/inlineasm/AsmParser.cpp:609:7: warning: parentheses were disambiguated as redundant parentheses around declaration
      of variable named '_literal' [-Wvexing-parse]
                u256(_literal);
                    ^~~~~~~~~~
...
/Users/Lin/case/solidity/libsolidity/inlineasm/AsmParser.cpp:609:8: error: unused variable '_literal' [-Werror,-Wunused-variable]
                u256(_literal);
                     ^
```

I tried following command to skip **-Wunused-variable** error, but it didn't work:

```shell
mkdir build && cd build
CFLAGS="-Wno-unused-variable -Wno-unused-parameter" cmake ..
make
```

So I modified the source code of *AsmParser.cpp* to comment out the try-catch block from line 609. Note it is just a **temporary solution**.

To verify the installation,

```shell
solc --version
solc, the solidity compiler commandline interface
Version: 0.4.25+commit.59dbf8f1.mod.Darwin.appleclang
solc --bin test.sol

======= ballot.sol:Ballot =======
Binary: 
......
```

If we compile the source code from without tag vX.Y.Z, then when running the solc command we'll get following warning:

> This is a pre-release compiler version, please do not use it in production

See [Handle git release tag properly #3288][20] for the discussion. Basically we use *./scripts/build.sh* but not run cmake directly.

#### SMT solver

SMT solver (either cvc4 or z3) is optional in compiling. I install cvc4 by `sudo port install cvc4` but then got a compiling error of solc:


```txt
In file included from /opt/local/include/cvc4/util/hash.h:26:
/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/include/c++/v1/ext/hash_map:213:5: error: Use of the
      header <ext/hash_map> is deprecated. Migrate to <unordered_map> [-Werror,-W#warnings]
```

I think that is because my Xcode version (mainly the C++ standard, I am not sure how to specify certain C++ standard for the configuration) is too high against cvc4. I prefer not to modify cvc4 source code so just uninstalled cvc4 and recompile. As cmake could not find cvc4 it will disable it by itself.

In latest master, we could also disable SMT solver by:

```shell
mkdir build
cd build
cmake .. -DUSE_CVC4=OFF -DUSE_Z3=OFF
make
make install
```

### node.js and npm

Here I recommand to install node.js and npm via **nvm**. It is like pythons's virtual environment and guarantee you to install different versions and switch between them.

Refer to [this link][4] to get brief introduction and a clean environent for installation.

Refer to [nvm 使用攻略][5] to install and use nvm.

Check the installation:

```shell
node -v
npm -v
```

To check wheter node.js works on the host, edit file *app.js* with following content:

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
res.statusCode = 200;
res.setHeader('Content-Type', 'text/plain');
res.end('Hello from NodeJS\n');
});

server.listen(port, hostname, () => {
console.log('Server running at http://${hostname}:${port}/');
});
```

Then run command `node app.js` to launch the script and check it at http://127.0.0.1:3000.

#### install node.js and npm by binary or macport (NOT recommanded)

Download node.js binary backage directly from [offical website][1].

Alternatively, install it via MacPort system. I choose package **nodejs8**. 

Install npm via MacPort system, refer to Refer to [Installing NPM on MAC OS X with MacPorts][2]. I choose **npm6** to suit nodejs version. Following information is output at end of the installation:

```shell
npm6 has the following notes:

It is not recommended to install packages globally. But if you do so please be aware that they won't get cleaned up when you deactivate or uninstall npm6. Globally installed packages will remain in /opt/local/lib/node_modules/ until you manually delete them.
```

Than means packages for different npm version will be installed to the same place. To change the installed package path, we need to create file *~/.npmrc* and set in it:

```shell
prefix=<Path to package>
```

In order for the installed package could be found by system, we need to add its bin path to system by `export PATH=<Path to package>/bin:$PATH`

#### Update node.js and npm via n

Refer to [MAC上NPM升级][3]

Install **n** tool: `sudo npm install -g n`

Install latest version of node.js: `sudo n stable`

Update NPM to latest version: `sudo npm install npm@latest -g`

Switch nodejs version to 6.11.3: `n  6.11.3`

#### Completely remove nodejs and npm via MacPort

First remove all packages via MacPort:

```shell
sudo port uninstall -f npm6
sudo port uninstall -f nodejs8
```

Then remove all installed packages via **n** tool. Previoulsly we install a new version of npm via n which is out of control of MacPort, so need be installed here as well.

First list all installed pacakges by `npm list -g`. There are package **npm** and **n**. Uninstall them one by one:

```shell
sudo npm uninstall n -g
sudo npm uninstall npm -g
```

Not sure why I still find following folders */usr/local/lib/node_modules* (Is this installed by Xcode?) anyway I deleted it as well.

### Remix

The simplest way is to download Remix desktop app from its [release page][6]. And here I installed remix-ide from npm. Refer to [Solidity 开发工具组合 - In Mac][9].

```shell
npm install remixd remix-ide -g 
```

Get an error for node-gyp rebuild.

```shell
> node-gyp rebuild
gyp ERR! configure error 
gyp ERR! stack Error: Command failed: /opt/local/bin/python -c import sys; print "%s.%s.%s" % sys.version_info[:3];
gyp ERR! stack   File "<string>", line 1
gyp ERR! stack     import sys; print "%s.%s.%s" % sys.version_info[:3];
gyp ERR! stack                                ^
gyp ERR! stack SyntaxError: invalid syntax
......
```

According to [this thread][7], node-gyp looks for python2 first before falling back to python. In my system, default python is v3.6 and python2 is inactive. So:

```shell
sudo port select set python2 python2.7
```

Note: in npm we can set certain python version by `npm config set python python3.6`, and we can check all setting by `npm config list`.

The second error is:

```shell
> node-gyp rebuild

  SOLINK_MODULE(target) Release/copied_files.node
c++: error: unrecognized command line option '-stdlib=libc++'
make: *** [Release/copied_files.node] Error 1
```

According to [this link][8],

> By default gyp will use the c++ executable. Unfortunately node-gyp does not "autoconfigure" your compiler settings. It will assume you are using clang and assume that the option --stdlib=libc++ is a valid option. Which in some cases, for example when you have g++ set as your main compiler (c++ points to g++) is not true.

So we change the command to `CXX=clang++ npm install remixd remix-ide -g`

Launch remix-ide from the folder where all source files are placed. We can hit the green link icon to connect local folder.

```shell
$ remix-ide
setup notifications for /Users/Lin/Public/test
Starting Remix IDE at http://localhost:8080 and sharing /Users/Lin/Public/test
Wed Sep 19 2018 16:07:29 GMT+1000 (AEST) Remixd is listening on 127.0.0.1:65520
```

Then open [http://localhost:8080] to use it.

### Install Truffle and Ganache

Use npm to install truffle and ganache command line tool:

```shell
npm install truffle -g
npm install ganache-cli -g
```

Alternatively, download Ganache GUI app from its [website][14].

## Environment setup

### test the contracts on testnet

A very detailed instruction [以太坊测试网络Rinkeby使用教程][17].

I choose **Rinkeby** testnet for test, and **MetaMask** for account management. 

First install MetaMask in chrome browser, generate a new account under Rinkeby testnet.

Request ETH for test from [Crypto Faucet section of Rinkeby][15], by using the address of the new account. It requires you to post your address to a social media website, I choose google plus. It looks like most people attach it in a [Invisible College][16], I also post my address in this community. Then I paste my post address to above Rinkeby website, and then got 3 eth in couples of seconds.

Now go back to your MetaMask, and you will see eth in your account. Keep this page open, then you can open Remix and choose environment **Injected web3**, you can see your account info and gas limit as well, in which you'll see your test account information.

#### send my own token

[TrustWallet+Ethereum-Wallet+Rinkeby测试网络 测试以太坊代币][18]

### Setup private chain

Refer to the post from Qin:
[利用puppeth搭建POA共识的以太坊私链网络][19]

#### Step 1: prepare the environement

```shell
# create folder
mkdir testnet && cd testnet

# create three accounts with password
geth --datadir node0 account new
# record password to file
echo node0 > node0/password

geth --datadir node1 account new
echo node1 > node1/password
geth --datadir node2 account new
echo node2 > node2/password
```

Also record the hex string of account address.
Under the node folder we will see **geth** and **keystore**:

- keystore contains the text files containing the Ethereum accounts you have available to the client. There should be just one files there corresponding to the account we created. The file is a JSON-formatted ascii text.
- geth contains one folder called **chaindata**. The chaindata folder contains the leveldb database files representing the blockchain genesis and subsequent blocks as they are mined and added to the blockchain. This folder will grow in size over time and if deleted or lost, the entire blockchain is gone and will need to be re-initialized.

#### Step 2: generate genesis configuration

Record the steps, most steps omitted.

```shell
puppeth
Please specify a network name to administer (no spaces, please)
> testnet

...

How many seconds should blocks take? (default = 15)
> 5

...

Which accounts are allowed to seal? (mandatory at least one)
> (input the address we got in step 1)
> ...
> ...

...

Which accounts should be pre-funded? (advisable at least one)
> (input the address we got in step 1)
> ...
> ...

Which file to save the genesis into? (default = testnet.json)
> genesis.json

(CTRL-D)
```

Explanation of genesis json file:

Field | Explanation
--- | ---
chainId	| 链id
nonce	| nonce就是一个64位随机数，用于挖矿，注意他和mixhash的设置需要满足以太坊的Yellow paper, 4.3.4. Block Header Validity, (44)章节所描述的条件
mixhash	| 与nonce配合用于挖矿，由上一个区块的一部分生成的hash。注意他和nonce的设置需要满足以太坊的Yellow paper, 4.3.4. Block Header Validity, (44)章节所描述的条件
difficulty	| 设置当前区块的难度，如果难度过大，cpu挖矿就很难，这里设置较小难度
alloc	| 用来预置账号以及账号的以太币数量
coinbase	| 矿工的账号
timestamp	| 设置创世块的时间戳
parentHash	| 上一个区块的hash值，因为是创世块，所以这个值是0
extraData	| 附加信息，随便填，可以填你的个性信息
gasLimit	| 该值设置对GAS的消耗总量限制，用来限制区块能包含的交易信息总和

#### Step 3: launch private chain

We launch many nodes on the same host with different ports. Note we disable *discovery* function by using `--nodiscover` option, and then use `admin.addPeer()` or *static-node* to connect to other nodes.

```shell
geth --datadir node0 init genesis.json
geth --datadir node0 --port 30000 --nodiscover --unlock '0' --password ./node0/password console

# without console option, we can still connect to the geth by:
# geth attach ipc:node0/geth.ipc

...
...
```

geth has following command line arguments:

Option | Explanation
--- | ---
  --rpc                |  启动HTTP-RPC服务（基于HTTP的）
  --rpcaddr value      |  HTTP-RPC服务器监听地址(default: "localhost")
  --rpcport value      |  HTTP-RPC服务器监听端口(default: 8545)
  --rpcapi value       |  指定需要调用的HTTP-RPC API接口，默认只有eth,net,web3
  --ws                 |  启动WS-RPC服务（基于WebService的）
  --wsaddr value       |  WS-RPC服务器监听地址(default: "localhost")
  --wsport value       |  WS-RPC服务器监听端口(default: 8546)
  --wsapi value        |  指定需要调用的WS-RPC API接口，默认只有eth,net,web3
  --wsorigins value    |  指定接收websocket请求的来源
  --ipcdisable         |  禁掉IPC-RPC服务
  --ipcpath            |  指定IPC socket/pipe文件目录（明确指定路径）
  --rpccorsdomain value|  指定一个可以接收请求来源的以逗号间隔的域名列表（浏览器访问的话，要强制指定该选项）
  --jspath loadScript  |  JavaScript根目录用来加载脚本 (default: ".")
  --exec value         |  执行JavaScript声明
  --preload value      |  指定一个可以预加载到控制台的JavaScript文件，其中包含一个以逗号分隔的列表
  --mine | Enable mining
  --nodiscover | Disables the peer discovery mechanism (manual peer addition)
  --maxpeers | value Maximum number of network peers (network disabled if set to 0) (default: 25)
  --networkid | value Network identifier (integer, 1=Frontier, 2=Morden (disused), 3=Ropsten) (default: 1)
  --rpc | Enable the HTTP-RPC server
  --rpccorsdomain | value Comma separated list of domains from which to accept cross origin requests (browser enforced)

To start the node with:

- rpc enabled
- starting mining automatically
- not locking automatically
- customized port
- enforcing browser access

use following command:

```shell
geth --datadir node0 --port 30000 --nodiscover --unlock '0' --rpc --rpcapi "web3,eth,net,admin" --rpccorsdomain "*" --rpcport 31000 --mine
```

#### Step 4: add peer nodes

We do this step because we disable the discovery function.

In each console input `admin.nodeInfo.enode`, and record the output to file *static-nodes.json*. Note we can also get this enode info in step 3, when initializing the node.

here we have a file *static-nodes.json*:

```shell
cat nodes0/static-nodes.json
[
"enode://2ffb53ede7de8dabf8f12343a7b2aba6b09263a53d8db5b4669309c5913f72969ce469cf09299f13e9d6cba8a98e18ad43811439326d7152f21d2e03ddc6be17@[::]:30000?discport=0",
"enode://910d1bfcd763bb5157bc62f8b121eb21fb305d17e4e4437c0b094d3d6f2d72f1964b80eb8fa2cf6cd7d4cc2d44cfc1ed9b74275ea7fd42ab89b4d089023fb7d5@[::]:30001?discport=0",
"enode://acab97a2a287b740b5efc3af465ba7330b3d4948b05e26818822d1aee659ec1b8f54ee9501576dc08ea4021d7ede01431691a27310a7dcbda2437bcd3b9c451d@[::]:30002?discport=0"
]
```

Place *static-nodes.json* under nodex/ (the path is shown by `admin.datadir`), and relaunach the node. Or just input in the console `admin.addPeer("nodeInfo_encode")`.

To verify the network,

```javascript
> admin.peers
[{
  ...
  ...
}]

> net.peerCount
2
```

#### Step 5: transfer eth between accounts

```javascript
> 
> var sender = eth.accounts[0]
undefined
> var receiver = "0x1458eac314d8fc922029095fae20483f55726017"
undefined
> var amount = web3.toWei(10, "ether")
undefined
> personal.unlockAccount(eth.accounts[0])
Unlock account 0x799a8f7796d1d20b8198a587caaf545cdde5de13
Passphrase: 
true
> eth.sendTransaction({from:sender, to:receiver, value: amount})
"0x97ca1f5fa27df083e14b2ffb82c2a60744aeae0f1a7b5e735ca4d0c05c16f7b6"
```

#### Step 6: connect to the account by remix-ide or Wallet

Use remix-ide to connect to private chain, choose *Web3 Provider* under *Run*->*Environment*, here we can see account information shown below.

Note if we want to use GUI app like Mist to operate on the account, we need to launch it by connecting to local network:

```shell
open -a /Applications/Mist.app --args --rpcport "31000" --rpc ~/case/ethereum_privatechain/testnet/node0/geth.ipc
```

Or more simply,

```shell
/Applications/Mist.app/Contents/MacOS/Mist --rpc 127.0.0.1:31000
```

#### Step 7: deploy a contract

We tried to deploy the contract in remix, and get ABI and address. In the console instead, we can get the contract object by `eth.contract(ABI).at(Address)`, then try to call contract's method:

```javascript
> var b = eth.contract([{"constant":false,"inputs":[{"name":"to","type":"address"}],"name":"delegate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"_winningProposal","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"voter","type":"address"}],"name":"giveRightToVote","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"proposal","type":"uint8"}],"name":"vote","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_numProposals","type":"uint8"}],"payable":false,"type":"constructor"}]).at('0xc825238a3348f0a679924796fcf1b1b64a8c1706')
undefined

> b.vote(9)
"0x1646e6547606a8ad0e183f1c9145eff08bbdfd860961d6c7d7367f5b70779cbd"
> 
> b.giveRightToVote('0x1458eac314d8fc922029095fae20483f55726017')
"0x2759928ad03a2ed5bc4b9c54531eb83e25c4a468e71682f67b160ad3328c8173"
> 
> b.giveRightToVote('0x3ca60eb49314d867ab75a3c7b3a5aa61c3d6ef71')
"0x46f756e613499f836e392011c8f6d7c23d378fd5a656bae775ecda8bf286c5b6"
> b.winningProposal()
9
```

### using truffle for development and test

#### Write code

Use `truffle init` to create a project framework, or use `truffle unbox xxxx` to download a code box from its website.

To write a new contract from scratch, use `truffle create contract new1`

To create a new contract, I'd add *new_contract.sol* under *contract* folder, and use `truffle compile` to compile it.

To connect to a network, need to edit file *truffle.js*:

```javascript
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  }
};
```

And we need to add the new contract to deploy it, to do this we create file *2_deploy_contracts.js*:

```javascript
const NewContract = artifacts.require("./new_contract.sol")

module.exports = function(deployer) {
    deployer.deploy(NewContract);
};
```

Now we can deploy it to the network by `truffle migrate --network development`.
If we add new contract and want to migrate, use `truffle migrate --reset`

#### Other operation

Launch truffle console by `truffle console --network development`, and then get the account list by `web3.eth.accounts`

#### Test

Truffle supports:

- Javascript test for interface
- Solidity test for low-level implementation

All test code should be placed under *./test* folder, and ended with extension name *js*, *sol*, etc. Use command `truffle test` to run the test.

Truffle 提供了一个清洁的沙箱测试环境. 当测试环境连接本地 Ganache 或者 Truffle 开发环境 (truffle develop), Truffle 将使用高级的快照特性, 保证每个测试的环境并不相互影响. 当使用其他客户端, 例如 go-ethereum 的时候, Truffle 将会在运行每个测试文件之前重新部署所有部署合约, 以便保证有一个全新的合约用于测试.

## Study materials

### Code exercise

- [Truffle box][21]: provides online code template
- [Not so smart contracts][22]: Github project, bad code examples
- [Solidity patterns][23]: Github projects, design patterns of Solidity
- [Solidity official document][24]
- [Zeppelin Library][25]

### Q & A

- difference between accounts and node?
- difference between transfer() and send()
- what variables are used memory/storage
- how to use function type? difference with functions?
- function call can use x.f(), x is its first argument.
- call(), delegatecall(), staticcall(), why will I use this way to call a function instead of x.f()?
- how to deploy multiple contracts seperately in the same source file?
- how to explain following quote?
> Write your functions in a way that, for example, calls to external functions happen after any changes to state variables in your contract so your contract is not vulnerable to a reentrancy exploit.
- re-enttry issue? should we move from state variable to a local memory variable?
- If A transfer to B, then how could B consume >2300 gas to get the call stuck?
- 当某个交易正处在挖矿过程中时状态不能确定，矿工可以在交易挖矿过程中控制执行时间
- 如何判断无符号数的正负? 现在的代码中，是通过A-B>A来判断B的正负。为什么不能直接把B转换成符号数然后判断？

### To-do

- follow a high rated opensource solidty project on github

## Project

### background

Artchain is a blockchain based exchange website, the whole project are divided into two major parts, one is the website end (by zhiyu xu) and one is the blockchain end (by us). As for our part, we do not need to modify the chain source code, what we need to do is 1) to deploy the chain (Ethereum with POA consensus) with 100 prefund accounts written in genesis.json and 6 supernodes to mine). 2) to develop the smart contract with the interface included in following documents (Sorry for Cuong, it is a chinese version in previous time).
The smart contract provides the API to the back end of website. It is better for u to firstly have a overview of the blockchain concenpt and the smart contract (solidity) grammar and so on.

artchain global office induction web
[https://www.artchain.world/]

you can test smart contract onlint through:
[http://remix.ethereum.org/] or deploy the contract on your own PC (firstly deploy the chain).

our ICO smart contract code in ERC-20. [https://etherscan.io/address/0x984c134a8809571993fd1573fb99f06dc61e216f#code]

one of tutorial of how to build up your private chain by ethereum: [https://hackernoon.com/setup-your-own-private-proof-of-authority-ethereum-network-with-geth-9a0a3750cda8]

Hi Lin and Cuong, I have applied two Aliyun cloud server for each of u.

- For Lin: ssh root@47.74.70.159   password:  Asdf1234!@
- For Cuong: ssh root@47.91.56.32  ,  password: Asdf1234!@

The server is equipped with a relatively complete "Go" envirnment and the Ethereum source code, which u can directly try to bulid up your private chain. To see the go environment details through "$ go env " and to launch private chains through the guide link I sent this morning. The Ethereum source codes are in path: "/home/gopath/src/go-ethereum/", and the Ethereum executive files are in path: "home/gopath/src/go-ethereum/build/bin". u can try some test on the server.

The requirement is not 100 super-nodes, is 100 pre-fund nodes. The super nodes are around 6 nodes(which can execute "mine" process). Creating nodes is actually to obtain the "address"es, and the command is "$ geth --datadir node account new". When creatting the nodes, remember the address and write it into the genesis.json.  I have finished parts of the whole process (1.automatically creat 100 nodes[deploy.sh], 2.creat genesis.json at normal step[setgen.sh], 3.launch console[console.sh]). The rest unfinished parts are to automatically read 100 addresses and write them into genesis.json (beteewn 1 and 2) and read and write the staticnodes file(between 2 and 3).  The parameters (like address) in sh is not the final state, it varies each time when you re-creat the accounts or re-deploy the testnet. Plz just read it as an reference. The single node complete deployment process you can see is:  [利用puppeth搭建POA共识的以太坊私链网络][19]

### work list

- git server for code store
- cloud server for private chain setup (using local system now)
- develop toolkit
  - remix
  - truffle
- code test
  - solidity on unit test
  - java mocha framework on integration
    - how to generate random number
    - hard to emulate simutaneous operation
- deploy private chain - Qin on scripts
- implementation of ERC20 and ERC721
  - ERC20 on mainnet
  - ERC721 TBD
- implementation of API
  - add_new_user
  - post_new_user
  - buy_artwork
  - buy_token
  - freeze_token
  - check_artwork
  - check_user
  - check_transaction
- deployment

### Meeting minutes

#### 1/Oct/2018

- end of oct: api ready, simple test
- end of this year: whole work


[1]: https://nodejs.org/en/
[2]: https://medium.com/@samthor/installing-npm-on-mac-os-x-with-macports-27e9f380ffb7
[3]: https://www.jianshu.com/p/a20964b88f98
[4]: https://www.imooc.com/article/14617
[5]: https://www.jianshu.com/p/e21e3783304f
[6]: https://github.com/ethereum/remix-ide/releases
[7]: https://github.com/nodejs/node-gyp/issues/193
[8]: https://stackoverflow.com/questions/38293984/c-error-unrecognized-command-line-option-stdlib-libc-while-installing-a
[9]: https://junahan.netlify.com/post/solidity-dev-env/
[10]: https://github.com/ethereum/solc-js
[11]: https://www.ethereum.org/cli
[12]: https://solidity.readthedocs.io/en/develop/installing-solidity.html
[13]: https://ethereumbuilders.gitbooks.io/guide/content/en/mac_cpp_build.html
[14]: https://truffleframework.com/ganache
[15]: https://www.rinkeby.io/#faucet
[16]: https://plus.google.com/communities/109236509503098181217
[17]: https://www.jianshu.com/p/c02f5ab286dd
[18]: http://www.qukuai.top/d/362
[19]: [https://github.com/xiaoping378/blog/blob/master/posts/%E4%BB%A5%E5%A4%AA%E5%9D%8A-%E7%A7%81%E6%9C%89%E9%93%BE%E6%90%AD%E5%BB%BA%E5%88%9D%E6%AD%A5%E5%AE%9E%E8%B7%B5.md]
[20]: https://github.com/ethereum/solidity/pull/3288
[21]: https://truffleframework.com/boxes
[22]: https://github.com/trailofbits/not-so-smart-contracts
[23]: https://github.com/fravoll/solidity-patterns
[24]: https://solidity.readthedocs.io/en/develop/index.html
[25]: https://github.com/OpenZeppelin/openzeppelin-solidity