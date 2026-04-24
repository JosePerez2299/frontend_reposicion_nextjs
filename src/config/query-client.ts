import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      throwOnError: false,  // no rompe el render
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  }),
})
