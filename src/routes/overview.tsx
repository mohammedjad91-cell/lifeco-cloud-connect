import { createFileRoute } from '@tanstack/react-router'
import GeneralInfo from '../pages/GeneralInfo'

export const Route = createFileRoute('/overview')({
  component: GeneralInfo,
})
