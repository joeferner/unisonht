use crate::lirc::{LircEvent, LircProtocol};

use super::{DecodeResult, Key, Remote};

fn create_denon_result(key: Key) -> Option<DecodeResult> {
    return Option::Some(DecodeResult {
        time: 0,
        key,
        repeat: 0,
    });
}

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

    fn decode(&self, events: &Vec<LircEvent>) -> Option<DecodeResult> {
        if let Option::Some(first_event) = events.get(0) {
            match first_event.scan_code {
                0x02e1 => return create_denon_result(Key::PowerOn),
                0x02e2 => return create_denon_result(Key::PowerOff),
                0x0cdf => return create_denon_result(Key::Dimmer),
                0x02c4 => return create_denon_result(Key::InputCd),
                0x02c8 => return create_denon_result(Key::InputDbs),
                0x02e3 => return create_denon_result(Key::InputDvd),
                0x0cb6 => return create_denon_result(Key::InputMode),
                0x02dc => return create_denon_result(Key::InputModeAnalog),
                0x0cb5 => return create_denon_result(Key::InputModeExtIn),
                0x02c3 => return create_denon_result(Key::InputPhono),
                0x02d2 => return create_denon_result(Key::InputTape),
                0x02c5 => return create_denon_result(Key::InputTuner),
                0x02c9 => return create_denon_result(Key::InputTv),
                0x02cc => return create_denon_result(Key::InputVAux),
                0x02cd => return create_denon_result(Key::InputVcr1),
                0x02ce => return create_denon_result(Key::InputVcr2),
                0x02ca => return create_denon_result(Key::InputVdp),
                0x0ca8 => return create_denon_result(Key::Mode5ch7ch),
                0x0495 => return create_denon_result(Key::ModeCinema),
                0x02e6 => return create_denon_result(Key::ModeDspSimu),
                0x0497 => return create_denon_result(Key::ModeGame),
                0x0496 => return create_denon_result(Key::ModeMusic),
                0x026a => return create_denon_result(Key::ModePureDirect),
                0x02e4 => return create_denon_result(Key::ModeStandard),
                0x0c9d => return create_denon_result(Key::ModeStereo),
                0x0c82 => return create_denon_result(Key::ModeSurroundBack),
                0x02df => return create_denon_result(Key::OnScreen),
                0x027a => return create_denon_result(Key::PowerOffMain),
                0x0279 => return create_denon_result(Key::PowerOnMain),
                0x0cd6 => return create_denon_result(Key::PresetNext),
                0x0cd5 => return create_denon_result(Key::PresetPrevious),
                0x049d => return create_denon_result(Key::RoomEq),
                0x02ed => return create_denon_result(Key::Speaker),
                0x0ca1 => return create_denon_result(Key::SurroundParameter),
                0x0ca0 => return create_denon_result(Key::SystemSetup),
                0x02ea => return create_denon_result(Key::TestTone),
                0x0cd7 => return create_denon_result(Key::TunerBand),
                0x0ccc => return create_denon_result(Key::TunerMemory),
                0x0cd8 => return create_denon_result(Key::TunerMode),
                0x0ccd => return create_denon_result(Key::TunerShift),
                0x0cb2 => return create_denon_result(Key::VideoOff),
                0x02d8 => return create_denon_result(Key::VideoSelect),
                0x02f1 => return create_denon_result(Key::VolumeUp),
                0x02f2 => return create_denon_result(Key::VolumeDown),
                0x0cd9 => return create_denon_result(Key::ChannelUp),
                0x0cda => return create_denon_result(Key::ChannelDown),
                0x0ca3 => return create_denon_result(Key::DirUp),
                0x0ca4 => return create_denon_result(Key::DirDown),
                0x0c7f => return create_denon_result(Key::DirLeft),
                0x02dd => return create_denon_result(Key::DirRight),
                0x02e0 => return create_denon_result(Key::Select),
                0x02f0 => return create_denon_result(Key::Mute),
                0x0cc1 => return create_denon_result(Key::Num1),
                0x0cc2 => return create_denon_result(Key::Num2),
                0x0cc3 => return create_denon_result(Key::Num3),
                0x0cc4 => return create_denon_result(Key::Num4),
                0x0cc5 => return create_denon_result(Key::Num5),
                0x0cc6 => return create_denon_result(Key::Num6),
                0x0cc7 => return create_denon_result(Key::Num7),
                0x0cc8 => return create_denon_result(Key::Num8),
                0x0cc9 => return create_denon_result(Key::Num9),
                0x0cca => return create_denon_result(Key::Num0),
                _ => return Option::None,
            }
        }
        return Option::None;
    }
}
