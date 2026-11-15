import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/statistics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/statistics"!</div>
}
