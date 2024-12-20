import { useState, useEffect, useReducer } from 'react';
import './productList.css';
import products from '../items.json';

const categories = ['A', 'B', 'C', 'D', 'E'];
const initialState = {
  selectedCategories: [],
  priceRange: { min: -Infinity, max: Infinity },
  search: '',
  inStockOnly: false,
  sort: 'none',
};
const filterReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CATEGORY': {
      const isSelected = state.selectedCategories.includes(action.payload);
      return {
        ...state,
        selectedCategories: isSelected
          ? state.selectedCategories.filter((item) => item !== action.payload)
          : [...state.selectedCategories, action.payload],
      };
    }
    case 'SET_PRICE_RANGE':
      return {
        ...state,
        priceRange: {
          ...state.priceRange,
          [action.payload.type]:
            action.payload.value === ''
              ? action.payload.type === 'min'
                ? -Infinity
                : Infinity
              : action.payload.value,
        },
      };
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
      };
    case 'SET_IN_STOCK':
      return {
        ...state,
        inStockOnly: !state.inStockOnly,
      };
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      };
    case 'RESET_FILTERS':
      return initialState;
    default:
      return state;
  }
};

function ProductList() {
  const [filters, dispatch] = useReducer(filterReducer, initialState);
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesCategory =
        filters.selectedCategories.length === 0 ||
        filters.selectedCategories.includes(product.category);
      const matchesPrice =
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max;
      const matchesStock = filters.inStockOnly ? product.inStock : true;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      return matchesCategory && matchesPrice && matchesStock && matchesSearch;
    });

    if (filters.sort === 'priceAsc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'priceDesc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [filters]);
  return (
    <div>
      <aside>
        <div>篩選</div>
        <div>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={() => dispatch({ type: 'SET_IN_STOCK' })}
          />
          僅顯示有庫存商品
        </div>
        <div>
          金額
          <input
            type="number"
            placeholder="最低價格"
            min="0"
            value={filters.priceRange.min}
            onChange={(e) =>
              dispatch({
                type: 'SET_PRICE_RANGE',
                payload: {
                  type: 'min',
                  value: e.target.value === '' ? '' : Number(e.target.value),
                },
              })
            }
          />
          <input
            type="number"
            placeholder="最高價格"
            min="0"
            value={filters.priceRange.max}
            onChange={(e) =>
              dispatch({
                type: 'SET_PRICE_RANGE',
                payload: {
                  type: 'max',
                  value: e.target.value === '' ? '' : Number(e.target.value),
                },
              })
            }
          />
        </div>
        <div>
          類別
          <ul>
            {categories.map((category) => (
              <li key={category}>
                <label>
                  <input
                    type="checkbox"
                    value={category}
                    checked={filters.selectedCategories.includes(category)}
                    onChange={() =>
                      dispatch({ type: 'SET_CATEGORY', payload: category })
                    }
                  />
                  {category}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div>
        <input
          type="text"
          placeholder="搜尋商品"
          value={filters.search}
          onChange={(e) =>
            dispatch({ type: 'SET_SEARCH', payload: e.target.value })
          }
        />
        排序
        <select
          value={filters.sort}
          onChange={(e) =>
            dispatch({ type: 'SET_SORT', payload: e.target.value })
          }
        >
          <option value="none">無價格排序</option>
          <option value="priceAsc">價格由低至高</option>
          <option value="priceDesc">價格由高至低</option>
        </select>
      </div>
      <div>
        <h3>篩選結果</h3>
        <ul>
          {filteredProducts.length > 0
            ? filteredProducts.map((product, index) => {
                if (index > 20) return;
                return (
                  <li key={product.id}>
                    {product.name} - {product.category} - ${product.price} -
                    {product.inStock ? '有庫存' : '無庫存'}
                  </li>
                );
              })
            : '無搜尋到商品'}
        </ul>
      </div>
    </div>
  );
}

export default ProductList;
