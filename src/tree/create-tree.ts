import { BaseObject, Id, LeafNode, NodeType, ParentNode, RootNode, TreeNode } from './types';

const isLeaf = (type: NodeType): type is NodeType.LEAF => type === NodeType.LEAF;
const isParent = (type: NodeType): type is NodeType.PARENT => type === NodeType.PARENT;
const isRoot = (type: NodeType): type is NodeType.ROOT => type === NodeType.ROOT;

export const isNodeLeaf = <T extends BaseObject>(node?: TreeNode<T>): node is LeafNode<T> =>
  !!node && isLeaf(node.type);

export const isNodeParentLike = <T extends BaseObject>(node?: TreeNode<T>): node is ParentNode<T> | RootNode<T> =>
  !!node && 'children' in node;

export const isNodeParent = <T extends BaseObject>(node?: TreeNode<T>): node is ParentNode<T> =>
  !!node && isParent(node.type);

const createLeafNode = <T extends BaseObject>(valueField?: keyof T, data?: T): LeafNode<T> => ({
  data,
  get value() {
    return data[valueField];
  },
  type: NodeType.LEAF
});

const createParentNode = <T extends BaseObject>(valueField?: keyof T, data?: T): ParentNode<T> =>
  Object.defineProperty(
    {
      children: [],
      data,
      get value() {
        return data[valueField];
      },
      type: NodeType.PARENT
    },
    'data',
    {
      value: data,
      enumerable: false,
      configurable: true
    }
  );

const createRootNode = <T extends BaseObject>(): RootNode<T> => ({
  children: [],
  type: NodeType.ROOT
});

const createNodeByType = <T extends BaseObject>(type: NodeType, valueField?: keyof T, data?: T): TreeNode<T> => {
  if (isLeaf(type)) {
    return createLeafNode(valueField, data);
  } else if (isParent(type)) {
    return createParentNode(valueField, data);
  } else if (isRoot(type)) {
    return createRootNode();
  }
};

const getId = (parentId: Id, key: string | number): Id => {
  let id: Id = parentId[key];
  if (!id) {
    id = {};
    parentId[key] = id;
  }
  return id;
};

function addNodeToParent<T extends BaseObject>(node: TreeNode<T>, parentNode: ParentNode<T> | RootNode<T>): void {
  Object.defineProperty(node, 'parent', {
    value: parentNode,
    enumerable: false,
    configurable: true
  });
  if (isNodeParentLike(parentNode)) {
    parentNode.children.push(node);
  }
}

export type ReduceListToTreeProps<T extends BaseObject> = {
  list: T[];
  root: Id;
  grouping: (keyof T)[];
  nodeById: Map<Id, TreeNode<T>>;
  rootNode: TreeNode<T>;
  createGroupCallback: CreateGroupCallback<T>;
};

function reduceListToTree<T extends BaseObject>({
  grouping,
  list,
  root,
  rootNode,
  nodeById,
  createGroupCallback
}: ReduceListToTreeProps<T>): TreeNode<T> {
  return list.reduce((accumulator: TreeNode<T>, dataItem: T) => {
    let parentId: Id = root;
    let parentNode: TreeNode<T> = accumulator;

    grouping.forEach((group: keyof T, index: number) => {
      const name: T[keyof T] = dataItem[group];
      const id = getId(parentId, name);
      let node = nodeById.get(id);
      if (!node) {
        const nodeType = index === grouping.length - 1 ? NodeType.LEAF : NodeType.PARENT;
        node = createNodeByType(nodeType, group, dataItem);
        if (isNodeParentLike(node) && typeof createGroupCallback === 'function') {
          node = createGroupCallback(node, dataItem, group);
        }

        nodeById.set(id, node);
        if (node && !isNodeLeaf(parentNode)) {
          addNodeToParent(node, parentNode);
        }
      }
      parentId = id;
      parentNode = node;
    });
    return accumulator;
  }, rootNode);
}

export type CreateGroupCallback<T extends BaseObject> = (
  groupNode: ParentNode<T> | RootNode<T>,
  entry: T,
  group: keyof T
) => ParentNode<T> | RootNode<T>;

export function createTree<T extends BaseObject>(
  list: T[],
  grouping: (keyof T)[],
  createGroupCallback?: CreateGroupCallback<T>
): RootNode<T> {
  const root: Id = {};
  //TODO: Create pointer-base id instead of value-base
  const nodeById: Map<Id, TreeNode<T>> = new Map<Id, TreeNode<T>>();
  const rootNode: RootNode<T> = createRootNode();
  return reduceListToTree({ list, root, grouping, nodeById, rootNode, createGroupCallback }) as RootNode<T>;
}
