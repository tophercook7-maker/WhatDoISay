import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthScreen } from './app/AuthScreen';
import { HistoryScreen } from './app/HistoryScreen';
import { LoadingScreen } from './app/LoadingScreen';
import { MainInputScreen } from './app/MainInputScreen';
import { ResultScreen } from './app/ResultScreen';
import { SettingsScreen } from './app/SettingsScreen';
import { UsageLimitScreen } from './app/UsageLimitScreen';
import { WelcomeScreen } from './app/WelcomeScreen';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useReplyHistory } from './hooks/useReplyHistory';
import { useReplyWorkflow } from './hooks/useReplyWorkflow';
import { useSubscription } from './hooks/useSubscription';
import { useUsage } from './hooks/useUsage';
import { runAiConnectionTest } from './services/aiReplyService';
import { getAccountPlan } from './services/planService';
import { AppRoute } from './types';

export default function App() {
  const [route, setRoute] = useState<AppRoute>('welcome');
  const auth = useAuth();
  const profile = useProfile(auth.user);
  const subscription = useSubscription(auth.user);
  const accountPlan = getAccountPlan(profile.profile, subscription.subscription);
  const usage = useUsage(auth.user?.id, accountPlan.isPro);
  const history = useReplyHistory(auth.user?.id, profile.profile);
  const workflow = useReplyWorkflow({
    canUseTextReply: usage.canUseTextReply,
    incrementTextReply: usage.incrementTextReply,
    onLimitReached: () => setRoute('usageLimit'),
    refreshRemoteState: async () => {
      await Promise.all([usage.refresh(), history.refresh()]);
    },
    saveReply: history.saveReply,
  });

  useEffect(() => {
    if (!auth.initializing && auth.user && (route === 'welcome' || route === 'auth')) {
      setRoute('main');
    }

    if (!auth.initializing && !auth.user && route !== 'welcome' && route !== 'auth') {
      setRoute('welcome');
    }
  }, [auth.initializing, auth.user, route]);

  if (auth.initializing) {
    return (
      <>
        <StatusBar style="light" />
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {route === 'welcome' ? (
        <WelcomeScreen onGetStarted={() => setRoute('auth')} onSignIn={() => setRoute('auth')} />
      ) : null}
      {route === 'auth' ? (
        <AuthScreen
          error={auth.error}
          loading={auth.loading}
          onBack={() => setRoute('welcome')}
          onSignIn={async (email, password) => {
            const result = await auth.signIn(email, password);
            if (result.ok) {
              setRoute('main');
            }
            return result;
          }}
          onSignUp={async (email, password) => {
            const result = await auth.signUp(email, password);
            if (result.ok && !result.needsEmailConfirmation) {
              setRoute('main');
            }
            return result;
          }}
        />
      ) : null}
      {route === 'main' ? (
        <MainInputScreen
          error={workflow.error || usage.error}
          loading={workflow.loading}
          onGenerate={async (request) => {
            const createdReply = await workflow.generateReply(request);
            if (createdReply) {
              setRoute('result');
            }
          }}
          onHistory={() => setRoute('history')}
          onSettings={() => setRoute('settings')}
          remainingTextReplies={usage.remainingTextReplies}
          usageLoading={profile.loading || usage.loading || !usage.usage}
        />
      ) : null}
      {route === 'result' ? (
        <ResultScreen
          error={workflow.error}
          loading={workflow.loading}
          reply={workflow.currentReply}
          onBack={() => setRoute('main')}
          onTryAgain={async () => workflow.tryAgain()}
          onModify={workflow.modifyReply}
        />
      ) : null}
      {route === 'settings' ? (
        <SettingsScreen
          email={auth.user?.email ?? ''}
          error={profile.error || subscription.error || history.error || usage.error}
          loading={profile.loading || subscription.loading || history.loading}
          onBack={() => setRoute('main')}
          onDeleteHistory={history.deleteAll}
          onRunAiConnectionTest={runAiConnectionTest}
          onRefreshAccount={async () => {
            await Promise.all([profile.refresh(), subscription.refresh(), usage.refresh()]);
          }}
          onSignOut={async () => {
            await auth.signOut();
            setRoute('welcome');
          }}
          onToggleSaveHistory={profile.toggleSaveHistory}
          plan={accountPlan}
          profile={profile.profile}
          textLimit={usage.textLimit}
          subscription={subscription.subscription}
          usage={usage.usage}
        />
      ) : null}
      {route === 'history' ? (
        <HistoryScreen
          history={history.history}
          loading={history.loading}
          onBack={() => setRoute('main')}
          onDelete={history.deleteItem}
          saveHistory={profile.profile?.saveHistory ?? true}
        />
      ) : null}
      {route === 'usageLimit' ? (
        <UsageLimitScreen onBack={() => setRoute('main')} onSettings={() => setRoute('settings')} />
      ) : null}
    </>
  );
}
