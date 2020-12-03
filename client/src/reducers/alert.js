import { SET_ALERT, REMOVE_ALERT } from "../actions/types";

const initialState = [];

//@Theory-> Reducers are the pure functions that take current state of application, perform an action and return a new state. These states are stored as objects and they specify how the state of an application changes in response to an action sent to the store.

// eslint-disable-next-line
export default function (state = initialState, action) {
  const { type, payload } = action; //action takes 2 properties where type is mandatory

  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
}
