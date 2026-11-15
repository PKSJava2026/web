import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/contracts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/contracts"!</div>
}
