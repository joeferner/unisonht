use crate::my_error::Result;
use rppal::spi::{Bus, Mode, SlaveSelect, Spi};

pub struct Mcp3204 {
    spi: Spi,
}

impl Mcp3204 {
    pub fn new() -> Result<Self> {
        let spi = Spi::new(Bus::Spi0, SlaveSelect::Ss0, 20_000, Mode::Mode0)?;
        return Result::Ok(Mcp3204 { spi });
    }
}
