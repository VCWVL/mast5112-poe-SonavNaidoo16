// AddDishScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ImageBackground,
    Alert,
    Animated,
    TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Dish, Course } from "./types"; 

// --- Animated Button Component ---
const AnimatedButton: React.FC<{
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
}> = ({ title, onPress, style, textStyle }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => onPress());
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
            <TouchableOpacity
                style={style}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Text style={textStyle}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- Main Screen Component: AddDishScreen ---
export default function AddDishScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const role = params.role || "user";

    const initialDishes: Dish[] = params.currentDishes
        ? JSON.parse(params.currentDishes as string)
        : [];

    // State variables using imported Course type
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState<Course | "">(""); 
    const [price, setPrice] = useState("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    // FIX: Added 'fadeAnim' to the dependency array.
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]); // <-- FIXED

    // --- Function: Add Dish ---
    const handleAddDish = () => {
        if (!name || !description || !course || !price) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        
        // Basic price validation
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Error", "Please enter a valid price.");
            return;
        }

        // Create new dish object using imported 'Dish' type
        const newDish: Dish = {
            id: Date.now().toString(),
            name,
            description,
            course: course as Course,
            price: priceNum,
        };

        Alert.alert("Success", "Dish added successfully!");

        const updatedDishes = [...initialDishes, newDish];

        // Navigate back to HomeScreen and pass updated list
        router.replace({
            pathname: "/HomeScreen",
            params: {
                role,
                dishes: JSON.stringify(updatedDishes),
            },
        });
    };

    // --- UI Section ---
    return (
        <ImageBackground
            source={{
                uri: "https://img.freepik.com/premium-photo/food-banner-vegetables-spices-top-view-free-copy-space_187166-5816.jpg",
            }}
            style={styles.background}
        >
            <View style={styles.overlay} />

            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <Text style={styles.title}>Add New Dish</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Dish Name"
                    placeholderTextColor="#aaa"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={course}
                        dropdownIconColor="#000000ff"
                        onValueChange={(value) => setCourse(value as Course)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Course" value="" color="#000000ff" />
                        <Picker.Item label="Starter" value="Starter" color="#000000ff" />
                        <Picker.Item label="Main" value="Main" color="#000000ff" />
                        <Picker.Item label="Dessert" value="Dessert" color="#000000ff" />
                    </Picker>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Price (R)"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                <AnimatedButton
                    title="Add Dish"
                    onPress={handleAddDish}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
            </Animated.View>
        </ImageBackground>
    );
}

// --- Styling Section ---
const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover", justifyContent: "center" },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    title: { fontSize: 28, color: "#fff", fontWeight: "bold", marginBottom: 20 },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#2c84bfff",
        backgroundColor: "rgba(255,255,255,0.1)",
        color: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    pickerContainer: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#2c84bfff",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden",
    },
    picker: { color: "#000000ff" },
    button: {
        backgroundColor: "#2c84bfff",
        paddingVertical: 14,
        paddingHorizontal: 80,
        borderRadius: 25,
    },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});