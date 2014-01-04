#!/bin/bash
# upgrade all packages
export DEBIAN_FRONTEND=noninteractive

add-apt-repository ppa:rquillo/ansible
apt-get update

apt-get -y install python-pip
apt-get -y install ansible
apt-get -y install python-numpy python-yaml

pip install -U nltk
python -m nltk.downloader all

#sudo ansible-playbook -c local -i hosts -v playbook.yml
