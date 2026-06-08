/**
 * Internationalization (i18n) support for vinFMEA SaaS.
 * Provides translations for 8 languages.
 */

export type Locale = "en" | "de" | "es" | "fr" | "ja" | "ko" | "pt" | "zh";

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];

// Translation keys
type TranslationKeys = {
  // Navigation
  "nav.dashboard": string;
  "nav.projects": string;
  "nav.hierarchy": string;
  "nav.sfmea": string;
  "nav.dfmea": string;
  "nav.pfmea": string;
  "nav.controlPlan": string;
  "nav.riskMatrix": string;
  "nav.processFlow": string;
  "nav.boundaryDiagram": string;
  "nav.actions": string;
  "nav.help": string;
  "nav.validation": string;
  "nav.signOut": string;
  // Common
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.add": string;
  "common.edit": string;
  "common.search": string;
  "common.export": string;
  "common.loading": string;
  "common.noData": string;
  // FMEA
  "fmea.failureMode": string;
  "fmea.failureEffect": string;
  "fmea.failureCause": string;
  "fmea.severity": string;
  "fmea.occurrence": string;
  "fmea.detection": string;
  "fmea.rpn": string;
  "fmea.actionPriority": string;
  "fmea.criticality": string;
  "fmea.recommendedAction": string;
  "fmea.responsibility": string;
  "fmea.targetDate": string;
  "fmea.status": string;
  // Dashboard
  "dashboard.title": string;
  "dashboard.totalProjects": string;
  "dashboard.topRisks": string;
  "dashboard.riskDistribution": string;
};

const translations: Record<Locale, TranslationKeys> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.projects": "Projects",
    "nav.hierarchy": "Hierarchy",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "Control Plan",
    "nav.riskMatrix": "Risk Matrix",
    "nav.processFlow": "Process Flow",
    "nav.boundaryDiagram": "Boundary Diagram",
    "nav.actions": "Action Tracking",
    "nav.help": "Help",
    "nav.validation": "Validation",
    "nav.signOut": "Sign Out",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.search": "Search",
    "common.export": "Export",
    "common.loading": "Loading...",
    "common.noData": "No data available",
    "fmea.failureMode": "Failure Mode",
    "fmea.failureEffect": "Failure Effect",
    "fmea.failureCause": "Failure Cause",
    "fmea.severity": "Severity",
    "fmea.occurrence": "Occurrence",
    "fmea.detection": "Detection",
    "fmea.rpn": "RPN",
    "fmea.actionPriority": "Action Priority",
    "fmea.criticality": "Criticality",
    "fmea.recommendedAction": "Recommended Action",
    "fmea.responsibility": "Responsibility",
    "fmea.targetDate": "Target Date",
    "fmea.status": "Status",
    "dashboard.title": "Dashboard",
    "dashboard.totalProjects": "Total Projects",
    "dashboard.topRisks": "Top Risks",
    "dashboard.riskDistribution": "Risk Distribution",
  },
  de: {
    "nav.dashboard": "Übersicht",
    "nav.projects": "Projekte",
    "nav.hierarchy": "Hierarchie",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "Kontrollplan",
    "nav.riskMatrix": "Risikomatrix",
    "nav.processFlow": "Prozessablauf",
    "nav.boundaryDiagram": "Grenzdiagramm",
    "nav.actions": "Maßnahmenverfolgung",
    "nav.help": "Hilfe",
    "nav.validation": "Validierung",
    "nav.signOut": "Abmelden",
    "common.save": "Speichern",
    "common.cancel": "Abbrechen",
    "common.delete": "Löschen",
    "common.add": "Hinzufügen",
    "common.edit": "Bearbeiten",
    "common.search": "Suchen",
    "common.export": "Exportieren",
    "common.loading": "Laden...",
    "common.noData": "Keine Daten verfügbar",
    "fmea.failureMode": "Fehlerart",
    "fmea.failureEffect": "Fehlerfolge",
    "fmea.failureCause": "Fehlerursache",
    "fmea.severity": "Bedeutung",
    "fmea.occurrence": "Auftreten",
    "fmea.detection": "Entdeckung",
    "fmea.rpn": "RPZ",
    "fmea.actionPriority": "Handlungspriorität",
    "fmea.criticality": "Kritikalität",
    "fmea.recommendedAction": "Empfohlene Maßnahme",
    "fmea.responsibility": "Verantwortlich",
    "fmea.targetDate": "Zieldatum",
    "fmea.status": "Status",
    "dashboard.title": "Übersicht",
    "dashboard.totalProjects": "Gesamtprojekte",
    "dashboard.topRisks": "Höchste Risiken",
    "dashboard.riskDistribution": "Risikoverteilung",
  },
  es: {
    "nav.dashboard": "Panel",
    "nav.projects": "Proyectos",
    "nav.hierarchy": "Jerarquía",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "Plan de Control",
    "nav.riskMatrix": "Matriz de Riesgo",
    "nav.processFlow": "Flujo de Proceso",
    "nav.boundaryDiagram": "Diagrama de Límites",
    "nav.actions": "Seguimiento de Acciones",
    "nav.help": "Ayuda",
    "nav.validation": "Validación",
    "nav.signOut": "Cerrar Sesión",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.add": "Agregar",
    "common.edit": "Editar",
    "common.search": "Buscar",
    "common.export": "Exportar",
    "common.loading": "Cargando...",
    "common.noData": "Sin datos disponibles",
    "fmea.failureMode": "Modo de Falla",
    "fmea.failureEffect": "Efecto de Falla",
    "fmea.failureCause": "Causa de Falla",
    "fmea.severity": "Severidad",
    "fmea.occurrence": "Ocurrencia",
    "fmea.detection": "Detección",
    "fmea.rpn": "NPR",
    "fmea.actionPriority": "Prioridad de Acción",
    "fmea.criticality": "Criticidad",
    "fmea.recommendedAction": "Acción Recomendada",
    "fmea.responsibility": "Responsable",
    "fmea.targetDate": "Fecha Objetivo",
    "fmea.status": "Estado",
    "dashboard.title": "Panel",
    "dashboard.totalProjects": "Proyectos Totales",
    "dashboard.topRisks": "Riesgos Principales",
    "dashboard.riskDistribution": "Distribución de Riesgo",
  },
  fr: {
    "nav.dashboard": "Tableau de bord",
    "nav.projects": "Projets",
    "nav.hierarchy": "Hiérarchie",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "Plan de contrôle",
    "nav.riskMatrix": "Matrice de risque",
    "nav.processFlow": "Flux de processus",
    "nav.boundaryDiagram": "Diagramme de limites",
    "nav.actions": "Suivi des actions",
    "nav.help": "Aide",
    "nav.validation": "Validation",
    "nav.signOut": "Déconnexion",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.delete": "Supprimer",
    "common.add": "Ajouter",
    "common.edit": "Modifier",
    "common.search": "Rechercher",
    "common.export": "Exporter",
    "common.loading": "Chargement...",
    "common.noData": "Aucune donnée disponible",
    "fmea.failureMode": "Mode de défaillance",
    "fmea.failureEffect": "Effet de défaillance",
    "fmea.failureCause": "Cause de défaillance",
    "fmea.severity": "Sévérité",
    "fmea.occurrence": "Occurrence",
    "fmea.detection": "Détection",
    "fmea.rpn": "IPR",
    "fmea.actionPriority": "Priorité d'action",
    "fmea.criticality": "Criticité",
    "fmea.recommendedAction": "Action recommandée",
    "fmea.responsibility": "Responsable",
    "fmea.targetDate": "Date cible",
    "fmea.status": "Statut",
    "dashboard.title": "Tableau de bord",
    "dashboard.totalProjects": "Projets totaux",
    "dashboard.topRisks": "Risques principaux",
    "dashboard.riskDistribution": "Distribution des risques",
  },
  ja: {
    "nav.dashboard": "ダッシュボード",
    "nav.projects": "プロジェクト",
    "nav.hierarchy": "階層",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "コントロールプラン",
    "nav.riskMatrix": "リスクマトリックス",
    "nav.processFlow": "工程フロー",
    "nav.boundaryDiagram": "境界図",
    "nav.actions": "アクション追跡",
    "nav.help": "ヘルプ",
    "nav.validation": "バリデーション",
    "nav.signOut": "サインアウト",
    "common.save": "保存",
    "common.cancel": "キャンセル",
    "common.delete": "削除",
    "common.add": "追加",
    "common.edit": "編集",
    "common.search": "検索",
    "common.export": "エクスポート",
    "common.loading": "読み込み中...",
    "common.noData": "データがありません",
    "fmea.failureMode": "故障モード",
    "fmea.failureEffect": "故障影響",
    "fmea.failureCause": "故障原因",
    "fmea.severity": "重大度",
    "fmea.occurrence": "発生頻度",
    "fmea.detection": "検出度",
    "fmea.rpn": "RPN",
    "fmea.actionPriority": "アクション優先度",
    "fmea.criticality": "重要度",
    "fmea.recommendedAction": "推奨アクション",
    "fmea.responsibility": "担当者",
    "fmea.targetDate": "目標日",
    "fmea.status": "ステータス",
    "dashboard.title": "ダッシュボード",
    "dashboard.totalProjects": "プロジェクト合計",
    "dashboard.topRisks": "主要リスク",
    "dashboard.riskDistribution": "リスク分布",
  },
  ko: {
    "nav.dashboard": "대시보드",
    "nav.projects": "프로젝트",
    "nav.hierarchy": "계층 구조",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "관리 계획",
    "nav.riskMatrix": "리스크 매트릭스",
    "nav.processFlow": "공정 흐름",
    "nav.boundaryDiagram": "경계 다이어그램",
    "nav.actions": "조치 추적",
    "nav.help": "도움말",
    "nav.validation": "검증",
    "nav.signOut": "로그아웃",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.delete": "삭제",
    "common.add": "추가",
    "common.edit": "편집",
    "common.search": "검색",
    "common.export": "내보내기",
    "common.loading": "로딩 중...",
    "common.noData": "데이터 없음",
    "fmea.failureMode": "고장 모드",
    "fmea.failureEffect": "고장 영향",
    "fmea.failureCause": "고장 원인",
    "fmea.severity": "심각도",
    "fmea.occurrence": "발생도",
    "fmea.detection": "검출도",
    "fmea.rpn": "RPN",
    "fmea.actionPriority": "조치 우선순위",
    "fmea.criticality": "위험도",
    "fmea.recommendedAction": "권장 조치",
    "fmea.responsibility": "담당자",
    "fmea.targetDate": "목표일",
    "fmea.status": "상태",
    "dashboard.title": "대시보드",
    "dashboard.totalProjects": "전체 프로젝트",
    "dashboard.topRisks": "주요 리스크",
    "dashboard.riskDistribution": "리스크 분포",
  },
  pt: {
    "nav.dashboard": "Painel",
    "nav.projects": "Projetos",
    "nav.hierarchy": "Hierarquia",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "Plano de Controle",
    "nav.riskMatrix": "Matriz de Risco",
    "nav.processFlow": "Fluxo de Processo",
    "nav.boundaryDiagram": "Diagrama de Limites",
    "nav.actions": "Rastreamento de Ações",
    "nav.help": "Ajuda",
    "nav.validation": "Validação",
    "nav.signOut": "Sair",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.add": "Adicionar",
    "common.edit": "Editar",
    "common.search": "Pesquisar",
    "common.export": "Exportar",
    "common.loading": "Carregando...",
    "common.noData": "Sem dados disponíveis",
    "fmea.failureMode": "Modo de Falha",
    "fmea.failureEffect": "Efeito da Falha",
    "fmea.failureCause": "Causa da Falha",
    "fmea.severity": "Severidade",
    "fmea.occurrence": "Ocorrência",
    "fmea.detection": "Detecção",
    "fmea.rpn": "NPR",
    "fmea.actionPriority": "Prioridade de Ação",
    "fmea.criticality": "Criticidade",
    "fmea.recommendedAction": "Ação Recomendada",
    "fmea.responsibility": "Responsável",
    "fmea.targetDate": "Data Alvo",
    "fmea.status": "Status",
    "dashboard.title": "Painel",
    "dashboard.totalProjects": "Projetos Totais",
    "dashboard.topRisks": "Principais Riscos",
    "dashboard.riskDistribution": "Distribuição de Risco",
  },
  zh: {
    "nav.dashboard": "仪表板",
    "nav.projects": "项目",
    "nav.hierarchy": "层级结构",
    "nav.sfmea": "SFMEA",
    "nav.dfmea": "DFMEA",
    "nav.pfmea": "PFMEA",
    "nav.controlPlan": "控制计划",
    "nav.riskMatrix": "风险矩阵",
    "nav.processFlow": "工艺流程",
    "nav.boundaryDiagram": "边界图",
    "nav.actions": "措施跟踪",
    "nav.help": "帮助",
    "nav.validation": "验证",
    "nav.signOut": "退出",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.add": "添加",
    "common.edit": "编辑",
    "common.search": "搜索",
    "common.export": "导出",
    "common.loading": "加载中...",
    "common.noData": "暂无数据",
    "fmea.failureMode": "失效模式",
    "fmea.failureEffect": "失效影响",
    "fmea.failureCause": "失效原因",
    "fmea.severity": "严重度",
    "fmea.occurrence": "发生度",
    "fmea.detection": "探测度",
    "fmea.rpn": "RPN",
    "fmea.actionPriority": "措施优先级",
    "fmea.criticality": "关键性",
    "fmea.recommendedAction": "建议措施",
    "fmea.responsibility": "负责人",
    "fmea.targetDate": "目标日期",
    "fmea.status": "状态",
    "dashboard.title": "仪表板",
    "dashboard.totalProjects": "项目总数",
    "dashboard.topRisks": "主要风险",
    "dashboard.riskDistribution": "风险分布",
  },
};

export function t(key: keyof TranslationKeys, locale: Locale = "en"): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("vinfmea_locale") as Locale) || "en";
}

export function setLocale(locale: Locale) {
  localStorage.setItem("vinfmea_locale", locale);
}
