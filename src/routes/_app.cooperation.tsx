import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/cooperation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/cooperation"!</div>
}
