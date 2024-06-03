export type TagResolver = (
  context: any,
  tag: any
) => Promise<void>
export type DirectiveResolver = (
  directive: string
) => Promise<void>

export type DataResolver = (
  context: any,
  tag: any
) => Promise<void>

export interface Resolver {
  data?: Record<string | symbol, DataResolver>
  tag?: TagResolver
}
