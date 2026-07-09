# 07 — State Management (v2)

## Strategy

| Concern | Tool |
|---------|------|
| Server data (lists, details) | **TanStack Query** |
| Form state | **React Hook Form** |
| Form validation | **Zod** (+ `@hookform/resolvers/zod`) |
| Ephemeral UI (flip, sidebar) | Local `useState` |
| Review session progress | Feature hook `useReducer` |

**No Redux. No business logic in client state.**

## TanStack Query

### Query key convention

```typescript
export const queryKeys = {
  decks: {
    all: ["decks"] as const,
    detail: (id: string) => ["decks", id] as const,
  },
  cards: {
    byDeck: (deckId: string) => ["cards", deckId] as const,
  },
  review: {
    queue: (deckId?: string) => ["review", "queue", deckId ?? "all"] as const,
  },
  dashboard: ["dashboard"] as const,
  statistics: ["statistics"] as const,
};
```

### Feature hook pattern

```typescript
// features/decks/hooks/use-decks.ts
export function useDecks() {
  return useQuery({
    queryKey: queryKeys.decks.all,
    queryFn: () => deckApi.list(),
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deckApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.decks.all }),
  });
}
```

## React Hook Form + Zod

Shared schema between API and form:

```typescript
// lib/validators/deck.schema.ts
export const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
```

```typescript
// features/decks/components/create-deck-form.tsx
const form = useForm<CreateDeckInput>({
  resolver: zodResolver(createDeckSchema),
  defaultValues: { title: "", color: "#6366f1" },
});
```

## Server Actions Policy

| Allowed | Not allowed |
|---------|-------------|
| Simple redirect after form | Business validation rules |
| Revalidate path wrapper | Prisma calls |
| Cookie/session helpers | Scheduler invocation |

**All CRUD and review operations go through `/api` Route Handlers.**

## Page Data Loading

| Pattern | When |
|---------|------|
| Client fetch via TanStack Query | Interactive lists, mutations (Decks, Review) |
| Server Component + fetch to own API | Optional for SSR dashboard (future) |
| `force-dynamic` + client query | MVP default for DB-backed pages |

## Invalidation Map

```
POST   /api/decks          → invalidate ['decks'], ['dashboard']
DELETE /api/decks/:id      → invalidate ['decks'], ['dashboard']
POST   /api/review         → invalidate ['review'], ['dashboard'], ['statistics']
POST   /api/decks/:id/cards → invalidate ['cards', deckId], ['decks']
```
