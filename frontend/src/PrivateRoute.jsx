import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const PrivateRoute = () => {
  const toast = useToast();
  const token = localStorage.getItem("user_token"); // check auth token
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (!token) {
      // Only show toast once
      toast({
        title: "Unauthorized",
        description: "You must be logged in to access this page.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      setAuthorized(false); // mark as unauthorized
    }
  }, [token, toast]);

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
