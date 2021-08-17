import { createTree } from '../create-tree';
import { getData, DataSource, grouping } from '../__fixtures__/category-group-item-structure';

describe('Given category, group, item flat data provided', () => {
  const data = getData();
  let tree;
  it('should return the consistent tree structure', () => {
    tree = createTree<DataSource>(data, grouping);
    expect(tree).toMatchSnapshot();
  });
  it('should give the access to origin data on each level of a tree', () => {
    const [firstOrigin] = data;
    expect(tree).toHaveProperty(['children', 0, 'data'], firstOrigin);
    expect(tree).toHaveProperty(['children', 0, 'children', 0, 'data'], firstOrigin);
    expect(tree).toHaveProperty(['children', 0, 'children', 0, 'children', 0, 'data'], firstOrigin);
  });
});
