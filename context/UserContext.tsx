import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import { Meteor } from "meteor/meteor";

const defualtState: IUserContext = {
  state: null,
  dispatch: () => {
    return {
      type: "no-op",
      payload: null,
    };
  },
};

export type AuthAction = {
  type: string;
  payload: Meteor.User | null;
};

type Dispatch = (action: AuthAction) => void;

interface IUserContext {
  state: Meteor.User | null;
  dispatch: Dispatch;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

function userContextReducer(state: IUserContext, action: AuthAction): IUserContext {
  const { type, payload } = action;
  switch (type) {
    case "login":
      return {
        ...state,
        state: payload,
      };
    case "logout":
      return {
        ...state,
        state: null,
      };
    default:
      return state;
  }
}

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userContextReducer, defualtState);
  const userContextValue: IUserContext = {
    state: state.state,
    dispatch,
  };
  return <UserContext.Provider value={userContextValue}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("no user context found");
  return context;
}
