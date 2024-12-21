import { useState, useEffect, useReducer } from 'react';
import './productList.css';
import products from '../items.json';
import { generateButtons } from './generateButtons';
import { generatePageOptions } from './generatePageOptions';

const categories = ['A', 'B', 'C', 'D', 'E'];
const initialState = {
  selectedCategories: [],
  priceRange: { min: 0, max: Infinity },
  search: '',
  inStock: false,
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
    case 'SET_PRICE_RANGE': {
      return {
        ...state,
        priceRange: {
          min: action.payload.min,
          max: action.payload.max,
        },
        currentPage: 1,
      };
    }
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
        currentPage: 1,
      };
    case 'SET_IN_STOCK':
      return {
        ...state,
        inStock: !state.inStock,
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
  const [inputPriceRange, setInputPriceRange] = useState({
    min: '',
    max: '',
  });
  const productsPerPage = 14;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        filters.selectedCategories.length === 0 ||
        filters.selectedCategories.includes(product.category);

      const matchesPrice =
        product.price >= filters.priceRange.min &&
        product.price <= filters.priceRange.max;

      const matchesStock = filters.inStock ? product.inStock : true;

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

  const dispatchAction = (type, payload) => {
    dispatch({ type, payload });
  };

  const handleSetCategory = (category) =>
    dispatchAction('SET_CATEGORY', category);
  const handleSetSearch = (search) => dispatchAction('SET_SEARCH', search);
  const handleSetSort = (sort) => dispatchAction('SET_SORT', sort);
  const handleSetPage = (page) => dispatchAction('SET_PAGE', page);
  const handleSetInStock = () => dispatchAction('SET_IN_STOCK');
  const handleNextPage = () =>
    dispatchAction('SET_PAGE', filters.currentPage + 1);
  const handlePreviousPage = () =>
    dispatchAction('SET_PAGE', filters.currentPage - 1);

  const handlePriceInputChange = (type, value) => {
    setInputPriceRange((prev) => ({
      ...prev,
      [type]: value === '' ? '' : Number(value),
    }));
  };

  const handleApplyPriceRange = () => {
    dispatch({
      type: 'SET_PRICE_RANGE',
      payload: {
        min: inputPriceRange.min === '' ? 0 : inputPriceRange.min,
        max: inputPriceRange.max === '' ? Infinity : inputPriceRange.max,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyPriceRange();
    }
  };
  
  return (
    <div className="main-wrapper">
      <aside className="aside-wrapper">
        <div className="section-wrapper">
          <span className="section-title">庫存</span>
          <label className="label-wrapper">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={handleSetInStock}
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
                    onChange={() => handleSetCategory(category)}
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
              value={inputPriceRange.min ?? ''}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              onChange={(e) => handlePriceInputChange('min', e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span> - </span>
            <input
              className="price-input"
              type="number"
              value={inputPriceRange.max ?? ''}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              onChange={(e) => handlePriceInputChange('max', e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="price-button" onClick={handleApplyPriceRange}>
              Go
            </button>
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
            onChange={(e) => handleSetSearch(e.target.value)}
          />
          <div className="products-sort-wrapper">
            <span className="products-sort-title">排序</span>
            <select
              value={filters.sort}
              onChange={(e) => handleSetSort(e.target.value)}
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
          <div className="products-button-wrapper">
            {generateButtons(filters.currentPage, totalPages).map(
              (button, index) => {
                if (button === '<') {
                  return (
                    <button
                      key={index}
                      onClick={handlePreviousPage}
                      disabled={filters.currentPage === 1}
                    >
                      &lt;
                    </button>
                  );
                } else if (button === '>') {
                  return (
                    <button
                      key={index}
                      onClick={handleNextPage}
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
                    onClick={() => handleSetPage(button)}
                    className={
                      button === filters.currentPage ? 'active-button' : ''
                    }
                  >
                    {button}
                  </button>
                );
              }
            )}
          </div>
          <div className="products-select-wrapper">
            <span className="products-select-title">前往頁面</span>
            <select
              value={filters.currentPage}
              onChange={(e) => handleSetPage(Number(e.target.value))}
            >
              {generatePageOptions(totalPages)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
