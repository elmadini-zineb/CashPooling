"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedSubscriptionFlow = UnifiedSubscriptionFlow;
var react_1 = require("react");
var mock_data_1 = require("@/lib/mock-data");
var validation_1 = require("@/lib/validation");
var hierarchy_manager_1 = require("@/lib/hierarchy-manager");
var rbac_1 = require("@/lib/rbac");
var step_selection_1 = require("./steps/step-selection");
var step_structure_1 = require("./steps/step-structure");
var step_pricing_1 = require("./steps/step-pricing");
var step_validation_1 = require("./steps/step-validation");
var step_contract_1 = require("./steps/step-contract");
function UnifiedSubscriptionFlow(_a) {
    var user = _a.user;
    var _b = (0, react_1.useState)("selection"), currentStep = _b[0], setCurrentStep = _b[1];
    var _c = (0, react_1.useState)(null), centralizerAccount = _c[0], setCentralizerAccount = _c[1];
    var _d = (0, react_1.useState)(null), hierarchy = _d[0], setHierarchy = _d[1];
    var _e = (0, react_1.useState)(undefined), pricingAccountId = _e[0], setPricingAccountId = _e[1];
    var _f = (0, react_1.useState)(null), investmentConfig = _f[0], setInvestmentConfig = _f[1];
    var _g = (0, react_1.useState)(null), notionalConfig = _g[0], setNotionalConfig = _g[1];
    var _h = (0, react_1.useState)(null), pricingConfig = _h[0], setPricingConfig = _h[1];
    var _j = (0, react_1.useState)(null), contractPeriodicity = _j[0], setContractPeriodicity = _j[1];
    var _k = (0, react_1.useState)([]), validationErrors = _k[0], setValidationErrors = _k[1];
    var _l = (0, react_1.useState)(null), generatedContract = _l[0], setGeneratedContract = _l[1];
    var defaultReportPricingConfig = {
        type: "fixed",
        billingFrequency: "monthly",
        openingFees: 0,
        monthlySubscription: 0,
        contractGenerationFees: 0,
    };
    // Build steps dynamically based on user role
    var baseSteps = [
        { key: "selection", label: "Sélection", number: 1 },
        { key: "structure", label: "Structuration", number: 2 },
    ];
    var pricingStep = { key: "pricing", label: "Tarification", number: 3 };
    var afterPricingSteps = [
        { key: "validation", label: "Validation", number: 4 },
        { key: "contract", label: "Contrat", number: 5 },
    ];
    var canAccessPricingStep = (0, rbac_1.canAccessPricing)(user === null || user === void 0 ? void 0 : user.role);
    // Adjust step numbers based on whether pricing is visible
    var steps = __spreadArray(__spreadArray(__spreadArray([], baseSteps, true), (canAccessPricingStep ? [pricingStep] : []), true), afterPricingSteps.map(function (step) { return (__assign(__assign({}, step), { number: step.number - (canAccessPricingStep ? 0 : 1) })); }), true);
    var currentStepIndex = steps.findIndex(function (s) { return s.key === currentStep; });
    var handleSelectionComplete = function (account) {
        setCentralizerAccount(account);
        setCurrentStep("structure");
    };
    var handleStructureComplete = function (validatedHierarchy, validatedInvestmentConfig, validatedNotionalConfig, validatedPricingAccountId, periodicity) {
        setHierarchy(validatedHierarchy);
        setInvestmentConfig(validatedInvestmentConfig);
        setNotionalConfig(validatedNotionalConfig);
        if (validatedPricingAccountId) {
            setPricingAccountId(validatedPricingAccountId);
        }
        if (periodicity) {
            setContractPeriodicity(periodicity);
        }
        var errors = hierarchy_manager_1.HierarchyManager.validateHierarchy(validatedHierarchy);
        setValidationErrors(errors);
        if (errors.length === 0) {
            // Skip pricing step if user doesn't have access
            if (canAccessPricingStep) {
                setCurrentStep("pricing");
            }
            else {
                setCurrentStep("validation");
            }
        }
    };
    var handlePricingComplete = function (config) {
        setPricingConfig(config);
        setCurrentStep("validation");
    };
    var handleValidationComplete = function () {
        if (!centralizerAccount || !hierarchy)
            return;
        var allSecondaryAccounts = hierarchy_manager_1.HierarchyManager.flattenToPoolableAccounts(hierarchy);
        var contract = {
            id: "contract-".concat(Date.now()),
            contractNumber: (0, validation_1.generateContractNumber)(),
            masterAccountId: centralizerAccount.id,
            masterAccount: centralizerAccount,
            secondaryAccounts: allSecondaryAccounts.map(function (config) { return config.account; }),
            pricingAccountId: pricingAccountId,
            clientId: centralizerAccount.clientId,
            clientName: centralizerAccount.clientName,
            status: "registered", // Changed from "suspended" to "registered"
            currency: centralizerAccount.currency,
            createdBy: (user === null || user === void 0 ? void 0 : user.email) || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            investmentConfig: investmentConfig || undefined,
            notionalConfig: notionalConfig || undefined,
            pricingConfig: pricingConfig || defaultReportPricingConfig,
            periodicityType: contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.periodicityType,
            periodicityFrequency: contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.frequency,
            periodicityUnit: contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.unit,
            periodicityExecutionTime: contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.executionTime,
        };
        setGeneratedContract(contract);
        setCurrentStep("contract");
    };
    var handleReset = function () {
        setCentralizerAccount(null);
        setHierarchy(null);
        setPricingAccountId(undefined);
        setInvestmentConfig(null);
        setNotionalConfig(null);
        setPricingConfig(null);
        setValidationErrors([]);
        setGeneratedContract(null);
        setCurrentStep("selection");
    };
    var handleBack = function () {
        var stepMap = {
            selection: "selection",
            structure: "selection",
            pricing: "structure",
            validation: canAccessPricingStep ? "pricing" : "structure",
            contract: "validation",
        };
        setCurrentStep(stepMap[currentStep]);
    };
    return (<div className="space-y-6">
      {/* Progress Stepper */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map(function (step, index) { return (<div key={step.key} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={"w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ".concat(currentStepIndex > index
                ? "bg-green-500 text-white"
                : currentStepIndex === index
                    ? "bg-gradient-to-r from-orange-500 to-cyan-500 text-white"
                    : "bg-slate-200 text-slate-500")}>
                  {currentStepIndex > index ? "✓" : step.number}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">Étape {step.number}</p>
                </div>
              </div>
              {index < steps.length - 1 && (<div className="flex-1 h-0.5 mx-4 bg-slate-200 relative">
                  <div className={"absolute inset-0 h-full transition-all ".concat(currentStepIndex > index ? "bg-green-500" : "bg-slate-200")}/>
                </div>)}
            </div>); })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "selection" && (<step_selection_1.StepSelection accounts={mock_data_1.mockAccounts} onComplete={handleSelectionComplete} initialAccount={centralizerAccount}/>)}

      {currentStep === "structure" && centralizerAccount && (<step_structure_1.StepStructure accounts={mock_data_1.mockAccounts} centralizerAccount={centralizerAccount} onComplete={handleStructureComplete} onBack={handleBack} initialHierarchy={hierarchy} initialInvestmentConfig={investmentConfig} initialNotionalConfig={notionalConfig} initialPricingAccountId={pricingAccountId}/>)}

      {currentStep === "pricing" && hierarchy && (<step_pricing_1.StepPricing hierarchy={hierarchy} onComplete={handlePricingComplete} onBack={handleBack} initialConfig={pricingConfig}/>)}

      {currentStep === "validation" && centralizerAccount && hierarchy && (<step_validation_1.StepValidation centralizerAccount={centralizerAccount} hierarchy={hierarchy} investmentConfig={investmentConfig} notionalConfig={notionalConfig} pricingConfig={pricingConfig} periodicityType={contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.periodicityType} periodicityFrequency={contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.frequency} periodicityUnit={contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.unit} periodicityExecutionTime={contractPeriodicity === null || contractPeriodicity === void 0 ? void 0 : contractPeriodicity.executionTime} onComplete={handleValidationComplete} onBack={handleBack} validationErrors={validationErrors}/>)}

      {currentStep === "contract" && generatedContract && (<step_contract_1.StepContract contract={generatedContract} hierarchy={hierarchy} user={user} onReset={handleReset}/>)}
    </div>);
}
