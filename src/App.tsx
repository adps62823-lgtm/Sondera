import React, { useState, useEffect } from 'react';
import { ModeProvider } from './context/ModeContext';
import { DesktopPetCompanion } from './components/companion/DesktopPetCompanion';
import { Navbar, NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WorkspaceHome } from './components/workspace/WorkspaceHome';
import { IntakeForm } from './components/intake/IntakeForm';
import { CaseDetailView } from './components/investigation/CaseDetailView';
import { CasesLibraryView } from './components/cases/CasesLibraryView';
import { JudgmentGymView } from './components/learn/JudgmentGymView';
import { PrivacyNavigatorView } from './components/privacy/PrivacyNavigatorView';
import { SettingsView } from './components/settings/SettingsView';
import { EmergencyResponseWizard } from './features/emergency/EmergencyResponseWizard';
import { ThreatEncyclopedia } from './features/threat-intel/ThreatEncyclopedia';
import { UrlDeepInspector } from './features/url-tools/UrlDeepInspector';
import { ClaimComparator } from './features/claims/ClaimComparator';
import { createCase } from './services/case-service';
import { CaseKind } from './types/domain';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('workspace');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('sondera_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('sondera_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleStartInvestigation = () => {
    setActiveTab('investigate');
  };

  const handleCreateCase = async (data: {
    input: string;
    kind: CaseKind;
    title?: string;
    context?: string;
    senderLabel?: string;
    receivedDate?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const caseId = await createCase(
        data.input,
        data.kind,
        data.title,
        data.context,
        data.senderLabel,
        data.receivedDate
      );
      setActiveCaseId(caseId);
      setActiveTab('case_detail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveTab('case_detail');
  };

  return (
    <ModeProvider>
      <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark text-ink-primary dark:text-neutral-100 relative">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCaseId={activeCaseId}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="flex-1">
          {activeTab === 'workspace' && (
            <WorkspaceHome
              onStartInvestigation={handleStartInvestigation}
              onOpenCase={handleOpenCase}
              onOpenPrivacy={() => setActiveTab('privacy')}
              onOpenGym={() => setActiveTab('learn')}
              onOpenEmergency={() => setActiveTab('emergency')}
              onOpenThreats={() => setActiveTab('threats')}
              onOpenUrlLab={() => setActiveTab('url_lab')}
              onOpenComparator={() => setActiveTab('comparator')}
            />
          )}

          {activeTab === 'investigate' && (
            <IntakeForm onSubmit={handleCreateCase} isSubmitting={isSubmitting} />
          )}

          {activeTab === 'case_detail' && activeCaseId && (
            <CaseDetailView
              caseId={activeCaseId}
              onBackToCases={() => setActiveTab('cases')}
            />
          )}

          {activeTab === 'cases' && (
            <CasesLibraryView
              onSelectCase={handleOpenCase}
              onNewInvestigation={() => setActiveTab('investigate')}
            />
          )}

          {activeTab === 'emergency' && <EmergencyResponseWizard />}

          {activeTab === 'threats' && <ThreatEncyclopedia />}

          {activeTab === 'url_lab' && <UrlDeepInspector />}

          {activeTab === 'comparator' && <ClaimComparator />}

          {activeTab === 'learn' && <JudgmentGymView />}

          {activeTab === 'privacy' && <PrivacyNavigatorView />}

          {activeTab === 'settings' && (
            <SettingsView theme={theme} toggleTheme={toggleTheme} />
          )}
        </main>

        <Footer />

        {/* Floating help companion */}
        <DesktopPetCompanion
          onNavigate={(tab) => setActiveTab(tab)}
          currentTab={activeTab}
        />
      </div>
    </ModeProvider>
  );
};
