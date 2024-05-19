use crate::lirc::find_remotes;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use env_logger;

mod lirc;
mod mcp3204;
mod my_error;
mod rc_devices;

fn run() -> Result<()> {
    let env = env_logger::Env::default();
    env_logger::init_from_env(env);

    let mcp3204 = Mcp3204::new()?;
    println!("{}", mcp3204.read_single(0)?);
    let remotes = find_remotes()?;
    println!("remotes {:#?}", remotes);
    return Result::Ok(());
}

fn main() {
    run().unwrap();
}
