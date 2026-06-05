import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk"
import Rootreducer from "./redux/reducer/rootreducer";

const initialState = {};

export const store = createStore(
  Rootreducer,
  initialState,
  compose(applyMiddleware(thunk))
);
