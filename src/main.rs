use crate::lirc::find_remotes;
use crate::lirc::lirc_reader::LircReader;
use crate::lirc::lirc_writer::LircWriter;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use crate::remotes::RemoteDecoder;
use env_logger;

mod ioctl;
mod lirc;
mod mcp3204;
mod my_error;
mod rc_devices;
mod remotes;

fn run() -> Result<()> {
    let env = env_logger::Env::default();
    env_logger::init_from_env(env);

    let mcp3204 = Mcp3204::new()?;
    println!("{}", mcp3204.read_single(0)?);
    let remotes = find_remotes()?;
    println!("remotes {:#?}", remotes);
    let mut reader = LircReader::new(remotes.lirc_rx_device)?;
    let mut _writer = LircWriter::new(remotes.lirc_tx_device)?;
    let mut decoder = RemoteDecoder::new();

    loop {
        for new_event in reader.read()? {
            if let Option::Some(decode_results) = decoder.decode(new_event) {
                println!("decode_results {:?}", decode_results);
            }
        }
    }
}

fn main() {
    run().unwrap();
}
