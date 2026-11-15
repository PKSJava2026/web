import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/database-tables')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/database-tables"!</div>
}
