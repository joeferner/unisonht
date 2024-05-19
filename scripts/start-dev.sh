#!/bin/bash

export RUST_BACKTRACE=1
export RUST_LOG=debug
sudo chmod a+w $(find /sys/ 2>/dev/null | grep protocols)
sudo chmod a+w $(find /dev/lirc* 2>/dev/null)
cargo run
