const { parentPort, workerData } = require('worker_threads');

function transformToLinear(data) {
  const linearData = [];
  function traverse(node, path) {
    if (!node || !node["$"] || !node["$"].words) {
      return;
    }
    const name = path ? `${path} > ${node["$"].words}` : node["$"].words;
    const size = node.synset ? node.synset.length : 0;
    linearData.push({ name, size });
    if (node.synset) {
      for (const child of node.synset) {
        traverse(child, name);
      }
    }
  }
  if (data && data.ImageNetStructure && data.ImageNetStructure.synset && data.ImageNetStructure.synset[0]) {
    traverse(data.ImageNetStructure.synset[0], "");
  } else {
    throw new Error("Invalid data structure");
  }
  return linearData;
}

try {
  const transformedData = transformToLinear(workerData);
  parentPort.postMessage(transformedData);
} catch (error) {
  parentPort.postMessage({ error: error.message });
  parentPort.close();
}
