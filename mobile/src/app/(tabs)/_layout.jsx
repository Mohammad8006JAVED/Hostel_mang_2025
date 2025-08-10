import { Tabs } from "expo-router";
import { Home, QrCode, FileText, Calendar, Settings } from "lucide-react-native";
import { useFonts, Inter_500Medium } from "@expo-google-fonts/inter";
import { useColorScheme } from "react-native";
import { getTheme } from "@/utils/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBackground,
          borderTopWidth: 1,
          borderTopColor: theme.tabBorder,
          paddingBottom: 10,
          paddingTop: 10,
          height: 90,
        },
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_500Medium",
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Home color={focused ? color : `${color}`} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, focused }) => (
            <QrCode color={focused ? color : `${color}`} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => (
            <FileText color={focused ? color : `${color}`} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="leave-requests"
        options={{
          title: "Leave",
          tabBarIcon: ({ color, focused }) => (
            <Calendar color={focused ? color : `${color}`} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Settings color={focused ? color : `${color}`} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}