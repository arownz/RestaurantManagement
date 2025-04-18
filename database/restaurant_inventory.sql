-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_inventory;
USE restaurant_inventory;

-- Create Category table
CREATE TABLE IF NOT EXISTS Category (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    Category VARCHAR(50) NOT NULL
);

-- Create Ingredients table
CREATE TABLE IF NOT EXISTS Ingredients (
    IngredientsID INT PRIMARY KEY AUTO_INCREMENT,
    IngredientName VARCHAR(100) NOT NULL UNIQUE,
    UnitOfMeasurement VARCHAR(20),
    CategoryID INT,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) ON DELETE SET NULL
);

-- Create StockIngredients table
CREATE TABLE IF NOT EXISTS StockIngredients (
    StockIngredientsID INT AUTO_INCREMENT,
    IngredientsID INT,
    Container VARCHAR(50),
    Quantity INT,
    Container_Size DECIMAL(10,2),
    Container_Price DECIMAL(10,2),
    Total_Quantity DECIMAL(10,2),
    Total_Price DECIMAL(10,2),
    Unit_Price DECIMAL(10,4),
    PRIMARY KEY (StockIngredientsID, IngredientsID),
    FOREIGN KEY (IngredientsID) REFERENCES Ingredients(IngredientsID) ON DELETE CASCADE
);

-- Create MenuItems table
CREATE TABLE IF NOT EXISTS MenuItems (
    MenuID INT PRIMARY KEY AUTO_INCREMENT,
    Menu VARCHAR(100) NOT NULL UNIQUE,
    SellingPrice DECIMAL(10,2)
);

-- Create Recipes table
CREATE TABLE IF NOT EXISTS Recipes (
    RecipeID INT PRIMARY KEY AUTO_INCREMENT,
    MenuID INT,
    IngredientsID INT,
    Quantity DECIMAL(10,2),
    FOREIGN KEY (MenuID) REFERENCES MenuItems(MenuID) ON DELETE CASCADE,
    FOREIGN KEY (IngredientsID) REFERENCES Ingredients(IngredientsID) ON DELETE CASCADE
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    MenuID INT,
    Quantity INT,
    TotalPrice DECIMAL(10,2),
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MenuID) REFERENCES MenuItems(MenuID) ON DELETE CASCADE
);

-- Create required views
CREATE OR REPLACE VIEW View_TotalStockByIngredient AS
SELECT 
    i.IngredientsID,
    i.IngredientName,
    i.UnitOfMeasurement,
    SUM(s.Total_Quantity) AS TotalStock
FROM 
    Ingredients i
JOIN 
    StockIngredients s ON i.IngredientsID = s.IngredientsID
GROUP BY 
    i.IngredientsID, i.IngredientName, i.UnitOfMeasurement;

CREATE OR REPLACE VIEW View_TotalIngredientsUsed AS
SELECT 
    i.IngredientsID,
    i.IngredientName,
    SUM(r.Quantity * o.Quantity) AS TotalUsed
FROM 
    Ingredients i
JOIN 
    Recipes r ON i.IngredientsID = r.IngredientsID
JOIN 
    Orders o ON r.MenuID = o.MenuID
GROUP BY 
    i.IngredientsID, i.IngredientName;

CREATE OR REPLACE VIEW View_RemainingIngredients AS
SELECT 
    ts.IngredientsID,
    ts.IngredientName,
    ts.UnitOfMeasurement,
    ts.TotalStock,
    COALESCE(tu.TotalUsed, 0) AS TotalUsed,
    ts.TotalStock - COALESCE(tu.TotalUsed, 0) AS RemainingStock
FROM 
    View_TotalStockByIngredient ts
LEFT JOIN 
    View_TotalIngredientsUsed tu ON ts.IngredientsID = tu.IngredientsID;

-- Insert some sample data
INSERT INTO Category (Category) VALUES 
('Dairy'), ('Meat'), ('Vegetables'), ('Spices'), ('Condiments');

INSERT INTO Ingredients (IngredientName, UnitOfMeasurement, CategoryID) VALUES 
('Salt', 'grams', 4),
('Ground Beef', 'grams', 2),
('Lettuce', 'grams', 3),
('Cheese', 'grams', 1),
('Ketchup', 'ml', 5);
