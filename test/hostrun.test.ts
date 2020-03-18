import { Hostrun } from '../src/hostrun'

/**
 * Dummy test
 */
describe('Homerun test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('Hostrun is instantiable', () => {
    expect(new Hostrun()).toBeInstanceOf(Hostrun)
  })

  it('default pwd should be init dir', () => {
    const workingDir = '/home/test/a'
    expect(new Hostrun({ pwd: workingDir }).pwd).toEqual('/home/test/a')
  })

  it('add flag', () => {
    const h = new Hostrun()
    h.run('test.exe')
      .flag('-t', 1)
      .compile()
    expect(h.cmd).toContain('-t 1')
  })

  it('add flag with same key w/o overwriting', () => {
    const h = new Hostrun()
    h.run('test.exe')
      .flag('-e', 'LOC=4')
      .flag('-e', 'LOC=3')
      .compile()
    expect(h.cmd).toContain('-e LOC=4 -e LOC=3')
  })
})
