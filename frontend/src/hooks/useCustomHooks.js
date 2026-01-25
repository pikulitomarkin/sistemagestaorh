import { useQuery } from '@tanstack/react-query';

/**
 * Hook customizado para buscar dados com React Query
 * @param {string} queryKey - Chave única para a query
 * @param {Function} queryFn - Função que retorna uma promise com os dados
 * @param {Object} options - Opções adicionais do React Query
 */
export function useFetch(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    ...options,
  });
}

/**
 * Hook para gerenciar paginação
 */
export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const goToPage = (newPage) => setPage(Math.max(1, newPage));

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
  };
}

/**
 * Hook para gerenciar estado de modal
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook para debounce de valores
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
