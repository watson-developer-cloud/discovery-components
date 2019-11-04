import { FilterGroupWithFns } from '../filterGroups';

const filterGroups: FilterGroupWithFns[] = [
  {
    id: 'FILTER_GROUP_A',
    type: 'checkbox',
    // title: 'Filter Group A',
    labelsFromItem: (item: any) => item.groupA.map((groupA: any) => groupA.label),
    applyFilter: (list: any[], label: string) =>
      list.filter((item: any) => item.groupA.some((groupA: any) => groupA.label === label))
  },
  {
    id: 'FILTER_GROUP_B',
    type: 'radio',
    // title: 'Filter Group B',
    labelsFromItem: (item: any) => item.groupBC.map((groupBC: any) => groupBC.label.groupB),
    applyFilter: (list: any[], label: string) =>
      list.filter((item: any) =>
        item.groupBC.some((groupBC: any) => groupBC.label.groupB === label)
      )
  },
  {
    id: 'FILTER_GROUP_C',
    type: 'radio',
    // title: 'Filter Group C',
    labelsFromItem: (item: any) => item.groupBC.map((groupBC: any) => groupBC.label.groupC),
    applyFilter: (list: any[], label: string) =>
      list.filter((item: any) =>
        item.groupBC.some((groupBC: any) => groupBC.label.groupC === label)
      )
  }
];

export default filterGroups;
