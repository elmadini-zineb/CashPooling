'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import type { BasePricing, OperationPricing, LevelingModePricing, AdriaModularPricing } from '@/lib/types'

export function AdriaModularPricing() {
  // État principal
  const [currency, setCurrency] = useState('MAD')
  const [savedMessage, setSavedMessage] = useState(false)

  // COUCHE 1: Tarification de base
  const [fixedFee, setFixedFee] = useState(500)
  const [fixedFeeBilling, setFixedFeeBilling] = useState('monthly')
  const [accountBrackets, setAccountBrackets] = useState([
    { id: '1', minAccounts: 1, maxAccounts: 5, feePerAccount: 50, isActive: true },
    { id: '2', minAccounts: 6, maxAccounts: 20, feePerAccount: 35, isActive: true },
    { id: '3', minAccounts: 21, maxAccounts: null, feePerAccount: 20, isActive: true },
  ])

  // COUCHE 2: Tarification par opération
  const [operations, setOperations] = useState<OperationPricing[]>([
    { id: '1', operationType: 'virement', pricingType: 'pourcentage', minAmount: 0, maxAmount: null, value: 0.5, isActive: true },
    { id: '2', operationType: 'sweep', pricingType: 'fixe', minAmount: 0, maxAmount: null, value: 10, isActive: true },
    { id: '3', operationType: 'autre', pricingType: 'pourcentage', minAmount: 0, maxAmount: null, value: 0.25, isActive: true },
  ])

  // COUCHE 3: Tarification par mode de nivellement
  const [levelingModes, setLevelingModes] = useState<LevelingModePricing[]>([
    { id: '1', levelingMode: 'ZBA', pricingType: 'fixe', value: 200, isActive: true, description: 'Solde zéro quotidien' },
    { id: '2', levelingMode: 'TBA', pricingType: 'pourcentage', value: 0.3, isActive: true, description: 'Solde cible' },
    { id: '3', levelingMode: 'FBA', pricingType: 'pourcentage', value: 0.15, isActive: true, description: 'Solde complet' },
  ])

  const handleAddBracket = () => {
    const newId = String(Math.max(0, ...accountBrackets.map(b => parseInt(b.id))) + 1)
    setAccountBrackets([...accountBrackets, {
      id: newId,
      minAccounts: 0,
      maxAccounts: null,
      feePerAccount: 0,
      isActive: true,
    }])
  }

  const handleDeleteBracket = (id: string) => {
    setAccountBrackets(accountBrackets.filter(b => b.id !== id))
  }

  const handleUpdateBracket = (id: string, field: string, value: any) => {
    setAccountBrackets(accountBrackets.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const handleAddOperation = () => {
    const newId = String(Math.max(0, ...operations.map(o => parseInt(o.id))) + 1)
    setOperations([...operations, {
      id: newId,
      operationType: 'virement',
      pricingType: 'fixe',
      minAmount: 0,
      maxAmount: null,
      value: 0,
      isActive: true,
    }])
  }

  const handleDeleteOperation = (id: string) => {
    setOperations(operations.filter(o => o.id !== id))
  }

  const handleUpdateOperation = (id: string, field: string, value: any) => {
    setOperations(operations.map(o =>
      o.id === id ? { ...o, [field]: value } : o
    ))
  }

  const handleAddLevelingMode = () => {
    const newId = String(Math.max(0, ...levelingModes.map(l => parseInt(l.id))) + 1)
    setLevelingModes([...levelingModes, {
      id: newId,
      levelingMode: 'ZBA',
      pricingType: 'fixe',
      value: 0,
      isActive: true,
    }])
  }

  const handleDeleteLevelingMode = (id: string) => {
    setLevelingModes(levelingModes.filter(l => l.id !== id))
  }

  const handleUpdateLevelingMode = (id: string, field: string, value: any) => {
    setLevelingModes(levelingModes.map(l =>
      l.id === id ? { ...l, [field]: value } : l
    ))
  }

  const handleSave = () => {
    const pricingConfig: AdriaModularPricing = {
      id: 'adria-pricing-1',
      currency,
      basePricing: {
        id: 'base-1',
        fixedFee,
        fixedFeeCurrency: currency,
        fixedFeeBillingCycle: fixedFeeBilling as 'monthly' | 'quarterly' | 'yearly',
        accountCountBrackets: accountBrackets,
      },
      operationPricings: operations,
      levelingModePricings: levelingModes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    console.log('[v0] Saving modular pricing config:', pricingConfig)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {savedMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configuration de tarification enregistrée avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* Currency Selection */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Devise</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MAD">MAD (Dirham marocain)</SelectItem>
              <SelectItem value="EUR">EUR (Euro)</SelectItem>
              <SelectItem value="USD">USD (Dollar américain)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="base" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-200">
          <TabsTrigger value="base">Tarification de base</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
          <TabsTrigger value="leveling">Modes de nivellement</TabsTrigger>
        </TabsList>

        {/* TAB 1: Base Pricing */}
        <TabsContent value="base" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abonnement fixe</CardTitle>
              <CardDescription>Montant récurrent indépendant des opérations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fixed-fee">Montant</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="fixed-fee"
                      type="number"
                      value={fixedFee}
                      onChange={(e) => setFixedFee(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-600 w-12">{currency}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-cycle">Fréquence</Label>
                  <Select value={fixedFeeBilling} onValueChange={setFixedFeeBilling}>
                    <SelectTrigger id="billing-cycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="yearly">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barèmes par nombre de comptes</CardTitle>
              <CardDescription>Tarif dégressif selon le nombre de comptes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-3 text-left">De</th>
                      <th className="p-3 text-left">À</th>
                      <th className="p-3 text-right">Frais/compte</th>
                      <th className="p-3 text-center">Actif</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountBrackets.map((bracket, idx) => (
                      <tr key={bracket.id} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={bracket.minAccounts}
                            onChange={(e) => handleUpdateBracket(bracket.id, 'minAccounts', Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={bracket.maxAccounts ?? ''}
                            onChange={(e) => handleUpdateBracket(bracket.id, 'maxAccounts', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Illimité"
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              type="number"
                              value={bracket.feePerAccount}
                              onChange={(e) => handleUpdateBracket(bracket.id, 'feePerAccount', Number(e.target.value))}
                              className="w-24"
                            />
                            <span className="text-xs text-slate-600">{currency}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={bracket.isActive}
                            onCheckedChange={(checked) => handleUpdateBracket(bracket.id, 'isActive', checked)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBracket(bracket.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={handleAddBracket}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un barème
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Operation Pricing */}
        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarification par opération</CardTitle>
              <CardDescription>Définissez les frais pour chaque type d'opération</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-3 text-left">Type d'opération</th>
                      <th className="p-3 text-left">Type tarif</th>
                      <th className="p-3 text-right">Min montant</th>
                      <th className="p-3 text-right">Max montant</th>
                      <th className="p-3 text-right">Valeur</th>
                      <th className="p-3 text-center">Actif</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op, idx) => (
                      <tr key={op.id} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td className="p-3">
                          <Select
                            value={op.operationType}
                            onValueChange={(val) => handleUpdateOperation(op.id, 'operationType', val)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="virement">Virement</SelectItem>
                              <SelectItem value="sweep">Sweep</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select
                            value={op.pricingType}
                            onValueChange={(val) => handleUpdateOperation(op.id, 'pricingType', val)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixe">Fixe</SelectItem>
                              <SelectItem value="pourcentage">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            value={op.minAmount}
                            onChange={(e) => handleUpdateOperation(op.id, 'minAmount', Number(e.target.value))}
                            className="w-24"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            value={op.maxAmount ?? ''}
                            onChange={(e) => handleUpdateOperation(op.id, 'maxAmount', e.target.value ? Number(e.target.value) : null)}
                            placeholder="Illimité"
                            className="w-24"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              type="number"
                              value={op.value}
                              onChange={(e) => handleUpdateOperation(op.id, 'value', Number(e.target.value))}
                              className="w-24"
                            />
                            <span className="text-xs text-slate-600 w-8">
                              {op.pricingType === 'pourcentage' ? '%' : currency}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={op.isActive}
                            onCheckedChange={(checked) => handleUpdateOperation(op.id, 'isActive', checked)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOperation(op.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={handleAddOperation}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une opération
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Leveling Mode Pricing */}
        <TabsContent value="leveling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarification par mode de nivellement</CardTitle>
              <CardDescription>Frais spécifiques selon le mode ZBA, TBA ou FBA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-3 text-left">Mode</th>
                      <th className="p-3 text-left">Type tarif</th>
                      <th className="p-3 text-right">Valeur</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-center">Actif</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelingModes.map((mode, idx) => (
                      <tr key={mode.id} className={idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono font-semibold">
                            {mode.levelingMode}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Select
                            value={mode.pricingType}
                            onValueChange={(val) => handleUpdateLevelingMode(mode.id, 'pricingType', val)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixe">Fixe</SelectItem>
                              <SelectItem value="pourcentage">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              type="number"
                              value={mode.value}
                              onChange={(e) => handleUpdateLevelingMode(mode.id, 'value', Number(e.target.value))}
                              className="w-24"
                            />
                            <span className="text-xs text-slate-600 w-8">
                              {mode.pricingType === 'pourcentage' ? '%' : currency}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Input
                            type="text"
                            value={mode.description ?? ''}
                            onChange={(e) => handleUpdateLevelingMode(mode.id, 'description', e.target.value)}
                            placeholder="Optionnel"
                            className="text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Switch
                            checked={mode.isActive}
                            onCheckedChange={(checked) => handleUpdateLevelingMode(mode.id, 'isActive', checked)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLevelingMode(mode.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={handleAddLevelingMode}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un mode
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Section */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle>Résumé de la configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-600">Abonnement mensuel</p>
              <p className="font-semibold">{fixedFee.toLocaleString('fr-FR')} {currency}</p>
            </div>
            <div>
              <p className="text-slate-600">Barèmes actifs</p>
              <p className="font-semibold">{accountBrackets.filter(b => b.isActive).length}/{accountBrackets.length}</p>
            </div>
            <div>
              <p className="text-slate-600">Opérations actives</p>
              <p className="font-semibold">{operations.filter(o => o.isActive).length}/{operations.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-slate-600">Modes de nivellement</p>
              <p className="font-semibold">{levelingModes.filter(l => l.isActive).length}/{levelingModes.length} actifs</p>
            </div>
            <div>
              <p className="text-slate-600">Devise</p>
              <p className="font-semibold">{currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        size="lg"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Enregistrer la configuration de tarification
      </Button>
    </div>
  )
}
