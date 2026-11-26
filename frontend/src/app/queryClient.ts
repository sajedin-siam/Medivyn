import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // don't retry client errors such as 403 or 404
      retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
    },
  },
})
