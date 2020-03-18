import { HostRun, Executor } from '../src/hostrun'
import * as path from 'path'
/**
 *
 * @param cmd
 * @param callback
 */

/**
 * Dummy test
 */
describe('Homerun test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('HostRun is instantiable', () => {
    expect(new HostRun()).toBeInstanceOf(HostRun)
  })

  it('Should set pwd', () => {
    const workingDir = '/home/test'
    const executable = 'test'
    const h = new HostRun({ pwd: workingDir })
    h.run(executable).compile()

    expect(h.cmd).toEqual(path.join(workingDir, executable))
  })

  it('add flag', () => {
    const h = new HostRun()
    h.run('test.exe')
      .flag('-t', 1)
      .compile()
    expect(h.cmd).toEqual('test.exe -t 1')
  })

  it('add flag with same key w/o overwriting', () => {
    const h = new HostRun()
    h.run('test.exe')
      .flag('-e', 'LOC=4')
      .flag('-e', 'LOC=3')
      .compile()
    expect(h.cmd).toEqual('test.exe -e LOC=4 -e LOC=3')
  })

  it('add argument', () => {
    const h = new HostRun()
    h.run('docker')
      .arg('ps')
      .compile()
    expect(h.cmd).toEqual('docker ps')
  })

  it('adds options', () => {
    const x: Executor = jest.fn()
    const options = {
      pwd: '/home/test',
      executor: x,
      dryRun: true
    }
    const h = new HostRun()
    h.run('test.exe')
      .options(options)
      .compile()
    expect(h.execute).toBe(x)
    expect(h.pwd).toEqual('/home/test')
    expect(h.dryRun).toBeTruthy()
  })

  it('should error when attempting compile w/o executable', () => {
    const h = new HostRun()
    expect(() => h.compile()).toThrowError(TypeError)
  })

  it('should Error as expected when dryRun is set to true', () => {
    const h = new HostRun()
    h.run('test.exe').options({ dryRun: true })

    expect(() => h.exec()).toThrow()
  })

  it('should call executor once', () => {
    const x: Executor = jest.fn()
    const h = new HostRun({ executor: x })
    h.run('test.exe').exec()
    expect(x).toBeCalledTimes(1)
  })

  it('should not call executor on compile', () => {
    const x: Executor = jest.fn()
    const h = new HostRun({ executor: x })
    h.run('test.exe').compile()
    expect(h.cmd).toBe('test.exe')
    expect(x).toBeCalledTimes(0)
  })
})
