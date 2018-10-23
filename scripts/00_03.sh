#!/bin/bash



# automatically creat the static-nodes.json in local
. ~/gopath/testsh/07_setEnode.sh


# send the genesis.json and static-nodes to each sever
. ~/gopath/testsh/08_toSvr.sh


# [on sever]start the mine process in nohup way
#. ~/09_nohup.sh