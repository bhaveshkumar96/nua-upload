import React, { use, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { RiEyeCloseLine } from "react-icons/ri";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
     const BACKEND_URL = "https://nua-upload.onrender.com";
  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword(!showPassword);
  const toast = useToast();

  const handleLogin = async () => {
    console.log("Email:", email, "Password:", password, "Name:", name);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/users/register`,
        {
          name,
          email,
          password,
        }
      );
      console.log("Registration successful:", data);
      
      localStorage.setItem("user_token", data.token);
      // localStorage.setItem("user", JSON.stringify(data.user));
      toast({
          title: "Success",
          description: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate("/signin");
        }, 1200);
      // navigate("/");
    } catch (error) {
        console.error("Registration failed:", error.response.data);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, purple.400, purple.600)"
      p="4"
    >
      <Box
        bg="white"
        p="8"
        rounded="lg"
        shadow="lg"
        w={{ base: "90%", md: "400px" }}
      >
        <Heading mb="4" textAlign="center" color="gray.700">
          Sign Up
        </Heading>
        <Text mb="6" textAlign="center" color="gray.500">
          Enter your email and password to sign up
        </Text>
        <FormControl mb="4">
          <FormLabel color="gray.700">Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl mb="4">
          <FormLabel color="gray.700">Email</FormLabel>
          <Input
            type="email"
            placeholder="mail@admin.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl mb="4">
          <FormLabel color="gray.700">Password</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement>
              <Button
                h="1.75rem"
                size="sm"
                onClick={handleTogglePassword}
                variant="ghost"
              >
                {showPassword ? <RiEyeCloseLine /> : <MdOutlineRemoveRedEye />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button colorScheme="purple" w="100%" mb="2" onClick={handleLogin}>
          Sign up
        </Button>
      </Box>
    </Flex>
  );
};

export default SignUpForm;
