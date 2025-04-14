import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout components
import Navigation from './components/Navigation';

// Table components
import CategoryTable from './components/tables/CategoryTable';
import IngredientsTable from './components/tables/IngredientsTable';
import StockIngredientsTable from './components/tables/StockIngredientsTable';
import MenuItemsTable from './components/tables/MenuItemsTable';
import RecipesTable from './components/tables/RecipesTable';
import OrdersTable from './components/tables/OrdersTable';

// View components
import TotalStockView from './components/views/TotalStockView';
import IngredientsUsedView from './components/views/IngredientsUsedView';
import RemainingIngredientsView from './components/views/RemainingIngredientsView';

// Form components
import CategoryForm from './components/forms/CategoryForm';
import IngredientsForm from './components/forms/IngredientsForm';
import StockIngredientsForm from './components/forms/StockIngredientsForm';
import MenuItemsForm from './components/forms/MenuItemsForm';
import RecipesForm from './components/forms/RecipesForm';
import OrdersForm from './components/forms/OrdersForm';

// Dashboard
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Table routes */}
            <Route path="/categories" element={<CategoryTable />} />
            <Route path="/ingredients" element={<IngredientsTable />} />
            <Route path="/stock" element={<StockIngredientsTable />} />
            <Route path="/menu" element={<MenuItemsTable />} />
            <Route path="/recipes" element={<RecipesTable />} />
            <Route path="/orders" element={<OrdersTable />} />
            
            {/* View routes */}
            <Route path="/views/total-stock" element={<TotalStockView />} />
            <Route path="/views/ingredients-used" element={<IngredientsUsedView />} />
            <Route path="/views/remaining-ingredients" element={<RemainingIngredientsView />} />
            
            {/* Form routes */}
            <Route path="/add/category" element={<CategoryForm />} />
            <Route path="/add/ingredient" element={<IngredientsForm />} />
            <Route path="/add/stock" element={<StockIngredientsForm />} />
            <Route path="/add/menu" element={<MenuItemsForm />} />
            <Route path="/add/recipe" element={<RecipesForm />} />
            <Route path="/add/order" element={<OrdersForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
