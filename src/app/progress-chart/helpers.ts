// Chart.js types
type DataSetPoint = { x: number, y: number }
type DataSet = Array<DataSetPoint>

export function last(dataset: DataSet): DataSetPoint {
  return dataset[dataset.length - 1]
}

export function removeDuplicates(originalDataset: DataSet): DataSet {
  const newDataset = originalDataset.reduce((accumDataset: DataSet, curr, index) => {
    if (!accumDataset.length || last(accumDataset).y !== curr.y) {
      accumDataset.push(curr)
    }
    return accumDataset
  }, [])

  if (last(originalDataset).x !== last(newDataset).x) {
    newDataset.push(last(originalDataset))
  }

  return newDataset
}
