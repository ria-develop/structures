export enum NodeType {
  ROOT,
  PARENT,
  LEAF
}

export type Id = {
  [index in string | number]: Id;
};

export type BaseObject = Record<string | number, string | number>;

export type NodeTypeHolder = {
  type: NodeType;
};
export type NodeValueHolder<T extends BaseObject> = {
  //readonly value: T[G];
  readonly value: string | number;
  data: T;
};
export type NodeChildrenHolder<T extends BaseObject> = {
  children: TreeNode<T>[];
};

export type ChildNodeNode<T extends BaseObject> = NodeTypeHolder & {
  parent?: ParentNode<T>;
};

export type LeafNode<T extends BaseObject> = NodeTypeHolder &
  NodeValueHolder<T> & {
    type: NodeType.LEAF;
  };
export type ParentNode<T extends BaseObject> = ChildNodeNode<T> &
  NodeValueHolder<T> &
  NodeChildrenHolder<T> & {
    type: NodeType.PARENT;
  };

export type RootNode<T extends BaseObject> = NodeTypeHolder &
  NodeChildrenHolder<T> & {
    type: NodeType.ROOT;
  };

export type TreeNode<T extends BaseObject> = ParentNode<T> | LeafNode<T> | RootNode<T>;
