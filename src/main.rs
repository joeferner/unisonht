use crate::mcp3204::Mcp3204;
use crate::my_error::Result;

mod mcp3204;
mod my_error;

fn run() -> Result<()> {
    let _mcp3204 = Mcp3204::new()?;
    return Result::Ok(());
}

fn main() {
    println!("Hello, world!");
    run().unwrap();
}
