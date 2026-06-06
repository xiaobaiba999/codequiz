import React, { useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import CodePush from 'react-native-code-push';

const CodePushWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // 启动时检查更新（静默下载）
    checkForUpdate();

    // App 从后台恢复时检查更新
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') checkForUpdate();
    });

    return () => subscription.remove();
  }, []);

  const checkForUpdate = async () => {
    try {
      const update = await CodePush.checkForUpdate();
      if (!update) return;

      // 下载更新
      const syncOptions = {
        installMode: CodePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
        updateDialog: undefined as any,
      };

      if (update.isMandatory) {
        // 强制更新
        Alert.alert(
          '更新提示',
          '发现重要更新，需要立即安装',
          [
            {
              text: '立即更新',
              onPress: () => {
                CodePush.sync(
                  { installMode: CodePush.InstallMode.IMMEDIATE },
                  null,
                  null,
                  () => CodePush.notifyAppReady(),
                );
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        // 非强制更新：静默下载，提示重启
        CodePush.sync(
          {
            installMode: CodePush.InstallMode.ON_NEXT_RESTART,
            mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
          },
          (status) => {
            if (status === CodePush.SyncStatus.UPDATE_INSTALLED) {
              Alert.alert('更新已下载', '重启应用以应用更新', [
                { text: '稍后', style: 'cancel' },
                { text: '立即重启', onPress: () => CodePush.restartApp() },
              ]);
            }
          },
        );
      }
    } catch (error) {
      console.log('[CodePush] Check update failed:', error);
    }
  };

  return <>{children}</>;
};

// 使用 CodePush HOC 包装
const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.MANUAL,
};

export default CodePush(codePushOptions)(CodePushWrapper as any) as any;
