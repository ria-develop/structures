import { generatorToArray } from '../utils';

export const grouping: ['category', 'group', 'item'] = ['category', 'group', 'item'];

export type DataSource = {
  category: string;
  categoryId: string;
  group: string;
  groupId: string;
  item: string;
  itemId: string;
  value: number;
};

function* categoryFactory(numCategories: number, numGroups: number, numItems: number): Generator<DataSource> {
  const total = numCategories * numGroups * numItems;
  let current = 0;
  let categoryId = 1;
  let groupId = 1;
  let itemId = 0;
  while (current < total) {
    current++;
    if (!(current % 4)) {
      categoryId++;
      groupId = 0;
      itemId = 0;
    }
    if (!(current % 2)) {
      groupId++;
      itemId = 0;
    }
    itemId++;

    yield {
      category: 'Category ' + categoryId,
      categoryId: categoryId + '',
      group: 'Group ' + groupId,
      groupId: groupId + '',
      item: 'Item ' + itemId,
      itemId: itemId + '',
      value: 100
    };
  }
}

export const getData = (numCategories = 2, numGroups = 2, numItems = 2): DataSource[] =>
  generatorToArray<DataSource>(categoryFactory(numCategories, numGroups, numItems));
