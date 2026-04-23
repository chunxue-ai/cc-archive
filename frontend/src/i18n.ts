export const supportedLocales = ['en', 'zh-CN'] as const;

export type Locale = (typeof supportedLocales)[number];

export type NavKey = 'overview' | 'export' | 'import';

interface NavItemCopy {
  key: NavKey;
  label: string;
}

interface MetricCopy {
  title: string;
  hint: string;
}

interface SectionCopy {
  title: string;
  description: string;
}

export interface Translation {
  appName: string;
  appBadge: string;
  navItems: NavItemCopy[];
  breadcrumbPrefix: string;
  greeting: string;
  subtitle: string;
  searchPlaceholder: string;
  githubLinkLabel: string;
  actions: {
    dryRun: string;
    startMigration: string;
    running: string;
    refresh: string;
  };
  localeLabel: string;
  notices: {
    backendUnavailable: string;
    noSessions: string;
    dryRunSummary: string;
    exportSuccess: string;
    restorePathRequired: string;
    restorePreviewSuccess: string;
    restoreSuccess: string;
    failedPrefix: string;
    scanSuccess: string;
  };
  metrics: {
    scannedSessions: MetricCopy;
    totalMessages: MetricCopy;
    localDataSize: MetricCopy;
    exportsCreated: MetricCopy;
  };
  table: {
    title: string;
    viewAll: string;
    showRecent: string;
    empty: string;
    emptySearch: string;
    columns: {
      sessionId: string;
      project: string;
      messages: string;
      size: string;
      updated: string;
    };
  };
  details: {
    title: string;
    badge: string;
    claudePath: string;
    archiveRoot: string;
    exportsRoot: string;
    savedExports: string;
    lastScan: string;
    lastExport: string;
    none: string;
  };
  importer: {
    savedExportsLabel: string;
    savedExportsPlaceholder: string;
    noSavedExports: string;
    refreshSavedExports: string;
    exportPathLabel: string;
    exportPathPlaceholder: string;
    overwriteLabel: string;
    previewAction: string;
    restoreAction: string;
    summaryTitle: string;
    plannedLabel: string;
    restoredLabel: string;
    skippedLabel: string;
    conflictsTitle: string;
    warningsTitle: string;
  };
  sections: Record<Exclude<NavKey, 'overview'>, SectionCopy>;
}

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  'zh-CN': '中文',
};

export const localeIntlCodes: Record<Locale, string> = {
  en: 'en-US',
  'zh-CN': 'zh-CN',
};

const localeStorageKey = 'cc-archive.locale';

const translations: Record<Locale, Translation> = {
  en: {
    appName: 'CC Archive',
    appBadge: 'Portable Memory Console',
    navItems: [
      {key: 'overview', label: 'Overview'},
      {key: 'export', label: 'Export'},
      {key: 'import', label: 'Import'},
    ],
    breadcrumbPrefix: 'Home',
    greeting: 'Welcome to CC Archive',
    subtitle: 'Scan Claude Code sessions and export portable migration packages.',
    searchPlaceholder: 'Search sessions, exports, and workspaces...',
    githubLinkLabel: 'Open the CC Archive repository on GitHub',
    actions: {
      dryRun: 'Preview Export',
      startMigration: 'Export Sessions',
      running: 'Working...',
      refresh: 'Refresh',
    },
    localeLabel: 'Language',
    notices: {
      backendUnavailable: 'Backend is unavailable in browser-only mode.',
      noSessions: 'No Claude Code session files were found.',
      dryRunSummary: 'Preview complete: {{sessions}} sessions, {{size}} total. No files were created.',
      exportSuccess: 'Export complete: {{sessions}} sessions saved to {{path}}.',
      restorePathRequired: 'Please enter an export package path first.',
      restorePreviewSuccess: 'Preview complete: {{planned}} planned, {{skipped}} conflicts detected.',
      restoreSuccess: 'Restore complete: {{restored}} restored, {{skipped}} skipped.',
      failedPrefix: 'Operation failed',
      scanSuccess: 'Scan complete: {{sessions}} sessions discovered.',
    },
    metrics: {
      scannedSessions: {
        title: 'Scanned Sessions',
        hint: 'Detected from local Claude Code project files',
      },
      totalMessages: {
        title: 'Message Records',
        hint: 'Summed from JSONL line counts',
      },
      localDataSize: {
        title: 'Local Session Data',
        hint: 'Total byte size of discovered session files',
      },
      exportsCreated: {
        title: 'Exports Created',
        hint: 'Packages created in this app session',
      },
    },
    table: {
      title: 'Claude Code Sessions',
      viewAll: 'View all',
      showRecent: 'Show recent',
      empty: 'No session data to display.',
      emptySearch: 'No sessions match your search.',
      columns: {
        sessionId: 'Session ID',
        project: 'Project',
        messages: 'Messages',
        size: 'Size',
        updated: 'Updated',
      },
    },
    details: {
      title: 'Storage Details',
      badge: 'Live',
      claudePath: 'Claude projects path',
      archiveRoot: 'Archive root',
      exportsRoot: 'Exports root',
      savedExports: 'Saved export packages',
      lastScan: 'Last scan',
      lastExport: 'Last export',
      none: 'None yet',
    },
    importer: {
      savedExportsLabel: 'Saved export packages',
      savedExportsPlaceholder: 'Select a previously exported path...',
      noSavedExports: 'No previous export package was found yet.',
      refreshSavedExports: 'Refresh list',
      exportPathLabel: 'Export package path',
      exportPathPlaceholder: '/Users/you/.cc-archive/exports/20260422T120000Z_xxxxxxxx',
      overwriteLabel: 'Overwrite existing local session files when conflicts are found',
      previewAction: 'Preview Restore',
      restoreAction: 'Restore Sessions',
      summaryTitle: 'Restore Summary',
      plannedLabel: 'Planned',
      restoredLabel: 'Restored',
      skippedLabel: 'Skipped',
      conflictsTitle: 'Conflicts',
      warningsTitle: 'Warnings',
    },
    sections: {
      export: {
        title: 'Export Workspace',
        description: 'Run dry checks or create a full export package from detected Claude Code sessions.',
      },
      import: {
        title: 'Import Workspace',
        description: 'Implementation has started: preview and restore workflows are now available.',
      },
    },
  },
  'zh-CN': {
    appName: 'CC Archive',
    appBadge: '记忆迁移工作台',
    navItems: [
      {key: 'overview', label: '总览'},
      {key: 'export', label: '导出'},
      {key: 'import', label: '导入'},
    ],
    breadcrumbPrefix: '首页',
    greeting: '欢迎使用 CC Archive',
    subtitle: '扫描本地 Claude Code 会话并创建可迁移的导出包。',
    searchPlaceholder: '搜索会话、导出包与工作区...',
    githubLinkLabel: '在 GitHub 打开 CC Archive 仓库',
    actions: {
      dryRun: '预览导出',
      startMigration: '导出会话',
      running: '处理中...',
      refresh: '刷新',
    },
    localeLabel: '语言',
    notices: {
      backendUnavailable: '当前为纯浏览器模式，后端不可用。',
      noSessions: '未发现 Claude Code 会话文件。',
      dryRunSummary: '预览完成：{{sessions}} 个会话，共 {{size}}。未创建任何文件。',
      exportSuccess: '导出完成：{{sessions}} 个会话，保存至 {{path}}。',
      restorePathRequired: '请先填写导出包路径。',
      restorePreviewSuccess: '预览完成：计划 {{planned}} 个，检测到 {{skipped}} 个冲突。',
      restoreSuccess: '恢复完成：已恢复 {{restored}} 个，跳过 {{skipped}} 个。',
      failedPrefix: '操作失败',
      scanSuccess: '扫描完成：发现 {{sessions}} 个会话。',
    },
    metrics: {
      scannedSessions: {
        title: '扫描到的会话',
        hint: '基于本地 Claude Code 项目文件检测',
      },
      totalMessages: {
        title: '消息记录数',
        hint: '根据 JSONL 行数汇总',
      },
      localDataSize: {
        title: '本地会话数据量',
        hint: '已发现会话文件总大小',
      },
      exportsCreated: {
        title: '已创建导出',
        hint: '本次应用会话中创建的导出包数量',
      },
    },
    table: {
      title: 'Claude Code 会话',
      viewAll: '查看全部',
      showRecent: '仅看最近',
      empty: '暂无可展示的会话数据。',
      emptySearch: '没有匹配搜索条件的会话。',
      columns: {
        sessionId: '会话 ID',
        project: '项目',
        messages: '消息数',
        size: '大小',
        updated: '更新时间',
      },
    },
    details: {
      title: '存储详情',
      badge: '实时',
      claudePath: 'Claude 项目路径',
      archiveRoot: '归档根目录',
      exportsRoot: '导出目录',
      savedExports: '历史导出包数量',
      lastScan: '最近扫描',
      lastExport: '最近导出',
      none: '暂无',
    },
    importer: {
      savedExportsLabel: '历史导出包',
      savedExportsPlaceholder: '选择一个已导出的路径...',
      noSavedExports: '暂未找到历史导出包。',
      refreshSavedExports: '刷新列表',
      exportPathLabel: '导出包路径',
      exportPathPlaceholder: '/Users/you/.cc-archive/exports/20260422T120000Z_xxxxxxxx',
      overwriteLabel: '发现冲突时覆盖本地已有会话文件',
      previewAction: '预览恢复',
      restoreAction: '恢复会话',
      summaryTitle: '恢复摘要',
      plannedLabel: '计划处理',
      restoredLabel: '已恢复',
      skippedLabel: '已跳过',
      conflictsTitle: '冲突项',
      warningsTitle: '警告',
    },
    sections: {
      export: {
        title: '导出工作区',
        description: '可对检测到的 Claude Code 会话执行模拟检查或完整导出。',
      },
      import: {
        title: '导入工作区',
        description: '实现已开始：现已支持预览恢复与执行恢复流程。',
      },
    },
  },
};

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = window.localStorage.getItem(localeStorageKey);
  if (saved && isLocale(saved)) {
    return saved;
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(localeStorageKey, locale);
}

export function getTranslations(locale: Locale): Translation {
  return translations[locale];
}
