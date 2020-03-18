import * as cp from 'child_process'
import * as path from 'path'

type FlagTuple = [string, string]
type Executor = (
  cmd: string,
  callback: (err: Error | null, stdout: string | Buffer, stderr: string | Buffer) => void
) => void

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

export class Hostrun {
  pwd: string
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
    this.pwd = process.cwd()
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
  run(executable: string): Hostrun {
    this.executable = executable
    return this
  }

  /**
   *
   * @param argument
   */
  arg(argument: string): Hostrun {
    this.args.push(argument)
    return this
  }

  /**
   *
   * @param type
   * @param value
   */
  flag(type: string, value: string | number): Hostrun {
    this.flags.push([type, value.toString()])
    return this
  }

  /**
   *
   * @param options
   */
  options(options: Partial<Options>): Hostrun {
    if (options?.dryRun) {
      this.dryRun = options.dryRun
    }
    if (options?.pwd) {
      this.pwd = options.pwd
    }
    return this
  }

  compile(): Hostrun {
    if (this.executable === null) {
      throw new Error('Executable can not be null')
    }
    // build cmd string starting with absolute path to exec.
    this.cmd = path.join(this.pwd, this.executable)
    // join in the arguments.
    this.cmd = [this.cmd, ...this.args].join(' ')
    // then concat flag and flag values finishing by joining to cmd string.
    const flagStr = this.flags.map(i => `${i[0]} ${i[1]}`).join(' ')
    this.cmd = [this.cmd, flagStr].join(' ')
    return this
  }

  /**
   *
   * @param options
   */
  exec(options?: Partial<Options>): Hostrun {
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

export const host = new Hostrun()
