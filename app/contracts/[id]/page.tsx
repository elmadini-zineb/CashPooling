'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ContractPDFPreview } from '@/components/contract-pdf-preview'
import type { CashPoolingContract, HierarchicalAccount } from '@/lib/types'

// Mock data for development
const mockContract: CashPoolingContract = {
  id: '1',
  contractNumber: '20240001',
  masterAccountId: 'ACC001',
  masterAccount: {
    id: 'ACC001',
    accountNumber: 'MA000000000000000001',
    accountType: 'Centralisateur',
    clientId: 'CLT001',
    clientName: 'Client One',
    companyName: 'Client One SARL',
    balance: 1000000,
    currency: 'MAD',
    status: 'active',
  },
  secondaryAccounts: [
    {
      id: 'ACC002',
      accountNumber: 'SA000000000000000002',
      accountType: 'Secondaire',
      clientId: 'CLT001',
      clientName: 'Client One - Sub 1',
      companyName: 'Client One SARL',
      balance: 500000,
      currency: 'MAD',
      status: 'active',
    },
    {
      id: 'ACC003',
      accountNumber: 'SA000000000000000003',
      accountType: 'Secondaire',
      clientId: 'CLT001',
      clientName: 'Client One - Sub 2',
      companyName: 'Client One SARL',
      balance: 300000,
      currency: 'MAD',
      status: 'active',
    },
  ],
  pricingAccountId: 'ACC001',
  clientId: 'CLT001',
  clientName: 'Client One',
  status: 'active',
  currency: 'MAD',
  createdBy: 'admin@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  pricingConfig: {
    pricingMode: 'standard',
    subscriptionAmount: 500,
    subscriptionFrequency: 'monthly',
    discount: {
      type: 'percentage',
      value: 5,
    },
  },
  investmentConfig: {
    investmentMode: 'total',
    excessThreshold: 100000,
    selectedFunds: [
      {
        id: 'FUND001',
        name: 'OPCVM Test',
        isin: 'LU0000000000',
        performance: 3.5,
      },
    ],
  },
}

const mockHierarchy: HierarchicalAccount = {
  id: 'ACC001',
  accountNumber: 'MA000000000000000001',
  accountName: 'Client One',
  role: 'master',
  children: [
    {
      id: 'ACC002',
      accountNumber: 'SA000000000000000002',
      accountName: 'Client One - Sub 1',
      role: 'secondary',
      children: [],
    },
    {
      id: 'ACC003',
      accountNumber: 'SA000000000000000003',
      accountName: 'Client One - Sub 2',
      role: 'secondary',
      children: [],
    },
  ],
}

export default function ContractPage() {
  const router = useRouter()
  const params = useParams()
  const contractId = params?.id as string

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto">
        <ContractPDFPreview
          contract={mockContract}
          hierarchy={mockHierarchy}
          onBack={() => router.back()}
        />
      </div>
    </div>
  )
}
