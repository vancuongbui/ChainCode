#!/usr/local/bin/python3.7
# encoding: utf-8
from fabric.api import * 
from fabric.api import local,cd,run,env
 

env.password='xxx'
env.roledefs = {
            'ALIserver': ['root@47.74.69.xxx','root@47.74.70.xxx','root@47.91.56.xxx'],
            'AWSserver': ['ubuntu@13.238.184.xxx','ubuntu@54.252.240.xxx','ubuntu@13.239.27.xxx']
            }
 

#@roles('localPC')
def loc00_01():
    print("creat the 100 prefund accounts and collect their address on local PC")
    print("send the acctSvr.sh file to each sever")
    local('cd ~/gopath/testsh/')
    local('./00_01.sh')

def loc00_02():
    print("write the 6 supernode and 100 prefund addresses into the genesis file")
    print("send the console.sh and genesis.json files to the sever")
    local('./00_02.sh')

def loc00_03():
    print("automatically creat the static-nodes.json in local")
    print("send the static-nodes.json files to the sever")
    local('./00_03.sh')
         

@roles('ALIserver')
def ali03():
    print("[on sever] creat the supernode accounts on ALI server")
    with cd('~'):   #cd用于进入某个目录
        run('./03_acctSvr.sh')  #远程操作用run

@roles('ALIserver')   
def ali06():
    print("[on sever] execute the console.sh")
    with cd('~'):   
        run('./06_console.sh')  

@roles('ALIserver')
def ali09():
    print("[on sever]start the mine process in nohup way")
    with cd('~'):  
        run('./09_nohup.sh')  
 

@roles('AWSserver')
def aws03():
    print("creat the supernode accounts on AWS server") 
    with cd('~'):   
        run('./03_acctSvr.sh')  

@roles('AWSserver')
def aws06():
    print("[on sever] execute the console.sh")
    with cd('~'):   
        run('./06_console.sh')  

@roles('AWSserver')
def aws09():
    print("[on sever]start the mine process in nohup way")
    with cd('~'):  
        run('./09_nohup.sh')  


def dotask():
    execute(loc00_01)
    execute(ali03)
    execute(aws03)
    execute(loc00_02)
    execute(ali06)
    execute(aws06)
    execute(loc00_03)
    execute(ali09)
    execute(aws09)


