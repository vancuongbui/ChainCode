#!/bin/bash

scp ubuntu@13.238.184.xxx:/home/ubuntu/tmp.13.238.184.xxx ~/gopath/testsh/
scp ubuntu@54.252.240.xxx:/home/ubuntu/tmp.54.252.240.xxx ~/gopath/testsh/
scp ubuntu@13.239.27.xxx:/home/ubuntu/tmp.13.239.27.xxx ~/gopath/testsh/
scp root@47.74.69.xxx:/root/tmp.47.74.69.xxx ~/gopath/testsh/
scp root@47.74.70.xxx:/root/tmp.47.74.70.xxx ~/gopath/testsh/
scp root@47.91.56.xxx:/root/tmp.47.91.56.xxx ~/gopath/testsh/ 


v[0]=$(cat tmp.13.238.184.xxx)
v[1]=$(cat tmp.54.252.240.xxx)
v[2]=$(cat tmp.13.239.27.xxx)
v[3]=$(cat tmp.47.74.69.xxx)
v[4]=$(cat tmp.47.74.70.xxx)
v[5]=$(cat tmp.47.91.56.xxx)

# create static-nodes.json
echo  "[" >> static1.json
for ((i=0; i < 6; i++));do 
echo  "\"enode://${v[i]}:30001\"," >> static1.json
done
echo  "]" >> static1.json

tac static1.json | sed '2s/,//'> static2.json  

tac static2.json > static-nodes.json

# 删除中间过程文件
rm static1.json static2.json



