import { Separator } from '@/components/ui/separator'

export function PageHeader({ title, description, action }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <Separator />
    </div>
  )
}
