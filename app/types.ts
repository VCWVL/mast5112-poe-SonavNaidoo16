/* Defines the allowed categories for a dish */
export type Course = "Starter" | "Main" | "Dessert";

/* Defines the structure for a single dish item on the menu */
export interface Dish {
    id: string;
    name: string;
    description: string;
    course: Course; // Enforces the course to be one of the defined types
    price: number;
}