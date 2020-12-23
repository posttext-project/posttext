export function createAsyncIter<T, TReturn = any, TNext = any>(
  callback: (iter: ResolverAsyncIter<T, TReturn, TNext>) => any
): {
  [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>
} {
  const iter = new ResolverAsyncIter<T, TReturn>()

  ;(async (): Promise<void> => {
    try {
      await callback(iter)
    } catch (err) {
      iter.throw(err)
    }
  })()

  return {
    async *[Symbol.asyncIterator](): AsyncGenerator<
      T,
      TReturn,
      TNext
    > {
      let lastItem

      while (true) {
        const { value, done } = await iter.shift({
          value: lastItem,
          done: false,
        })

        if (!done) {
          lastItem = yield value as T
        } else {
          iter.shift({ value: lastItem, done: true })

          return value as TReturn
        }
      }
    },
  }
}

export type AsyncQueue<T, TReturn> = [
  (value: IteratorResult<T, TReturn>) => any,
  (reason: any) => any
][]

export class ResolverAsyncIter<T, TReturn = any, TNext = any> {
  private input: {
    queue: AsyncQueue<T, TReturn>
    data: IteratorResult<T, TReturn>[]
    errors: any[]
  }
  private output: {
    queue: AsyncQueue<TNext, any>
    data: IteratorResult<TNext, any>[]
  }

  constructor() {
    this.input = {
      queue: [],
      data: [],
      errors: [],
    }
    this.output = {
      queue: [],
      data: [],
    }
  }

  shift(
    {
      value,
      done,
    }: IteratorResult<TNext | undefined, any | undefined> = {
      value: undefined,
      done: false,
    }
  ): Promise<IteratorResult<T, TReturn>> {
    if (this.output.queue.length) {
      this.output.queue.shift()![0]({
        value,
        done,
      } as IteratorResult<TNext, any>)
    } else {
      this.output.data.push({
        value,
        done,
      } as IteratorResult<TNext, any>)
    }

    return new Promise((resolve, reject) => {
      if (this.input.errors.length) {
        return reject(this.input.errors.shift())
      }

      if (this.input.data.length) {
        return resolve(this.input.data.shift()!)
      }

      this.input.queue.push([resolve, reject])
    })
  }

  throw(err: any): void {
    if (this.input.queue.length) {
      this.input.queue.shift()![1](err)
    } else {
      this.input.errors.push(err)
    }
  }

  next(value: T): Promise<IteratorResult<TNext, any>> {
    if (this.input.queue.length) {
      this.input.queue.shift()![0]({ value, done: false })
    } else {
      this.input.data.push({ value, done: false })
    }

    return new Promise((resolve, reject) => {
      if (this.output.data.length) {
        return resolve(this.output.data.shift()!)
      }

      this.output.queue.push([resolve, reject])
    })
  }

  return(value?: TReturn): Promise<IteratorResult<TNext, any>> {
    if (this.input.queue.length) {
      this.input.queue.shift()![0]({
        value: (value as unknown) as TReturn,
        done: true,
      })
    } else {
      this.input.data.push({
        value: (value as unknown) as TReturn,
        done: true,
      })
    }

    return new Promise((resolve, reject) => {
      if (this.output.data.length) {
        return resolve(this.output.data.shift()!)
      }

      this.output.queue.push([resolve, reject])
    })
  }
}
