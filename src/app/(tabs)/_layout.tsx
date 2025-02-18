import { Redirect, Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useAuth } from "~/src/providers/AuthProvider";

export default function TabsLayout() {
    const {isAuthenticated} = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />
    }

    return (
            <Tabs screenOptions={{ tabBarActiveTintColor: ' black', tabBarShowLabel: false, tabBarStyle: { paddingTop: 10 } }}>
                <Tabs.Screen 
                    name="index" 
                    options={{ 
                        headerTitle: 'For you', 
                        tabBarIcon: ({ color , focused }) => <Octicons name={focused ? "home" : "home"} size={26} color={color} />,
                    }} 
                />

                <Tabs.Screen 
                    name="new" 
                    options={{ 
                        headerTitle: 'Create post', 
                        tabBarIcon: ({ color , focused }) => <FontAwesome name={focused ? "plus-square" : "plus-square-o"} size={27} color={color} />,
                    }} 
                />

                <Tabs.Screen 
                    name="profile" 
                    options={{ 
                        headerTitle: 'Profile', 
                        tabBarIcon: ({ color , focused }) => <FontAwesome6 name="user-circle" size={26} color={color} />,
                    }} 
                />
            </Tabs>
    );
};