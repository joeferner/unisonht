use crate::lirc::{LircEvent, LircProtocol};

use super::{DecodeResult, Key, RemoteInfo};

fn create_pioneer_result(key: Key) -> Option<DecodeResult> {
    return Option::Some(DecodeResult {
        time: 0,
        key,
        repeat: 0,
    });
}

pub fn pioneer_info() -> RemoteInfo {
    return RemoteInfo {
        protocol: LircProtocol::Nec,
        repeat_count: 2,
        tx_scan_code_gap: 25,
        tx_repeat_gap: 25,
        rx_repeat_gap_max: 200,
    };
}

pub fn pioneer_decode(events: &Vec<LircEvent>) -> Option<DecodeResult> {
    if let Option::Some(first_event) = events.get(0) {
        match first_event.scan_code {
            0xaa00 => return create_pioneer_result(Key::Num0),
            0xaa01 => return create_pioneer_result(Key::Num1),
            0xaa02 => return create_pioneer_result(Key::Num2),
            0xaa03 => return create_pioneer_result(Key::Num3),
            0xaa04 => return create_pioneer_result(Key::Num4),
            0xaa05 => return create_pioneer_result(Key::Num5),
            0xaa06 => return create_pioneer_result(Key::Num6),
            0xaa07 => return create_pioneer_result(Key::Num7),
            0xaa08 => return create_pioneer_result(Key::Num8),
            0xaa09 => return create_pioneer_result(Key::Num9),
            0xaa0a => return create_pioneer_result(Key::VolumeUp),
            0xaa0b => return create_pioneer_result(Key::VolumeDown),
            0xaa10 => return create_pioneer_result(Key::ChannelUp),
            0xaa11 => return create_pioneer_result(Key::ChannelDown),
            0xaa1a => return create_pioneer_result(Key::PowerOn),
            0xaa1b => return create_pioneer_result(Key::PowerOff),
            0xaa1c => return create_pioneer_result(Key::PowerToggle),
            0xaa24 => return create_pioneer_result(Key::DirRight),
            0xaa25 => return create_pioneer_result(Key::DirLeft),
            0xaa26 => return create_pioneer_result(Key::DirUp),
            0xaa27 => return create_pioneer_result(Key::DirDown),
            0xaa28 => return create_pioneer_result(Key::Select),
            0xaa38 => return create_pioneer_result(Key::Record),
            0xaa45 => return create_pioneer_result(Key::InputAnt),
            0xaa49 => return create_pioneer_result(Key::Mute),
            0xaa4a => return create_pioneer_result(Key::Display),
            0xaa5a => {
                if let Option::Some(second_event) = events.get(1) {
                    match second_event.scan_code {
                        0xaf64 => return create_pioneer_result(Key::Dot),
                        0xaf61 => return create_pioneer_result(Key::ChannelEnter),
                        0xaf62 => return create_pioneer_result(Key::ChannelReturn),
                        0xaf74 => return create_pioneer_result(Key::InputPc),
                        0xaf7a => return create_pioneer_result(Key::Input1),
                        0xaf7b => return create_pioneer_result(Key::Input2),
                        0xaf7c => return create_pioneer_result(Key::Input3),
                        0xaf7d => return create_pioneer_result(Key::Input4),
                        0xaf7e => return create_pioneer_result(Key::Input5),
                        0xaf7f => return create_pioneer_result(Key::Input6),
                        _ => return Option::None,
                    }
                }
            }
            0xaa5b => {
                if let Option::Some(second_event) = events.get(1) {
                    match second_event.scan_code {
                        0xaf20 => return create_pioneer_result(Key::Home),
                        0xaf22 => return create_pioneer_result(Key::Back),
                        0xaf24 => return create_pioneer_result(Key::Guide),
                        0xaf25 => return create_pioneer_result(Key::Info),
                        0xaf27 => return create_pioneer_result(Key::Menu),
                        0xaf2a => return create_pioneer_result(Key::DayPlus),
                        0xaf2b => return create_pioneer_result(Key::DayMinus),
                        0xaf2c => return create_pioneer_result(Key::FavoriteB),
                        0xaf2d => return create_pioneer_result(Key::FavoriteC),
                        0xaf2e => return create_pioneer_result(Key::FavoriteD),
                        0xaf2f => return create_pioneer_result(Key::FavoriteA),
                        0xaf33 => return create_pioneer_result(Key::PageUp),
                        0xaf34 => return create_pioneer_result(Key::PageDown),
                        _ => return Option::None,
                    }
                }
            }
            0xaa5e => {
                if let Option::Some(second_event) = events.get(1) {
                    match second_event.scan_code {
                        0xaf3a => return create_pioneer_result(Key::Size),
                        0xaf61 => return create_pioneer_result(Key::AvSelection),
                        0xaf70 => return create_pioneer_result(Key::Sleep),
                        _ => return Option::None,
                    }
                }
            }
            _ => return Option::None,
        }
    }
    return Option::None;
}
