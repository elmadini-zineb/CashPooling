"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepStructure = StepStructure;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var hierarchy_builder_1 = require("@/components/hierarchy-builder");
var investment_config_panel_1 = require("@/components/investment-config-panel");
var contract_periodicity_panel_1 = require("@/components/contract-periodicity-panel");
var mock_data_1 = require("@/lib/mock-data");
var lucide_react_1 = require("lucide-react");
function StepStructure(_a) {
    var accounts = _a.accounts, centralizerAccount = _a.centralizerAccount, onComplete = _a.onComplete, onBack = _a.onBack, initialInvestmentConfig = _a.initialInvestmentConfig, initialPricingAccountId = _a.initialPricingAccountId;
    var _b = (0, react_1.useState)(null), localHierarchy = _b[0], setLocalHierarchy = _b[1];
    var _c = (0, react_1.useState)(initialInvestmentConfig), localInvestmentConfig = _c[0], setLocalInvestmentConfig = _c[1];
    var _d = (0, react_1.useState)(null), localNotionalConfig = _d[0], setLocalNotionalConfig = _d[1];
    var _e = (0, react_1.useState)(initialPricingAccountId || centralizerAccount.id), localPricingAccountId = _e[0], setLocalPricingAccountId = _e[1];
    var _f = (0, react_1.useState)({
        periodicityType: "DAILY",
        executionTime: undefined,
    }), localPeriodicity = _f[0], setLocalPeriodicity = _f[1];
    var _g = (0, react_1.useState)(null), periodicityError = _g[0], setPeriodicityError = _g[1];
    var _h = (0, react_1.useState)(false), isNotionalPooling = _h[0], setIsNotionalPooling = _h[1];
    var _j = (0, react_1.useState)("hierarchy"), activeTab = _j[0], setActiveTab = _j[1];
    var handleContinue = function () {
        var isValidPeriodicity = localPeriodicity.periodicityType !== "CUSTOM" ||
            (localPeriodicity.frequency !== undefined && localPeriodicity.frequency > 0 && !!localPeriodicity.unit);
        if (!isValidPeriodicity) {
            setPeriodicityError("La périodicité personnalisée nécessite une fréquence et une unité.");
            return;
        }
        setPeriodicityError(null);
        if (localHierarchy && localPricingAccountId) {
            onComplete(localHierarchy, localInvestmentConfig, localNotionalConfig, localPricingAccountId, localPeriodicity);
        }
    };
    var handleHierarchyChange = function (hierarchy, isNotional, notionalConfig) {
        setLocalHierarchy(hierarchy);
        setIsNotionalPooling(isNotional);
        setLocalNotionalConfig(notionalConfig);
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Étape 2: Structurer la hiérarchie et le nivellement</card_1.CardTitle>
        <card_1.CardDescription>
          Configurez la structure multi-niveaux{isNotionalPooling ? " (Pooling Notionnel)" : ", les paramètres de nivellement"} et les placements OPCVM
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <lucide_react_1.NetworkIcon className="w-4 h-4"/>
              Hiérarchie & Nivellement
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="pricing" className="flex items-center gap-2">
              <lucide_react_1.DollarSign className="w-4 h-4"/>
              Tarification
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="investment" className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="w-4 h-4"/>
              Placement OPCVM
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="hierarchy" className="mt-6 space-y-6">
            <hierarchy_builder_1.HierarchyBuilder accounts={accounts} centralizerAccount={centralizerAccount} onHierarchyChange={handleHierarchyChange}/>
            <contract_periodicity_panel_1.ContractPeriodicityPanel value={localPeriodicity} onChange={setLocalPeriodicity} error={periodicityError !== null && periodicityError !== void 0 ? periodicityError : undefined}/>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="pricing" className="mt-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <lucide_react_1.Info className="w-5 h-5 text-orange-600 mt-1"/>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tarification</p>
                  <p className="text-sm text-slate-600">Mode de tarification : Report simple (aligné EBICS)</p>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                La tarification sera incluse automatiquement dans le contrat généré.
                Aucun paramètre de tarification n'est modifiable dans cette étape du MVP.
              </p>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode de tarification</p>
                  <p className="text-base font-semibold text-slate-900">Report simple (EBICS)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Devise</p>
                  <p className="text-base font-semibold text-slate-900">{centralizerAccount.currency}</p>
                </div>
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="investment" className="mt-6">
            <investment_config_panel_1.InvestmentConfigPanel config={localInvestmentConfig} currency={centralizerAccount.currency} availableFunds={mock_data_1.mockOPCVMFunds} onChange={setLocalInvestmentConfig}/>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <button_1.Button onClick={onBack} variant="outline" size="lg">
            Retour
          </button_1.Button>
          <button_1.Button onClick={handleContinue} disabled={!localHierarchy} size="lg" className="flex-1">
            Continuer
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
