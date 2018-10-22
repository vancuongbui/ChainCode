#!/bin/bash
cd /home/testnet

for ((i=0; i < 5; i++)); do
geth --datadir node${i} init genesis.json
geth --datadir node${i} --port 30000 --nodiscover --unlock '0' --password ./node0/password --mine

done
