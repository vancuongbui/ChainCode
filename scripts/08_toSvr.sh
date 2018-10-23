#!/bin/bash

# set IP array
aliIP[0]=root@47.74.69.xxx
aliIP[1]=root@47.74.70.xxx
aliIP[2]=root@47.91.56.xxx
awsIP[0]=ubuntu@13.238.184.xxx
awsIP[1]=ubuntu@54.252.240.xxx
awsIP[2]=ubuntu@13.239.27.xxx


# 向AliCloud传递文件
for i in "${aliIP[@]}"; do
scp ~/gopath/testsh/static-nodes.json $i:/root/node0
scp ~/gopath/testsh/09_nohup.sh $i:/root/
done


# 向AWSCloud传递文件
for i in "${awsIP[@]}"; do
scp ~/gopath/testsh/static-nodes.json $i:/home/ubuntu/node0/
scp ~/gopath/testsh/09_nohup.sh $i:/home/ubuntu/
done



