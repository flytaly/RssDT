#!/bin/bash
#
# Launch Redis, Postgres and Mailcatcher
#

CYAN='\033[1;36m'
NC='\033[0m' # No ColorED='\033[0;31m'

output="$(redis-cli ping)"
if [[ $output != "PONG" ]]; then
	echo -e "Launch redis ${CYAN}server${NC}"
	redis-server &
	disown
else
	echo -e "${CYAN}Redis${NC} was already started"
fi

output="$(systemctl is-active postgresql)"
if [[ $output != "active" ]]; then
	echo -e "Launch ${CYAN}postgres${NC}"
	systemctl start postgresql
else
	echo -e "${CYAN}Postgres${NC} was already started"
fi

mailPort=1025
output="$(lsof -i:${mailPort})"
if [[ -z $output ]]; then
	echo -e "Launch ${CYAN}mailcatcher${NC}"
	mailcatcher
else
	echo -e "${CYAN}Port ${mailPort}${NC} is already in use"
fi
