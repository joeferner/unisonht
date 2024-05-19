use crate::lirc::{LircEvent, LircProtocol};

use super::{DecodeResult, Key, Remote};

fn create_rca_result(key: Key) -> Option<DecodeResult> {
    return Option::Some(DecodeResult {
        time: 0,
        key,
        repeat: 0,
    });
}

pub struct RcaRemote {}

impl RcaRemote {
    pub fn new() -> Self {
        return RcaRemote {};
    }
}

impl Remote for RcaRemote {
    fn get_protocol(&self) -> LircProtocol {
        return LircProtocol::Sony12;
    }

    fn get_repeat_count(&self) -> u32 {
        return 3;
    }

    fn get_tx_scan_code_gap(&self) -> u32 {
        return 0;
    }

    fn get_tx_repeat_gap(&self) -> u32 {
        return 0;
    }

    fn get_rx_repeat_gap_max(&self) -> u32 {
        return 200;
    }

    fn decode(&self, events: &Vec<LircEvent>) -> Option<DecodeResult> {
        if let Option::Some(first_event) = events.get(0) {
            match first_event.scan_code {
                0x10015 => return create_rca_result(Key::PowerToggle),
                0x10012 => return create_rca_result(Key::VolumeUp),
                0x10013 => return create_rca_result(Key::VolumeDown),
                0x10014 => return create_rca_result(Key::Mute),
                _ => return Option::None,
            }
        }
        return Option::None;
    }
}
