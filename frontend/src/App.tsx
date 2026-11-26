import React, { useEffect, useState } from 'react';
import { MODULO_BIENESTAR_VISIBLE } from './config/funciones';
import { AlunaProvider, useAluna } from './context/AlunaContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { KnowledgeDetailModal } from './components/common/KnowledgeDetailModal';
import { RequestAccessModal } from './components/common/RequestAccessModal';
import { KnowledgeItem } from './types';

// Pantallas
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { CommunitiesScreen } from './screens/CommunitiesScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { UploadScreen } from './screens/UploadScreen';
import { PermissionsManagerScreen } from './screens/PermissionsManagerScreen';
import { AccessRequestsScreen } from './screens/AccessRequestsScreen';
import { AILabScreen } from './screens/AILabScreen';
import { CustodianPanelScreen } from './screens/CustodianPanelScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WellnessScreen } from './screens/WellnessScreen';
import { MyCommunityScreen } from './screens/MyCommunityScreen';

const MainLayout: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    setSelectedKnowledgeIdForLab 
  } = useAluna();

  // Modals state
  const [selectedKnowledgeForDetail, setSelectedKnowledgeForDetail] = useState<KnowledgeItem | null>(null);
  const [selectedKnowledgeForRequest, setSelectedKnowledgeForRequest] = useState<KnowledgeItem | null>(null);

  // Con el módulo oculto, quien llegue a /bienestar por un enlace viejo vuelve al inicio
  useEffect(() => {
    if (!MODULO_BIENESTAR_VISIBLE && activeScreen === 'wellness') setActiveScreen('welcome');
  }, [activeScreen, setActiveScreen]);

  const handleOpenKnowledge =(k: KnowledgeItem) => {
    setSelectedKnowledgeForDetail(k);
  };

  const handleRequestAccess = (k: KnowledgeItem) => {
    setSelectedKnowledgeForRequest(k);
  };

  const handleOpenInLab = (k: KnowledgeItem) => {
    setSelectedKnowledgeIdForLab(k.id);
    setActiveScreen('ai_lab');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#07131B] text-[#06233B] dark:text-slate-100 transition-colors font-sans">
      
      {/* 1. Global Navigation Bar (Includes discreet profile switcher in user menu) */}
      <Navbar />

      {/* 2. Main Screen View Switcher */}
      <main className="flex-1">
        <ErrorBoundary key={activeScreen} onReset={() => setActiveScreen('welcome')}>
        {activeScreen === 'welcome' && <WelcomeScreen />}
        {activeScreen === 'login' && <LoginScreen />}
        {activeScreen === 'register' && <RegisterScreen />}
        {activeScreen === 'dashboard' && (
          <DashboardScreen
            onOpenKnowledge={handleOpenKnowledge}
            onRequestAccess={handleRequestAccess}
          />
        )}
        {(activeScreen === 'communities' || activeScreen === 'community_detail') && (
          <CommunitiesScreen
            onOpenKnowledge={handleOpenKnowledge}
            onRequestAccess={handleRequestAccess}
          />
        )}
        {activeScreen === 'library' && (
          <LibraryScreen
            onOpenKnowledge={handleOpenKnowledge}
            onRequestAccess={handleRequestAccess}
          />
        )}
        {activeScreen === 'upload' && <UploadScreen />}
        {activeScreen === 'permissions' && <PermissionsManagerScreen />}
        {activeScreen === 'requests' && <AccessRequestsScreen />}
        {activeScreen === 'ai_lab' && <AILabScreen />}
        {activeScreen === 'custodian' && <CustodianPanelScreen />}
        {activeScreen === 'profile' && <ProfileScreen />}
        {activeScreen === 'my_community' && <MyCommunityScreen />}
        {MODULO_BIENESTAR_VISIBLE && activeScreen === 'wellness' && <WellnessScreen />}
        </ErrorBoundary>
      </main>

      {/* 3. Global Institutional Footer */}
      <Footer />

      {/* 4. Modals & Interactive Overlays */}
      <KnowledgeDetailModal
        knowledge={selectedKnowledgeForDetail}
        onClose={() => setSelectedKnowledgeForDetail(null)}
        onOpenInLab={handleOpenInLab}
      />

      <RequestAccessModal
        knowledge={selectedKnowledgeForRequest}
        onClose={() => setSelectedKnowledgeForRequest(null)}
      />

      {/* 5. Notifications Toast */}
      <NotificationToast />

    </div>
  );
};

export default function App() {
  return (
    <AlunaProvider>
      <MainLayout />
    </AlunaProvider>
  );
}
