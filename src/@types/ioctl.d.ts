declare module "ioctl" {
  const ioctl: (fd: number, request: number, data: number | Buffer) => number;
  export default ioctl;
}
