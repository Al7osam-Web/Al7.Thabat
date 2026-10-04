interface Row {
  key: any;
  items: Item[];
  children?: Row[];
}

interface Item {
  [key: string]: any;
}

export function groupBy(
  items: Item[],
  propertyGetters: ((item: Item) => any)[]
): Row[] {
  const groups = items.reduce((acc: { [key: string]: Item[] }, item: Item) => {
    let group: any = acc;

    propertyGetters.forEach((getter, index) => {
      const propertyValue = getter(item);
      if (index === propertyGetters.length - 1) {
        group[propertyValue] = (group[propertyValue] || []).concat(item);
      } else {
        group[propertyValue] = group[propertyValue] || {};
        group = group[propertyValue];
      }
    });

    return acc;
  }, {});

  return Object.keys(groups).map((key: string) => {
    const row: Row = {
      key,
      items: groups[key],
    };

    const nestedItems = groups[key].filter(item => {
      const lastGetter = propertyGetters[propertyGetters.length - 1];
      const nestedItem = lastGetter(item);

      return Array.isArray(nestedItem);
    });

    if (nestedItems.length > 0) {
      const nestedPropertyGetter = propertyGetters.slice(1);

      row.children = groupBy(
        nestedItems.reduce(
          (acc: Item[], item: Item) =>
            acc.concat(nestedPropertyGetter[0](item)),
          []
        ),
        nestedPropertyGetter
      );
    }

    return row;
  });
}
