import React from "react";
import Login from "../Login/Login";

export default function ProtectedRouter({ data, children }) {
  if (data !== null) {
    return children;
  } else {
    return <Login />;
  }
}
