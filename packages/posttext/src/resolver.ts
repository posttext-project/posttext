export type TagResolver = (tag: string) => Promise<void>
export type DirectiveResolver = (
  directive: string
) => Promise<void>

export type DataResolver = (data: string) => Promise<void>

export interface Resolver {
  data?: Record<string | symbol, DataResolver>
  directive?: DirectiveResolver
  tag?: TagResolver
}
