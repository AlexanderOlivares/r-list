import React, { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import { Meteor } from 'meteor/meteor';

const defualtState = null;

export type AuthAction = {
  type: string;
  payload: Meteor.User;
};

type Dispatch = (action: AuthAction) => void;

interface IUserContext {
  state: Meteor.User | null;
  dispatch: Dispatch;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

function userContextReducer(state: IUserContext, action: AuthAction): any {
  const { type, payload } = action;
  switch (type) {
    case "login":
      return {
        ...payload
      };
    case "logout":
      return {
        payload: null,
      };
    default:
      return state;
  }
}

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userContextReducer, defualtState);
  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("no user context found");
  return context;
}
