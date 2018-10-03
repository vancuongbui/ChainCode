#!/bin/bash


for ((i=0; i < 5; i++)); do

# setup new accounts and input an interactive password '123'
cd /home/testnet
geth --datadir ./node${i} account new << EOF
123
123
EOF

# print the addresses into addr file with prefix '0x'
cd /home/testnet/node${i}/keystore
addr=$(ls)
echo 0x${addr:37} >>/home/testnet/node${i}/addr


# print password into files for further convience
echo 123 > /home/testnet/node$i/password

# copy genesis file to each nodes file
# cp /home/testnet/genesis.json /home/testnet/node${i}

done
