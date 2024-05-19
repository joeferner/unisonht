#!/bin/bash

export RUST_BACKTRACE=1
export RUST_LOG=debug
sudo chmod a+w $(find /sys/ 2>/dev/null | grep protocols)
cargo run
