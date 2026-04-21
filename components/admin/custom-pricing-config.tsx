'use client'

import { CustomPricingIntegration } from "./custom-pricing-integration"

interface CustomPricingConfigProps {
  onSave?: () => void
}

export function CustomPricingConfig({ onSave }: CustomPricingConfigProps) {

  return <CustomPricingIntegration />
}
