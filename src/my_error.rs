pub type Result<T> = std::result::Result<T, MyError>;

#[derive(Debug)]
pub enum MyError {
    SpiError(rppal::spi::Error),
    StdIoError(std::io::Error),
    GenericError(String),
}

impl MyError {
    pub fn new<S: Into<String>>(message: S) -> Self {
        return MyError::GenericError(message.into());
    }
}

impl From<rppal::spi::Error> for MyError {
    fn from(err: rppal::spi::Error) -> Self {
        return MyError::SpiError(err);
    }
}

impl From<std::io::Error> for MyError {
    fn from(err: std::io::Error) -> Self {
        return MyError::StdIoError(err);
    }
}
