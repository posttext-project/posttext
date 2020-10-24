export interface RunAsyncIteratorResult<T, TReturn> {
  collection: T[]
  last: TReturn
}

export async function runAsyncIterator<T, TReturn>(
  asyncIterator: AsyncGenerator<T, TReturn, any>
): Promise<RunAsyncIteratorResult<T, TReturn>> {
  const collection: T[] = []

  let iterResult = await asyncIterator.next()
  while (!iterResult.done) {
    iterResult = await asyncIterator.next()

    collection.push(iterResult.value as T)
  }

  const last: TReturn = iterResult.value

  return {
    collection,
    last,
  }
}
