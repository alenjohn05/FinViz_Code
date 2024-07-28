const { parentPort, workerData } = require('worker_threads');

function transformToLinear(data, startIndex) {
  const linearData = [];
  function traverse(node, path, index) {
    if (!node || !node["$"] || !node["$"].words) {
      return;
    }
    const name = path ? `${path} > ${node["$"].words}` : node["$"].words;
    const size = node.synset ? node.synset.length : 0;
    linearData.push({ name, size });
    if (node.synset) {
      for (let i = 0; i < node.synset.length; i++) {
        traverse(node.synset[i], name, index + i + 1);
      }
    }
  }
  data.forEach((node, index) => {
    traverse(node, "", startIndex + index);
  });
  return linearData;
}

try {
  const { chunk, startIndex } = workerData;
  const transformedData = transformToLinear(chunk, startIndex);
  parentPort.postMessage(transformedData);
} catch (error) {
  parentPort.postMessage({ error: error.message });
}