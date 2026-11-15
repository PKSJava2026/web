import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/rate-orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/rate-orders"!</div>
}
