import { Redirect, Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useAuth } from "~/src/providers/AuthProvider";
import { Image, StyleSheet } from "react-native";
export default function TabsLayout() {
    const {isAuthenticated} = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)" />
    }

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: 'black',
            tabBarShowLabel: false,
            tabBarStyle: { paddingTop: 10, borderTopWidth: 0 },
            headerStyle: { borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
        }}>
            <Tabs.Screen 
                name="index" 
                options={{ 
                    headerTitle: '',
                    headerLeft: () => (
                        <Image 
                            source={(require as any)('../../../assets/logo-black.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    ),
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
                    headerTitle: '', 
                    tabBarIcon: ({ color , focused }) => <FontAwesome6 name="user-circle" size={26} color={color} />, 
                }} 
            />
        </Tabs>

    );
};

const styles = StyleSheet.create({
    logo: {
        width: 120, 
        height: 50, 
        marginLeft: 15,
    },
});