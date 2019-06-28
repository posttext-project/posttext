export interface ASTNode {
  level?: number
  name: string
  options: any
  params: any[]
  content: ASTNode[]
}
