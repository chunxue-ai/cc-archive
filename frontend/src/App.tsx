import {useEffect, useMemo, useState, type MouseEvent} from 'react';
import './App.css';
import {
  detectInitialLocale,
  getTranslations,
  localeIntlCodes,
  localeLabels,
  persistLocale,
  supportedLocales,
  type Locale,
  type NavKey,
  type Translation,
} from './i18n';
import {APP_GITHUB_URL, APP_VERSION} from './version';
import {
  DryRunClaudeCodeExport,
  ExportClaudeCodeSessions,
  ListClaudeCodeExportPaths,
  RestoreClaudeCodeSessions,
  ScanClaudeCodeSessions,
} from '../wailsjs/go/main/App';
import {BrowserOpenURL} from '../wailsjs/runtime/runtime';
import {ccarchive} from '../wailsjs/go/models';

type MetricTone = 'positive' | 'warning' | 'critical';
type MetricFormat = 'number' | 'percent' | 'bytes';
type MetricKey = keyof Translation['metrics'];

type NoticeTone = 'neutral' | 'success' | 'error';

interface NoticeState {
  tone: NoticeTone;
  message: string;
}

const toneClasses: Record<MetricTone, string> = {
  positive: 'metric-card--positive',
  warning: 'metric-card--warning',
  critical: 'metric-card--critical',
};

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (output, [key, value]) => output.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const rounded = size >= 10 ? size.toFixed(1) : size.toFixed(2);
  return `${rounded} ${units[unitIndex]}`;
}

function renderLocaleIcon(code: Locale) {
  if (code === 'en') {
    return (
      <svg viewBox="0 0 16 12" aria-hidden="true" focusable="false">
        <rect x="0.5" y="0.5" width="15" height="11" rx="2" fill="#ffffff" stroke="#d5ded2"/>
        <rect x="0.5" y="1.3" width="15" height="1.1" fill="#c94d4d"/>
        <rect x="0.5" y="3.5" width="15" height="1.1" fill="#c94d4d"/>
        <rect x="0.5" y="5.7" width="15" height="1.1" fill="#c94d4d"/>
        <rect x="0.5" y="7.9" width="15" height="1.1" fill="#c94d4d"/>
        <rect x="0.5" y="10.1" width="15" height="1.1" fill="#c94d4d"/>
        <rect x="0.5" y="0.5" width="6.6" height="5.4" rx="1.2" fill="#29519a"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 12" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="15" height="11" rx="2" fill="#cd3f3f" stroke="#c43b3b"/>
      <path d="M4 2.1 4.6 3.3 5.9 3.5 4.9 4.4 5.1 5.7 4 5.1 2.9 5.7 3.1 4.4 2.1 3.5 3.4 3.3z" fill="#f6d351"/>
    </svg>
  );
}

function App() {
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale());
  const [activeView, setActiveView] = useState<NavKey>('overview');
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busyAction, setBusyAction] = useState<'dry-run' | 'export' | 'restore-preview' | 'restore' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanResult, setScanResult] = useState<ccarchive.ScanResult | null>(null);
  const [exportsCreated, setExportsCreated] = useState(0);
  const [lastExportPath, setLastExportPath] = useState('');
  const [restoreExportPath, setRestoreExportPath] = useState('');
  const [restoreOverwrite, setRestoreOverwrite] = useState(false);
  const [restoreResult, setRestoreResult] = useState<ccarchive.RestoreResult | null>(null);
  const [exportPathOptions, setExportPathOptions] = useState<string[]>([]);
  const [loadingExportPaths, setLoadingExportPaths] = useState(false);

  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const copy = useMemo(() => getTranslations(locale), [locale]);
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(localeIntlCodes[locale]),
    [locale],
  );
  const percentFormatter = useMemo(
    () => new Intl.NumberFormat(localeIntlCodes[locale], {maximumFractionDigits: 1}),
    [locale],
  );
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat(localeIntlCodes[locale], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    [locale],
  );

  const sessions = scanResult?.sessions ?? [];
  const selectedSavedExportPath = exportPathOptions.includes(restoreExportPath) ? restoreExportPath : '';
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSessions = useMemo(() => {
    if (normalizedSearchQuery === '') {
      return sessions;
    }

    return sessions.filter((session) => {
      const fields = [
        session.sessionId,
        session.projectKey,
        session.relativePath,
        session.sourcePath,
      ];
      return fields.some((field) => field.toLowerCase().includes(normalizedSearchQuery));
    });
  }, [sessions, normalizedSearchQuery]);

  const totalMessages = useMemo(
    () => sessions.reduce((total, session) => total + Math.max(session.messageCount, 0), 0),
    [sessions],
  );

  const metricCards: Array<{ key: MetricKey; value: number; tone: MetricTone; format: MetricFormat }> = [
    {key: 'scannedSessions', value: scanResult?.totalSessions ?? 0, tone: 'positive', format: 'number'},
    {key: 'totalMessages', value: totalMessages, tone: 'positive', format: 'number'},
    {key: 'localDataSize', value: scanResult?.totalBytes ?? 0, tone: 'warning', format: 'bytes'},
    {key: 'exportsCreated', value: exportsCreated, tone: 'critical', format: 'number'},
  ];

  const visibleSessions = useMemo(
    () => (showAllSessions ? filteredSessions : filteredSessions.slice(0, 6)),
    [filteredSessions, showAllSessions],
  );

  const activeNavLabel = useMemo(
    () => copy.navItems.find((item) => item.key === activeView)?.label ?? '',
    [copy.navItems, activeView],
  );
  const isOverviewView = activeView === 'overview';

  const isBusy = busyAction !== null || refreshing;

  const handleOpenGithub = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();

    try {
      BrowserOpenURL(APP_GITHUB_URL);
    } catch {
      window.open(APP_GITHUB_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const reportBackendError = (error: unknown): NoticeState => {
    const details = error instanceof Error ? error.message : String(error);
    if (details.includes('window') || details.includes('go') || details.includes('undefined')) {
      return {tone: 'error', message: copy.notices.backendUnavailable};
    }
    return {tone: 'error', message: `${copy.notices.failedPrefix}: ${details}`};
  };

  const formatMetricValue = (value: number, format: MetricFormat): string => {
    if (format === 'percent') {
      return `${percentFormatter.format(value)}%`;
    }
    if (format === 'bytes') {
      return formatBytes(value);
    }
    return numberFormatter.format(value);
  };

  const formatDateTime = (value: string): string => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return dateTimeFormatter.format(date);
  };

  const resolvedLastExportPath = lastExportPath.trim() !== '' ? lastExportPath : exportPathOptions[0] ?? '';
  const claudeProjectsPath = scanResult?.storage.claudeProjectsDir ?? '-';
  const archiveRootPath = scanResult?.storage.archiveRoot ?? '-';
  const exportsRootPath = scanResult?.storage.exportsRoot ?? '-';
  const savedExportsCount = numberFormatter.format(exportPathOptions.length);
  const lastScanValue = scanResult?.scannedAt ? formatDateTime(scanResult.scannedAt) : copy.details.none;
  const lastExportValue = resolvedLastExportPath || copy.details.none;

  const loadSessions = async (showSuccessNotice: boolean): Promise<void> => {
    setRefreshing(true);
    try {
      const result = await ScanClaudeCodeSessions();
      setScanResult(result);

      if (showSuccessNotice) {
        setNotice({
          tone: 'success',
          message: interpolate(copy.notices.scanSuccess, {
            sessions: numberFormatter.format(result.totalSessions),
          }),
        });
      }

      if (result.totalSessions === 0 && !showSuccessNotice) {
        setNotice({tone: 'neutral', message: copy.notices.noSessions});
      }
    } catch (error) {
      setNotice(reportBackendError(error));
    } finally {
      setRefreshing(false);
    }
  };

  const loadExportPathOptions = async (): Promise<void> => {
    setLoadingExportPaths(true);
    try {
      const paths = await ListClaudeCodeExportPaths();
      setExportPathOptions(paths);
      setRestoreExportPath((currentValue) => {
        if (currentValue.trim() !== '' || paths.length === 0) {
          return currentValue;
        }
        return paths[0];
      });
    } catch (error) {
      setNotice(reportBackendError(error));
    } finally {
      setLoadingExportPaths(false);
    }
  };

  useEffect(() => {
    void loadSessions(false);
    void loadExportPathOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDryRun = async (): Promise<void> => {
    setBusyAction('dry-run');
    setNotice(null);
    try {
      const result = await DryRunClaudeCodeExport({includeAll: true});
      if (result.sessionCount === 0) {
        setNotice({tone: 'neutral', message: copy.notices.noSessions});
        return;
      }

      const summary = interpolate(copy.notices.dryRunSummary, {
        sessions: numberFormatter.format(result.sessionCount),
        size: formatBytes(result.totalBytes),
      });
      setNotice({tone: 'success', message: summary});
    } catch (error) {
      setNotice(reportBackendError(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleExport = async (): Promise<void> => {
    setBusyAction('export');
    setNotice(null);
    try {
      const result = await ExportClaudeCodeSessions({includeAll: true});
      if (result.exportedSessions === 0) {
        setNotice({tone: 'neutral', message: copy.notices.noSessions});
        return;
      }

      setExportsCreated((count) => count + 1);
      setLastExportPath(result.exportPath);

      const summary = interpolate(copy.notices.exportSuccess, {
        sessions: numberFormatter.format(result.exportedSessions),
        path: result.exportPath,
      });
      setNotice({tone: 'success', message: summary});
      await loadSessions(false);
      await loadExportPathOptions();
    } catch (error) {
      setNotice(reportBackendError(error));
    } finally {
      setBusyAction(null);
    }
  };

  const handleRestore = async (dryRun: boolean): Promise<void> => {
    const exportPath = restoreExportPath.trim();
    if (exportPath === '') {
      setNotice({tone: 'error', message: copy.notices.restorePathRequired});
      return;
    }

    setBusyAction(dryRun ? 'restore-preview' : 'restore');
    setNotice(null);
    try {
      const result = await RestoreClaudeCodeSessions({
        exportPath,
        overwrite: restoreOverwrite,
        dryRun,
      });
      setRestoreResult(result);

      if (dryRun) {
        setNotice({
          tone: 'success',
          message: interpolate(copy.notices.restorePreviewSuccess, {
            planned: numberFormatter.format(result.plannedSessions),
            skipped: numberFormatter.format(result.skippedSessions),
          }),
        });
      } else {
        setNotice({
          tone: 'success',
          message: interpolate(copy.notices.restoreSuccess, {
            restored: numberFormatter.format(result.restoredSessions),
            skipped: numberFormatter.format(result.skippedSessions),
          }),
        });
        await loadSessions(false);
      }
    } catch (error) {
      setNotice(reportBackendError(error));
    } finally {
      setBusyAction(null);
    }
  };

  const renderActionButtons = () => (
    <div className="hero__actions">
      <button
        type="button"
        className="button button--secondary"
        onClick={handleDryRun}
        disabled={isBusy}
      >
        {busyAction === 'dry-run' ? copy.actions.running : copy.actions.dryRun}
      </button>
      <button
        type="button"
        className="button button--primary"
        onClick={handleExport}
        disabled={isBusy}
      >
        {busyAction === 'export' ? copy.actions.running : copy.actions.startMigration}
      </button>
      <button
        type="button"
        className="button button--secondary"
        onClick={() => void loadSessions(true)}
        disabled={isBusy}
      >
        {refreshing ? copy.actions.running : copy.actions.refresh}
      </button>
    </div>
  );

  const renderOverview = () => (
    <>
      <section className="hero">
        <div>
          <h2>{copy.greeting}</h2>
          <p>{copy.subtitle}</p>
        </div>

        {renderActionButtons()}
      </section>

      {notice ? (
        <p className={`hero-notice hero-notice--${notice.tone}`}>{notice.message}</p>
      ) : null}

      <section className="metrics-grid" aria-label="Key metrics">
        {metricCards.map((metric) => (
          <article key={metric.key} className={`metric-card ${toneClasses[metric.tone]}`}>
            <p className="metric-card__label">{copy.metrics[metric.key].title}</p>
            <p className="metric-card__value">{formatMetricValue(metric.value, metric.format)}</p>
            <p className="metric-card__hint">{copy.metrics[metric.key].hint}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="table-card">
          <div className="table-card__header">
            <h3>{copy.table.title}</h3>
              <button
                type="button"
                onClick={() => setShowAllSessions((current) => !current)}
                disabled={filteredSessions.length <= 6}
              >
                {showAllSessions ? copy.table.showRecent : copy.table.viewAll}
              </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
              <tr>
                <th>{copy.table.columns.sessionId}</th>
                <th>{copy.table.columns.project}</th>
                <th>{copy.table.columns.messages}</th>
                <th>{copy.table.columns.size}</th>
                <th>{copy.table.columns.updated}</th>
              </tr>
              </thead>
              <tbody>
              {visibleSessions.length === 0 ? (
                <tr>
                  <td colSpan={5}>{normalizedSearchQuery ? copy.table.emptySearch : copy.table.empty}</td>
                </tr>
              ) : (
                visibleSessions.map((session) => (
                  <tr key={session.key}>
                    <td>{session.sessionId}</td>
                    <td>{session.projectKey}</td>
                    <td>{session.messageCount >= 0 ? numberFormatter.format(session.messageCount) : '-'}</td>
                    <td>{formatBytes(session.sizeBytes)}</td>
                    <td>{formatDateTime(session.updatedAt)}</td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="checklist-card">
          <div className="checklist-card__header">
            <h3>{copy.details.title}</h3>
            <span>{copy.details.badge}</span>
          </div>

          <ul className="detail-list">
            <li className="detail-list__item detail-list__item--dual">
              <div className="detail-list__pair">
                <p>{copy.details.claudePath}</p>
                <code title={claudeProjectsPath}>{claudeProjectsPath}</code>
              </div>
              <div className="detail-list__pair">
                <p>{copy.details.archiveRoot}</p>
                <code title={archiveRootPath}>{archiveRootPath}</code>
              </div>
            </li>
            <li className="detail-list__item detail-list__item--dual">
              <div className="detail-list__pair">
                <p>{copy.details.exportsRoot}</p>
                <code title={exportsRootPath}>{exportsRootPath}</code>
              </div>
              <div className="detail-list__pair">
                <p>{copy.details.savedExports}</p>
                <input
                  className="ui-field detail-list__readonly detail-list__readonly--code"
                  type="text"
                  value={savedExportsCount}
                  readOnly
                  tabIndex={-1}
                  aria-label={copy.details.savedExports}
                />
              </div>
            </li>
            <li className="detail-list__item detail-list__item--dual">
              <div className="detail-list__pair">
                <p>{copy.details.lastScan}</p>
                <input
                  className="ui-field detail-list__readonly detail-list__readonly--code"
                  type="text"
                  value={lastScanValue}
                  readOnly
                  tabIndex={-1}
                  aria-label={copy.details.lastScan}
                />
              </div>
              <div className="detail-list__pair">
                <p>{copy.details.lastExport}</p>
                <code title={lastExportValue}>{lastExportValue}</code>
              </div>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );

  const renderImportSection = () => (
    <section className="feature-panel">
      <h2>{copy.sections.import.title}</h2>
      <p>{copy.sections.import.description}</p>

      <div className="import-form">
        <label className="import-form__field">
          <span>{copy.importer.savedExportsLabel}</span>
          <div className="import-form__select-row">
            <div className="ui-select import-form__saved-select">
              <select
                className="ui-field ui-field--select"
                value={selectedSavedExportPath}
                onChange={(event) => {
                  setRestoreExportPath(event.target.value);
                  setRestoreResult(null);
                }}
                disabled={loadingExportPaths}
              >
                <option value="">{copy.importer.savedExportsPlaceholder}</option>
                {exportPathOptions.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
              <span className="ui-select__icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" focusable="false">
                  <path d="M4 6.5 8 10 12 6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
                </svg>
              </span>
            </div>
            <button
              type="button"
              className="button button--secondary import-form__refresh"
              onClick={() => void loadExportPathOptions()}
              disabled={isBusy || loadingExportPaths}
            >
              {loadingExportPaths ? copy.actions.running : copy.importer.refreshSavedExports}
            </button>
          </div>
          {exportPathOptions.length === 0 ? (
            <p className="import-form__hint">{copy.importer.noSavedExports}</p>
          ) : null}
        </label>

        <label className="import-form__field">
          <span>{copy.importer.exportPathLabel}</span>
          <input
            className="ui-field"
            type="text"
            value={restoreExportPath}
            placeholder={copy.importer.exportPathPlaceholder}
            onChange={(event) => {
              setRestoreExportPath(event.target.value);
              setRestoreResult(null);
            }}
          />
        </label>

        <label className="import-form__toggle">
          <input
            type="checkbox"
            checked={restoreOverwrite}
            onChange={(event) => setRestoreOverwrite(event.target.checked)}
          />
          <span>{copy.importer.overwriteLabel}</span>
        </label>

        <div className="hero__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => void handleRestore(true)}
            disabled={isBusy}
          >
            {busyAction === 'restore-preview' ? copy.actions.running : copy.importer.previewAction}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => void handleRestore(false)}
            disabled={isBusy}
          >
            {busyAction === 'restore' ? copy.actions.running : copy.importer.restoreAction}
          </button>
        </div>
      </div>

      {notice ? (
        <p className={`hero-notice hero-notice--${notice.tone}`}>{notice.message}</p>
      ) : null}

      {restoreResult ? (
        <article className="import-result">
          <h3>{copy.importer.summaryTitle}</h3>
          <div className="import-result__stats">
            <p>
              <strong>{copy.importer.plannedLabel}:</strong> {numberFormatter.format(restoreResult.plannedSessions)}
            </p>
            <p>
              <strong>{copy.importer.restoredLabel}:</strong> {numberFormatter.format(restoreResult.restoredSessions)}
            </p>
            <p>
              <strong>{copy.importer.skippedLabel}:</strong> {numberFormatter.format(restoreResult.skippedSessions)}
            </p>
          </div>
          <p className="import-result__path">
            <strong>{copy.importer.exportPathLabel}:</strong> <code>{restoreResult.exportPath}</code>
          </p>

          {restoreResult.conflicts && restoreResult.conflicts.length > 0 ? (
            <div className="import-result__group">
              <h4>{copy.importer.conflictsTitle}</h4>
              <ul>
                {restoreResult.conflicts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {restoreResult.warnings && restoreResult.warnings.length > 0 ? (
            <div className="import-result__group">
              <h4>{copy.importer.warningsTitle}</h4>
              <ul>
                {restoreResult.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  );

  const renderSection = () => {
    if (activeView === 'overview') {
      return renderOverview();
    }

    if (activeView === 'import') {
      return renderImportSection();
    }

    const section = copy.sections[activeView];
    return (
      <section className="feature-panel">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        {activeView === 'export' ? renderActionButtons() : null}
        {notice ? (
          <p className={`hero-notice hero-notice--${notice.tone}`}>{notice.message}</p>
        ) : null}
      </section>
    );
  };

  return (
    <div id="app">
      <div className={`workspace-shell ${isOverviewView ? 'workspace-shell--overview' : 'workspace-shell--section'}`}>
        <div className="ambient-shape ambient-shape--one"/>
        <div className="ambient-shape ambient-shape--two"/>
        <div className="ambient-shape ambient-shape--three"/>

        <div className={`dashboard ${isOverviewView ? 'dashboard--overview' : 'dashboard--section'}`}>
          <aside className="sidebar">
            <div className="brand">
              <div className="brand__main">
                <div className="brand__logo">CC</div>
                <div>
                  <h1>{copy.appName}</h1>
                  <p>{copy.appBadge}</p>
                </div>
              </div>

              <a
                className="github-link"
                href={APP_GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                onClick={handleOpenGithub}
                aria-label={copy.githubLinkLabel}
                title={copy.githubLinkLabel}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M8 0.2a8 8 0 0 0-2.53 15.59c0.4 0.07 0.55-0.17 0.55-0.38v-1.34c-2.25 0.49-2.73-0.95-2.73-0.95a2.14 2.14 0 0 0-0.9-1.18c-0.73-0.5 0.06-0.49 0.06-0.49a1.69 1.69 0 0 1 1.23 0.82 1.72 1.72 0 0 0 2.34 0.67 1.73 1.73 0 0 1 0.51-1.08c-1.8-0.2-3.69-0.9-3.69-4a3.14 3.14 0 0 1 0.84-2.18 2.92 2.92 0 0 1 0.08-2.15s0.67-0.22 2.2 0.83a7.6 7.6 0 0 1 4 0c1.52-1.05 2.2-0.83 2.2-0.83a2.92 2.92 0 0 1 0.08 2.15 3.14 3.14 0 0 1 0.84 2.18c0 3.11-1.89 3.79-3.7 4a1.94 1.94 0 0 1 0.55 1.5v2.23c0 0.21 0.14 0.45 0.55 0.38a8 8 0 0 0-2.53-15.59z"/>
                </svg>
                <span className="github-link__version">v{APP_VERSION}</span>
              </a>
            </div>

            <nav className="sidebar__nav" aria-label={copy.appName}>
              {copy.navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`nav-item ${item.key === activeView ? 'nav-item--active' : ''}`}
                  onClick={() => setActiveView(item.key)}
                >
                  <span className="nav-item__dot" aria-hidden="true"/>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className={`main-panel ${isOverviewView ? 'main-panel--overview' : 'main-panel--section'}`}>
            <header className="topbar">
              <p className="breadcrumb">{copy.breadcrumbPrefix} / {activeNavLabel}</p>

              <div className="topbar__controls">
                <label className="search-field">
                  <span className="sr-only">{copy.searchPlaceholder}</span>
                  <input
                    type="search"
                    placeholder={copy.searchPlaceholder}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>

                <div className="language-switch" role="group" aria-label={copy.localeLabel}>
                  {supportedLocales.map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`language-switch__option ${locale === code ? 'language-switch__option--active' : ''}`}
                      onClick={() => setLocale(code)}
                    >
                      <span className="language-switch__icon">{renderLocaleIcon(code)}</span>
                      <span>{localeLabels[code]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
