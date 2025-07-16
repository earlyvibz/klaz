import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/schools')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/_dashboard/schools"!</div>
}
