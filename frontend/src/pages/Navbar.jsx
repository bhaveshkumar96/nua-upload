import React from "react";
import { Box, Flex, Button, Text, HStack } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Upload", path: "/upload" },
    { label: "Share", path: "/share" },
    { label: "Logout", path: "/logout" },
  ];
  const handleClick = (path) => {
    if (path === "/logout") {
      localStorage.removeItem("user_token");
    }
    navigate(path);
  };
  return (
    <Box bg="purple.600" px="6" py="3">
      <Flex align="center" justify="space-between">
        {/* Logo / Title */}
        <Text color="white" fontSize="lg" fontWeight="bold">
          File Manager
        </Text>

        {/* Nav Links */}
        <HStack spacing="4">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "solid" : "ghost"}
              colorScheme="whiteAlpha"
              color="white"
              onClick={() => handleClick(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
