use crate::lirc::{LircEvent, LircProtocol};

use super::{DecodeResult, Key, Remote};

pub struct DenonRemote {}

impl DenonRemote {
    pub fn new() -> Self {
        return DenonRemote {};
    }
}

impl Remote for DenonRemote {
    fn get_protocol(&self) -> LircProtocol {
        return LircProtocol::Sharp;
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

    fn get_display_name(&self) -> &str {
        return "denon";
    }

    fn decode(&self, events: &Vec<LircEvent>) -> Option<DecodeResult> {
        if let Option::Some(first_event) = events.get(0) {
            match first_event.scan_code {
                0x02e1 => return DecodeResult::new(self, Key::PowerOn),
                0x02e2 => return DecodeResult::new(self, Key::PowerOff),
                0x0cdf => return DecodeResult::new(self, Key::Dimmer),
                0x02c4 => return DecodeResult::new(self, Key::InputCd),
                0x02c8 => return DecodeResult::new(self, Key::InputDbs),
                0x02e3 => return DecodeResult::new(self, Key::InputDvd),
                0x0cb6 => return DecodeResult::new(self, Key::InputMode),
                0x02dc => return DecodeResult::new(self, Key::InputModeAnalog),
                0x0cb5 => return DecodeResult::new(self, Key::InputModeExtIn),
                0x02c3 => return DecodeResult::new(self, Key::InputPhono),
                0x02d2 => return DecodeResult::new(self, Key::InputTape),
                0x02c5 => return DecodeResult::new(self, Key::InputTuner),
                0x02c9 => return DecodeResult::new(self, Key::InputTv),
                0x02cc => return DecodeResult::new(self, Key::InputVAux),
                0x02cd => return DecodeResult::new(self, Key::InputVcr1),
                0x02ce => return DecodeResult::new(self, Key::InputVcr2),
                0x02ca => return DecodeResult::new(self, Key::InputVdp),
                0x0ca8 => return DecodeResult::new(self, Key::Mode5ch7ch),
                0x0495 => return DecodeResult::new(self, Key::ModeCinema),
                0x02e6 => return DecodeResult::new(self, Key::ModeDspSimu),
                0x0497 => return DecodeResult::new(self, Key::ModeGame),
                0x0496 => return DecodeResult::new(self, Key::ModeMusic),
                0x026a => return DecodeResult::new(self, Key::ModePureDirect),
                0x02e4 => return DecodeResult::new(self, Key::ModeStandard),
                0x0c9d => return DecodeResult::new(self, Key::ModeStereo),
                0x0c82 => return DecodeResult::new(self, Key::ModeSurroundBack),
                0x02df => return DecodeResult::new(self, Key::OnScreen),
                0x027a => return DecodeResult::new(self, Key::PowerOffMain),
                0x0279 => return DecodeResult::new(self, Key::PowerOnMain),
                0x0cd6 => return DecodeResult::new(self, Key::PresetNext),
                0x0cd5 => return DecodeResult::new(self, Key::PresetPrevious),
                0x049d => return DecodeResult::new(self, Key::RoomEq),
                0x02ed => return DecodeResult::new(self, Key::Speaker),
                0x0ca1 => return DecodeResult::new(self, Key::SurroundParameter),
                0x0ca0 => return DecodeResult::new(self, Key::SystemSetup),
                0x02ea => return DecodeResult::new(self, Key::TestTone),
                0x0cd7 => return DecodeResult::new(self, Key::TunerBand),
                0x0ccc => return DecodeResult::new(self, Key::TunerMemory),
                0x0cd8 => return DecodeResult::new(self, Key::TunerMode),
                0x0ccd => return DecodeResult::new(self, Key::TunerShift),
                0x0cb2 => return DecodeResult::new(self, Key::VideoOff),
                0x02d8 => return DecodeResult::new(self, Key::VideoSelect),
                0x02f1 => return DecodeResult::new(self, Key::VolumeUp),
                0x02f2 => return DecodeResult::new(self, Key::VolumeDown),
                0x0cd9 => return DecodeResult::new(self, Key::ChannelUp),
                0x0cda => return DecodeResult::new(self, Key::ChannelDown),
                0x0ca3 => return DecodeResult::new(self, Key::DirUp),
                0x0ca4 => return DecodeResult::new(self, Key::DirDown),
                0x0c7f => return DecodeResult::new(self, Key::DirLeft),
                0x02dd => return DecodeResult::new(self, Key::DirRight),
                0x02e0 => return DecodeResult::new(self, Key::Select),
                0x02f0 => return DecodeResult::new(self, Key::Mute),
                0x0cc1 => return DecodeResult::new(self, Key::Num1),
                0x0cc2 => return DecodeResult::new(self, Key::Num2),
                0x0cc3 => return DecodeResult::new(self, Key::Num3),
                0x0cc4 => return DecodeResult::new(self, Key::Num4),
                0x0cc5 => return DecodeResult::new(self, Key::Num5),
                0x0cc6 => return DecodeResult::new(self, Key::Num6),
                0x0cc7 => return DecodeResult::new(self, Key::Num7),
                0x0cc8 => return DecodeResult::new(self, Key::Num8),
                0x0cc9 => return DecodeResult::new(self, Key::Num9),
                0x0cca => return DecodeResult::new(self, Key::Num0),
                _ => return Option::None,
            }
        }
        return Option::None;
    }
}
