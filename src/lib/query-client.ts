import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
      toast.error(`Error: ${error.message}`)  // muestra toast en cualquier error
    },
  }),
})