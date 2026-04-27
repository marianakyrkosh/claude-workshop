import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Workshop Starter</h1>
      <p className="text-muted-foreground">A full-stack monorepo template for building apps with Claude.</p>
      <Button asChild>
        <Link href="/items">View Items</Link>
      </Button>
    </div>
  )
}
