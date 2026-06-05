import { combineReducers } from "redux";
import { cartReducer } from "./cardReducer";
import {
  ProductReducer,
  ProductdetailReducer,
  authReducer,
  catalogReducer,
  orderReducer,
} from "./reducer";

const Rootreducer = combineReducers({
  Productlist: ProductReducer,
  productdetail: ProductdetailReducer,
  catalog: catalogReducer,
  auth: authReducer,
  cart: cartReducer,
  orders: orderReducer,
});

export default Rootreducer;
