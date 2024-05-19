use crate::lirc::{LircEvent, LircProtocol};

use super::{DecodeResult, Key, Remote};

pub struct PioneerRemote {}

impl PioneerRemote {
    pub fn new() -> Self {
        return PioneerRemote {};
    }
}

impl Remote for PioneerRemote {
    fn get_protocol(&self) -> LircProtocol {
        return LircProtocol::Nec;
    }

    fn get_repeat_count(&self) -> u32 {
        return 2;
    }

    fn get_tx_scan_code_gap(&self) -> u32 {
        return 25;
    }

    fn get_tx_repeat_gap(&self) -> u32 {
        return 25;
    }

    fn get_rx_repeat_gap_max(&self) -> u32 {
        return 200;
    }

    fn get_display_name(&self) -> &str {
        return "pioneer";
    }

    fn decode(&self, events: &Vec<LircEvent>) -> Option<DecodeResult> {
        if let Option::Some(first_event) = events.get(0) {
            match first_event.scan_code {
                0xaa00 => return DecodeResult::new(self, Key::Num0),
                0xaa01 => return DecodeResult::new(self, Key::Num1),
                0xaa02 => return DecodeResult::new(self, Key::Num2),
                0xaa03 => return DecodeResult::new(self, Key::Num3),
                0xaa04 => return DecodeResult::new(self, Key::Num4),
                0xaa05 => return DecodeResult::new(self, Key::Num5),
                0xaa06 => return DecodeResult::new(self, Key::Num6),
                0xaa07 => return DecodeResult::new(self, Key::Num7),
                0xaa08 => return DecodeResult::new(self, Key::Num8),
                0xaa09 => return DecodeResult::new(self, Key::Num9),
                0xaa0a => return DecodeResult::new(self, Key::VolumeUp),
                0xaa0b => return DecodeResult::new(self, Key::VolumeDown),
                0xaa10 => return DecodeResult::new(self, Key::ChannelUp),
                0xaa11 => return DecodeResult::new(self, Key::ChannelDown),
                0xaa1a => return DecodeResult::new(self, Key::PowerOn),
                0xaa1b => return DecodeResult::new(self, Key::PowerOff),
                0xaa1c => return DecodeResult::new(self, Key::PowerToggle),
                0xaa24 => return DecodeResult::new(self, Key::DirRight),
                0xaa25 => return DecodeResult::new(self, Key::DirLeft),
                0xaa26 => return DecodeResult::new(self, Key::DirUp),
                0xaa27 => return DecodeResult::new(self, Key::DirDown),
                0xaa28 => return DecodeResult::new(self, Key::Select),
                0xaa38 => return DecodeResult::new(self, Key::Record),
                0xaa45 => return DecodeResult::new(self, Key::InputAnt),
                0xaa49 => return DecodeResult::new(self, Key::Mute),
                0xaa4a => return DecodeResult::new(self, Key::Display),
                0xaa5a => {
                    if let Option::Some(second_event) = events.get(1) {
                        match second_event.scan_code {
                            0xaf64 => return DecodeResult::new(self, Key::Dot),
                            0xaf61 => return DecodeResult::new(self, Key::ChannelEnter),
                            0xaf62 => return DecodeResult::new(self, Key::ChannelReturn),
                            0xaf74 => return DecodeResult::new(self, Key::InputPc),
                            0xaf7a => return DecodeResult::new(self, Key::Input1),
                            0xaf7b => return DecodeResult::new(self, Key::Input2),
                            0xaf7c => return DecodeResult::new(self, Key::Input3),
                            0xaf7d => return DecodeResult::new(self, Key::Input4),
                            0xaf7e => return DecodeResult::new(self, Key::Input5),
                            0xaf7f => return DecodeResult::new(self, Key::Input6),
                            _ => return Option::None,
                        }
                    }
                }
                0xaa5b => {
                    if let Option::Some(second_event) = events.get(1) {
                        match second_event.scan_code {
                            0xaf20 => return DecodeResult::new(self, Key::Home),
                            0xaf22 => return DecodeResult::new(self, Key::Back),
                            0xaf24 => return DecodeResult::new(self, Key::Guide),
                            0xaf25 => return DecodeResult::new(self, Key::Info),
                            0xaf27 => return DecodeResult::new(self, Key::Menu),
                            0xaf2a => return DecodeResult::new(self, Key::DayPlus),
                            0xaf2b => return DecodeResult::new(self, Key::DayMinus),
                            0xaf2c => return DecodeResult::new(self, Key::FavoriteB),
                            0xaf2d => return DecodeResult::new(self, Key::FavoriteC),
                            0xaf2e => return DecodeResult::new(self, Key::FavoriteD),
                            0xaf2f => return DecodeResult::new(self, Key::FavoriteA),
                            0xaf33 => return DecodeResult::new(self, Key::PageUp),
                            0xaf34 => return DecodeResult::new(self, Key::PageDown),
                            _ => return Option::None,
                        }
                    }
                }
                0xaa5e => {
                    if let Option::Some(second_event) = events.get(1) {
                        match second_event.scan_code {
                            0xaf3a => return DecodeResult::new(self, Key::Size),
                            0xaf61 => return DecodeResult::new(self, Key::AvSelection),
                            0xaf70 => return DecodeResult::new(self, Key::Sleep),
                            _ => return Option::None,
                        }
                    }
                }
                _ => return Option::None,
            }
        }
        return Option::None;
    }
}
