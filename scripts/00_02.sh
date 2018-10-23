#!/bin/bash


# write the 6 supernode and 100 prefund addresses into the genesis file
. ~/gopath/testsh/04_setgen.sh


# send the console.sh and genesis.json file to each sever
. ~/gopath/testsh/05_toConSvr.sh


# [on sever] execute the console.sh
# get enode | connect them
#./06_console.sh