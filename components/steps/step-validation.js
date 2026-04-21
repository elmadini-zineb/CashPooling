"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepValidation = StepValidation;
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var hierarchy_manager_1 = require("@/lib/hierarchy-manager");
var lucide_react_1 = require("lucide-react");
var hierarchy_visualizer_1 = require("@/components/hierarchy-visualizer");
var format_helpers_1 = require("@/lib/format-helpers");
function StepValidation(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var centralizerAccount = _a.centralizerAccount, hierarchy = _a.hierarchy, investmentConfig = _a.investmentConfig, notionalConfig = _a.notionalConfig, pricingConfig = _a.pricingConfig, onComplete = _a.onComplete, onBack = _a.onBack, validationErrors = _a.validationErrors;
    var poolableAccounts = hierarchy_manager_1.HierarchyManager.flattenToPoolableAccounts(hierarchy);
    var accountCounts = hierarchy_manager_1.HierarchyManager.getAccountCountByRole(hierarchy);
    var depth = hierarchy_manager_1.HierarchyManager.getDepth(hierarchy);
    var debitCoverageAccounts = poolableAccounts.filter(function (config) { var _a; return (_a = config.debitCoverage) === null || _a === void 0 ? void 0 : _a.enabled; });
    return (<div className="space-y-6">
      {validationErrors.length === 0 ? (<alert_1.Alert className="bg-green-50 border-green-200">
          <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600"/>
          <alert_1.AlertDescription className="text-green-800 font-medium">
            Validation réussie - La configuration est conforme aux règles métier
          </alert_1.AlertDescription>
        </alert_1.Alert>) : (<alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-5 w-5"/>
          <alert_1.AlertDescription>
            <strong>Erreurs de validation:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {validationErrors.map(function (error, index) { return (<li key={index}>{error}</li>); })}
            </ul>
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      <card_1.Card>
        <card_1.CardHeader>
        <card_1.CardTitle>Étape 4: Validation et récapitulatif</card_1.CardTitle>
        <card_1.CardDescription>Vérifiez la configuration avant de générer le contrat</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <p className="text-sm text-cyan-700 font-medium">Centralisateur</p>
              <p className="text-2xl font-bold text-cyan-900">{accountCounts.centralizer}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Intermédiaires</p>
              <p className="text-2xl font-bold text-orange-900">{accountCounts.intermediate}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-700 font-medium">Secondaires</p>
              <p className="text-2xl font-bold text-slate-900">{accountCounts.secondary}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">À niveler</p>
              <p className="text-2xl font-bold text-green-900">{poolableAccounts.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium flex items-center gap-1">
                <lucide_react_1.Shield className="w-3 h-3"/>
                Couverture
              </p>
              <p className="text-2xl font-bold text-blue-900">{debitCoverageAccounts.length}</p>
            </div>
            <div className={"rounded-lg p-4 border ".concat((notionalConfig === null || notionalConfig === void 0 ? void 0 : notionalConfig.enabled) ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200")}>
              <p className={"text-sm font-medium flex items-center gap-1 ".concat((notionalConfig === null || notionalConfig === void 0 ? void 0 : notionalConfig.enabled) ? "text-purple-700" : "text-slate-500")}>
                <lucide_react_1.Layers className="w-3 h-3"/>
                Notionnel
              </p>
              <p className={"text-2xl font-bold ".concat((notionalConfig === null || notionalConfig === void 0 ? void 0 : notionalConfig.enabled) ? "text-purple-900" : "text-slate-400")}>
                {(notionalConfig === null || notionalConfig === void 0 ? void 0 : notionalConfig.enabled) ? "Oui" : "Non"}
              </p>
            </div>
          </div>

          {/* Centralizer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Compte Centralisateur</h3>
            <div className="bg-gradient-to-r from-cyan-50 to-orange-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">{centralizerAccount.accountNumber}</p>
                  <p className="text-sm text-slate-700 mt-1">{centralizerAccount.clientName}</p>
                  <p className="text-xs text-slate-500 mt-1">{centralizerAccount.accountType}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">
                    {centralizerAccount.balance.toLocaleString("fr-FR")} {centralizerAccount.currency}
                  </p>
                  <badge_1.Badge className="mt-1 bg-green-100 text-green-700 border-green-300">
                    {centralizerAccount.status}
                  </badge_1.Badge>
                </div>
              </div>
            </div>
          </div>

          {(notionalConfig === null || notionalConfig === void 0 ? void 0 : notionalConfig.enabled) && (<div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <lucide_react_1.Layers className="w-5 h-5 text-purple-600"/>
                Cash Pooling Notionnel
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-700 font-medium">Compte Miroir Virtuel</p>
                    <p className="text-lg font-mono font-semibold text-purple-900">
                      {notionalConfig.virtualMirrorAccountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700 font-medium">Comptes consolidés</p>
                    <p className="text-lg font-semibold text-purple-900">{poolableAccounts.length} comptes</p>
                  </div>
                  <div className="col-span-2">
                    <badge_1.Badge variant={notionalConfig.allowOperationsOnConsolidated ? "default" : "outline"} className="bg-purple-100 text-purple-700 border-purple-300">
                      {notionalConfig.allowOperationsOnConsolidated
                ? "Opérations autorisées sur solde consolidé"
                : "Opérations non autorisées sur solde consolidé"}
                    </badge_1.Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm text-purple-700">
                    Les soldes créditeurs et débiteurs seront compensés virtuellement sans mouvement réel de fonds. La
                    consolidation s'effectue en temps réel.
                  </p>
                </div>
              </div>
            </div>)}

          {/* Hierarchy Visualization */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Structure hiérarchique (Profondeur: {depth} niveaux)</h3>
            <hierarchy_visualizer_1.HierarchyVisualizer hierarchy={hierarchy}/>
          </div>

          {/* Pooling Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Configuration du nivellement</h3>
            <div className="space-y-2">
              {poolableAccounts.map(function (config) {
            var _a;
            return (<div key={config.accountId} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium text-slate-900">{config.account.accountNumber}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{config.account.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <badge_1.Badge variant="outline" className="font-mono">
                        {config.mode}
                      </badge_1.Badge>
                      {config.mode === "TBA" && config.targetBalance !== undefined && (<span className="text-xs text-slate-600">Cible: {config.targetBalance} MAD</span>)}
                      {config.mode === "FBA" && (<span className="text-xs text-slate-600">
                          [{config.minBalance} - {config.maxBalance}] MAD
                        </span>)}
                      {((_a = config.debitCoverage) === null || _a === void 0 ? void 0 : _a.enabled) && (<badge_1.Badge className="bg-blue-100 text-blue-700 border-blue-300 flex items-center gap-1">
                          <lucide_react_1.Shield className="w-3 h-3"/>
                          Priorité {config.debitCoverage.priority}
                        </badge_1.Badge>)}
                    </div>
                  </div>
                </div>);
        })}
            </div>
          </div>

          {/* Investment Configuration Summary */}
          {(investmentConfig === null || investmentConfig === void 0 ? void 0 : investmentConfig.enabled) && (<div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <lucide_react_1.TrendingUp className="w-5 h-5 text-cyan-600"/>
                Placement OPCVM Automatique
              </h3>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cyan-700 font-medium">Seuil d'excédent</p>
                    <p className="text-lg font-semibold text-cyan-900">
                      {investmentConfig.surplusThreshold.toLocaleString("fr-FR")} {centralizerAccount.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-cyan-700 font-medium">Mode de placement</p>
                    <p className="text-lg font-semibold text-cyan-900">
                      {investmentConfig.investmentMode === "total"
                ? "Total"
                : "Partiel (".concat(investmentConfig.investmentQuota, "%)")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-cyan-700 font-medium">OPCVM cible</p>
                    <p className="text-sm font-semibold text-cyan-900 mt-1">{(_b = investmentConfig.opcvmFund) === null || _b === void 0 ? void 0 : _b.name}</p>
                    <p className="text-xs text-cyan-600">
                      {(_c = investmentConfig.opcvmFund) === null || _c === void 0 ? void 0 : _c.fundType} - Min:{" "}
                      {(_d = investmentConfig.opcvmFund) === null || _d === void 0 ? void 0 : _d.minInvestment.toLocaleString("fr-FR")}{" "}
                      {(_e = investmentConfig.opcvmFund) === null || _e === void 0 ? void 0 : _e.currency}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-cyan-700 font-medium flex items-center gap-1">
                      <lucide_react_1.Clock className="w-3 h-3"/>
                      Fréquence d'exécution
                    </p>
                    <p className="text-sm font-semibold text-cyan-900 mt-1">
                      {(0, format_helpers_1.formatSchedulingFrequency)(investmentConfig.scheduling)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <badge_1.Badge variant={investmentConfig.autoRedemptionEnabled ? "default" : "outline"} className="mt-2">
                      {investmentConfig.autoRedemptionEnabled
                ? "Rachat automatique activé"
                : "Rachat automatique désactivé"}
                    </badge_1.Badge>
                  </div>
                </div>
              </div>

            </div>)}

          {periodicityType && (<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Périodicité d'exécution</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {(0, format_helpers_1.formatContractPeriodicity)(periodicityType, periodicityFrequency, periodicityUnit, periodicityExecutionTime)}
              </p>
            </div>)}

          {/* Pricing Configuration Summary */}
          {(pricingConfig === null || pricingConfig === void 0 ? void 0 : pricingConfig.type) && (<div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <lucide_react_1.CreditCard className="w-5 h-5 text-emerald-600"/>
                Tarification
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Type de tarification</p>
                    <p className="text-lg font-semibold text-emerald-900 capitalize">
                      {pricingConfig.type === "fixed"
                ? "Fixe"
                : pricingConfig.type === "variable"
                    ? "Variable"
                    : "Hybride"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Périodicité de facturation</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {pricingConfig.billingFrequency === "monthly"
                ? "Mensuelle"
                : pricingConfig.billingFrequency === "quarterly"
                    ? "Trimestrielle"
                    : "Annuelle"}
                    </p>
                  </div>

                  {pricingConfig.type === "fixed" && (<>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais d'ouverture</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_f = pricingConfig.openingFees) === null || _f === void 0 ? void 0 : _f.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Abonnement mensuel</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_g = pricingConfig.monthlySubscription) === null || _g === void 0 ? void 0 : _g.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-700 font-medium">Frais de génération du contrat</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_h = pricingConfig.contractGenerationFees) === null || _h === void 0 ? void 0 : _h.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>)}

                  {pricingConfig.type === "variable" && (<>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Taux sur montant nivelé</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.leveledAmountRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais par opération</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_j = pricingConfig.levelingOperationFees) === null || _j === void 0 ? void 0 : _j.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-700 font-medium">Frais par compte secondaire/mois</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_k = pricingConfig.secondaryAccountFees) === null || _k === void 0 ? void 0 : _k.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>)}

                  {pricingConfig.type === "hybrid" && (<>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Abonnement mensuel fixe</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_l = pricingConfig.monthlyBase) === null || _l === void 0 ? void 0 : _l.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais d'ouverture</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_m = pricingConfig.hybridOpeningFees) === null || _m === void 0 ? void 0 : _m.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Comptes inclus au forfait</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.accountsIncluded}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Taux sur montant nivelé</p>
                        <p className="text-lg font-semibold text-emerald-900">{pricingConfig.hybridLeveledAmountRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Seuil de déclenchement</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_o = pricingConfig.variableTriggerThreshold) === null || _o === void 0 ? void 0 : _o.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-medium">Frais compte secondaire supplémentaire</p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {(_p = pricingConfig.hybridSecondaryAccountFees) === null || _p === void 0 ? void 0 : _p.toLocaleString("fr-FR")} MAD
                        </p>
                      </div>
                    </>)}
                </div>
              </div>
            </div>)}

          {/* Debit Coverage Section */}
          {debitCoverageAccounts.length > 0 && (<div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <lucide_react_1.Shield className="w-5 h-5 text-blue-600"/>
                Couverture automatique des soldes débiteurs
              </h3>
              <alert_1.Alert className="bg-blue-50 border-blue-200">
                <alert_1.AlertDescription className="text-blue-800 text-sm">
                  {debitCoverageAccounts.length} compte(s) bénéficient d'une couverture automatique en cas de solde
                  débiteur. Les comptes seront traités par ordre de priorité avant le nivellement standard.
                </alert_1.AlertDescription>
              </alert_1.Alert>
              <div className="space-y-2">
                {debitCoverageAccounts
                .sort(function (a, b) { return (a.debitCoverage.priority || 999) - (b.debitCoverage.priority || 999); })
                .map(function (config) { return (<div key={config.accountId} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm font-medium text-slate-900">{config.account.accountNumber}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{config.account.clientName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <badge_1.Badge variant="outline" className="bg-white">
                          Priorité {config.debitCoverage.priority}
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline" className="bg-white">
                          {config.debitCoverage.mode === "full" ? "Couverture totale" : "Couverture partielle"}
                        </badge_1.Badge>
                        {config.debitCoverage.minCoverageAmount && (<span className="text-xs text-slate-600">
                            Min: {config.debitCoverage.minCoverageAmount} MAD
                          </span>)}
                      </div>
                    </div>); })}
              </div>
            </div>)}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button_1.Button onClick={onBack} variant="outline" size="lg">
              Retour
            </button_1.Button>
            <button_1.Button onClick={onComplete} disabled={validationErrors.length > 0} size="lg" className="flex-1">
              Générer le contrat
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
