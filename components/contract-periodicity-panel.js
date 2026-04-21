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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractPeriodicityPanel = ContractPeriodicityPanel;
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var radio_group_1 = require("@/components/ui/radio-group");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var periodicityLabels = {
    DAILY: "Quotidienne",
    WEEKLY: "Hebdomadaire",
    MONTHLY: "Mensuelle",
    REAL_TIME: "Temps réel",
    CUSTOM: "Personnalisée",
};
function ContractPeriodicityPanel(_a) {
    var _b, _c, _d, _e;
    var value = _a.value, onChange = _a.onChange, error = _a.error;
    var handleTypeChange = function (periodicityType) {
        var nextValue = __assign(__assign({}, value), { periodicityType: periodicityType });
        if (periodicityType === "REAL_TIME") {
            nextValue.executionTime = undefined;
        }
        onChange(nextValue);
    };
    var handleCustomFrequencyChange = function (frequency) {
        onChange(__assign(__assign({}, value), { frequency: frequency > 0 ? frequency : undefined }));
    };
    var handleCustomUnitChange = function (unit) {
        onChange(__assign(__assign({}, value), { unit: unit }));
    };
    var handleExecutionTimeChange = function (executionTime) {
        onChange(__assign(__assign({}, value), { executionTime: executionTime || undefined }));
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center gap-2">
          <lucide_react_1.Repeat className="w-5 h-5 text-slate-700"/>
          <card_1.CardTitle>Exécution Périodicité</card_1.CardTitle>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        <div className="space-y-3">
          <label_1.Label className="text-sm font-semibold">Type d'exécution <span className="text-red-500">*</span></label_1.Label>
          <radio_group_1.RadioGroup value={value.periodicityType} onValueChange={function (newValue) { return handleTypeChange(newValue); }} className="grid gap-3 sm:grid-cols-3">
            {Object.keys(periodicityLabels).map(function (type) { return (<radio_group_1.RadioGroupItem key={type} value={type} id={"periodicity-".concat(type)} className="rounded-lg border border-slate-200 p-4 hover:border-slate-300">
                <div className="text-sm font-semibold text-slate-900">{periodicityLabels[type]}</div>
              </radio_group_1.RadioGroupItem>); })}
          </radio_group_1.RadioGroup>
        </div>

        {value.periodicityType === "CUSTOM" ? (<div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label_1.Label htmlFor="custom-frequency" className="text-sm">
                Fréquence <span className="text-red-500">*</span>
              </label_1.Label>
              <input_1.Input id="custom-frequency" type="number" min={1} value={(_b = value.frequency) !== null && _b !== void 0 ? _b : ""} onChange={function (event) { return handleCustomFrequencyChange(Number(event.target.value)); }} placeholder="Ex: 3"/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="custom-unit" className="text-sm">
                Unité <span className="text-red-500">*</span>
              </label_1.Label>
              <select_1.Select value={(_c = value.unit) !== null && _c !== void 0 ? _c : ""} onValueChange={function (newValue) { return handleCustomUnitChange(newValue); }}>
                <select_1.SelectTrigger id="custom-unit">
                  <select_1.SelectValue placeholder="Sélectionner..."/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="DAY">Jours</select_1.SelectItem>
                  <select_1.SelectItem value="WEEK">Semaines</select_1.SelectItem>
                  <select_1.SelectItem value="MONTH">Mois</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="custom-execution-time" className="text-sm">
                Heure d'exécution (optionnel)
              </label_1.Label>
              <input_1.Input id="custom-execution-time" type="time" value={(_d = value.executionTime) !== null && _d !== void 0 ? _d : ""} onChange={function (event) { return handleExecutionTimeChange(event.target.value); }}/>
            </div>
          </div>) : value.periodicityType === "REAL_TIME" ? (<div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <lucide_react_1.Clock className="w-4 h-4 text-slate-500"/>
              Temps réel : cette option ne nécessite pas de fréquence chiffrée.
            </div>
          </div>) : (<div className="space-y-3">
            <div className="space-y-2">
              <label_1.Label htmlFor="standard-execution-time" className="text-sm">
                Heure d'exécution (optionnel)
              </label_1.Label>
              <input_1.Input id="standard-execution-time" type="time" value={(_e = value.executionTime) !== null && _e !== void 0 ? _e : ""} onChange={function (event) { return handleExecutionTimeChange(event.target.value); }}/>
            </div>
            <p className="text-xs text-slate-500">
              Laissez vide pour exécuter à la première fenêtre de traitement disponible.
            </p>
          </div>)}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </card_1.CardContent>
    </card_1.Card>);
}
