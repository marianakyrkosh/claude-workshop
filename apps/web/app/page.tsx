import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Workshop Starter</h1>
      <p className="text-zinc-600">A full-stack monorepo template for building apps with Claude.</p>
      <div>
        <Link href="/items" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          View Items
        </Link>
      </div>
    </div>
  )
}
