import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming in next release</CardTitle>
          <CardDescription>
            Feature rollout is one at a time. Decks is complete — this feature is next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            See <code className="text-xs">docs/architecture/README.md</code> for the implementation order.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
