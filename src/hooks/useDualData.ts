/**
 * useDualData.ts — Factory hook for dual-mode data access.
 * Demo mode: reads from localStorage stores (crossRoleStore).
 * Production mode: reads from Supabase via React Query.
 *
 * This keeps every page hook unchanged — the switch happens inside the hook.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import { getAppMode } from "@/lib/appConfig";
import { useSyncExternalStore } from "react";

/**
 * For stores that have NO Supabase table yet:
 * Demo → returns localStorage data as usual.
 * Production → returns the provided emptyValue (empty array, empty object, etc.)
 */
export function useDemoOnlyStore<T>(
  store: { getSnapshot: () => T; subscribe: (cb: () => void) => () => void; set: (v: T | ((p: T) => T)) => void },
  emptyValue: T
): [T, (v: T | ((p: T) => T)) => void] {
  const localData = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const isProduction = getAppMode() === "production";
  return [isProduction ? emptyValue : localData, store.set];
}

/**
 * Generic dual-mode read hook.
 * - Demo: returns localStorage data via store.getSnapshot()
 * - Production: fetches from Supabase table, maps rows to frontend type
 */
export function useDualQuery<TLocal, TRow = any>({
  store,
  tableName,
  select,
  queryKey,
  mapRowToLocal,
  filters,
  orderBy,
  enabled = true,
}: {
  store: { getSnapshot: () => TLocal; subscribe: (cb: () => void) => () => void; set: (v: TLocal | ((p: TLocal) => TLocal)) => void };
  tableName: string;
  select?: string;
  queryKey: string[];
  mapRowToLocal: (row: TRow) => any;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}): [TLocal, (v: TLocal | ((p: TLocal) => TLocal)) => void, { isLoading: boolean; isProduction: boolean }] {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady, isAuthenticated } = useAuthReady();

  // Always subscribe to local store (hooks must be called unconditionally)
  const localData = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  // Supabase query (only runs in production)
  const query = useQuery<any>({
    queryKey: isProduction ? queryKey : ["disabled"],
    queryFn: async () => {
      let q = (supabase.from as any)(tableName).select(select || "*");
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          q = q.eq(key, value);
        });
      }
      if (orderBy) {
        q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      const { data, error } = await q;
      if (error) {
        console.error(`[useDualQuery] ${tableName}:`, error);
        return [];
      }
      return (data || []).map(mapRowToLocal);
    },
    enabled: isProduction && isReady && enabled,
  });

  if (isProduction) {
    const hasLocalFallback = Array.isArray(localData)
      ? localData.length > 0
      : Boolean(localData);

    const data = (!isAuthenticated && hasLocalFallback)
      ? (localData as TLocal)
      : (query.data ?? (Array.isArray(localData) ? [] : localData)) as TLocal;

    return [data, store.set, { isLoading: query.isLoading, isProduction: true }];
  }

  return [localData, store.set, { isLoading: false, isProduction: false }];
}

/**
 * Helper: create a Supabase insert mutation for production mode.
 */
export function useDualInsert<T extends Record<string, any>>({
  tableName,
  invalidateKeys,
  mapLocalToRow,
  localInsert,
}: {
  tableName: string;
  invalidateKeys: string[][];
  mapLocalToRow: (item: T) => Record<string, any>;
  localInsert: (item: T) => void;
}) {
  const queryClient = useQueryClient();
  const isProduction = getAppMode() === "production";

  const mutation = useMutation({
    mutationFn: async (item: T) => {
      if (!isProduction) {
        localInsert(item);
        return item;
      }
      const { data, error } = await (supabase.from as any)(tableName)
        .insert(mapLocalToRow(item))
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (isProduction) {
        invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });

  return mutation;
}

/**
 * Helper: create a Supabase update mutation for production mode.
 */
export function useDualUpdate<T extends Record<string, any>>({
  tableName,
  invalidateKeys,
  mapLocalToRow,
  localUpdate,
}: {
  tableName: string;
  invalidateKeys: string[][];
  mapLocalToRow: (item: Partial<T> & { id: any }) => Record<string, any>;
  localUpdate: (id: any, update: Partial<T>) => void;
}) {
  const queryClient = useQueryClient();
  const isProduction = getAppMode() === "production";

  return useMutation({
    mutationFn: async ({ id, ...update }: Partial<T> & { id: any }) => {
      if (!isProduction) {
        localUpdate(id, update as unknown as Partial<T>);
        return { id, ...update };
      }
      const row = mapLocalToRow({ id, ...update } as any);
      const { id: rowId, ...rest } = row;
      const { data, error } = await (supabase.from as any)(tableName)
        .update(rest)
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (isProduction) {
        invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
  });
}
