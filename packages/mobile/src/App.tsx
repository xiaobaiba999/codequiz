import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import QuestionListScreen from './screens/QuestionListScreen';
import QuestionDetailScreen from './screens/QuestionDetailScreen';
import StatsScreen from './screens/StatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import PracticeScreen from './screens/PracticeScreen';
import ExamScreen from './screens/ExamScreen';
import WrongBookScreen from './screens/WrongBookScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import { useAuthStore } from './store/auth';
import { useThemeStore } from './store/theme';
import CodePushWrapper from './components/CodePushWrapper';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#1677ff',
      headerShown: true,
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页', tabBarLabel: '首页' }} />
    <Tab.Screen name="Questions" component={QuestionListScreen} options={{ title: '题库', tabBarLabel: '题库' }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '统计', tabBarLabel: '统计' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的', tabBarLabel: '我的' }} />
  </Tab.Navigator>
);

const AppContent = () => {
  const { token } = useAuthStore();
  const { isDark } = useThemeStore();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: '#1677ff',
            background: isDark ? '#1a1a1a' : '#ffffff',
            card: isDark ? '#2a2a2a' : '#ffffff',
            text: isDark ? '#ffffff' : '#000000',
            border: isDark ? '#444444' : '#e0e0e0',
            notification: '#ff4d4f',
          },
          fonts: { regular: { fontFamily: '', fontWeight: '400' as any }, medium: { fontFamily: '', fontWeight: '500' as any }, bold: { fontFamily: '', fontWeight: '700' as any }, heavy: { fontFamily: '', fontWeight: '900' as any } },
        }}
      >
        <Stack.Navigator>
          {!token ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{ title: '答题' }} />
              <Stack.Screen name="Practice" component={PracticeScreen} options={{ title: '刷题' }} />
              <Stack.Screen name="Exam" component={ExamScreen} options={{ title: '模拟考试' }} />
              <Stack.Screen name="WrongBook" component={WrongBookScreen} options={{ title: '错题本' }} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: '收藏夹' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const App = () => (
  <CodePushWrapper>
    <AppContent />
  </CodePushWrapper>
);

export default App;
