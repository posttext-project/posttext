export type Document = {
  body: Node[];
};

export type Tag = {
  identifier: Identifier;
  arguments: Literal[];
  properties: Property[];
  blocks: Block[];
};

export type Property = {
  identifier: Identifier;
  value: Literal;
};

export type Block = {
  children: Node[];
};

export type Text = {
  content: string;
};

export type Identifier = {
  name: string;
};

export type Literal = {
  value: string;
};

export type Node = Tag | Text;
