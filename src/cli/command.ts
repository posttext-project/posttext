export interface CommandOptions {
  args: string[]
  flags: Record<string, any>
}

export interface Command {
  run(): Promise<any>
}
