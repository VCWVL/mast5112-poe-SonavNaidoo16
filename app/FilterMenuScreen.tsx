import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ImageBackground,
    Animated,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dish, Course } from "./types"; // Imported types
import { Picker } from "@react-native-picker/picker";

// --- COMPONENT: MenuItem ---
const MenuItem: React.FC<{ item: Dish }> = ({ item }) => (
    <View style={filterStyles.menuItemContainer}>
        <Text style={filterStyles.dishName}>{item.name}</Text>
        <Text style={filterStyles.dishPrice}>R {item.price.toFixed(2)}</Text>
    </View>
);

// --- MAIN COMPONENT: FilterMenuScreen ---
export default function FilterMenuScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Load dishes and cast to Dish[]
    const dishes: Dish[] = params.currentDishes
        ? JSON.parse(params.currentDishes as string)
        : [];

    // State for the selected filter
    const [selectedCourse, setSelectedCourse] = useState<Course | "All">("All");

    // Filter the dishes based on selectedCourse
    const filteredDishes = useMemo(() => {
        if (selectedCourse === "All") {
            return dishes;
        }
        // Filter by the Course type
        return dishes.filter(dish => dish.course === selectedCourse);
    }, [dishes, selectedCourse]);

    // Screen fade-in animation
    const screenFade = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(screenFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    // Function to navigate back
    const handleGoBack = () => {
        router.back();
    };

    return (
        <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1543883011-37f90f2b38f8" }}
            style={filterStyles.background}
        >
            <View style={filterStyles.overlay} />

            <Animated.View style={[filterStyles.container, { opacity: screenFade }]}>
                <Text style={filterStyles.title}>Filter Menu</Text>

                {/* Course Selection Picker */}
                <View style={filterStyles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCourse}
                        onValueChange={(itemValue) => setSelectedCourse(itemValue as Course | "All")}
                        style={filterStyles.picker}
                        dropdownIconColor="#fff"
                    >
                        <Picker.Item label="Show All" value="All" color="#000000ff" />
                        <Picker.Item label="Starter" value="Starter" color="#000000ff" />
                        <Picker.Item label="Main" value="Main" color="#000000ff" />
                        <Picker.Item label="Dessert" value="Dessert" color="#000000ff" />
                    </Picker>
                </View>
                
                <Text style={filterStyles.listHeader}>
                    Showing {filteredDishes.length} {selectedCourse === "All" ? "Items" : selectedCourse + "s"}
                </Text>


                {/* List of Filtered Dishes */}
                {dishes.length === 0 ? (
                    <Text style={filterStyles.emptyText}>The menu is currently empty.</Text>
                ) : (
                    <FlatList
                        data={filteredDishes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MenuItem item={item} />}
                        contentContainerStyle={filterStyles.listContainer}
                        style={filterStyles.flatList}
                    />
                )}

                {/* Back Button */}
                <TouchableOpacity onPress={handleGoBack} style={filterStyles.backButton}>
                    <Text style={filterStyles.backButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </Animated.View>
        </ImageBackground>
    );
}

// --- Styles for FilterMenuScreen ---
const filterStyles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.75)" },
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 80, alignItems: "center" },
    title: { fontSize: 32, fontWeight: "bold", color: "#f8f8f8", marginBottom: 20 },

    pickerContainer: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#f8f8f8",
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        color: "#000000ff", // Text color needs to be set if not using dark mode
    },

    listHeader: { fontSize: 16, color: '#f8f8f8', marginBottom: 10, alignSelf: 'flex-start', fontWeight: 'bold' },
    
    flatList: { width: "100%" },
    listContainer: { paddingBottom: 20 },
    emptyText: { color: "#aaa", marginTop: 20, fontSize: 16 },

    menuItemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#2c84bfff",
    },
    dishName: { color: "#fff", fontWeight: "600", fontSize: 16 },
    dishPrice: { color: "#aaffaa", fontWeight: "bold", fontSize: 16 },

    backButton: {
        backgroundColor: "#2c84bfff",
        borderRadius: 10,
        padding: 15,
        width: "100%",
        marginTop: 20,
        alignItems: "center",
    },
    backButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});