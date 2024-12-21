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
  currentPage: 1,
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
        currentPage: 1,
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
        currentPage: 1,
      };
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
        currentPage: 1,
      };
    case 'SET_IN_STOCK':
      return {
        ...state,
        inStockOnly: !state.inStockOnly,
        currentPage: 1,
      };
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
        currentPage: 1,
      };
    case 'RESET_FILTERS':
      return initialState;
    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      };
    default:
      return state;
  }
};

function ProductList() {
  const [filters, dispatch] = useReducer(filterReducer, initialState);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const productsPerPage = 15;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    const filtered = products.filter((product) => {
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

  const generateButtons = (currentPage, totalPages) => {
    const buttons = [];

    if (currentPage > 1) buttons.push('<');

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    buttons.push(1);
    if (startPage > 2) buttons.push('...');
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    if (endPage < totalPages - 1) buttons.push('...');
    if (totalPages > 1) buttons.push(totalPages);
    if (currentPage < totalPages) buttons.push('>');

    return buttons;
  };

  return (
    <div className="main-wrapper">
      <aside className="aside-wrapper">
        <div className="section-wrapper">
          <span className="section-title">庫存</span>
          <label className="label-wrapper">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={() => dispatch({ type: 'SET_IN_STOCK' })}
            />
            <span>僅顯示有庫存</span>
          </label>
        </div>
        <div className="section-wrapper">
          <span className="section-title">類別</span>
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category}>
                <label className="label-wrapper">
                  <input
                    type="checkbox"
                    value={category}
                    checked={filters.selectedCategories.includes(category)}
                    onChange={() =>
                      dispatch({ type: 'SET_CATEGORY', payload: category })
                    }
                  />
                  <span>{category}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="section-wrapper">
          <span className="section-title">金額</span>
          <div className="price-input-wrapper">
            <span>NT$ </span>
            <input
              className="price-input"
              type="number"
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
            <span> - </span>
            <input
              className="price-input"
              type="number"
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
        </div>
      </aside>
      <div className="products-wrapper">
        <div className="products-top-wrapper">
          <input
            className="products-search"
            type="text"
            placeholder="搜尋商品"
            value={filters.search}
            onChange={(e) =>
              dispatch({ type: 'SET_SEARCH', payload: e.target.value })
            }
          />
          <div className="products-sort-wrapper">
            <span className="products-sort-title">排序</span>
            <select
              value={filters.sort}
              onChange={(e) =>
                dispatch({ type: 'SET_SORT', payload: e.target.value })
              }
            >
              <option value="none">產品編號</option>
              <option value="priceAsc">價格由低至高</option>
              <option value="priceDesc">價格由高至低</option>
            </select>
          </div>
        </div>
        <div className="products-bottom-wrapper">
          <div className="products-title">
            共找到 {filteredProducts.length} 件商品
          </div>
          <table className="products-table">
            <thead>
              <tr>
                <th>商品名稱</th>
                <th>類別</th>
                <th>價格</th>
                <th>庫存</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts
                  .slice(
                    (filters.currentPage - 1) * productsPerPage,
                    filters.currentPage * productsPerPage
                  )
                  .map((product, index) => (
                    <tr key={index}>
                      <td data-label="商品名稱: ">{product.name}</td>
                      <td data-label="類別: ">{product.category}</td>
                      <td data-label="價格: ">${product.price}</td>
                      <td data-label="庫存: ">
                        {product.inStock ? '是' : '否'}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4">無搜尋到商品</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="products-pagination-wrapper">
          {generateButtons(filters.currentPage, totalPages).map(
            (button, index) => {
              if (button === '<') {
                return (
                  <button
                    key={index}
                    onClick={() =>
                      dispatch({
                        type: 'SET_PAGE',
                        payload: filters.currentPage - 1,
                      })
                    }
                    disabled={filters.currentPage === 1}
                  >
                    &lt;
                  </button>
                );
              } else if (button === '>') {
                return (
                  <button
                    key={index}
                    onClick={() =>
                      dispatch({
                        type: 'SET_PAGE',
                        payload: filters.currentPage + 1,
                      })
                    }
                    disabled={filters.currentPage === totalPages}
                  >
                    &gt;
                  </button>
                );
              } else if (button === '...') {
                return <span key={index}>...</span>;
              }
              return (
                <button
                  key={index}
                  onClick={() =>
                    dispatch({ type: 'SET_PAGE', payload: button })
                  }
                  disabled={button === filters.currentPage}
                >
                  {button}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
