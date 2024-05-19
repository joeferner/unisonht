pub type Result<T> = std::result::Result<T, MyError>;

#[derive(Debug)]
pub struct MyError {
  spi_error: Option<rppal::spi::Error>,
}

impl From<rppal::spi::Error> for MyError {
    fn from(err: rppal::spi::Error) -> Self {
        return MyError {
          spi_error: Option::Some(err)
        };
    }
}
