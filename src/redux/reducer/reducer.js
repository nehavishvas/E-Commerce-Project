import constant from "../../constant/constant";

const defaultProductFacets = {
  brands: [],
  items: [],
  ratings: [],
  stock: { inStock: 0, outOfStock: 0 },
  summary: { averagePrice: 0, averageRating: 0, totalReviews: 0 },
  priceRange: { min: 0, max: 0 },
};

export const ProductReducer = (
  state = {
    loading: true,
    Product: [],
    total: 0,
    page: 1,
    pages: 1,
    limit: 0,
    facets: defaultProductFacets,
    filters: {},
  },
  action
) => {
  switch (action.type) {
    case constant.PRODUCT_LIST_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.PRODUCT_LIST_SUCCESS:
      return {
        loading: false,
        Product: action.payload.products,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        limit: action.payload.limit,
        facets: {
          ...defaultProductFacets,
          ...(action.payload.facets || {}),
          stock: {
            ...defaultProductFacets.stock,
            ...(action.payload.facets?.stock || {}),
          },
          summary: {
            ...defaultProductFacets.summary,
            ...(action.payload.facets?.summary || {}),
          },
          priceRange: {
            ...defaultProductFacets.priceRange,
            ...(action.payload.facets?.priceRange || {}),
          },
        },
        filters: action.payload.filters,
      };
    case constant.PRODUCT_LIST_FAIL:
      return {
        loading: false,
        Product: [],
        total: 0,
        page: 1,
        pages: 1,
        limit: 0,
        facets: defaultProductFacets,
        filters: {},
        error: action.payload,
      };
    default:
      return state;
  }
};

export const ProductdetailReducer = (
  state = { loading: true, Product: {}, relatedProducts: [] },
  action
) => {
  switch (action.type) {
    case constant.PRODUCT_DETAIL_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.PRODUCT_DETAIL_SUCCESS:
      return {
        loading: false,
        Product: action.payload.product,
        relatedProducts: action.payload.relatedProducts || [],
      };
    case constant.REVIEW_CREATE_REQUEST:
      return { ...state, reviewLoading: true, reviewError: undefined, reviewSuccess: undefined };
    case constant.REVIEW_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        reviewLoading: false,
        reviewSuccess: action.payload.message,
        Product: action.payload.product,
        relatedProducts: action.payload.relatedProducts || [],
      };
    case constant.REVIEW_CREATE_FAIL:
      return { ...state, reviewLoading: false, reviewError: action.payload };
    case constant.PRODUCT_DETAIL_FAIL:
      return {
        loading: false,
        Product: {},
        relatedProducts: [],
        error: action.payload,
      };
    default:
      return state;
  }
};

export const catalogReducer = (
  state = { loading: true, tree: [], stats: null },
  action
) => {
      switch (action.type) {
    case constant.CATALOG_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.CATALOG_SUCCESS:
      return {
        loading: false,
        tree: action.payload.tree,
        stats: action.payload.stats,
      };
    case constant.CATALOG_FAIL:
      return { loading: false, tree: [], stats: null, error: action.payload };
    default:
      return state;
  }
};

const storedUser = localStorage.getItem("shopzoneUser");
const storedToken = localStorage.getItem("shopzoneToken");

export const authReducer = (
  state = {
    loading: false,
    token: storedToken || null,
    user: storedUser ? JSON.parse(storedUser) : null,
    githubConfig: null,
  },
  action
) => {
  switch (action.type) {
    case constant.AUTH_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.AUTH_SUCCESS:
      return {
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
        githubConfig: state.githubConfig,
      };
    case constant.AUTH_FAIL:
      return { ...state, loading: false, error: action.payload };
    case constant.AUTH_GITHUB_CONFIG_SUCCESS:
      return { ...state, githubConfig: action.payload };
    case constant.AUTH_LOGOUT:
      return { loading: false, token: null, user: null, githubConfig: state.githubConfig };
    default:
      return state;
  }
};

export const orderReducer = (
  state = {
    loading: false,
    orders: [],
    latestOrder: null,
    transactionLoading: false,
    transactionDetail: null,
  },
  action
) => {
  switch (action.type) {
    case constant.PAYMENT_CONFIRM_REQUEST:
    case constant.ORDER_LIST_REQUEST:
      return { ...state, loading: true, error: undefined };
    case constant.PAYMENT_CONFIRM_SUCCESS:
      return {
        ...state,
        loading: false,
        latestOrder: action.payload,
        orders: [action.payload, ...state.orders],
      };
    case constant.ORDER_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload,
      };
    case constant.TRANSACTION_DETAIL_REQUEST:
      return {
        ...state,
        transactionLoading: true,
        transactionError: undefined,
      };
    case constant.TRANSACTION_DETAIL_SUCCESS:
      return {
        ...state,
        transactionLoading: false,
        transactionDetail: action.payload,
      };
    case constant.TRANSACTION_DETAIL_FAIL:
      return {
        ...state,
        transactionLoading: false,
        transactionError: action.payload,
      };
    case constant.TRANSACTION_DETAIL_CLEAR:
      return {
        ...state,
        transactionLoading: false,
        transactionDetail: null,
        transactionError: undefined,
      };
    case constant.PAYMENT_CONFIRM_FAIL:
    case constant.ORDER_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    case constant.AUTH_LOGOUT:
      return {
        loading: false,
        orders: [],
        latestOrder: null,
        transactionLoading: false,
        transactionDetail: null,
      };
    default:
      return state;
  }
};
