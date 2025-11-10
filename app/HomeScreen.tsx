import React, { useEffect, useRef, useState, useMemo } from "react";
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    Alert,
    Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dish, Course } from "./types"; // Imported types

// Helper function: capitalizes the first letter of a word
const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// --- COMPONENT: MenuItem ---
const MenuItem: React.FC<{ item: Dish }> = ({ item }) => (
    <View style={styles.menuItemContainer}>
        <View style={styles.nameAndPriceRow}>
            <Text style={styles.dishName}>{item.name}</Text>
            <Text style={styles.dottedLine} numberOfLines={1}>
                ........................................................
            </Text>
            <Text style={styles.dishPrice}>R {item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.dishDesc}>{item.description}</Text>
    </View>
);

// --- COMPONENT: CourseSection ---
const CourseSection: React.FC<{ title: Course | string; dishes: Dish[] }> = ({
    title,
    dishes,
}) => (
    <View style={styles.courseSection}>
        <Text style={styles.courseTitle}>{title.toUpperCase()}</Text>
        {dishes.map((dish) => (
            <MenuItem key={dish.id} item={dish} />
        ))}
    </View>
);

// --- MAIN COMPONENT: HomeScreen ---
export default function HomeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Get user role and dishes passed via navigation params
    const role = params.role || "user";
    const initialDishes: Dish[] = params.dishes ? JSON.parse(params.dishes as string) : [];

    // State to store list of dishes
    const [dishes, setDishes] = useState<Dish[]>(initialDishes);

    // --- Animation Refs ---
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    const removeScale = useRef(new Animated.Value(1)).current;
    const helpScale = useRef(new Animated.Value(1)).current;
    const resetScale = useRef(new Animated.Value(1)).current;
    const logoutScale = useRef(new Animated.Value(1)).current;
    const filterScale = useRef(new Animated.Value(1)).current; // NEW FILTER SCALE

    // Map of all button animation references
    const buttonScales = {
        add: addScale,
        remove: removeScale,
        help: helpScale,
        reset: resetScale,
        logout: logoutScale,
        filter: filterScale, // NEW
    };

    // --- Animation Handlers ---
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        return () => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
        };
    }, []);

    const pressIn = (anim: Animated.Value) => {
        Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const pressOut = (anim: Animated.Value) => {
        Animated.spring(anim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // --- FEATURE: Calculate Course Averages and Breakdown ---
    const averageStats = useMemo(() => {
        let totalItems = 0;
        let totalSum = 0;
        const courseStats: Record<Course, { count: number; sum: number }> = {
            Starter: { count: 0, sum: 0 },
            Main: { count: 0, sum: 0 },
            Dessert: { count: 0, sum: 0 },
        };

        dishes.forEach(dish => {
            totalItems++;
            totalSum += dish.price;
            courseStats[dish.course].count++;
            courseStats[dish.course].sum += dish.price;
        });

        const breakdown = Object.entries(courseStats)
            .filter(([, stats]) => stats.count > 0)
            .map(([course, stats]) => ({
                course: course as Course,
                average: stats.count > 0 ? stats.sum / stats.count : 0,
            }));

        return {
            totalItems,
            totalAverage: totalItems > 0 ? totalSum / totalItems : 0,
            breakdown,
        };
    }, [dishes]);

    // --- Group dishes by course for menu display ---
    const menuSections = useMemo(() => {
        const grouped = dishes.reduce((acc, dish) => {
            const courseKey = capitalize(dish.course);
            if (!acc[courseKey]) acc[courseKey] = [];
            acc[courseKey].push(dish);
            return acc;
        }, {} as Record<string, Dish[]>);

        return Object.entries(grouped).map(([title, items]) => ({
            title: title,
            data: items,
        }));
    }, [dishes]);

    // --- Handle Reset: Clears all dishes from menu ---
    const handleReset = () => {
        Alert.alert("Reset Menu", "Are you sure you want to clear all dishes?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => setDishes([]) },
        ]);
    };

    // --- Handle Logout: Fades out then navigates back to login ---
    const handleLogout = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
        }).start(() => {
            router.replace({
                pathname: "/",
                params: { dishes: JSON.stringify(dishes) },
            });
        });
    };

    // --- Render Screen UI ---
    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ImageBackground
                source={{
                    uri: "https://png.pngtree.com/thumb_back/fw800/background/20231230/pngtree-illustrated-vector-background-restaurant-menu-design-with-paper-texture-food-and-image_13914730.png",
                }}
                style={styles.background}
            >
                <View style={styles.overlay} />

                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Christoffel’s Menu</Text>
                    <Text style={styles.subtitle}>
                        Logged in as: {role === "christoffel" ? "Christoffel (Chef)" : "User"}
                    </Text>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Current Menu</Text>

                    {dishes.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No dishes yet. Add a dish to get started.
                        </Text>
                    ) : (
                        <View style={styles.menuListContainer}>
                            {menuSections.map((section) => (
                                <CourseSection
                                    key={section.title}
                                    title={section.title}
                                    dishes={section.data}
                                />
                            ))}
                        </View>
                    )}

                    {/* --- FEATURE: Menu Statistics Box with Breakdown --- */}
                    <View style={styles.statsBox}>
                        <Text style={styles.statsTitle}>Menu Statistics</Text>

                        {/* Overall Average */}
                        <Text style={styles.statsText}>
                            Total Items: {averageStats.totalItems}
                        </Text>
                        <Text style={styles.statsText}>
                            Overall Avg. Price: R {averageStats.totalAverage.toFixed(2)}
                        </Text>

                        <View style={styles.divider} />

                        {/* Course Breakdown */}
                        <Text style={styles.statsSubtitle}>Average Price by Course:</Text>
                        {averageStats.breakdown.length === 0 ? (
                            <Text style={styles.statsText}>No dishes to calculate average.</Text>
                        ) : (
                            averageStats.breakdown.map(item => (
                                <View key={item.course} style={styles.breakdownRow}>
                                    <Text style={styles.breakdownCourse}>{item.course}:</Text>
                                    <Text style={styles.breakdownPrice}>R {item.average.toFixed(2)}</Text>
                                </View>
                            ))
                        )}
                    </View>


                    {/* --- BUTTONS --- */}

                    {/* FEATURE: Filter Menu Button (Visible to all users) */}
                    <TouchableWithoutFeedback
                        onPressIn={() => pressIn(buttonScales.filter)}
                        onPressOut={() => pressOut(buttonScales.filter)}
                        onPress={() =>
                            router.push({
                                pathname: "/FilterMenuScreen",
                                params: { currentDishes: JSON.stringify(dishes) },
                            })
                        }
                    >
                        <Animated.View
                            style={[styles.card, styles.filterButton, { transform: [{ scale: buttonScales.filter }] }]}
                        >
                            <Text style={styles.cardTitle}>Filter Menu</Text>
                            <Text style={styles.cardText}>Filter and view the menu by course type.</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>


                    {/* Chef Controls */}
                    {role === "christoffel" && (
                        <>
                            {/* Add Dish Button */}
                            <TouchableWithoutFeedback
                                onPressIn={() => pressIn(buttonScales.add)}
                                onPressOut={() => pressOut(buttonScales.add)}
                                onPress={() =>
                                    router.push({
                                        pathname: "/AddDishScreen",
                                        params: { role, currentDishes: JSON.stringify(dishes) },
                                    })
                                }
                            >
                                <Animated.View
                                    style={[styles.card, { transform: [{ scale: buttonScales.add }] }]}
                                >
                                    <Text style={styles.cardTitle}>Add Dish</Text>
                                    <Text style={styles.cardText}>Add new dishes to your menu.</Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>

                            {/* Remove Dish Button */}
                            <TouchableWithoutFeedback
                                onPressIn={() => pressIn(buttonScales.remove)}
                                onPressOut={() => pressOut(buttonScales.remove)}
                                onPress={() =>
                                    router.push({
                                        pathname: "/RemoveDishScreen",
                                        params: { role, currentDishes: JSON.stringify(dishes) },
                                    })
                                }
                            >
                                <Animated.View
                                    style={[styles.card, { transform: [{ scale: buttonScales.remove }] }]}
                                >
                                    <Text style={styles.cardTitle}>Remove Dish</Text>
                                    <Text style={styles.cardText}>
                                        Delete dishes from the menu list.
                                    </Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>

                            {/* Reset Menu Button */}
                            <TouchableWithoutFeedback
                                onPressIn={() => pressIn(buttonScales.reset)}
                                onPressOut={() => pressOut(buttonScales.reset)}
                                onPress={handleReset}
                            >
                                <Animated.View
                                    style={[
                                        styles.card,
                                        {
                                            backgroundColor: "rgba(220,20,60,0.3)",
                                            transform: [{ scale: buttonScales.reset }],
                                        },
                                    ]}
                                >
                                    <Text style={styles.cardTitle}>Reset Menu</Text>
                                    <Text style={styles.cardText}>
                                        Clear all dishes and start fresh.
                                    </Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </>
                    )}

                    {/* Help Button (Visible to all) */}
                    <TouchableWithoutFeedback
                        onPressIn={() => pressIn(buttonScales.help)}
                        onPressOut={() => pressOut(buttonScales.help)}
                        onPress={() => router.push("/HelpScreen")}
                    >
                        <Animated.View
                            style={[styles.card, { transform: [{ scale: buttonScales.help }] }]}
                        >
                            <Text style={styles.cardTitle}>Help</Text>
                            <Text style={styles.cardText}>
                                Learn how to use the app and get assistance.
                            </Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>

                    {/* Logout Button (Visible to all) */}
                    <TouchableWithoutFeedback
                        onPressIn={() => pressIn(buttonScales.logout)}
                        onPressOut={() => pressOut(buttonScales.logout)}
                        onPress={handleLogout}
                    >
                        <Animated.View
                            style={[
                                styles.card,
                                styles.logoutButton,
                                { transform: [{ scale: buttonScales.logout }] },
                            ]}
                        >
                            <Text style={styles.logoutText}>LOGOUT</Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </ImageBackground>
        </Animated.View>
    );
}

// --- STYLES (Updated for Stats Box) ---
const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
    container: { padding: 20, alignItems: "center", paddingTop: 80 },
    title: { fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: "#fff" },
    subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#ddd" },
    
    // NEW/UPDATED STATS STYLES
    statsBox: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        width: "100%",
        alignItems: "stretch", 
    },
    statsTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8, textAlign: 'center' },
    statsSubtitle: { fontSize: 15, fontWeight: "600", color: "#ddd", marginTop: 10, marginBottom: 5 },
    statsText: { fontSize: 16, color: "#fff", fontWeight: "600" },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    breakdownCourse: { color: "#ccc", fontSize: 14 },
    breakdownPrice: { color: "#aaffaa", fontSize: 14, fontWeight: '600' },
    
    // BUTTON/CARD STYLES
    card: {
        backgroundColor: "rgba(201, 68, 27, 0.3)",
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        width: "100%",
        shadowColor: "#bf672cff",
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 4,
    },
    cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#fff" },
    cardText: { fontSize: 14, color: "#ccc" },

    // NEW FILTER BUTTON STYLE
    filterButton: {
        backgroundColor: "rgba(44, 132, 191, 0.5)",
    },
    
    // MENU LIST STYLES
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    emptyText: { color: "#bbb", textAlign: "center", marginTop: 10 },
    menuListContainer: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    courseSection: { marginBottom: 25 },
    courseTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#bf672cff",
        marginBottom: 10,
        marginTop: 5,
        borderBottomWidth: 2,
        borderBottomColor: "#bf672cff",
        paddingBottom: 5,
    },
    menuItemContainer: { marginBottom: 15, paddingBottom: 5 },
    nameAndPriceRow: { flexDirection: "row", alignItems: "flex-end" },
    dishName: { color: "#fff", fontWeight: "600", fontSize: 16, marginRight: 8 },
    dottedLine: { flex: 1, color: "#ccc", fontSize: 16, overflow: "hidden", lineHeight: 10, marginBottom: 4 },
    dishPrice: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
    dishDesc: { color: "#ccc", fontSize: 14, fontStyle: "italic", marginTop: 2 },
    logoutButton: {
        backgroundColor: "rgba(52, 152, 219, 0.6)",
        marginTop: 30,
        marginBottom: 40,
        alignItems: "center",
        padding: 15,
    },
    logoutText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
});