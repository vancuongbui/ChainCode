
#!/bin/bash


# creat the 100 prefund accounts and collect their address on local PC
. ~/gopath/testsh/01_deploy.sh


# send the acctSvr.sh file to each sever
. ~/gopath/testsh/02_toAcctSvr.sh


# [on sever] creat the supernode accounts on each server| get IP | get address 
#. ~/03_acctSvr.sh

