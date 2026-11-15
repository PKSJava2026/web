import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/my-rating')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/my-rating"!</div>
}
