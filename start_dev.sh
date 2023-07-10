#!/bin/bash

SCRIPT=$(realpath "$0")
PROJECT_DIR=$(dirname "$SCRIPT")

export PROJECT_DIR

"$PROJECT_DIR/db_and_mail.sh"
kitty --session "$PROJECT_DIR/kitty-session.conf" &
disown
