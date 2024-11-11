import { TreeNode } from "@/components/file-tree";

// components/JsonTreeEditor/utils.ts
export const convertJsonToTree = (
  obj: never,
  parentKey = 'root',
  parentPath: string[] = []
): TreeNode => {
  const isObject = obj !== null && typeof obj === 'object';
  
  const node: TreeNode = {
    key: parentKey,
    value: isObject ? undefined : obj,
    path: parentPath,
    isObject,
    isExpanded: true
  };

  if (isObject) {
    node.children = Object.entries(obj).map(([key, value]) => 
      convertJsonToTree(value, key, [...parentPath, key])
    );
  }

  return node;
};

export const updateJsonByPath = (
  obj: any,
  path: string[],
  value: any
): any => {
  if (path.length === 0) return value;
  
  const [head, ...rest] = path;
  const result = { ...obj };
  
  if (rest.length === 0) {
    result[head] = value;
  } else {
    result[head] = updateJsonByPath(obj[head], rest, value);
  }
  
  return result;
};

export const deleteJsonByPath = (
  obj: any,
  path: string[]
): any => {
  if (path.length === 0) return obj;
  
  const [head, ...rest] = path;
  const result = { ...obj };
  
  if (rest.length === 0) {
    delete result[head];
  } else {
    result[head] = deleteJsonByPath(obj[head], rest);
  }
  
  return result;
};

