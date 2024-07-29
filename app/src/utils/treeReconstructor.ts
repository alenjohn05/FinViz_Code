export function reconstructTreeFromDB(data: { name: string; size: number }[]): any {
    const tree: { [key: string]: any } = {};
    data.forEach(({ name, size }) => {
      const pathParts = name.split(" > ");
      let currentLevel = tree;
      pathParts.slice(0, -1).forEach((part) => {
        if (!currentLevel[part]) {
          currentLevel[part] = { name: part, size: 0, children: {} };
        }
        currentLevel = currentLevel[part].children;
      });
      const leaf = pathParts[pathParts.length - 1];
      if (!currentLevel[leaf]) {
        currentLevel[leaf] = { name: leaf, size, children: {} };
      } else {
        currentLevel[leaf].size = size;
      }
    });
  
    function convertTreeToList(tree: { [key: string]: any }): any[] {
      return Object.keys(tree).map((key) => {
        const { name, size, children } = tree[key];
        return { name, size, children: convertTreeToList(children) };
      });
    }
  
    return convertTreeToList(tree);
  }