import * as cp from 'child_process'
import * as path from 'path'

type FlagTuple = [string, string]
export type Executor = (
  cmd: string,
  callback: (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => any
) => any

interface Options {
  pwd: string
  executable: string
  execPath: string
  verbose: boolean
  flags: FlagTuple[]
  args: string[]
  dryRun: boolean
  executor: Executor
}

export class HostRun {
  pwd: string | null
  executable: string | null
  flags: FlagTuple[]
  args: string[]
  stdout: string | Buffer | null
  stderr: string | Buffer | null
  cmd: string | null
  dryRun: boolean
  execute: Executor

  /**
   *
   * @param options
   */
  constructor(options?: Partial<Options>) {
    // set defaults
    this.pwd = null
    this.flags = []
    this.args = []
    this.executable = null
    this.stderr = null
    this.stdout = null
    this.cmd = null
    this.dryRun = false
    this.execute = cp.exec

    // set user provided options if they exist
    if (options) {
      this.options(options)
    }
  }

  /**
   *
   * @param executable
   */
  run(executable: string): HostRun {
    this.executable = executable
    return this
  }

  /**
   *
   * @param argument
   */
  arg(argument: string): HostRun {
    this.args.push(argument)
    return this
  }

  /**
   *
   * @param type
   * @param value
   */
  flag(type: string, value: string | number): HostRun {
    this.flags.push([type, value.toString()])
    return this
  }

  /**
   *
   * @param options
   */
  options(options: Partial<Options>): HostRun {
    if (options.dryRun) {
      this.dryRun = options.dryRun
    }
    if (options.executor) {
      this.execute = options.executor
    }
    if (options.pwd) {
      this.pwd = options.pwd
    }
    return this
  }

  compile(): HostRun {
    if (this.executable === null) {
      throw new TypeError('Executable can not be null')
    }

    // build cmd string starting with absolute path to exec.
    if (this.pwd !== null) {
      this.cmd = path.join(this.pwd, this.executable)
    } else {
      this.cmd = this.executable
    }
    // join in the arguments.
    this.cmd = [this.cmd, ...this.args].join(' ')
    // then concat flag and flag values finishing by joining to cmd string.
    const flagStr = this.flags.map(i => `${i[0]} ${i[1]}`).join(' ')
    this.cmd = [this.cmd, flagStr].join(' ').trim()
    return this
  }

  /**
   *
   * @param options
   */
  exec(options?: Partial<Options>): HostRun {
    // if options are provided set them before proceeding.
    if (options) {
      this.options(options)
    }
    // compile command string.
    this.compile()
    if (this.cmd === null) {
      throw new Error('Failed to compile command string')
    }
    if (this.dryRun) {
      console.log('=====================================================================')
      console.log(this.cmd)
      console.log('=====================================================================')
      throw new Error('DryRun Error: This would of worked but the dryRun option was set')
    }
    // actually execute command.
    this._execProcess(this.cmd)
    return this
  }

  /**
   *
   * @param cmd - command string to run on cmd.
   */
  private _execProcess(cmd: string): void {
    this.execute(cmd, (err, stdout, stderr) => {
      if (err) {
        throw err
      }
      this.stderr = stderr
      this.stdout = stdout
    })
  }
}

export const host = new HostRun()
