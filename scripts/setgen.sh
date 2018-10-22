#!/bin/bash
cd /home/testnet

puppeth << EOF
testnet
2
3
2
2
11
90ce5786430fcd196902dc1d29556542d75e78e5

90ce5786430fcd196902dc1d29556542d75e78e5

7777
2
2
genesis.json

EOF

for ((i=0; i < 5; i++)); do
cp /home/testnet/genesis.json /home/testnet/node${i}

done
