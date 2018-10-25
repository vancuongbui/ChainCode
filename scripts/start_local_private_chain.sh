nohup geth --datadir ../testnet/node0 --port 30000 --nodiscover --unlock '0' --password ../testnet/node0/password --mine --ws --wsport 31000 --wsorigins "*" --wsapi "db,web3,eth,net,admin,personal" &
nohup geth --datadir ../testnet/node1 --port 30001 --nodiscover --unlock '0' --password ../testnet/node1/password --mine --rpc --rpcapi "web3,eth,net,admin" --rpccorsdomain "*" --rpcport 31001 &
nohup geth --datadir ../testnet/node2 --port 30002 --nodiscover --unlock '0' --password ../testnet/node2/password --mine --rpc --rpcapi "web3,eth,net,admin" --rpccorsdomain "*" --rpcport 31002 &
