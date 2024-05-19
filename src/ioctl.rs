use crate::my_error::Result;
use nix::convert_ioctl_res;
use nix::libc::ioctl;
use std::os::fd::RawFd;

pub fn write_u32(fd: RawFd, cmd: u32, data: u32) -> Result<i32> {
    let data_bytes = data.to_le_bytes();
    let ret = convert_ioctl_res!(unsafe { ioctl(fd, cmd, data_bytes.as_ptr()) })?;
    return Result::Ok(ret);
}
