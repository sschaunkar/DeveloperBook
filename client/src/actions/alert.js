import { v4 as uuid } from "uuid";
import { SET_ALERT, REMOVE_ALERT } from "./types";
//Here we have an action setAlert that is going to dispatch type SET_ALERT to the reducer which is going to add alert to state
export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id = uuid();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
