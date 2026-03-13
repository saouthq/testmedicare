/**
 * useSupabaseQuery.ts — Wrapper hooks for React Query + Supabase.
 * Provides a consistent pattern for querying Supabase tables with:
 * - Automatic auth-readiness check
 * - Fallback to localStorage stores in demo mode
 * - Type-safe queries
 */
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// ─── Auth readiness hook ────────────────────────────────────

/**
 * Hook that waits for Supabase session to be restored before enabling queries.
 * Prevents RLS failures from auth.uid() returning null during session restoration.
 */
export function useAuthReady() {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // getSession restores from storage first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setIsReady(true);
    });

    // Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { userId, isReady, isAuthenticated: isReady && !!userId };
}

// ─── Generic Supabase query hook ────────────────────────────

interface SupabaseQueryOptions<T> {
  queryKey: string[];
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
  /** Fallback data when user is in demo mode or not authenticated */
  fallbackData?: T[];
}

/**
 * Generic hook for querying a Supabase table with React Query.
 * Falls back to provided data in demo mode.
 */
export function useSupabaseTable<T>({
  queryKey,
  tableName,
  select = "*",
  filters,
  orderBy,
  enabled = true,
  fallbackData,
}: SupabaseQueryOptions<T>) {
  const { isReady, isAuthenticated } = useAuthReady();

  return useQuery<T[]>({
    queryKey,
    queryFn: async () => {
      let query = (supabase.from as any)(tableName).select(select);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[useSupabaseTable] Error querying ${tableName}:`, error);
        // Return fallback data on error (e.g., demo mode)
        return fallbackData || [];
      }
      return (data as T[]) || [];
    },
    enabled: enabled && isReady,
    // If not authenticated, use fallback data immediately
    ...((!isAuthenticated && fallbackData) ? { initialData: fallbackData } : {}),
  });
}

// ─── Supabase mutation helpers ──────────────────────────────

interface SupabaseMutationOptions {
  tableName: string;
  invalidateKeys?: string[][];
}

/**
 * Hook for inserting a row into a Supabase table.
 */
export function useSupabaseInsert<T extends Record<string, any>>({
  tableName,
  invalidateKeys,
}: SupabaseMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (row: T) => {
      const { data, error } = await (supabase.from as any)(tableName)
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateKeys?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}

/**
 * Hook for updating a row in a Supabase table.
 */
export function useSupabaseUpdate<T extends Record<string, any>>({
  tableName,
  invalidateKeys,
}: SupabaseMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: T & { id: string | number }) => {
      const { data, error } = await (supabase.from as any)(tableName)
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateKeys?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}

/**
 * Hook for deleting a row from a Supabase table.
 */
export function useSupabaseDelete({
  tableName,
  invalidateKeys,
}: SupabaseMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await (supabase.from as any)(tableName)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys?.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}

// ─── Realtime subscription hook ─────────────────────────────

/**
 * Subscribe to Supabase Realtime changes on a table.
 * Automatically invalidates React Query cache on changes.
 */
export function useSupabaseRealtime(
  tableName: string,
  invalidateKeys: string[][],
  filter?: string
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${tableName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          ...(filter ? { filter } : {}),
        },
        () => {
          invalidateKeys.forEach(key =>
            queryClient.invalidateQueries({ queryKey: key })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, filter, queryClient]);
}

/**
 * Check if we're in demo mode (no Supabase user, using localStorage).
 */
export function useIsDemoMode(): boolean {
  const { isAuthenticated } = useAuthReady();
  return !isAuthenticated;
}
